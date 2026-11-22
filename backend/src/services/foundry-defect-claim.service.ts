import crypto from 'crypto';
import rfqEscrowService from './rfq-escrow.service';
import { db } from '../config/database';
import { notifications } from '../models/schema';

export interface PorosityMeasurement {
  location: string;
  voidDepthMm: number;
  voidDiameterMm?: number;
  maxAllowedDepthMm?: number;
}

export interface UltrasonicScanReading {
  attenuationDb: number;
  defectIndication: boolean;
  depthEstimateMm?: number;
  frequencyMhz?: number;
  notes?: string;
}

export type DefectClassification =
  | 'CRITICAL_DEGASSING_DEFECT'
  | 'MODERATE_SHRINKAGE_POROSITY'
  | 'MINOR_SURFACE_BLEMISH';

export type CastingSoundnessStatus =
  | 'REJECTED_POROSITY_EXCEEDED'
  | 'ACCEPTED_WITH_CONCESSION'
  | 'PENDING_METALLURGICAL_AUDIT';

export const CASTING_SOUNDNESS_STANDARDS = {
  STANDARD_CODE: 'ASTM E505 / ISO 4987',
  MAX_PERMISSIBLE_VOID_DEPTH_MM: 3.0,
  CRITICAL_VOID_DEPTH_THRESHOLD_MM: 3.0,
  DEFAULT_DRY_SAND_DEGASSING_MINUTES: 15,
};

export interface DefectClaimSubmissionParams {
  idempotencyKey?: string;
  rfqId: number;
  tenantId: number;
  claimantId: number;
  foundryProviderId: number;
  componentName: string;
  material: string;
  affectedSerialNumbers: string[];
  photoUrls: string[];
  dialGaugeMeasurements: PorosityMeasurement[];
  ultrasonicScanReading?: UltrasonicScanReading;
  milestoneIndex?: number;
  frozenMilestoneAmount?: number;
  notes?: string;
}

export interface FoundryDefectClaim {
  id: string;
  rfqId: number;
  tenantId: number;
  claimantId: number;
  foundryProviderId: number;
  componentName: string;
  material: string;
  affectedSerialNumbers: string[];
  photoUrls: string[];
  dialGaugeMeasurements: PorosityMeasurement[];
  ultrasonicScanReading?: UltrasonicScanReading;
  maxMeasuredDepthMm: number;
  classification: DefectClassification;
  soundnessStatus: CastingSoundnessStatus;
  escrowHoldId?: string;
  frozenMilestoneAmount: number;
  milestoneIndex: number;
  notes?: string;
  status: 'SUBMITTED' | 'UNDER_AUDIT' | 'REMELT_ORDERED' | 'CONCESSION_ACCEPTED' | 'REJECTED';
  remeltOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarrantyRemeltOrder {
  id: string;
  claimId: string;
  rfqId: number;
  tenantId: number;
  foundryProviderId: number;
  machineShopId: number;
  componentName: string;
  material: string;
  affectedSerialNumbers: string[];
  quantity: number;
  clientSurcharge: 0;
  processRequirements: {
    coreType: 'dry_sand_core';
    degassingMethod: 'inert_gas_lance_argon' | 'nitrogen_flux';
    minimumDegassingTimeMinutes: number;
    metallurgicalSpec: string;
  };
  frozenMilestoneAmount: number;
  status: 'ISSUED' | 'MELT_PREPARATION' | 'POURED' | 'METROLOGY_PASSED' | 'DELIVERED';
  dispatchedAt: Date;
  notes?: string;
}

export interface MetallurgicalAuditParams {
  claimId: string;
  tenantId: number;
  auditorId: number;
  verdict: 'DEGASSING_DEFECT' | 'SHRINKAGE_POROSITY' | 'ACCEPTABLE_CONCESSION';
  metallurgicalNotes: string;
  requiresWarrantyRemelt: boolean;
}

export class FoundryDefectClaimService {
  private claims = new Map<string, FoundryDefectClaim>();
  private remeltOrders = new Map<string, WarrantyRemeltOrder>();
  private idempotencyStore = new Map<string, any>();

