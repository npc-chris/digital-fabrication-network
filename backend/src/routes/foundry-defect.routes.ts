import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import foundryDefectClaimService from '../services/foundry-defect-claim.service';

const router = Router();

/**
 * POST /api/v1/foundry/defect-claims
 * File a casting subsurface porosity defect claim with photo and dial depth gauge measurements.
 */
router.post('/defect-claims', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      idempotencyKey,
      rfqId,
      tenantId,
      claimantId,
      foundryProviderId,
      componentName,
      material,
      affectedSerialNumbers,
      photoUrls,
      dialGaugeMeasurements,
      ultrasonicScanReading,
      milestoneIndex,
      frozenMilestoneAmount,
      notes,
    } = req.body;

    if (!rfqId || !tenantId || !foundryProviderId) {
      return res.status(400).json({
        error: 'rfqId, tenantId, and foundryProviderId are required',
      });
    }

    if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
      return res.status(400).json({
        error: 'At least one defect photograph is required',
      });
    }

    if (!dialGaugeMeasurements || !Array.isArray(dialGaugeMeasurements) || dialGaugeMeasurements.length === 0) {
      return res.status(400).json({
        error: 'Dial depth gauge measurements are required for casting evaluation',
      });
    }

    if (!affectedSerialNumbers || !Array.isArray(affectedSerialNumbers) || affectedSerialNumbers.length === 0) {
      return res.status(400).json({
        error: 'Affected casting serial numbers are required',
      });
    }

    const claim = await foundryDefectClaimService.submitDefectClaim({
      idempotencyKey,
      rfqId: Number(rfqId),
      tenantId: Number(tenantId),
      claimantId: Number(claimantId || req.user?.id || 1),
      foundryProviderId: Number(foundryProviderId),
      componentName: String(componentName || 'Casting Component'),
      material: String(material || 'Gray Cast Iron'),
      affectedSerialNumbers,
      photoUrls,
      dialGaugeMeasurements,
      ultrasonicScanReading,
      milestoneIndex: milestoneIndex !== undefined ? Number(milestoneIndex) : undefined,
      frozenMilestoneAmount: frozenMilestoneAmount !== undefined ? Number(frozenMilestoneAmount) : undefined,
      notes,
    });

    return res.status(201).json({
      success: true,
      claim,
      message:
        claim.soundnessStatus === 'REJECTED_POROSITY_EXCEEDED'
          ? 'Defect exceeds ASTM E505 limits; foundry milestone disbursement has been frozen under warranty investigation'
          : 'Defect claim submitted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error submitting defect claim' });
  }
});

/**
 * GET /api/v1/foundry/defect-claims/:claimId
 * Retrieve defect claim details.
 */
router.get('/defect-claims/:claimId', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const rawClaimId = req.params.claimId;
    const claimId = Array.isArray(rawClaimId) ? rawClaimId[0] : String(rawClaimId);
    const claim = foundryDefectClaimService.getClaim(claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Defect claim not found' });
    }
    return res.status(200).json({ success: true, claim });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching defect claim' });
  }
});

/**
 * POST /api/v1/foundry/defect-claims/:claimId/audit-verdict
 * Record metallurgical auditor assessment and issue zero-cost Warranty Remelt Order.
 */
router.post('/defect-claims/:claimId/audit-verdict', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { tenantId, auditorId, verdict, metallurgicalNotes, requiresWarrantyRemelt } = req.body;

    if (!tenantId || !verdict) {
      return res.status(400).json({
        error: 'tenantId and verdict are required',
      });
    }

    const rawClaimId = req.params.claimId;
    const claimId = Array.isArray(rawClaimId) ? rawClaimId[0] : String(rawClaimId);

    const result = await foundryDefectClaimService.processMetallurgicalAudit({
      claimId,
      tenantId: Number(tenantId),
      auditorId: Number(auditorId || req.user?.id || 1),
      verdict,
      metallurgicalNotes: metallurgicalNotes || 'Auditor verdict logged',
      requiresWarrantyRemelt: Boolean(requiresWarrantyRemelt ?? verdict === 'DEGASSING_DEFECT'),
    });

    return res.status(200).json({
      success: true,
      ...result,
      message: result.remeltOrder
        ? 'Mandatory zero-cost Warranty Remelt Order dispatched to foundry'
        : 'Audit verdict processed',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error processing audit verdict' });
  }
});

/**
 * GET /api/v1/foundry/remelt-orders/:orderId
 * Retrieve warranty remelt order details.
 */
router.get('/remelt-orders/:orderId', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const rawOrderId = req.params.orderId;
    const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : String(rawOrderId);
    const remeltOrder = foundryDefectClaimService.getRemeltOrder(orderId);
    if (!remeltOrder) {
      return res.status(404).json({ error: 'Warranty remelt order not found' });
    }
    return res.status(200).json({ success: true, remeltOrder });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching remelt order' });
  }
});

/**
 * GET /api/v1/foundry/claims-by-rfq/:rfqId
 * List claims for a specific RFQ.
 */
router.get('/claims-by-rfq/:rfqId', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const rfqId = Number(req.params.rfqId);
    const claims = foundryDefectClaimService.getClaimsByRfq(rfqId);
    return res.status(200).json({ success: true, rfqId, claims });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching claims for RFQ' });
  }
});

export default router;
