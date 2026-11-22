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

import qcRouter from './qc.routes';
import {
  validateToolCalibration,
  registerToolCalibration,
} from '../services/tool-calibration.service';

const app = express();
app.use(express.json());
app.use('/api/v1/qc', qcRouter);

describe('US-X-03: Measuring Tool Calibration Registry Check (KAN-61)', () => {
  describe('Tool Calibration Service (validateToolCalibration)', () => {
    it('verifies that Sunday digital micrometer expired 14 days ago is detected and flagged', () => {
      // Given Sunday digital micrometer that expired 14 days ago (relative to Nov 21, 2026)
      const asOf = new Date('2026-11-21T20:00:00.000Z');
      const result = validateToolCalibration('TOOL-MIC-EXP-14D', asOf);

      expect(result.isValid).toBe(false);
      expect(result.daysExpired).toBe(14);
      expect(result.recalibrationRequired).toBe(true);
      expect(result.error).toBe(
        'TOOL CALIBRATION EXPIRED: Use certified tool or schedule hub recalibration'
      );
      expect(result.tool?.status).toBe('EXPIRED');
    });

    it('verifies that an accredited active tool is accepted without error', () => {
      const asOf = new Date('2026-11-21T20:00:00.000Z');
      const result = validateToolCalibration('TOOL-MITU-001', asOf);

      expect(result.isValid).toBe(true);
      expect(result.daysExpired).toBe(0);
      expect(result.recalibrationRequired).toBe(false);
      expect(result.tool?.status).toBe('ACTIVE');
      expect(result.tool?.accreditationBody).toContain('ISO/IEC 17025');
    });

    it('rejects an unregistered or unknown tool ID', () => {
      const result = validateToolCalibration('UNKNOWN-GAUGE-999');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('UNKNOWN_TOOL_ID');
    });
  });

  describe('First-Article Submission with Calibration Enforcement (POST /api/v1/qc/first-article/submit)', () => {
    const compliantReadings = [40.008, 40.007, 40.009]; // 0.0020 mm taper <= 0.003 mm

    it('blocks submission and returns 422 when tool calibration has expired', async () => {
      // Given a digital micrometer with an annual calibration stamp that expired 14 days ago
      // When Sunday enters the tool ID to log first-article journal readings
      const response = await request(app)
        .post('/api/v1/qc/first-article/submit')
        .send({
          batchId: 'BATCH-2026-SUNDAY-01',
          partNumber: 'SHAFT-40MM-CNC',
          operatorName: 'Sunday Quality Machinist',
          measuringToolId: 'TOOL-MIC-EXP-14D',
          nominalMm: 40.0,
          toleranceUpperMm: 40.02,
          toleranceLowerMm: 39.98,
          maxTaperMm: 0.003,
          readings: compliantReadings,
        });

      // Then the app blocks submission
      expect(response.status).toBe(422);

      // And displays: "TOOL CALIBRATION EXPIRED: Use certified tool or schedule hub recalibration"
      expect(response.body.error).toBe('TOOL_CALIBRATION_EXPIRED');
      expect(response.body.message).toBe(
        'TOOL CALIBRATION EXPIRED: Use certified tool or schedule hub recalibration'
      );
      expect(response.body.daysExpired).toBe(14);

      // And requires entry of an accredited tool serial number to proceed
      expect(response.body.requiredAction).toBe('REQUIRES_ACCREDITED_TOOL_SERIAL');
    });

    it('permits submission and unlocks authorization when an accredited tool is provided', async () => {
      // When Sunday switches to an accredited Mitutoyo digital micrometer
      const response = await request(app)
        .post('/api/v1/qc/first-article/submit')
        .send({
          batchId: 'BATCH-2026-SUNDAY-02',
          partNumber: 'SHAFT-40MM-CNC',
          operatorName: 'Sunday Quality Machinist',
          measuringToolId: 'TOOL-MITU-001',
          nominalMm: 40.0,
          toleranceUpperMm: 40.02,
          toleranceLowerMm: 39.98,
          maxTaperMm: 0.003,
          readings: compliantReadings,
        });

      expect(response.status).toBe(201);
      expect(response.body.evaluation.status).toBe('ACCEPTED');
      expect(response.body.evaluation.batchAuthorized).toBe(true);
      expect(response.body.evaluation.taperDeviationMm).toBe(0.002);
    });
  });

  describe('Tool Calibration Registry Routes', () => {
    it('GET /api/v1/qc/calibration/:toolId returns calibration status', async () => {
      const response = await request(app).get('/api/v1/qc/calibration/TOOL-MIC-EXP-14D');
      expect(response.status).toBe(200);
      expect(response.body.isValid).toBe(false);
      expect(response.body.status).toBe('EXPIRED');
      expect(response.body.error).toContain('TOOL CALIBRATION EXPIRED');
    });

    it('POST /api/v1/qc/calibration/register creates new accredited calibration record', async () => {
      const newTool = {
        toolId: 'TOOL-STARRETT-771',
        toolType: 'dial_indicator' as const,
        serialNumber: 'STAR-77182',
        manufacturer: 'Starrett',
        calibrationDate: '2026-11-01T00:00:00.000Z',
        calibrationExpirationDate: '2027-11-01T00:00:00.000Z',
        accreditationBody: 'ISO/IEC 17025',
        certificateNumber: 'CERT-STAR-2026-90',
        hubId: 'HUB-LAGOS-CENTRAL',
        status: 'ACTIVE' as const,
      };

      const response = await request(app).post('/api/v1/qc/calibration/register').send(newTool);
      expect(response.status).toBe(201);
      expect(response.body.tool.toolId).toBe('TOOL-STARRETT-771');

      // Verify immediate look-up
      const check = await request(app).get('/api/v1/qc/calibration/TOOL-STARRETT-771');
      expect(check.status).toBe(200);
      expect(check.body.isValid).toBe(true);
      expect(check.body.status).toBe('ACTIVE');
    });
  });
});
