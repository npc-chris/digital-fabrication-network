import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'super-secure-test-jwt-secret-32-chars-long';

// Mock database
jest.mock('../config/database', () => {
  return {
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    },
  };
});

import verificationRoutes from './verification.routes';
import { db } from '../config/database';

describe('Workshop KYC Verification Routes (API Tests)', () => {
  let app: express.Express;

  const explorerToken = jwt.sign(
    { id: 101, email: 'founder@hardware.ng', role: 'explorer' },
    process.env.JWT_SECRET!
  );

  const providerToken = jwt.sign(
    { id: 202, email: 'machinist@aba.ng', role: 'provider' },
    process.env.JWT_SECRET!
  );

  const adminToken = jwt.sign(
    { id: 1, email: 'admin@fabnetwork.ng', role: 'admin' },
    process.env.JWT_SECRET!
  );

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/verification', verificationRoutes);
  });

  describe('POST /api/verification/submit', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      const response = await request(app)
        .post('/api/verification/submit')
        .send({ documentType: 'cac_certificate', documentUrl: 'https://s3.amazonaws.com/kyc/cac.pdf' });

      expect(response.status).toBe(401);
    });

    it('returns 400 Bad Request when documentType or documentUrl is missing', async () => {
      const response = await request(app)
        .post('/api/verification/submit')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ documentType: 'cac_certificate' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Document type and URL required');
    });

    it('returns 201 with pending document record on valid submission', async () => {
      const mockCreatedDoc = {
        id: 50,
        userId: 202,
        documentType: 'workshop_lease',
        documentUrl: 'https://cdn.fabnetwork.ng/docs/lease.pdf',
        status: 'pending',
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockCreatedDoc]),
        }),
      });

      const response = await request(app)
        .post('/api/verification/submit')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          documentType: 'workshop_lease',
          documentUrl: 'https://cdn.fabnetwork.ng/docs/lease.pdf',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(50);
      expect(response.body.status).toBe('pending');
    });
  });

  describe('GET /api/verification/my-documents', () => {
    it('returns 200 with user verification documents', async () => {
      const mockDocs = [
        { id: 1, documentType: 'cac_certificate', status: 'approved' },
        { id: 2, documentType: 'machine_inventory', status: 'pending' },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockDocs),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/verification/my-documents')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].documentType).toBe('cac_certificate');
    });
  });

  describe('GET /api/verification/pending (Admin Protected)', () => {
    it('returns 403 Forbidden when explorer or provider tries to access pending KYC list', async () => {
      const response = await request(app)
        .get('/api/verification/pending')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    it('returns 200 with list of pending documents when admin accesses', async () => {
      const mockPendingList = [
        {
          document: { id: 10, status: 'pending', documentType: 'cac' },
          user: { id: 202, email: 'machinist@aba.ng' },
          profile: { firstName: 'Musa', businessName: 'Precision Engineering' },
        },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockPendingList),
              }),
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/api/verification/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].document.id).toBe(10);
    });
  });

  describe('POST /api/verification/:id/review', () => {
    it('returns 400 when review status is not approved or rejected', async () => {
      const response = await request(app)
        .post('/api/verification/10/review')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('approved or rejected');
    });

    it('returns 404 when document is not found', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const response = await request(app)
        .post('/api/verification/999/review')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Document not found');
    });

    it('successfully approves KYC document and updates workshop verification status', async () => {
      const existingDoc = { id: 10, userId: 202, status: 'pending' };
      const updatedDoc = { id: 10, userId: 202, status: 'approved', reviewNotes: 'Verified CAC document' };

      // Select existing document
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingDoc]),
        }),
      });

      // Update document & update profile
      (db.update as jest.Mock)
        .mockReturnValueOnce({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([updatedDoc]),
            }),
          }),
        })
        .mockReturnValueOnce({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        });

      const response = await request(app)
        .post('/api/verification/10/review')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
          reviewNotes: 'Verified CAC document',
          verificationStatus: 'verified',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
    });
  });

  describe('GET /api/verification/status', () => {
    it('returns 200 with current profile verification status and document trail', async () => {
      const mockProfile = { userId: 202, verificationStatus: 'verified', verifiedAt: new Date() };
      const mockDocs = [{ id: 1, documentType: 'cac', status: 'approved' }];

      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockProfile]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockDocs),
            }),
          }),
        });

      const response = await request(app)
        .get('/api/verification/status')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.verificationStatus).toBe('verified');
      expect(response.body.documents).toHaveLength(1);
    });
  });
});
