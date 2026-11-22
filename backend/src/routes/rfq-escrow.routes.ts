import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import rfqEscrowService, {
  TenantIsolationViolationError,
  KycVerificationRequiredError,
  MilestoneAmountMismatchError,
  TechnicalHoldActiveError,
} from '../services/rfq-escrow.service';
import { paystackService } from '../services/paystack.service';

const router = Router();

/**
 * POST /api/rfq/escrow/initialize-deposit
 * Initializes a Nigerian Paystack checkout transaction for escrow contract deposit.
 */
router.post('/initialize-deposit', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { rfqId, totalAmount, tenantId, callbackUrl } = req.body;

    if (!rfqId || totalAmount === undefined || typeof totalAmount !== 'number' || totalAmount <= 0) {
      return res.status(400).json({
        error: 'rfqId and positive totalAmount are required to initialize escrow payment',
      });
    }

    const email = req.user?.email || 'founder@fabnetwork.ng';
    const initResult = await paystackService.initializePayment({
      email,
      amount: totalAmount,
      callbackUrl,
      metadata: {
        rfqId: Number(rfqId),
        tenantId: Number(tenantId || 1),
        userId: req.user?.id,
        purpose: 'ESCROW_CONTRACT_DEPOSIT',
      },
    });

    return res.status(200).json(initResult);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error initializing Paystack escrow deposit' });
  }
});

/**
 * GET /api/rfq/escrow/verify-transaction/:reference
 * Verifies transaction payment reference directly with Paystack API.
 */
router.get('/verify-transaction/:reference', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const rawRef = req.params.reference;
    const reference = Array.isArray(rawRef) ? rawRef[0] : rawRef;
    if (!reference) {
      return res.status(400).json({ error: 'Transaction reference is required' });
    }

    const verification = await paystackService.verifyPayment(String(reference));
    return res.status(200).json(verification);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error verifying Paystack transaction' });
  }
});

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
    if (error instanceof TechnicalHoldActiveError) {
      return res.status(422).json({ error: error.message, code: 'TECHNICAL_HOLD_ACTIVE' });
    }
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
 * POST /api/rfq/escrow/technical-hold
 * Place a milestone or RFQ on technical hold (HOLD_NCR or HOLD_WARRANTY_INVESTIGATION).
 */
router.post('/technical-hold', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      rfqId,
      tenantId,
      milestoneIndex,
      holdType,
      reason,
      referenceId,
      affectedSerialNumbers,
    } = req.body;

    if (!rfqId || !tenantId || !reason) {
      return res.status(400).json({
        error: 'Missing required parameters: rfqId, tenantId, and reason are required',
      });
    }

    const validHoldType = holdType === 'HOLD_WARRANTY_INVESTIGATION' ? 'HOLD_WARRANTY_INVESTIGATION' : 'HOLD_NCR';

    const result = rfqEscrowService.applyTechnicalHold({
      rfqId: Number(rfqId),
      tenantId: Number(tenantId),
      milestoneIndex: milestoneIndex !== undefined ? Number(milestoneIndex) : undefined,
      holdType: validHoldType,
      reason: String(reason),
      referenceId: referenceId ? String(referenceId) : undefined,
      affectedSerialNumbers: Array.isArray(affectedSerialNumbers) ? affectedSerialNumbers : undefined,
    });

    return res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof TenantIsolationViolationError) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Error applying technical hold' });
  }
});

/**
 * POST /api/rfq/escrow/technical-hold/resolve
 * Resolve an active technical hold following verified corrective action or remelt.
 */
router.post('/technical-hold/resolve', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      rfqId,
      tenantId,
      milestoneIndex,
      approverId,
      resolutionAction,
      notes,
    } = req.body;

    if (!rfqId || !tenantId || !resolutionAction) {
      return res.status(400).json({
        error: 'Missing required parameters: rfqId, tenantId, and resolutionAction are required',
      });
    }

    const result = rfqEscrowService.resolveTechnicalHold({
      rfqId: Number(rfqId),
      tenantId: Number(tenantId),
      milestoneIndex: milestoneIndex !== undefined ? Number(milestoneIndex) : undefined,
      approverId: Number(approverId || req.user?.id || 1),
      resolutionAction,
      notes,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof TenantIsolationViolationError) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Error resolving technical hold' });
  }
});

/**
 * GET /api/rfq/escrow/technical-hold/:rfqId
 * List active technical holds for an RFQ.
 */
router.get('/technical-hold/:rfqId', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const rfqId = Number(req.params.rfqId);
    if (!rfqId) {
      return res.status(400).json({ error: 'Valid rfqId parameter is required' });
    }

    const activeHolds = rfqEscrowService.getActiveTechnicalHolds(rfqId);
    return res.status(200).json({ rfqId, activeHolds });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching active technical holds' });
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
