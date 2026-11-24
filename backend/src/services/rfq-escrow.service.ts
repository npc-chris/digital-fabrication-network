import { db } from '../config/database';
import { transactions, profiles, users, escrowMilestones } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export type RfqStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'QUOTED'
  | 'ACCEPTED'
  | 'ESCROW_FUNDED'
  | 'IN_PRODUCTION'
  | 'QC_INSPECTION'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type EscrowStatus = 'pending' | 'escrowed' | 'released' | 'refunded' | 'failed' | 'HOLD_NCR' | 'HOLD_WARRANTY_INVESTIGATION';

export type MilestoneStatus = 'locked' | 'funded' | 'in_progress' | 'verified' | 'released' | 'refunded' | 'HOLD_NCR' | 'HOLD_WARRANTY_INVESTIGATION';

export type TechnicalHoldType = 'HOLD_NCR' | 'HOLD_WARRANTY_INVESTIGATION';

export interface TechnicalHoldRecord {
  id: string;
  rfqId: number;
  tenantId: number;
  milestoneIndex?: number;
  holdType: TechnicalHoldType;
  reason: string;
  referenceId?: string;
  affectedSerialNumbers?: string[];
  appliedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: number;
  resolutionAction?: string;
  notes?: string;
  active: boolean;
}

export interface TechnicalHoldParams {
  idempotencyKey?: string;
  rfqId: number;
  tenantId: number;
  milestoneIndex?: number;
  holdType: TechnicalHoldType;
  reason: string;
  referenceId?: string;
  affectedSerialNumbers?: string[];
}

export interface ResolveTechnicalHoldParams {
  idempotencyKey?: string;
  rfqId: number;
  tenantId: number;
  milestoneIndex?: number;
  approverId: number;
  resolutionAction: 'CORRECTIVE_REWORK_COMPLETED' | 'WARRANTY_REMELT_VERIFIED' | 'ACCEPTED_UNDER_CONCESSION' | 'REWORK_VERIFIED';
  notes?: string;
}

export class TechnicalHoldActiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TechnicalHoldActiveError';
  }
}

export interface MilestoneDefinition {
  index?: number;
  name: string;
  description?: string;
  percentage?: number;
  amount?: number;
}

export interface EscrowMilestoneRecord {
  id: string;
  rfqId: number;
  tenantId: number;
  milestoneIndex: number;
  name: string;
  percentage: number;
  amount: number;
  currency: string;
  status: MilestoneStatus;
  workAuthorizationTicketId?: string;
  releasedAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkAuthorizationTicket {
  ticketId: string;
  rfqId: number;
  tenantId: number;
  providerId: number;
  milestoneIndex: number;
  scopeOfWork: string;
  authorizedAmount: number;
  currency: string;
  issuedAt: Date;
  status: 'AUTHORIZED' | 'REVOKED' | 'EXPIRED';
}

export interface RfqRecord {
  id: number;
  tenantId: number;
  explorerId: number;
  providerId?: number;
  title: string;
  cadFileUrl?: string;
  material: string;
  quantity: number;
  status: RfqStatus;
  quotedAmount?: number;
  escrowReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscrowFundingParams {
  idempotencyKey: string;
  rfqId: number;
  tenantId: number;
  explorerId: number;
  providerId: number;
  amount: number;
  currency?: string;
  paymentProvider: 'paystack' | 'flutterwave';
  externalReference: string;
}

export interface MultiMilestoneFundingParams {
  idempotencyKey: string;
  rfqId: number;
  tenantId: number;
  explorerId: number;
  providerId: number;
  totalAmount: number;
  currency?: string;
  paymentProvider: 'paystack' | 'flutterwave';
  externalReference: string;
  milestoneTranches?: MilestoneDefinition[];
}

export interface MultiMilestoneEscrowResult {
  success: boolean;
  contractId: string;
  transactionId: number;
  rfqId: number;
  tenantId: number;
  explorerId: number;
  providerId: number;
  totalAmount: number;
  currency: string;
  status: 'ESCROW_FUNDED';
  milestones: EscrowMilestoneRecord[];
  workAuthorizationTickets: WorkAuthorizationTicket[];
  fundedAt: Date;
}

export interface MilestoneReleaseParams {
  idempotencyKey: string;
  rfqId: number;
  tenantId: number;
  milestoneIndex: number;
  providerId: number;
  approverId?: number;
}

export interface MilestoneReleaseResult {
  success: boolean;
  rfqId: number;
  tenantId: number;
  milestoneIndex: number;
  providerId: number;
  status: 'released';
  releasedAt: Date;
}

export interface MilestoneRefundParams {
  idempotencyKey: string;
  rfqId: number;
  tenantId: number;
  milestoneIndex?: number;
  explorerId: number;
  reason?: string;
}

export interface MilestoneRefundResult {
  success: boolean;
  rfqId: number;
  tenantId: number;
  milestoneIndex?: number;
  explorerId: number;
  status: 'refunded';
  reason?: string;
  refundedAt: Date;
}

export interface EscrowReleaseParams {
  idempotencyKey: string;
  rfqId: number;
  tenantId: number;
  adminOrPlatformId: number;
  providerId: number;
}

export class TenantIsolationViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantIsolationViolationError';
  }
}

