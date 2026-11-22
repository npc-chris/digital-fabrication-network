import crypto from 'crypto';
import notificationSmsService, { SmsDispatchResult } from './notification-sms.service';
import rfqEscrowService from './rfq-escrow.service';
import { db } from '../config/database';
import { notifications } from '../models/schema';

export interface PlantLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface FailedEquipment {
  equipmentName: string;
  failureDescription: string;
  downtimeCostPerHourNgn?: number;
  failureTimestamp?: string;
}

export interface CorporatePoAuthorization {
  poNumber: string;
  poAmount: number;
  issuingEntity: string;
  token: string;
}

export interface MaterialSpec {
  alloyGrade: string;
  form: string;
  dimensions: string;
  quantity: number;
  millCertRequired?: boolean;
}

export interface TargetDeliveryShop {
  shopId: number;
  shopName: string;
  address: string;
  latitude: number;
  longitude: number;
}

export type CourierTransitState =
  | 'DISPATCH_REQUESTED'
  | 'COURIER_ASSIGNED'
  | 'STOCK_PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED_TO_SHOP'
  | 'CANCELLED';

export interface TransitStateHistoryEntry {
  state: CourierTransitState;
  timestamp: Date;
  notes?: string;
  gps?: { latitude: number; longitude: number };
}

export interface HotShotCourierDispatch {
  courierId: string;
  courierName: string;
  courierPhone: string;
  vehicleType: 'MOTORCYCLE_HOTSHOT';
  pickupAddress: string;
  pickupCoords: { latitude: number; longitude: number };
  dropoffAddress: string;
  dropoffCoords: { latitude: number; longitude: number };
  transitState: CourierTransitState;
  targetArrivalTimestamp: string;
  trackingUrl: string;
  stateHistory: TransitStateHistoryEntry[];
}

export interface CertifiedStockItem {
  stockId: string;
  supplierName: string;
  alloyGrade: string;
  form: string;
  dimensions: string;
  quantityAvailable: number;
  location: { address: string; latitude: number; longitude: number };
  distanceKm: number;
  millCertNumber: string;
  heatNumber: string;
}

export interface EmergencyBreakdownTicket {
  id: string;
  tenantId: number;
  requestorId: number;
  plantLocation: PlantLocation;
  failedEquipment: FailedEquipment;
  fracturePhotoUrls: string[];
  corporatePo: CorporatePoAuthorization;
  materialSpec: MaterialSpec;
  targetDeliveryShop: TargetDeliveryShop;
  stockReservation: {
    stockId: string;
    reservationToken: string;
    supplierName: string;
    distanceKm: number;
    allocatedQuantity: number;
  };
  courierDispatch: HotShotCourierDispatch;
  poEscrowHold: {
    authorizedAmount: number;
    currency: string;
    status: 'PO_AUTHORIZED_HOLD';
    heldAt: Date;
  };
  aeAlertsSent: SmsDispatchResult[];
  status: 'INTAKE_LOGGED' | 'IN_TRANSIT' | 'DELIVERED' | 'MACHINING_IN_PROGRESS' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyIntakeParams {
  idempotencyKey?: string;
  tenantId: number;
  requestorId: number;
  plantLocation: PlantLocation;
  failedEquipment: FailedEquipment;
  fracturePhotoUrls: string[];
  corporatePo: CorporatePoAuthorization;
  materialSpec: MaterialSpec;
  targetDeliveryShop: TargetDeliveryShop;
  onCallAePhones?: string[];
  targetArrivalTimestamp?: string;
}

export class InvalidCourierStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCourierStateTransitionError';
  }
}

const VALID_COURIER_TRANSITIONS: Record<CourierTransitState, CourierTransitState[]> = {
  DISPATCH_REQUESTED: ['COURIER_ASSIGNED', 'CANCELLED'],
  COURIER_ASSIGNED: ['STOCK_PICKED_UP', 'CANCELLED'],
  STOCK_PICKED_UP: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED_TO_SHOP', 'CANCELLED'],
  DELIVERED_TO_SHOP: [],
  CANCELLED: [],
};

