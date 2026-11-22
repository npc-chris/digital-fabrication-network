import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'super-secure-test-jwt-secret-32-chars-long';

// Mock database module
jest.mock('../config/database', () => {
  return {
    db: {
      select: jest.fn(),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue([{ id: 1 }]),
      }),
      update: jest.fn(),
    },
  };
});

import foundryDefectRoutes from './foundry-defect.routes';
import foundryDefectClaimService from '../services/foundry-defect-claim.service';
import rfqEscrowService, { TechnicalHoldActiveError } from '../services/rfq-escrow.service';
import { db } from '../config/database';

describe('Foundry Defect Claim & Automated Warranty Remelt (KAN-48)', () => {
  let app: express.Express;

  const machineShopSupervisorToken = jwt.sign(
    { id: 202, email: 'sunday@machinefab.ng', role: 'provider' },
    process.env.JWT_SECRET!
  );

  const foundryManagerToken = jwt.sign(
    { id: 205, email: 'babajide@castfoundry.ng', role: 'provider' },
    process.env.JWT_SECRET!
  );

  beforeEach(() => {
    jest.clearAllMocks();
    rfqEscrowService.clearIdempotencyStore();
    foundryDefectClaimService.clearStore();

    app = express();
    app.use(express.json());
    app.use('/api/v1/foundry', foundryDefectRoutes);
  });

  describe('FoundryDefectClaimService (Unit Tests)', () => {
    it('rejects submission when defect photos or dial measurements are missing', async () => {
      await expect(
        foundryDefectClaimService.submitDefectClaim({
          rfqId: 501,
          tenantId: 10,
          claimantId: 202,
          foundryProviderId: 205,
          componentName: 'Saddle Casting',
          material: 'Gray Cast Iron Class 35',
          affectedSerialNumbers: ['SC-01'],
          photoUrls: [],
          dialGaugeMeasurements: [{ location: 'Guideway Face', voidDepthMm: 15.0 }],
        })
      ).rejects.toThrow('At least one defect photograph is required');

      await expect(
        foundryDefectClaimService.submitDefectClaim({
          rfqId: 501,
          tenantId: 10,
          claimantId: 202,
          foundryProviderId: 205,
          componentName: 'Saddle Casting',
          material: 'Gray Cast Iron Class 35',
          affectedSerialNumbers: ['SC-01'],
          photoUrls: ['https://storage.dfn.network/photos/void-01.jpg'],
          dialGaugeMeasurements: [],
        })
      ).rejects.toThrow('Dial gauge depth measurements are required');
    });

    it('classifies 15 mm porosity voids across guideway as critical degassing defect and freezes ₦165,000 escrow milestone', async () => {
      const claim = await foundryDefectClaimService.submitDefectClaim({
        idempotencyKey: 'claim-sc-01',
        rfqId: 501,
        tenantId: 10,
        claimantId: 202,
        foundryProviderId: 205,
        componentName: 'Saddle Casting',
        material: 'Gray Cast Iron Class 35',
        affectedSerialNumbers: ['SC-001', 'SC-002'],
        photoUrls: ['https://storage.dfn.network/photos/subsurface-porosity.jpg'],
        dialGaugeMeasurements: [
          { location: 'Guideway Face A', voidDepthMm: 15.0, voidDiameterMm: 8.5 },
          { location: 'Guideway Face B', voidDepthMm: 12.0, voidDiameterMm: 6.0 },
        ],
        ultrasonicScanReading: {
          attenuationDb: 24.5,
          defectIndication: true,
          notes: 'Extensive subsurface attenuation indicating widespread gas bubbles',
        },
        frozenMilestoneAmount: 165000,
        milestoneIndex: 1,
      });

      expect(claim.classification).toBe('CRITICAL_DEGASSING_DEFECT');
      expect(claim.soundnessStatus).toBe('REJECTED_POROSITY_EXCEEDED');
      expect(claim.maxMeasuredDepthMm).toBe(15.0);
      expect(claim.frozenMilestoneAmount).toBe(165000);
      expect(claim.escrowHoldId).toBeDefined();

      // Verify that KAN-45 escrow engine blocks milestone disbursement
      const holdCheck = rfqEscrowService.isTechnicalHoldActive(501, 1);
      expect(holdCheck.active).toBe(true);
      expect(holdCheck.hold?.holdType).toBe('HOLD_WARRANTY_INVESTIGATION');

      // Attempting to release frozen milestone must throw TechnicalHoldActiveError
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: 205, verificationStatus: 'verified' }]),
        }),
      });

      await expect(
        rfqEscrowService.releaseMilestone({
          idempotencyKey: 'rel-try-frozen',
          rfqId: 501,
          tenantId: 10,
          milestoneIndex: 1,
          providerId: 205,
        })
      ).rejects.toThrow(TechnicalHoldActiveError);
    });

    it('issues mandatory zero client surcharge Warranty Remelt Order upon metallurgical auditor degassing verdict', async () => {
      const claim = await foundryDefectClaimService.submitDefectClaim({
        rfqId: 501,
        tenantId: 10,
        claimantId: 202,
        foundryProviderId: 205,
        componentName: 'Saddle Casting',
        material: 'Gray Cast Iron Class 35',
        affectedSerialNumbers: ['SC-001', 'SC-002'],
        photoUrls: ['https://storage.dfn.network/photos/void.jpg'],
        dialGaugeMeasurements: [{ location: 'Face', voidDepthMm: 15.0 }],
        frozenMilestoneAmount: 165000,
      });

      const auditResult = await foundryDefectClaimService.processMetallurgicalAudit({
        claimId: claim.id,
        tenantId: 10,
        auditorId: 301,
        verdict: 'DEGASSING_DEFECT',
        metallurgicalNotes: 'Inadequate ladle degassing caused massive nitrogen/hydrogen bubble entrapment',
        requiresWarrantyRemelt: true,
      });

      expect(auditResult.claim.status).toBe('REMELT_ORDERED');
      expect(auditResult.remeltOrder).toBeDefined();
      expect(auditResult.remeltOrder?.clientSurcharge).toBe(0);
      expect(auditResult.remeltOrder?.quantity).toBe(2);
      expect(auditResult.remeltOrder?.processRequirements.coreType).toBe('dry_sand_core');
      expect(auditResult.remeltOrder?.processRequirements.degassingMethod).toBe('inert_gas_lance_argon');
      expect(auditResult.remeltOrder?.frozenMilestoneAmount).toBe(165000);
    });
  });

  describe('Foundry Defect Routes (API Tests)', () => {
    it('POST /api/v1/foundry/defect-claims creates claim and freezes escrow milestone', async () => {
      const response = await request(app)
        .post('/api/v1/foundry/defect-claims')
        .set('Authorization', `Bearer ${machineShopSupervisorToken}`)
        .send({
          rfqId: 701,
          tenantId: 10,
          foundryProviderId: 205,
          componentName: 'Cast Iron Saddle',
          material: 'ASTM A48 Class 35 Gray Iron',
          affectedSerialNumbers: ['SN-01', 'SN-02'],
          photoUrls: ['https://storage.dfn.network/photos/porosity.jpg'],
          dialGaugeMeasurements: [{ location: 'Way Face', voidDepthMm: 15.0 }],
          frozenMilestoneAmount: 165000,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.claim.classification).toBe('CRITICAL_DEGASSING_DEFECT');
      expect(response.body.claim.soundnessStatus).toBe('REJECTED_POROSITY_EXCEEDED');

      // Verify active escrow hold
      const activeHolds = rfqEscrowService.getActiveTechnicalHolds(701);
      expect(activeHolds).toHaveLength(1);
      expect(activeHolds[0].holdType).toBe('HOLD_WARRANTY_INVESTIGATION');
    });

    it('GET /api/v1/foundry/defect-claims/:claimId returns claim details', async () => {
      const claim = await foundryDefectClaimService.submitDefectClaim({
        rfqId: 702,
        tenantId: 10,
        claimantId: 202,
        foundryProviderId: 205,
        componentName: 'Hydraulic Cylinder Cap',
        material: 'Ductile Iron 65-45-12',
        affectedSerialNumbers: ['HYD-01'],
        photoUrls: ['https://storage.dfn.network/photos/cap.jpg'],
        dialGaugeMeasurements: [{ location: 'Bore', voidDepthMm: 4.2 }],
      });

      const response = await request(app)
        .get(`/api/v1/foundry/defect-claims/${claim.id}`)
        .set('Authorization', `Bearer ${machineShopSupervisorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.claim.id).toBe(claim.id);
      expect(response.body.claim.maxMeasuredDepthMm).toBe(4.2);
    });

    it('POST /api/v1/foundry/defect-claims/:claimId/audit-verdict generates zero client surcharge remelt order', async () => {
      const claim = await foundryDefectClaimService.submitDefectClaim({
        rfqId: 703,
        tenantId: 10,
        claimantId: 202,
        foundryProviderId: 205,
        componentName: 'Milling Table',
        material: 'Cast Iron',
        affectedSerialNumbers: ['MT-01'],
        photoUrls: ['https://storage.dfn.network/photos/mt01.jpg'],
        dialGaugeMeasurements: [{ location: 'T-Slot', voidDepthMm: 6.0 }],
        frozenMilestoneAmount: 165000,
      });

      const response = await request(app)
        .post(`/api/v1/foundry/defect-claims/${claim.id}/audit-verdict`)
        .set('Authorization', `Bearer ${foundryManagerToken}`)
        .send({
          tenantId: 10,
          verdict: 'DEGASSING_DEFECT',
          metallurgicalNotes: 'Gas porosity verified under microscopy',
          requiresWarrantyRemelt: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.remeltOrder.clientSurcharge).toBe(0);
      expect(response.body.remeltOrder.processRequirements.coreType).toBe('dry_sand_core');

      // Check remelt order lookup
      const remeltRes = await request(app)
        .get(`/api/v1/foundry/remelt-orders/${response.body.remeltOrder.id}`)
        .set('Authorization', `Bearer ${machineShopSupervisorToken}`);

      expect(remeltRes.status).toBe(200);
      expect(remeltRes.body.remeltOrder.id).toBe(response.body.remeltOrder.id);
    });
  });
});
