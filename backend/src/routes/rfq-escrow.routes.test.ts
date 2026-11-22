import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'super-secure-test-jwt-secret-32-chars-long';
process.env.PAYSTACK_SECRET_KEY = 'test-paystack-secret-key';

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

import rfqEscrowRoutes from './rfq-escrow.routes';
import rfqEscrowService from '../services/rfq-escrow.service';
import { db } from '../config/database';

describe('RFQ Escrow Routes (API Tests)', () => {
  let app: express.Express;

  const explorerToken = jwt.sign(
    { id: 101, email: 'babatunde@innovator.ng', role: 'explorer' },
    process.env.JWT_SECRET!
  );

  const providerToken = jwt.sign(
    { id: 202, email: 'sunday@machinefab.ng', role: 'provider' },
    process.env.JWT_SECRET!
  );

  beforeEach(() => {
    jest.clearAllMocks();
    rfqEscrowService.clearIdempotencyStore();

    app = express();
    app.use(express.json());
    app.use('/api/rfq/escrow', rfqEscrowRoutes);
  });

  describe('POST /api/rfq/escrow/fund', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      const response = await request(app)
        .post('/api/rfq/escrow/fund')
        .send({
          idempotencyKey: 'fund-unauth-1',
          rfqId: 501,
          tenantId: 10,
          providerId: 202,
          totalAmount: 680000,
          externalReference: 'PAY-1',
        });

      expect(response.status).toBe(401);
    });

    it('returns 400 Bad Request when required parameters are missing', async () => {
      const response = await request(app)
        .post('/api/rfq/escrow/fund')
        .set('Authorization', `Bearer ${explorerToken}`)
        .send({
          idempotencyKey: 'fund-missing-params',
          // rfqId and tenantId omitted
          totalAmount: 680000,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required escrow funding parameters');
    });

    it('returns 400 Bad Request when totalAmount is non-positive', async () => {
      const response = await request(app)
        .post('/api/rfq/escrow/fund')
        .set('Authorization', `Bearer ${explorerToken}`)
        .send({
          idempotencyKey: 'fund-neg-amount',
          rfqId: 501,
          tenantId: 10,
          providerId: 202,
          totalAmount: -5000,
          externalReference: 'PAY-NEG',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('totalAmount must be a positive number');
    });

    it('returns 201 with partitioned milestones and work authorization tickets on successful funding', async () => {
      const mockTx = { id: 88, userId: 101, amount: '680000' };
      const returningMock = jest.fn().mockResolvedValue([mockTx]);
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({ returning: returningMock }),
      });

      // Babatunde funds quote of ₦680,000 with custom milestone amounts
      const response = await request(app)
        .post('/api/rfq/escrow/fund')
        .set('Authorization', `Bearer ${explorerToken}`)
        .send({
          idempotencyKey: 'idemp-route-680k',
          rfqId: 501,
          tenantId: 10,
          providerId: 202,
          totalAmount: 680000,
          currency: 'NGN',
          paymentProvider: 'paystack',
          externalReference: 'PAY-ROUTE-680k',
          milestoneTranches: [
            { name: 'Milestone 1: Material Procurement', amount: 200000 },
            { name: 'Milestone 2: First Article Approved', amount: 300000 },
            { name: 'Milestone 3: Final Verification', amount: 180000 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.contractId).toBe('ESCROW-RFQ-501-88');
      expect(response.body.totalAmount).toBe(680000);
      expect(response.body.milestones).toHaveLength(3);
      expect(response.body.milestones[0].amount).toBe(200000);
      expect(response.body.milestones[1].amount).toBe(300000);
      expect(response.body.milestones[2].amount).toBe(180000);
      expect(response.body.workAuthorizationTickets).toHaveLength(3);
    });

    it('returns 400 Bad Request when milestone tranche amounts do not sum to totalAmount', async () => {
      const response = await request(app)
        .post('/api/rfq/escrow/fund')
        .set('Authorization', `Bearer ${explorerToken}`)
        .send({
          idempotencyKey: 'idemp-mismatch',
          rfqId: 501,
          tenantId: 10,
          providerId: 202,
          totalAmount: 680000,
          currency: 'NGN',
          paymentProvider: 'paystack',
          externalReference: 'PAY-MISMATCH',
          milestoneTranches: [
            { name: 'Milestone 1', amount: 200000 },
            { name: 'Milestone 2', amount: 300000 },
            { name: 'Milestone 3', amount: 150000 }, // sum 650k != 680k
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('does not match total amount');
    });
  });

  describe('POST /api/rfq/escrow/release-milestone', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      const response = await request(app)
        .post('/api/rfq/escrow/release-milestone')
        .send({
          idempotencyKey: 'rel-unauth',
          rfqId: 501,
          tenantId: 10,
          milestoneIndex: 1,
          providerId: 202,
        });

      expect(response.status).toBe(401);
    });

    it('returns 403 Forbidden when provider KYC is unverified', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 202, verificationStatus: 'unverified' }]),
        }),
      });

      const response = await request(app)
        .post('/api/rfq/escrow/release-milestone')
        .set('Authorization', `Bearer ${explorerToken}`)
        .send({
          idempotencyKey: 'rel-unverified-kyc',
          rfqId: 501,
          tenantId: 10,
          milestoneIndex: 1,
          providerId: 202,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('unverified KYC status');
    });

    it('returns 200 with milestone released when provider KYC is verified', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 202, verificationStatus: 'verified' }]),
        }),
      });

      const response = await request(app)
        .post('/api/rfq/escrow/release-milestone')
        .set('Authorization', `Bearer ${explorerToken}`)
        .send({
          idempotencyKey: 'rel-verified-kyc',
          rfqId: 501,
          tenantId: 10,
          milestoneIndex: 1,
          providerId: 202,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('released');
      expect(response.body.milestoneIndex).toBe(1);
    });
  });

  describe('POST /api/rfq/escrow/refund', () => {
    it('returns 200 on valid refund request', async () => {
      const response = await request(app)
        .post('/api/rfq/escrow/refund')
        .set('Authorization', `Bearer ${explorerToken}`)
        .send({
          idempotencyKey: 'refund-api-1',
          rfqId: 501,
          tenantId: 10,
          milestoneIndex: 2,
          reason: 'Material defect identified during turning',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('refunded');
      expect(response.body.milestoneIndex).toBe(2);
    });
  });

  describe('POST /api/rfq/escrow/webhook/:provider', () => {
    it('returns 401 when Paystack webhook signature is invalid', async () => {
      const response = await request(app)
        .post('/api/rfq/escrow/webhook/paystack')
        .set('x-paystack-signature', 'invalid-fake-signature')
        .send({
          event: 'charge.success',
          data: { amount: 680000 },
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid webhook signature');
    });

    it('returns 200 and processes payment when Paystack webhook signature is valid', async () => {
      const payload = {
        event: 'charge.success',
        data: {
          id: 1009,
          reference: 'WEBHOOK-TEST-01',
          amount: 680000,
          currency: 'NGN',
          metadata: {
            idempotencyKey: 'webhook-idemp-test',
            rfqId: 501,
            tenantId: 10,
            explorerId: 101,
            providerId: 202,
          },
        },
      };
      const rawPayload = JSON.stringify(payload);
      const secret = process.env.PAYSTACK_SECRET_KEY!;
      const validSignature = crypto.createHmac('sha512', secret).update(rawPayload).digest('hex');

      const mockTx = { id: 99, userId: 101, amount: '680000' };
      const returningMock = jest.fn().mockResolvedValue([mockTx]);
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({ returning: returningMock }),
      });

      const response = await request(app)
        .post('/api/rfq/escrow/webhook/paystack')
        .set('x-paystack-signature', validSignature)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.fundingResult.status).toBe('ESCROW_FUNDED');
    });
  });
});