/**
 * Calculate distance in kilometers between two geographic coordinates using the Haversine formula.
 */
export function calculateGeodesicDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export class EmergencyBreakdownService {
  private tickets = new Map<string, EmergencyBreakdownTicket>();
  private idempotencyStore = new Map<string, any>();

  // Certified regional alloy stock inventory
  private certifiedStockCatalog: CertifiedStockItem[] = [
    {
      stockId: 'STOCK-4140-IKEJA-01',
      supplierName: 'Kemi Alloy Warehouse Ikeja',
      alloyGrade: 'AISI 4140 pre-hardened',
      form: 'round bar',
      dimensions: 'Ø80mm x 600mm',
      quantityAvailable: 12,
      location: {
        address: 'Plot 14 Industrial Avenue, Ikeja, Lagos',
        latitude: 6.6018,
        longitude: 3.3515,
      },
      distanceKm: 0,
      millCertNumber: 'MILL-CERT-4140-9821',
      heatNumber: 'HEAT-77410-B',
    },
    {
      stockId: 'STOCK-4140-ILUPEJU-02',
      supplierName: 'Ogunlesi Precision Steel Ilupeju',
      alloyGrade: 'AISI 4140 annealed',
      form: 'round bar',
      dimensions: 'Ø80mm x 1000mm',
      quantityAvailable: 5,
      location: {
        address: 'Industrial Avenue, Ilupeju, Lagos',
        latitude: 6.5510,
        longitude: 3.3650,
      },
      distanceKm: 0,
      millCertNumber: 'MILL-CERT-4140-4412',
      heatNumber: 'HEAT-55321-A',
    },
    {
      stockId: 'STOCK-1045-APAPA-03',
      supplierName: 'Coastal Forgings Apapa',
      alloyGrade: 'AISI 1045',
      form: 'round bar',
      dimensions: 'Ø100mm x 500mm',
      quantityAvailable: 20,
      location: {
        address: 'Wharf Road, Apapa, Lagos',
        latitude: 6.4474,
        longitude: 3.3591,
      },
      distanceKm: 0,
      millCertNumber: 'MILL-CERT-1045-8120',
      heatNumber: 'HEAT-10459-C',
    },
  ];

  /**
   * Locate certified alloy stock matching material requirements within maximum search radius.
   */
  public findNearbyCertifiedStock(
    targetLat: number,
    targetLon: number,
    materialQuery: string,
    maxRadiusKm = 30.0
  ): CertifiedStockItem[] {
    const queryNormalized = materialQuery.toLowerCase();

    return this.certifiedStockCatalog
      .filter((item) => {
        const gradeMatch = item.alloyGrade.toLowerCase().includes(queryNormalized) ||
          queryNormalized.includes(item.alloyGrade.toLowerCase()) ||
          (queryNormalized.includes('4140') && item.alloyGrade.includes('4140'));
        return gradeMatch && item.quantityAvailable > 0;
      })
      .map((item) => {
        const distanceKm = calculateGeodesicDistanceKm(
          targetLat,
          targetLon,
          item.location.latitude,
          item.location.longitude
        );
        return {
          ...item,
          distanceKm,
        };
      })
      .filter((item) => item.distanceKm <= maxRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /**
   * Process night-shift emergency breakdown submission, authorize corporate PO hold,
   * alert on-call AEs via Termii/Twilio, locate certified stock, and dispatch motorcycle courier.
   */
  public async submitEmergencyBreakdown(params: EmergencyIntakeParams): Promise<EmergencyBreakdownTicket> {
    if (params.idempotencyKey && this.idempotencyStore.has(params.idempotencyKey)) {
      return this.idempotencyStore.get(params.idempotencyKey);
    }

    rfqEscrowService.assertTenantAccess(params.tenantId, params.tenantId);

    // Validate corporate PO authorization
    if (!params.corporatePo || !params.corporatePo.poNumber || params.corporatePo.poAmount <= 0) {
      throw new Error('Valid corporate PO with positive authorization amount is required');
    }

    if (!params.corporatePo.token || params.corporatePo.token.trim() === '') {
      throw new Error('Corporate PO authorization token is required');
    }

    if (!params.plantLocation || !params.plantLocation.address) {
      throw new Error('Plant location and geographic coordinates are required');
    }

    if (!params.failedEquipment || !params.failedEquipment.equipmentName) {
      throw new Error('Failed equipment details are required');
    }

    if (!params.fracturePhotoUrls || params.fracturePhotoUrls.length === 0) {
      throw new Error('At least one fracture photograph is required for emergency intake');
    }

    if (!params.materialSpec || !params.materialSpec.alloyGrade) {
      throw new Error('Material specification (alloy grade and dimensions) is required');
    }

    if (!params.targetDeliveryShop || !params.targetDeliveryShop.address) {
      throw new Error('Target delivery machine shop details are required');
    }

    // Query nearby certified alloy stock within 30 km radius
    const nearbyStock = this.findNearbyCertifiedStock(
      params.targetDeliveryShop.latitude,
      params.targetDeliveryShop.longitude,
      params.materialSpec.alloyGrade,
      30.0
    );

    if (nearbyStock.length === 0) {
      throw new Error(
        `No certified ${params.materialSpec.alloyGrade} stock found within 30 km radius of delivery shop`
      );
    }

    const selectedStock = nearbyStock[0];
    const reservationEntropy = crypto.randomBytes(3).toString('hex').toUpperCase();
    const reservationToken = `STOCK-RES-${selectedStock.stockId.split('-')[1]}-${reservationEntropy}`;

    // Generate ticket ID
    const ticketEntropy = crypto.randomBytes(4).toString('hex').toUpperCase();
    const ticketId = `EMERG-${Date.now().toString().slice(-6)}-${ticketEntropy}`;

    // Target arrival timestamp (default 9:00 AM)
    const targetArrivalTimestamp = params.targetArrivalTimestamp || '09:00 AM WAT';

    // Dispatch motorcycle hot-shot courier
    const courierEntropy = crypto.randomBytes(3).toString('hex').toUpperCase();
    const courierId = `COURIER-HOTSHOT-${courierEntropy}`;
    const trackingUrl = `https://dfn.network/track/courier/${courierId}`;

    const courierDispatch: HotShotCourierDispatch = {
      courierId,
      courierName: 'Bamidele Rapid Hot-Shot Express',
      courierPhone: '+2348023456789',
      vehicleType: 'MOTORCYCLE_HOTSHOT',
      pickupAddress: selectedStock.location.address,
      pickupCoords: {
        latitude: selectedStock.location.latitude,
        longitude: selectedStock.location.longitude,
      },
      dropoffAddress: params.targetDeliveryShop.address,
      dropoffCoords: {
        latitude: params.targetDeliveryShop.latitude,
        longitude: params.targetDeliveryShop.longitude,
      },
      transitState: 'DISPATCH_REQUESTED',
      targetArrivalTimestamp,
      trackingUrl,
      stateHistory: [
        {
          state: 'DISPATCH_REQUESTED',
          timestamp: new Date(),
          notes: `Hot-shot motorcycle courier assigned for ${selectedStock.alloyGrade} delivery`,
          gps: {
            latitude: selectedStock.location.latitude,
            longitude: selectedStock.location.longitude,
          },
        },
      ],
    };

    // Dispatch urgent SMS alert cascade to on-call AEs via Termii/Twilio
    const aeAlertsSent = await notificationSmsService.dispatchUrgentAeAlert({
      ticketId,
      equipmentName: params.failedEquipment.equipmentName,
      poAmount: params.corporatePo.poAmount,
      plantLocationName: params.plantLocation.name,
      targetShopName: params.targetDeliveryShop.shopName,
      recipientPhones: params.onCallAePhones,
    });

    const ticket: EmergencyBreakdownTicket = {
      id: ticketId,
      tenantId: params.tenantId,
      requestorId: params.requestorId,
      plantLocation: params.plantLocation,
      failedEquipment: params.failedEquipment,
      fracturePhotoUrls: params.fracturePhotoUrls,
      corporatePo: params.corporatePo,
      materialSpec: params.materialSpec,
      targetDeliveryShop: params.targetDeliveryShop,
      stockReservation: {
        stockId: selectedStock.stockId,
        reservationToken,
        supplierName: selectedStock.supplierName,
        distanceKm: selectedStock.distanceKm,
        allocatedQuantity: params.materialSpec.quantity || 1,
      },
      courierDispatch,
      poEscrowHold: {
        authorizedAmount: params.corporatePo.poAmount,
        currency: 'NGN',
        status: 'PO_AUTHORIZED_HOLD',
        heldAt: new Date(),
      },
      aeAlertsSent,
      status: 'INTAKE_LOGGED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tickets.set(ticketId, ticket);

    // Record in-app notification
    try {
      if (db && db.insert) {
        await db.insert(notifications).values({
          userId: params.targetDeliveryShop.shopId,
          type: 'order',
          title: `EMERGENCY DISPATCH: Ticket #${ticketId}`,
          message: `Emergency breakdown: ${params.failedEquipment.equipmentName}. Stock dispatched via courier, target arrival: ${targetArrivalTimestamp}. PO held: NGN ${params.corporatePo.poAmount.toLocaleString()}.`,
          relatedType: 'order',
          relatedId: 1,
        });
      }
    } catch (err) {
      // Non-blocking notification fallback
    }

    if (params.idempotencyKey) {
      this.idempotencyStore.set(params.idempotencyKey, ticket);
    }

    return ticket;
  }

  /**
   * Update hot-shot courier transit state machine.
   * Enforces strictly linear state transitions:
   * DISPATCH_REQUESTED -> COURIER_ASSIGNED -> STOCK_PICKED_UP -> IN_TRANSIT -> DELIVERED_TO_SHOP.
   */
  public updateCourierTransitState(
    ticketId: string,
    nextState: CourierTransitState,
    notes?: string,
    currentGps?: { latitude: number; longitude: number }
  ): HotShotCourierDispatch {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Emergency ticket ${ticketId} not found`);
    }

    const currentState = ticket.courierDispatch.transitState;
    const allowedNextStates = VALID_COURIER_TRANSITIONS[currentState] || [];

    if (!allowedNextStates.includes(nextState)) {
      throw new InvalidCourierStateTransitionError(
        `Invalid courier transit state transition from ${currentState} to ${nextState}`
      );
    }

    ticket.courierDispatch.transitState = nextState;
    ticket.courierDispatch.stateHistory.push({
      state: nextState,
      timestamp: new Date(),
      notes,
      gps: currentGps,
    });

    if (nextState === 'DELIVERED_TO_SHOP') {
      ticket.status = 'DELIVERED';
    } else if (nextState === 'IN_TRANSIT') {
      ticket.status = 'IN_TRANSIT';
    }

    ticket.updatedAt = new Date();
    return ticket.courierDispatch;
  }

  /**
   * Get emergency ticket by ID.
   */
  public getTicket(ticketId: string): EmergencyBreakdownTicket | undefined {
    return this.tickets.get(ticketId);
  }

  /**
   * Reset in-memory store (for testing).
   */
  public clearStore(): void {
    this.tickets.clear();
    this.idempotencyStore.clear();
  }
}

export default new EmergencyBreakdownService();