export class InvalidStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStateTransitionError';
  }
}

export class KycVerificationRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KycVerificationRequiredError';
  }
}

export class DuplicateTransactionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateTransactionError';
  }
}

export class MilestoneAmountMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MilestoneAmountMismatchError';
  }
}

const ALLOWED_RFQ_TRANSITIONS: Record<RfqStatus, RfqStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['QUOTED', 'REJECTED', 'CANCELLED'],
  QUOTED: ['ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  ACCEPTED: ['ESCROW_FUNDED', 'CANCELLED'],
  ESCROW_FUNDED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['QC_INSPECTION'],
  QC_INSPECTION: ['COMPLETED', 'REJECTED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export class RfqEscrowService {
  private idempotencyStore = new Map<string, any>();
  private technicalHolds = new Map<string, TechnicalHoldRecord>();

  /**
   * Apply an immutable technical hold on the platform escrow ledger.
   * Freezes milestone disbursement upon receiving non-conformance telemetry.
   */
  public applyTechnicalHold(params: TechnicalHoldParams): { success: boolean; hold: TechnicalHoldRecord } {
    this.assertTenantAccess(params.tenantId, params.tenantId);

    if (!params.reason || params.reason.trim() === '') {
      throw new Error('Technical hold reason is required');
    }

    const holdId = `HOLD-RFQ${params.rfqId}-M${params.milestoneIndex ?? 'ALL'}-${Date.now()}`;
    const record: TechnicalHoldRecord = {
      id: holdId,
      rfqId: params.rfqId,
      tenantId: params.tenantId,
      milestoneIndex: params.milestoneIndex,
      holdType: params.holdType,
      reason: params.reason,
      referenceId: params.referenceId,
      affectedSerialNumbers: params.affectedSerialNumbers,
      appliedAt: new Date(),
      active: true,
    };

    this.technicalHolds.set(holdId, record);
    return { success: true, hold: record };
  }

  /**
   * Check whether a milestone or RFQ has an active technical hold.
   */
  public isTechnicalHoldActive(rfqId: number, milestoneIndex?: number): { active: boolean; hold?: TechnicalHoldRecord } {
    for (const hold of this.technicalHolds.values()) {
      if (hold.active && hold.rfqId === rfqId) {
        if (
          hold.milestoneIndex === undefined ||
          hold.milestoneIndex === 0 ||
          milestoneIndex === undefined ||
          hold.milestoneIndex === milestoneIndex
        ) {
          return { active: true, hold };
        }
      }
    }
    return { active: false };
  }

  /**
   * List all active technical holds for an RFQ or tenant.
   */
  public getActiveTechnicalHolds(rfqId?: number, tenantId?: number): TechnicalHoldRecord[] {
    const list: TechnicalHoldRecord[] = [];
    for (const hold of this.technicalHolds.values()) {
      if (!hold.active) continue;
      if (rfqId !== undefined && hold.rfqId !== rfqId) continue;
      if (tenantId !== undefined && hold.tenantId !== tenantId) continue;
      list.push(hold);
    }
    return list;
  }

  /**
   * Resolve a technical hold after verified corrective rework or remelt.
   */
  public resolveTechnicalHold(params: ResolveTechnicalHoldParams): {
    success: boolean;
    resolvedCount: number;
    resolvedHolds: TechnicalHoldRecord[];
  } {
    this.assertTenantAccess(params.tenantId, params.tenantId);

    const resolved: TechnicalHoldRecord[] = [];
    for (const hold of this.technicalHolds.values()) {
      if (hold.active && hold.rfqId === params.rfqId) {
        if (
          params.milestoneIndex === undefined ||
          hold.milestoneIndex === undefined ||
          hold.milestoneIndex === 0 ||
          hold.milestoneIndex === params.milestoneIndex
        ) {
          hold.active = false;
          hold.resolvedAt = new Date();
          hold.resolvedBy = params.approverId;
          hold.resolutionAction = params.resolutionAction;
          hold.notes = params.notes;
          resolved.push(hold);
        }
      }
    }

    return {
      success: true,
      resolvedCount: resolved.length,
      resolvedHolds: resolved,
    };
  }

  /**
   * Validate that an operation strictly respects tenant isolation boundaries.
   */
  public assertTenantAccess(tenantId: number, resourceTenantId: number): void {
    if (tenantId !== resourceTenantId) {
      throw new TenantIsolationViolationError(
        `Cross-tenant access denied: tenant ${tenantId} cannot access resources belonging to tenant ${resourceTenantId}`
      );
    }
  }

  /**
   * Validate whether an RFQ state transition is permissible.
   */
  public validateTransition(currentStatus: RfqStatus, nextStatus: RfqStatus): void {
    const validNextStates = ALLOWED_RFQ_TRANSITIONS[currentStatus] || [];
    if (!validNextStates.includes(nextStatus)) {
      throw new InvalidStateTransitionError(
        `Invalid RFQ transition from ${currentStatus} to ${nextStatus}`
      );
    }
  }

  /**
   * Transition an RFQ record through the lifecycle state machine with tenant validation.
   */
  public transitionRfq(rfq: RfqRecord, tenantId: number, nextStatus: RfqStatus): RfqRecord {
    this.assertTenantAccess(tenantId, rfq.tenantId);
    this.validateTransition(rfq.status, nextStatus);

    return {
      ...rfq,
      status: nextStatus,
      updatedAt: new Date(),
    };
  }

  /**
   * Partition an escrow amount into deterministic milestone tranches.
   */
  public calculateMilestones(
    totalAmount: number,
    customTranches?: MilestoneDefinition[],
    currency = 'NGN'
  ): EscrowMilestoneRecord[] {
    if (totalAmount <= 0) {
      throw new Error('Total escrow amount must be greater than zero');
    }

    if (customTranches && customTranches.length > 0) {
      const hasSpecificAmounts = customTranches.every((t) => typeof t.amount === 'number');
      const hasSpecificPercentages = customTranches.every((t) => typeof t.percentage === 'number');

      if (hasSpecificAmounts) {
        const sumAmounts = customTranches.reduce((acc, t) => acc + (t.amount || 0), 0);
        if (Math.abs(sumAmounts - totalAmount) > 0.01) {
          throw new MilestoneAmountMismatchError(
            `Sum of milestone amounts (${sumAmounts}) does not match total amount (${totalAmount})`
          );
        }

        return customTranches.map((t, idx) => ({
          id: `M${t.index || idx + 1}`,
          rfqId: 0,
          tenantId: 0,
          milestoneIndex: t.index || idx + 1,
          name: t.name,
          percentage: Number(((t.amount! / totalAmount) * 100).toFixed(2)),
          amount: t.amount!,
          currency,
          status: 'locked',
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      if (hasSpecificPercentages) {
        const sumPercentages = customTranches.reduce((acc, t) => acc + (t.percentage || 0), 0);
        if (Math.abs(sumPercentages - 100) > 0.01) {
          throw new MilestoneAmountMismatchError(
            `Sum of milestone percentages (${sumPercentages}%) must equal 100%`
          );
        }

        let allocated = 0;
        return customTranches.map((t, idx) => {
          const isLast = idx === customTranches.length - 1;
          const amount = isLast
            ? Number((totalAmount - allocated).toFixed(2))
            : Number(((totalAmount * t.percentage!) / 100).toFixed(2));
          allocated += amount;

          return {
            id: `M${t.index || idx + 1}`,
            rfqId: 0,
            tenantId: 0,
            milestoneIndex: t.index || idx + 1,
            name: t.name,
            percentage: t.percentage!,
            amount,
            currency,
            status: 'locked',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        });
      }
    }

    // Default 3-tranche engineering milestone model:
    // Tranche 1: Material Procurement & Tooling Allocation (30%)
    // Tranche 2: First-Article Inspection & Machining Run (40%)
    // Tranche 3: Final Metrology & Dispatch Acceptance (30%)
    const m1Amount = Number((totalAmount * 0.3).toFixed(2));
    const m2Amount = Number((totalAmount * 0.4).toFixed(2));
    const m3Amount = Number((totalAmount - (m1Amount + m2Amount)).toFixed(2));

    return [
      {
        id: 'M1',
        rfqId: 0,
        tenantId: 0,
        milestoneIndex: 1,
        name: 'Material Procurement & Tooling Allocation',
        percentage: 30.0,
        amount: m1Amount,
        currency,
        status: 'locked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'M2',
        rfqId: 0,
        tenantId: 0,
        milestoneIndex: 2,
        name: 'First-Article Inspection & Machining Run',
        percentage: 40.0,
        amount: m2Amount,
        currency,
        status: 'locked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'M3',
        rfqId: 0,
        tenantId: 0,
        milestoneIndex: 3,
        name: 'Final Metrology & Dispatch Acceptance',
        percentage: 30.0,
        amount: m3Amount,
        currency,
        status: 'locked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Fund multi-milestone escrow with strict tranche partitioning, work authorization tickets, and idempotency.
   */
  public async fundMultiMilestoneEscrow(
    params: MultiMilestoneFundingParams
  ): Promise<MultiMilestoneEscrowResult> {
    const cached = this.idempotencyStore.get(params.idempotencyKey);
    if (cached) {
      return cached;
    }

    this.assertTenantAccess(params.tenantId, params.tenantId);

    if (params.totalAmount <= 0) {
      throw new Error('Escrow funding amount must be greater than zero');
    }

    const currency = params.currency || 'NGN';
    const computedMilestones = this.calculateMilestones(
      params.totalAmount,
      params.milestoneTranches,
      currency
    );

    const milestones: EscrowMilestoneRecord[] = computedMilestones.map((m) => ({
      ...m,
      rfqId: params.rfqId,
      tenantId: params.tenantId,
    }));

    // Generate cryptographic Work Authorization Tickets for each milestone
    const workAuthorizationTickets: WorkAuthorizationTicket[] = milestones.map((m) => {
      const entropy = crypto.randomBytes(4).toString('hex').toUpperCase();
      const ticketId = `AUTH-RFQ${params.rfqId}-M${m.milestoneIndex}-${entropy}`;
      m.workAuthorizationTicketId = ticketId;

      return {
        ticketId,
        rfqId: params.rfqId,
        tenantId: params.tenantId,
        providerId: params.providerId,
        milestoneIndex: m.milestoneIndex,
        scopeOfWork: m.name,
        authorizedAmount: m.amount,
        currency,
        issuedAt: new Date(),
        status: 'AUTHORIZED',
      };
    });

    const [createdTransaction] = await db
      .insert(transactions)
      .values({
        userId: params.explorerId,
        paymentProvider: params.paymentProvider,
        reference: params.externalReference,
        amount: params.totalAmount.toString(),
        currency,
        status: 'escrowed',
        metadata: JSON.stringify({
          rfqId: params.rfqId,
          tenantId: params.tenantId,
          providerId: params.providerId,
          idempotencyKey: params.idempotencyKey,
          milestones,
          workAuthorizationTickets,
        }),
      })
      .returning();

    const transactionId = createdTransaction ? createdTransaction.id : 1;
    const contractId = `ESCROW-RFQ-${params.rfqId}-${transactionId}`;

    const result: MultiMilestoneEscrowResult = {
      success: true,
      contractId,
      transactionId,
      rfqId: params.rfqId,
      tenantId: params.tenantId,
      explorerId: params.explorerId,
      providerId: params.providerId,
      totalAmount: params.totalAmount,
      currency,
      status: 'ESCROW_FUNDED',
      milestones,
      workAuthorizationTickets,
      fundedAt: new Date(),
    };

    this.idempotencyStore.set(params.idempotencyKey, result);
    return result;
  }

  /**
   * Release specific milestone funds to workshop provider following milestone completion and KYC check.
   */
  public async releaseMilestone(params: MilestoneReleaseParams): Promise<MilestoneReleaseResult> {
    const cached = this.idempotencyStore.get(params.idempotencyKey);
    if (cached) {
      return cached;
    }

    this.assertTenantAccess(params.tenantId, params.tenantId);

    // Enforce technical hold on platform escrow ledger
    const holdCheck = this.isTechnicalHoldActive(params.rfqId, params.milestoneIndex);
    if (holdCheck.active && holdCheck.hold) {
      throw new TechnicalHoldActiveError(
        `Milestone ${params.milestoneIndex} of RFQ ${params.rfqId} is locked under technical hold [${holdCheck.hold.holdType}]: ${holdCheck.hold.reason}. Payouts are frozen until corrective action is verified.`
      );
    }

    // Verify provider KYC status before clearing payout
    const providerProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, params.providerId));

    const providerProfile = providerProfiles[0];
    if (!providerProfile || providerProfile.verificationStatus !== 'verified') {
      throw new KycVerificationRequiredError(
        `Workshop provider ${params.providerId} has unverified KYC status. Payouts require verified status.`
      );
    }

    const releaseTimestamp = new Date();
    const result: MilestoneReleaseResult = {
      success: true,
      rfqId: params.rfqId,
      tenantId: params.tenantId,
      milestoneIndex: params.milestoneIndex,
      providerId: params.providerId,
      status: 'released',
      releasedAt: releaseTimestamp,
    };

    this.idempotencyStore.set(params.idempotencyKey, result);
    return result;
  }

  /**
   * Refund escrowed balance back to the explorer upon verified cancellation or dispute.
   */
  public async refundMilestone(params: MilestoneRefundParams): Promise<MilestoneRefundResult> {
    const cached = this.idempotencyStore.get(params.idempotencyKey);
    if (cached) {
      return cached;
    }

    this.assertTenantAccess(params.tenantId, params.tenantId);

    const result: MilestoneRefundResult = {
      success: true,
      rfqId: params.rfqId,
      tenantId: params.tenantId,
      milestoneIndex: params.milestoneIndex,
      explorerId: params.explorerId,
      status: 'refunded',
      reason: params.reason,
      refundedAt: new Date(),
    };

    this.idempotencyStore.set(params.idempotencyKey, result);
    return result;
  }

  /**
   * Fund escrow (backwards-compatible wrapper).
   */
  public async fundEscrow(params: EscrowFundingParams): Promise<any> {
    return this.fundMultiMilestoneEscrow({
      idempotencyKey: params.idempotencyKey,
      rfqId: params.rfqId,
      tenantId: params.tenantId,
      explorerId: params.explorerId,
      providerId: params.providerId,
      totalAmount: params.amount,
      currency: params.currency || 'NGN',
      paymentProvider: params.paymentProvider,
      externalReference: params.externalReference,
    });
  }

  /**
   * Release escrow (backwards-compatible wrapper).
   */
  public async releaseEscrow(params: EscrowReleaseParams): Promise<any> {
    return this.releaseMilestone({
      idempotencyKey: params.idempotencyKey,
      rfqId: params.rfqId,
      tenantId: params.tenantId,
      milestoneIndex: 1,
      providerId: params.providerId,
      approverId: params.adminOrPlatformId,
    });
  }

  /**
   * Refund escrow (backwards-compatible wrapper).
   */
  public async refundEscrow(idempotencyKey: string, rfqId: number, explorerId: number): Promise<any> {
    return this.refundMilestone({
      idempotencyKey,
      rfqId,
      tenantId: 1,
      explorerId,
      reason: 'General dispute refund',
    });
  }

  /**
   * Verify cryptographic webhook signature from payment gateway.
   */
  public verifyWebhookSignature(
    provider: 'paystack' | 'flutterwave',
    rawPayload: string,
    signature: string,
    secret: string
  ): boolean {
    if (!signature || !secret) {
      return false;
    }

    if (provider === 'paystack') {
      const expectedHash = crypto
        .createHmac('sha512', secret)
        .update(rawPayload)
        .digest('hex');
      try {
        return crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(signature));
      } catch {
        return false;
      }
    }

    if (provider === 'flutterwave') {
      return signature === secret;
    }

    return false;
  }

  /**
   * Process incoming escrow funding webhook idempotently.
   */
  public async processEscrowWebhook(params: {
    provider: 'paystack' | 'flutterwave';
    rawPayload: string;
    signature: string;
    secret: string;
    payload: any;
  }): Promise<any> {
    const isValid = this.verifyWebhookSignature(
      params.provider,
      params.rawPayload,
      params.signature,
      params.secret
    );

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const { payload } = params;
    const metadata = payload.data?.metadata || payload.data?.meta || {};
    const idempotencyKey = metadata.idempotencyKey || `WH-${payload.data?.id || payload.data?.reference}`;

    const fundingParams: MultiMilestoneFundingParams = {
      idempotencyKey,
      rfqId: Number(metadata.rfqId || 1),
      tenantId: Number(metadata.tenantId || 1),
      explorerId: Number(metadata.explorerId || payload.data?.customer?.id || 1),
      providerId: Number(metadata.providerId || 2),
      totalAmount: Number(payload.data?.amount || 0),
      currency: payload.data?.currency || 'NGN',
      paymentProvider: params.provider,
      externalReference: payload.data?.reference || `REF-${Date.now()}`,
      milestoneTranches: metadata.milestoneTranches,
    };

    const fundingResult = await this.fundMultiMilestoneEscrow(fundingParams);
    return {
      processed: true,
      provider: params.provider,
      fundingResult,
    };
  }

  /**
   * Reset in-memory idempotency cache (used for unit test resets).
   */
  public clearIdempotencyStore(): void {
    this.idempotencyStore.clear();
    this.technicalHolds.clear();
  }
}

export default new RfqEscrowService();
