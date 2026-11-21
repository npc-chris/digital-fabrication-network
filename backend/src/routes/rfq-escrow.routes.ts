import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import rfqEscrowService, {
  TenantIsolationViolationError,
  KycVerificationRequiredError,
  MilestoneAmountMismatchError,
} from '../services/rfq-escrow.service';

const router = Router();

/**
 * POST /api/rfq/escrow/fund
 * Fund multi-milestone escrow contract for accepted RFQ.
 */
router.post('/fund', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      idempotencyKey,
      rfqId,
      tenantId,
      providerId,
      totalAmount,
      currency,
      paymentProvider,
      externalReference,
      milestoneTranches,
    } = req.body;

    if (!idempotencyKey || !rfqId || !tenantId || !providerId || totalAmount === undefined || !externalReference) {
      return res.status(400).json({
        error: 'Missing required escrow funding parameters (idempotencyKey, rfqId, tenantId, providerId, totalAmount, externalReference)',
      });
    }

    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      return res.status(400).json({
        error: 'totalAmount must be a positive number greater than zero',
      });
    }

    const explorerId = req.user?.id || 1;
    const result = await rfqEscrowService.fundMultiMilestoneEscrow({
      idempotencyKey,
      rfqId: Number(rfqId),
      tenantId: Number(tenantId),
      explorerId,
      providerId: Number(providerId),
      totalAmount: Number(totalAmount),
      currency: currency || 'NGN',
      paymentProvider: paymentProvider || 'paystack',
      externalReference,
      milestoneTranches,
    });

    return res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof TenantIsolationViolationError) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof MilestoneAmountMismatchError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Internal escrow error' });
  }
});

/**
 * POST /api/rfq/escrow/release-milestone
 * Authorize disbursement of a specific verified milestone tranche.
 */
router.post('/release-milestone', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { idempotencyKey, rfqId, tenantId, milestoneIndex, providerId } = req.body;

    if (!idempotencyKey || !rfqId || !tenantId || milestoneIndex === undefined || !providerId) {
      return res.status(400).json({
        error: 'Missing required milestone release parameters (idempotencyKey, rfqId, tenantId, milestoneIndex, providerId)',
      });
    }

    const result = await rfqEscrowService.releaseMilestone({
      idempotencyKey,
      rfqId: Number(rfqId),
      tenantId: Number(tenantId),
      milestoneIndex: Number(milestoneIndex),
      providerId: Number(providerId),
      approverId: req.user?.id,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof KycVerificationRequiredError) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof TenantIsolationViolationError) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Internal milestone release error' });
  }
});

/**
 * POST /api/rfq/escrow/refund
 * Refund escrow balance back to the explorer upon dispute or cancellation.
 */
router.post('/refund', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { idempotencyKey, rfqId, tenantId, explorerId, milestoneIndex, reason } = req.body;

    if (!idempotencyKey || !rfqId || !tenantId) {
      return res.status(400).json({
        error: 'Missing required refund parameters (idempotencyKey, rfqId, tenantId)',
      });
    }

    const result = await rfqEscrowService.refundMilestone({
      idempotencyKey,
      rfqId: Number(rfqId),
      tenantId: Number(tenantId),
      explorerId: Number(explorerId || req.user?.id || 1),
      milestoneIndex: milestoneIndex !== undefined ? Number(milestoneIndex) : undefined,
      reason: reason || 'Dispute settlement refund',
    });

    return res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof TenantIsolationViolationError) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Internal escrow refund error' });
  }
});

/**
 * POST /api/rfq/escrow/webhook/:provider
 * Idempotent webhook listener for Paystack and Flutterwave payment events.
 */
router.post('/webhook/:provider', async (req: Request, res: Response): Promise<any> => {
  try {
    const provider = req.params.provider as 'paystack' | 'flutterwave';
    if (provider !== 'paystack' && provider !== 'flutterwave') {
      return res.status(400).json({ error: 'Unsupported payment provider webhook' });
    }

    const signature = (req.headers['x-paystack-signature'] || req.headers['verif-hash']) as string;
    const secret = process.env.ESCROW_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || 'test-webhook-secret';
    const rawPayload = JSON.stringify(req.body);

    const result = await rfqEscrowService.processEscrowWebhook({
      provider,
      rawPayload,
      signature,
      secret,
      payload: req.body,
    });

    return res.status(200).json({ status: 'success', message: 'Webhook processed successfully', data: result });
  } catch (error: any) {
    if (error.message === 'Invalid webhook signature') {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    return res.status(500).json({ error: error.message || 'Webhook processing failed' });
  }
});

export default router;
