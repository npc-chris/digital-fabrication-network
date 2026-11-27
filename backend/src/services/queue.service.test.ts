import { ProductQueueService } from './queue.service';
import { loadBalancerService } from './load-balancer.service';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/dfn_gateway_test';

describe('ProductQueueService - Async Product-Line Dispatcher', () => {
  const originalEnv = process.env;
  let queue: ProductQueueService;

  beforeEach(() => {
    process.env = { ...originalEnv };
    loadBalancerService.resetForTests();
    queue = new ProductQueueService();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('enqueues and dispatches jobs across load-balanced discovery instances', async () => {
    process.env.DISCOVERY_UPSTREAMS = 'https://disc-1.internal,https://disc-2.internal';

    const dispatchedUrls: string[] = [];
    queue.setDispatcher(async (targetUrl, job) => {
      dispatchedUrls.push(targetUrl);
      return { ok: true, data: { accepted: job.jobId } };
    });

    const job1 = await queue.enqueueJob({
      jobType: 'discovery.job.analyze',
      targetService: 'discovery',
      orgId: 'org_acme',
      payload: { stepFile: 'bracket.step' },
    });
    const job2 = await queue.enqueueJob({
      jobType: 'discovery.job.analyze',
      targetService: 'discovery',
      orgId: 'org_acme',
      payload: { stepFile: 'housing.step' },
    });

    const p1 = await queue.processNext('discovery');
    const p2 = await queue.processNext('discovery');

    expect(p1?.status).toBe('completed');
    expect(p2?.status).toBe('completed');
    expect(dispatchedUrls).toEqual(['https://disc-1.internal', 'https://disc-2.internal']);

    const fetched = await queue.getJob(job1.jobId);
    expect(fetched?.status).toBe('completed');
    expect(fetched?.dispatchedToUrl).toBe('https://disc-1.internal');
    expect(job2.targetService).toBe('discovery');
  });

  it('retries failed jobs up to maxAttempts and transitions to dead_letter', async () => {
    process.env.PRISM_API_URL = 'https://prism.internal';

    queue.setDispatcher(async () => ({ ok: false, error: 'Worker timeout' }));

    const job = await queue.enqueueJob({
      jobType: 'prism.cad.parse',
      targetService: 'prism',
      orgId: 'org_acme',
      payload: { assetId: 'cad_77' },
      maxAttempts: 2,
    });

    const attempt1 = await queue.processNext('prism');
    expect(attempt1?.status).toBe('queued');
    expect(attempt1?.attempts).toBe(1);

    const attempt2 = await queue.processNext('prism');
    expect(attempt2?.status).toBe('dead_letter');
    expect(attempt2?.attempts).toBe(2);
    expect(attempt2?.lastError).toBe('Worker timeout');
    expect((await queue.getJob(job.jobId))?.status).toBe('dead_letter');
  });
});
