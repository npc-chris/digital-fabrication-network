import crypto from 'crypto';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'super-secure-test-jwt-secret-32-chars-long';

// Mock database module
jest.mock('../config/database', () => {
  return {
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    },
  };
});

import rfqEscrowService, {
  TenantIsolationViolationError,
  KycVerificationRequiredError,
  MilestoneAmountMismatchError,
  TechnicalHoldActiveError,
} from './rfq-escrow.service';
import { db } from '../config/database';

describe('RfqEscrowService - Multi-Milestone Escrow (Unit Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rfqEscrowService.clearIdempotencyStore();
  });

  describe('calculateMilestones', () => {
    it('calculates default 3-tranche engineering milestone distribution (30% / 40% / 30%) with exact summing', () => {
      const totalAmount = 100000;
      const milestones = rfqEscrowService.calculateMilestones(totalAmount);

      expect(milestones).toHaveLength(3);
      expect(milestones[0].percentage).toBe(30);
      expect(milestones[0].amount).toBe(30000);
      expect(milestones[1].percentage).toBe(40);
      expect(milestones[1].amount).toBe(40000);
      expect(milestones[2].percentage).toBe(30);
      expect(milestones[2].amount).toBe(30000);

      const totalSum = milestones.reduce((acc, m) => acc + m.amount, 0);
      expect(totalSum).toBe(totalAmount);
    });

    it('partitions custom tranches by specific amounts matching total amount', () => {
      // Gherkin AC: 680,000 partitioned into 200,000, 300,000, and 180,000
      const totalAmount = 680000;
      const customTranches = [
        { name: 'Material Procurement', amount: 200000 },
        { name: 'Rough Machining & First Article', amount: 300000 },
        { name: 'Final Verification & Delivery', amount: 180000 },
      ];

      const milestones = rfqEscrowService.calculateMilestones(totalAmount, customTranches);

      expect(milestones).toHaveLength(3);
      expect(milestones[0].amount).toBe(200000);
      expect(milestones[1].amount).toBe(300000);
      expect(milestones[2].amount).toBe(180000);

      const totalSum = milestones.reduce((acc, m) => acc + m.amount, 0);
      expect(totalSum).toBe(totalAmount);
    });

    it('partitions custom tranches by percentage and calculates exact amounts', () => {
      const totalAmount = 500000;
      const customTranches = [
        { name: 'Stock & Tooling', percentage: 25 },
        { name: 'Machining', percentage: 50 },
        { name: 'Surface Finishing', percentage: 25 },
      ];

      const milestones = rfqEscrowService.calculateMilestones(totalAmount, customTranches);

      expect(milestones).toHaveLength(3);
      expect(milestones[0].amount).toBe(125000);
      expect(milestones[1].amount).toBe(250000);
      expect(milestones[2].amount).toBe(125000);
    });

    it('throws MilestoneAmountMismatchError when custom amounts do not match total amount', () => {
      const totalAmount = 680000;
      const mismatchedTranches = [
        { name: 'Milestone 1', amount: 200000 },
        { name: 'Milestone 2', amount: 300000 },
        { name: 'Milestone 3', amount: 100000 }, // sum 600,000 != 680,000
      ];

      expect(() => {
        rfqEscrowService.calculateMilestones(totalAmount, mismatchedTranches);
      }).toThrow(MilestoneAmountMismatchError);
    });

    it('throws error when total amount is non-positive', () => {
      expect(() => {
        rfqEscrowService.calculateMilestones(0);
      }).toThrow('Total escrow amount must be greater than zero');
    });
  });

  describe('fundMultiMilestoneEscrow', () => {
    it('creates 3 locked milestone lines and generates work authorization tickets for machine shop', async () => {
      const mockTx = { id: 42, userId: 101, amount: '680000' };
      const returningMock = jest.fn().mockResolvedValue([mockTx]);
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({ returning: returningMock }),
      });

      const params = {
        idempotencyKey: 'idemp-fund-unique-1',
        rfqId: 501,
        tenantId: 10,
        explorerId: 101,
        providerId: 202,
        totalAmount: 680000,
        paymentProvider: 'paystack' as const,
        externalReference: 'PAY-REF-680k',
        milestoneTranches: [
          { name: 'Milestone 1: Material Procurement', amount: 200000 },
          { name: 'Milestone 2: First Article Approved', amount: 300000 },
          { name: 'Milestone 3: Final Verification', amount: 180000 },
        ],
      };

      const result = await rfqEscrowService.fundMultiMilestoneEscrow(params);

      expect(result.success).toBe(true);
      expect(result.status).toBe('ESCROW_FUNDED');
      expect(result.totalAmount).toBe(680000);
      expect(result.milestones).toHaveLength(3);
      expect(result.milestones[0].status).toBe('locked');
      expect(result.milestones[0].amount).toBe(200000);
      expect(result.milestones[1].amount).toBe(300000);
      expect(result.milestones[2].amount).toBe(180000);

      // Verify work authorization tickets issued to machine shop
      expect(result.workAuthorizationTickets).toHaveLength(3);
      expect(result.workAuthorizationTickets[0].providerId).toBe(202);
      expect(result.workAuthorizationTickets[0].status).toBe('AUTHORIZED');
      expect(result.workAuthorizationTickets[0].ticketId).toContain('AUTH-RFQ501-M1-');
    });

    it('enforces financial idempotency by returning cached result on identical idempotencyKey', async () => {
      const mockTx = { id: 42, userId: 101, amount: '680000' };
      const returningMock = jest.fn().mockResolvedValue([mockTx]);
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({ returning: returningMock }),
      });

      const params = {
        idempotencyKey: 'duplicate-key-safe',
        rfqId: 501,
        tenantId: 10,
        explorerId: 101,
        providerId: 202,
        totalAmount: 680000,
        paymentProvider: 'paystack' as const,
        externalReference: 'PAY-REF-DUP',
      };

      const call1 = await rfqEscrowService.fundMultiMilestoneEscrow(params);
      const call2 = await rfqEscrowService.fundMultiMilestoneEscrow(params);

      expect(call1).toEqual(call2);
      // DB insert was only called once
      expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it('throws TenantIsolationViolationError on cross-tenant access attempt', () => {
      expect(() => {
        rfqEscrowService.assertTenantAccess(1, 2);
      }).toThrow(TenantIsolationViolationError);
    });
  });

  describe('releaseMilestone', () => {
    it('throws KycVerificationRequiredError when provider has unverified KYC status', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 202, verificationStatus: 'unverified' }]),
        }),
      });

      await expect(
        rfqEscrowService.releaseMilestone({
          idempotencyKey: 'rel-key-1',
          rfqId: 501,
          tenantId: 10,
          milestoneIndex: 1,
          providerId: 202,
        })
      ).rejects.toThrow(KycVerificationRequiredError);
    });

    it('successfully releases milestone funds when provider is KYC verified', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 202, verificationStatus: 'verified' }]),
        }),
      });

      const result = await rfqEscrowService.releaseMilestone({
        idempotencyKey: 'rel-key-success',
        rfqId: 501,
        tenantId: 10,
        milestoneIndex: 1,
        providerId: 202,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('released');
      expect(result.milestoneIndex).toBe(1);
      expect(result.providerId).toBe(202);
      expect(result.releasedAt).toBeDefined();
    });

    it('throws TechnicalHoldActiveError when milestone is under technical hold (HOLD_NCR)', async () => {
      // Apply technical hold due to non-conformance telemetry
      rfqEscrowService.applyTechnicalHold({
        rfqId: 501,
        tenantId: 10,
        milestoneIndex: 2,
        holdType: 'HOLD_NCR',
        reason: 'Hole pitch measured 121.8 mm vs spec 120.00 +/- 0.05 mm',
        referenceId: 'NCR-2026-001',
      });

      // Mock verified provider profile
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 202, verificationStatus: 'verified' }]),
        }),
      });

      await expect(
        rfqEscrowService.releaseMilestone({
          idempotencyKey: 'rel-key-held',
          rfqId: 501,
          tenantId: 10,
          milestoneIndex: 2,
          providerId: 202,
        })
      ).rejects.toThrow(TechnicalHoldActiveError);
    });

    it('allows release after technical hold is verified and resolved', async () => {
      rfqEscrowService.applyTechnicalHold({
        rfqId: 501,
        tenantId: 10,
        milestoneIndex: 2,
        holdType: 'HOLD_NCR',
        reason: 'Hole pitch deviation',
        referenceId: 'NCR-2026-001',
      });

      // Resolve technical hold following corrective rework
      const resolveResult = rfqEscrowService.resolveTechnicalHold({
        rfqId: 501,
        tenantId: 10,
        milestoneIndex: 2,
        approverId: 303,
        resolutionAction: 'CORRECTIVE_REWORK_COMPLETED',
        notes: 'Offset slotted bushing installed at ₦12,500',
      });

      expect(resolveResult.success).toBe(true);
      expect(resolveResult.resolvedCount).toBe(1);

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 202, verificationStatus: 'verified' }]),
        }),
      });

      const releaseResult = await rfqEscrowService.releaseMilestone({
        idempotencyKey: 'rel-key-resolved',
        rfqId: 501,
        tenantId: 10,
        milestoneIndex: 2,
        providerId: 202,
      });

      expect(releaseResult.success).toBe(true);
      expect(releaseResult.status).toBe('released');
    });
  });

  describe('refundMilestone', () => {
    it('successfully marks target milestone as refunded with reason and timestamp', async () => {
      const result = await rfqEscrowService.refundMilestone({
        idempotencyKey: 'refund-key-1',
        rfqId: 501,
        tenantId: 10,
        milestoneIndex: 2,
        explorerId: 101,
        reason: 'Customer requested cancellation during rough machining',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('refunded');
      expect(result.milestoneIndex).toBe(2);
      expect(result.refundedAt).toBeDefined();
    });
  });

  describe('verifyWebhookSignature and processEscrowWebhook', () => {
    const secret = 'webhook-secret-key-123';
    const payload = {
      event: 'charge.success',
      data: {
        id: 991,
        reference: 'WEBHOOK-PAYSTACK-01',
        amount: 680000,
        currency: 'NGN',
        metadata: {
          idempotencyKey: 'webhook-idemp-1',
          rfqId: 501,
          tenantId: 10,
          explorerId: 101,
          providerId: 202,
        },
      },
    };
    const rawPayload = JSON.stringify(payload);

    it('verifies valid Paystack HMAC-SHA512 signature', () => {
      const validSignature = crypto.createHmac('sha512', secret).update(rawPayload).digest('hex');
      const isValid = rfqEscrowService.verifyWebhookSignature('paystack', rawPayload, validSignature, secret);
      expect(isValid).toBe(true);
    });

    it('rejects invalid or forged Paystack HMAC-SHA512 signature', () => {
      const isValid = rfqEscrowService.verifyWebhookSignature('paystack', rawPayload, 'invalid_sig', secret);
      expect(isValid).toBe(false);
    });

    it('verifies valid Flutterwave secret token', () => {
      const isValid = rfqEscrowService.verifyWebhookSignature('flutterwave', rawPayload, secret, secret);
      expect(isValid).toBe(true);
    });

    it('processes verified Paystack webhook and automatically funds escrow contract', async () => {
      const validSignature = crypto.createHmac('sha512', secret).update(rawPayload).digest('hex');

      const mockTx = { id: 77, userId: 101, amount: '680000' };
      const returningMock = jest.fn().mockResolvedValue([mockTx]);
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({ returning: returningMock }),
      });

      const result = await rfqEscrowService.processEscrowWebhook({
        provider: 'paystack',
        rawPayload,
        signature: validSignature,
        secret,
        payload,
      });

      expect(result.processed).toBe(true);
      expect(result.fundingResult.status).toBe('ESCROW_FUNDED');
      expect(result.fundingResult.totalAmount).toBe(680000);
      expect(result.fundingResult.milestones).toHaveLength(3);
    });
  });
});
