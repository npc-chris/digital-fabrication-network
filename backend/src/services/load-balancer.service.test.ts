import { LoadBalancerService } from './load-balancer.service';

describe('LoadBalancerService - Product-Line Round-Robin & Circuit Breaker', () => {
  const originalEnv = process.env;
  let lb: LoadBalancerService;

  beforeEach(() => {
    process.env = { ...originalEnv };
    lb = new LoadBalancerService();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('distributes requests round-robin across configured replica URLs', () => {
    process.env.FINWORLD_UPSTREAMS = 'https://fin-a.internal, https://fin-b.internal, https://fin-c.internal';

    expect(lb.selectUpstream('finworld')).toBe('https://fin-a.internal');
    expect(lb.selectUpstream('finworld')).toBe('https://fin-b.internal');
    expect(lb.selectUpstream('finworld')).toBe('https://fin-c.internal');
    expect(lb.selectUpstream('finworld')).toBe('https://fin-a.internal');
  });

  it('opens circuit breaker after threshold failures and routes to healthy nodes', () => {
    process.env.DIGISEC_UPSTREAMS = 'https://idp-1.internal,https://idp-2.internal';
    process.env.CIRCUIT_BREAKER_THRESHOLD = '2';
    process.env.CIRCUIT_BREAKER_COOLDOWN_MS = '60000';

    lb.recordFailure('digisec', 'https://idp-1.internal');
    expect(lb.getPoolSnapshot('digisec').healthyCount).toBe(2);

    lb.recordFailure('digisec', 'https://idp-1.internal');
    const snap = lb.getPoolSnapshot('digisec');
    expect(snap.healthyCount).toBe(1);

    for (let i = 0; i < 4; i++) {
      expect(lb.selectUpstream('digisec')).toBe('https://idp-2.internal');
    }

    lb.recordSuccess('digisec', 'https://idp-1.internal', 18);
    expect(lb.getPoolSnapshot('digisec').healthyCount).toBe(2);
  });
});
