import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { productQueueService } from '../services/queue.service';
import { ProductServiceKey } from '../services/load-balancer.service';

const router = Router();
const VALID_SERVICES: ProductServiceKey[] = ['digisec', 'finworld', 'discovery', 'prism'];

router.get('/stats', authenticate, (_req: Request, res: Response) => {
  return res.status(200).json(productQueueService.getStats());
});

router.get('/jobs', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 25)));
    const jobs = await productQueueService.listRecentJobs(limit);
    return res.status(200).json({ jobs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to list queue jobs' });
  }
});

router.get('/jobs/:jobId', authenticate, async (req: Request, res: Response) => {
  try {
    const job = await productQueueService.getJob(String(req.params.jobId));
    if (!job) {
      return res.status(404).json({ error: 'Queue job not found' });
    }
    return res.status(200).json(job);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to read queue job' });
  }
});

router.post('/enqueue', authenticate, async (req: Request, res: Response) => {
  try {
    const { queueName, jobType, targetService, orgId, payload, maxAttempts } = req.body;
    if (!jobType || !targetService || !VALID_SERVICES.includes(targetService)) {
      return res.status(400).json({
        error: `jobType and valid targetService (${VALID_SERVICES.join(', ')}) are required`,
      });
    }

    const job = await productQueueService.enqueueJob({
      queueName,
      jobType: String(jobType),
      targetService,
      orgId: orgId ? String(orgId) : req.user?.orgId,
      payload: payload && typeof payload === 'object' ? payload : {},
      maxAttempts,
    });

    return res.status(202).json(job);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to enqueue job' });
  }
});

router.post(
  '/process/:targetService',
  authenticate,
  authorize('admin', 'platform_manager'),
  async (req: Request, res: Response) => {
    try {
      const service = req.params.targetService as ProductServiceKey;
      if (!VALID_SERVICES.includes(service)) {
        return res.status(400).json({
          error: `Unsupported targetService. Must be one of: ${VALID_SERVICES.join(', ')}`,
        });
      }

      const processed = await productQueueService.processNext(service);
      if (!processed) {
        return res.status(200).json({ processed: false, message: 'Queue empty for service', service });
      }
      return res.status(200).json({ processed: true, job: processed });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to process queued job' });
    }
  }
);

export default router;
