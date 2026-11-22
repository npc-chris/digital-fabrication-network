import request from 'supertest';
import express from 'express';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'super-secure-test-jwt-secret-32-chars-long';

// Mock database
jest.mock('../config/database', () => {
  return {
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      execute: jest.fn().mockResolvedValue([]),
    },
  };
});

import qcRoutes, { evaluateFirstArticle } from './qc.routes';
import { db } from '../config/database';

describe('First-Article QC Metrology & Taper Invariant API', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/v1/qc', qcRoutes);
  });

  describe('Metrology Domain Engine evaluateFirstArticle()', () => {
    it('approves readings when taper is <= 0.003mm and all readings within limits', () => {
      const result = evaluateFirstArticle({
        batchId: 'BATCH-TST-001',
        partNumber: 'SHAFT-40MM-CNC',
        nominalMm: 40.0,
        toleranceUpperMm: 40.02,
        toleranceLowerMm: 39.98,
        maxTaperMm: 0.003,
        readings: [40.008, 40.007, 40.009],
      });

      expect(result.status).toBe('ACCEPTED');
      expect(result.isTaperCompliant).toBe(true);
      expect(result.isDimensionalCompliant).toBe(true);
      expect(result.batchAuthorized).toBe(true);
      expect(result.taperDeviationMm).toBe(0.002);
      expect(result.failureReasons).toHaveLength(0);
    });

    it('rejects when taper deviation exceeds 0.003mm threshold even if inside drawing limits', () => {
      const result = evaluateFirstArticle({
        batchId: 'BATCH-TST-002',
        partNumber: 'SHAFT-40MM-CNC',
        nominalMm: 40.0,
        toleranceUpperMm: 40.02,
        toleranceLowerMm: 39.98,
        maxTaperMm: 0.003,
        readings: [40.002, 40.007, 40.001], // delta = 0.006mm > 0.003mm
      });

      expect(result.status).toBe('REJECTED');
      expect(result.isTaperCompliant).toBe(false);
      expect(result.batchAuthorized).toBe(false);
      expect(result.taperDeviationMm).toBe(0.006);
      expect(result.failureReasons[0]).toContain('exceeds maximum allowable limit');
    });

    it('rejects when a reading violates upper drawing limit', () => {
      const result = evaluateFirstArticle({
        batchId: 'BATCH-TST-003',
        partNumber: 'SHAFT-40MM-CNC',
        nominalMm: 40.0,
        toleranceUpperMm: 40.01,
        toleranceLowerMm: 39.99,
        maxTaperMm: 0.003,
        readings: [40.012, 40.011, 40.013], // delta = 0.002mm (passes taper), but 40.012 > 40.010
      });

      expect(result.status).toBe('REJECTED');
      expect(result.isTaperCompliant).toBe(true);
      expect(result.isDimensionalCompliant).toBe(false);
      expect(result.batchAuthorized).toBe(false);
      expect(result.failureReasons.some((r) => r.includes('exceeds upper limit'))).toBe(true);
    });

    it('verifies translation invariance property (shifting all readings preserves taper)', () => {
      const baseReadings = [40.005, 40.007, 40.006];
      const shiftOffsets = [-15.5, 0.0, 12.345, 100.0];

      const baseResult = evaluateFirstArticle({
        batchId: 'INV-1',
        partNumber: 'PN-1',
        nominalMm: 40.0,
        toleranceUpperMm: 50.0,
        toleranceLowerMm: 30.0,
        maxTaperMm: 0.003,
        readings: baseReadings,
      });

      for (const shift of shiftOffsets) {
        const shiftedReadings = baseReadings.map((r) => r + shift);
        const shiftedResult = evaluateFirstArticle({
          batchId: 'INV-1',
          partNumber: 'PN-1',
          nominalMm: 40.0 + shift,
          toleranceUpperMm: 50.0 + shift,
          toleranceLowerMm: 30.0 + shift,
          maxTaperMm: 0.003,
          readings: shiftedReadings,
        });

        expect(shiftedResult.taperDeviationMm).toBeCloseTo(baseResult.taperDeviationMm, 4);
        expect(shiftedResult.isTaperCompliant).toBe(baseResult.isTaperCompliant);
      }
    });

    it('verifies permutation invariance property (order of readings does not change taper)', () => {
      const readings = [40.008, 40.006, 40.007];
      const permutations = [
        [40.008, 40.006, 40.007],
        [40.006, 40.008, 40.007],
        [40.007, 40.008, 40.006],
        [40.006, 40.007, 40.008],
      ];

      for (const perm of permutations) {
        const result = evaluateFirstArticle({
          batchId: 'PERM-1',
          partNumber: 'PN-1',
          nominalMm: 40.0,
          toleranceUpperMm: 40.02,
          toleranceLowerMm: 39.98,
          maxTaperMm: 0.003,
          readings: perm,
        });

        expect(result.taperDeviationMm).toBe(0.002);
        expect(result.status).toBe('ACCEPTED');
        expect(result.batchAuthorized).toBe(true);
      }
    });
  });

  describe('POST /api/v1/qc/first-article/submit', () => {
    it('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/qc/first-article/submit')
        .send({ batchId: 'BATCH-001' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.issues).toBeDefined();
    });

    it('returns 400 when less than 2 readings are supplied', async () => {
      const response = await request(app)
        .post('/api/v1/qc/first-article/submit')
        .send({
          batchId: 'BATCH-001',
          partNumber: 'SHAFT-01',
          nominalMm: 40.0,
          toleranceUpperMm: 40.02,
          toleranceLowerMm: 39.98,
          readings: [40.005],
        });

      expect(response.status).toBe(400);
      expect(response.body.issues.some((i: any) => i.message.includes('At least 2 dial/micrometer readings'))).toBe(true);
    });

    it('returns 400 when toleranceUpperMm is less than toleranceLowerMm', async () => {
      const response = await request(app)
        .post('/api/v1/qc/first-article/submit')
        .send({
          batchId: 'BATCH-001',
          partNumber: 'SHAFT-01',
          nominalMm: 40.0,
          toleranceUpperMm: 39.90,
          toleranceLowerMm: 40.10,
          readings: [40.005, 40.006],
        });

      expect(response.status).toBe(400);
      expect(response.body.issues.some((i: any) => i.message.includes('toleranceUpperMm must be greater than or equal'))).toBe(true);
    });

    it('returns 201 with batch authorization unlocked on compliant readings', async () => {
      const mockInspection = {
        id: 10,
        batchId: 'BATCH-OK-1',
        partNumber: 'PIN-12MM',
        status: 'ACCEPTED',
        taperDeviationMm: '0.0015',
        readings: JSON.stringify([12.001, 12.002, 12.0025]),
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInspection]),
        }),
      });

      const response = await request(app)
        .post('/api/v1/qc/first-article/submit')
        .send({
          batchId: 'BATCH-OK-1',
          partNumber: 'PIN-12MM',
          nominalMm: 12.0,
          toleranceUpperMm: 12.01,
          toleranceLowerMm: 11.99,
          readings: [12.001, 12.002, 12.0025],
          notes: 'Dial gauge test pass',
        });

      expect(response.status).toBe(201);
      expect(response.body.evaluation.status).toBe('ACCEPTED');
      expect(response.body.evaluation.batchAuthorized).toBe(true);
      expect(response.body.evaluation.isTaperCompliant).toBe(true);
      expect(response.body.evaluation.taperDeviationMm).toBe(0.0015);
      expect(response.body.message).toContain('Batch production authorized');
    });

    it('returns 201 with production hold when taper violates <= 0.003mm threshold', async () => {
      const mockInspection = {
        id: 11,
        batchId: 'BATCH-FAIL-TAPER',
        partNumber: 'PIN-12MM',
        status: 'REJECTED',
        taperDeviationMm: '0.0050',
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInspection]),
        }),
      });

      const response = await request(app)
        .post('/api/v1/qc/first-article/submit')
        .send({
          batchId: 'BATCH-FAIL-TAPER',
          partNumber: 'PIN-12MM',
          nominalMm: 12.0,
          toleranceUpperMm: 12.05,
          toleranceLowerMm: 11.95,
          readings: [12.001, 12.006], // delta 0.005 > 0.003
        });

      expect(response.status).toBe(201);
      expect(response.body.evaluation.status).toBe('REJECTED');
      expect(response.body.evaluation.batchAuthorized).toBe(false);
      expect(response.body.evaluation.isTaperCompliant).toBe(false);
      expect(response.body.message).toContain('Production hold triggered');
    });
  });

  describe('GET /api/v1/qc/first-article/inspections', () => {
    it('returns list of inspections successfully', async () => {
      const mockList = [
        { id: 1, batchId: 'BATCH-A', status: 'ACCEPTED' },
        { id: 2, batchId: 'BATCH-B', status: 'REJECTED' },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockList),
        }),
      });

      const response = await request(app).get('/api/v1/qc/first-article/inspections');

      expect(response.status).toBe(200);
      expect(response.body.inspections).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });
  });
});