  /**
   * Submit casting subsurface defect claim with photo and dial depth gauge measurements.
   * Classifies defect against ASTM E505 and freezes escrow when critical void depth >= 3.0mm.
   */
  public async submitDefectClaim(params: DefectClaimSubmissionParams): Promise<FoundryDefectClaim> {
    if (params.idempotencyKey && this.idempotencyStore.has(params.idempotencyKey)) {
      return this.idempotencyStore.get(params.idempotencyKey);
    }

    rfqEscrowService.assertTenantAccess(params.tenantId, params.tenantId);

    if (!params.rfqId || !params.claimantId || !params.foundryProviderId) {
      throw new Error('rfqId, claimantId, and foundryProviderId are required');
    }

    if (!params.photoUrls || params.photoUrls.length === 0) {
      throw new Error('At least one defect photograph is required for casting porosity claim');
    }

    if (!params.dialGaugeMeasurements || params.dialGaugeMeasurements.length === 0) {
      throw new Error('Dial gauge depth measurements are required for porosity evaluation');
    }

    if (!params.affectedSerialNumbers || params.affectedSerialNumbers.length === 0) {
      throw new Error('Affected casting serial numbers must be specified');
    }

    // Evaluate maximum void depth
    const maxMeasuredDepthMm = Math.max(...params.dialGaugeMeasurements.map((m) => m.voidDepthMm));

    let classification: DefectClassification;
    let soundnessStatus: CastingSoundnessStatus;

    if (maxMeasuredDepthMm >= CASTING_SOUNDNESS_STANDARDS.CRITICAL_VOID_DEPTH_THRESHOLD_MM) {
      classification = 'CRITICAL_DEGASSING_DEFECT';
      soundnessStatus = 'REJECTED_POROSITY_EXCEEDED';
    } else if (maxMeasuredDepthMm >= 1.0) {
      classification = 'MODERATE_SHRINKAGE_POROSITY';
      soundnessStatus = 'PENDING_METALLURGICAL_AUDIT';
    } else {
      classification = 'MINOR_SURFACE_BLEMISH';
      soundnessStatus = 'ACCEPTED_WITH_CONCESSION';
    }

    const claimUuid = crypto.randomBytes(4).toString('hex').toUpperCase();
    const claimId = `CLAIM-CAST-RFQ${params.rfqId}-${claimUuid}`;
    const frozenMilestoneAmount = params.frozenMilestoneAmount ?? 165000;
    const milestoneIndex = params.milestoneIndex ?? 1;

    let escrowHoldId: string | undefined;

    // Freeze escrow disbursement if critical defect detected
    if (soundnessStatus === 'REJECTED_POROSITY_EXCEEDED' || soundnessStatus === 'PENDING_METALLURGICAL_AUDIT') {
      const holdResult = rfqEscrowService.applyTechnicalHold({
        rfqId: params.rfqId,
        tenantId: params.tenantId,
        milestoneIndex,
        holdType: 'HOLD_WARRANTY_INVESTIGATION',
        reason: `Subsurface porosity void depth (${maxMeasuredDepthMm} mm) exceeds ASTM E505 soundness threshold (3.0 mm)`,
        referenceId: claimId,
        affectedSerialNumbers: params.affectedSerialNumbers,
      });
      escrowHoldId = holdResult.hold.id;
    }

    const claim: FoundryDefectClaim = {
      id: claimId,
      rfqId: params.rfqId,
      tenantId: params.tenantId,
      claimantId: params.claimantId,
      foundryProviderId: params.foundryProviderId,
      componentName: params.componentName || 'Casting Component',
      material: params.material || 'Gray Cast Iron',
      affectedSerialNumbers: params.affectedSerialNumbers,
      photoUrls: params.photoUrls,
      dialGaugeMeasurements: params.dialGaugeMeasurements,
      ultrasonicScanReading: params.ultrasonicScanReading,
      maxMeasuredDepthMm,
      classification,
      soundnessStatus,
      escrowHoldId,
      frozenMilestoneAmount,
      milestoneIndex,
      notes: params.notes,
      status: 'SUBMITTED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.claims.set(claimId, claim);

    // Record notification for foundry manager
    try {
      if (db && db.insert) {
        await db.insert(notifications).values({
          userId: params.foundryProviderId,
          type: 'order',
          title: `Foundry Defect Claim Filed: ${claimId}`,
          message: `Defect claim logged for RFQ #${params.rfqId}. Subsurface void depth: ${maxMeasuredDepthMm} mm. Milestone disbursement frozen under warranty investigation.`,
          relatedType: 'order',
          relatedId: params.rfqId,
        });
      }
    } catch (err) {
      // Non-blocking notification fallback
    }

    if (params.idempotencyKey) {
      this.idempotencyStore.set(params.idempotencyKey, claim);
    }

    return claim;
  }

  /**
   * Process metallurgical auditor review and issue mandatory zero-cost Warranty Remelt Order.
   */
  public async processMetallurgicalAudit(params: MetallurgicalAuditParams): Promise<{
    claim: FoundryDefectClaim;
    remeltOrder?: WarrantyRemeltOrder;
  }> {
    rfqEscrowService.assertTenantAccess(params.tenantId, params.tenantId);

    const claim = this.claims.get(params.claimId);
    if (!claim) {
      throw new Error(`Defect claim ${params.claimId} not found`);
    }

    if (params.verdict === 'DEGASSING_DEFECT' || params.requiresWarrantyRemelt) {
      const orderUuid = crypto.randomBytes(4).toString('hex').toUpperCase();
      const remeltOrderId = `REMELT-RFQ${claim.rfqId}-${orderUuid}`;

      const remeltOrder: WarrantyRemeltOrder = {
        id: remeltOrderId,
        claimId: claim.id,
        rfqId: claim.rfqId,
        tenantId: claim.tenantId,
        foundryProviderId: claim.foundryProviderId,
        machineShopId: claim.claimantId,
        componentName: claim.componentName,
        material: claim.material,
        affectedSerialNumbers: claim.affectedSerialNumbers,
        quantity: claim.affectedSerialNumbers.length,
        clientSurcharge: 0,
        processRequirements: {
          coreType: 'dry_sand_core',
          degassingMethod: 'inert_gas_lance_argon',
          minimumDegassingTimeMinutes: CASTING_SOUNDNESS_STANDARDS.DEFAULT_DRY_SAND_DEGASSING_MINUTES,
          metallurgicalSpec: 'ASTM E505 Sound Casting with Dry-Sand Core and Inert Lance Degassing',
        },
        frozenMilestoneAmount: claim.frozenMilestoneAmount,
        status: 'ISSUED',
        dispatchedAt: new Date(),
        notes: params.metallurgicalNotes,
      };

      this.remeltOrders.set(remeltOrderId, remeltOrder);

      claim.status = 'REMELT_ORDERED';
      claim.remeltOrderId = remeltOrderId;
      claim.updatedAt = new Date();

      // Notify foundry manager of mandatory zero-cost remelt obligation
      try {
        if (db && db.insert) {
          await db.insert(notifications).values({
            userId: claim.foundryProviderId,
            type: 'order',
            title: `Mandatory Warranty Remelt Order: ${remeltOrderId}`,
            message: `Metallurgical audit verified degassing defect on RFQ #${claim.rfqId}. Zero-cost dry-sand core remelt required before escrow milestone release.`,
            relatedType: 'order',
            relatedId: claim.rfqId,
          });
        }
      } catch (err) {
        // Non-blocking notification fallback
      }

      return { claim, remeltOrder };
    } else {
      claim.status = 'CONCESSION_ACCEPTED';
      claim.updatedAt = new Date();
      return { claim };
    }
  }

  /**
   * Get defect claim by ID.
   */
  public getClaim(claimId: string): FoundryDefectClaim | undefined {
    return this.claims.get(claimId);
  }

  /**
   * Get warranty remelt order by ID.
   */
  public getRemeltOrder(orderId: string): WarrantyRemeltOrder | undefined {
    return this.remeltOrders.get(orderId);
  }

  /**
   * List claims associated with an RFQ.
   */
  public getClaimsByRfq(rfqId: number): FoundryDefectClaim[] {
    const results: FoundryDefectClaim[] = [];
    for (const claim of this.claims.values()) {
      if (claim.rfqId === rfqId) {
        results.push(claim);
      }
    }
    return results;
  }

  /**
   * Reset in-memory storage (for testing).
   */
  public clearStore(): void {
    this.claims.clear();
    this.remeltOrders.clear();
    this.idempotencyStore.clear();
  }
}

export default new FoundryDefectClaimService();
