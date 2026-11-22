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

import emergencyBreakdownRoutes from './emergency-breakdown.routes';
import emergencyBreakdownService, {
  InvalidCourierStateTransitionError,
  calculateGeodesicDistanceKm,
} from '../services/emergency-breakdown.service';
import notificationSmsService from '../services/notification-sms.service';

describe('24/7 Emergency Breakdown Intake & Hot-Shot Courier Routing (KAN-52)', () => {
  let app: express.Express;

  const plantManagerToken = jwt.sign(
    { id: 401, email: 'plant.engineer@flourmills.ng', role: 'explorer' },
    process.env.JWT_SECRET!
  );

  beforeEach(() => {
    jest.clearAllMocks();
    emergencyBreakdownService.clearStore();
    notificationSmsService.clearLogs();

    app = express();
    app.use(express.json());
    app.use('/api/v1/emergency', emergencyBreakdownRoutes);
  });

  describe('EmergencyBreakdownService & Distance Calculation', () => {
    it('calculates geodesic distance accurately across Lagos industrial corridors', () => {
      // Ikeja industrial coordinates to Mushin coordinates (~8.5 km)
      const dist = calculateGeodesicDistanceKm(6.6018, 3.3515, 6.5298, 3.3562);
      expect(dist).toBeGreaterThan(7.0);
      expect(dist).toBeLessThan(10.0);
    });

    it('rejects intake when corporate PO token or positive amount is missing', async () => {
      await expect(
        emergencyBreakdownService.submitEmergencyBreakdown({
          tenantId: 10,
          requestorId: 401,
          plantLocation: {
            name: 'Apapa Grain Terminal',
            address: 'Wharf Road, Apapa',
            latitude: 6.4474,
            longitude: 3.3591,
          },
          failedEquipment: {
            equipmentName: 'High-Shear Mixer Shaft',
            failureDescription: 'Catastrophic fracture along keyway',
          },
          fracturePhotoUrls: ['https://storage.dfn.network/photos/shaft-break.jpg'],
          corporatePo: {
            poNumber: 'PO-CORP-2026-99',
            poAmount: 0,
            issuingEntity: 'Flour Mills of Nigeria Plc',
            token: 'AUTH-PO-TOKEN-99',
          },
          materialSpec: {
            alloyGrade: 'AISI 4140 pre-hardened',
            form: 'round bar',
            dimensions: 'Ø80mm x 600mm',
            quantity: 1,
          },
          targetDeliveryShop: {
            shopId: 202,
            shopName: "Sunday's Machine Shop",
            address: 'Industrial Layout, Mushin, Lagos',
            latitude: 6.5298,
            longitude: 3.3562,
          },
        })
      ).rejects.toThrow('Valid corporate PO with positive authorization amount is required');
    });

    it('processes high-shear mixer shaft failure at 4:00 AM with ₦1,400,000 corporate PO, alerts on-call AEs, locates stock within 30 km, and dispatches courier for 9:00 AM delivery', async () => {
      const ticket = await emergencyBreakdownService.submitEmergencyBreakdown({
        idempotencyKey: 'emerg-mixer-shaft-4am',
        tenantId: 10,
        requestorId: 401,
        plantLocation: {
          name: 'Ikeja Food Processing Plant',
          address: 'Plot 8 Commercial Avenue, Ikeja, Lagos',
          latitude: 6.6018,
          longitude: 3.3515,
        },
        failedEquipment: {
          equipmentName: 'High-Shear Mixer Drive Shaft',
          failureDescription: 'Torsional fatigue shear at keyway during night shift',
          downtimeCostPerHourNgn: 2500000,
          failureTimestamp: '2026-11-23T04:00:00+01:00',
        },
        fracturePhotoUrls: [
          'https://storage.dfn.network/photos/mixer-shaft-shear-1.jpg',
          'https://storage.dfn.network/photos/mixer-shaft-shear-2.jpg',
        ],
        corporatePo: {
          poNumber: 'PO-NIGHT-2026-081',
          poAmount: 1400000,
          issuingEntity: 'Consumer Goods Manufacturing Ltd',
          token: 'CORP-PO-HOLD-TOKEN-4140',
        },
        materialSpec: {
          alloyGrade: 'AISI 4140 pre-hardened',
          form: 'round bar',
          dimensions: 'Ø80mm x 600mm',
          quantity: 1,
          millCertRequired: true,
        },
        targetDeliveryShop: {
          shopId: 202,
          shopName: "Sunday's Machine Shop",
          address: 'Plot 12 Industrial Estate, Mushin, Lagos',
          latitude: 6.5298,
          longitude: 3.3562,
        },
        targetArrivalTimestamp: '09:00 AM WAT',
      });

      // Assert ticket creation and PO hold
      expect(ticket.id).toBeDefined();
      expect(ticket.poEscrowHold.authorizedAmount).toBe(1400000);
      expect(ticket.poEscrowHold.status).toBe('PO_AUTHORIZED_HOLD');

      // Assert certified stock proximity within 30 km radius
      expect(ticket.stockReservation.supplierName).toBeDefined();
      expect(ticket.stockReservation.distanceKm).toBeLessThanOrEqual(30.0);
      expect(ticket.stockReservation.reservationToken).toMatch(/^STOCK-RES-4140-/);

      // Assert on-call AE alerts sent via SMS service
      expect(ticket.aeAlertsSent.length).toBeGreaterThanOrEqual(1);
      const smsLogs = notificationSmsService.getDispatchLogs();
      expect(smsLogs.length).toBeGreaterThanOrEqual(1);

      // Assert motorcycle hot-shot courier dispatch
      expect(ticket.courierDispatch.vehicleType).toBe('MOTORCYCLE_HOTSHOT');
      expect(ticket.courierDispatch.transitState).toBe('DISPATCH_REQUESTED');
      expect(ticket.courierDispatch.targetArrivalTimestamp).toBe('09:00 AM WAT');
      expect(ticket.courierDispatch.trackingUrl).toContain('https://dfn.network/track/courier/');
    });

    it('enforces hot-shot courier transit state machine progression and rejects illegal transitions', async () => {
      const ticket = await emergencyBreakdownService.submitEmergencyBreakdown({
        tenantId: 10,
        requestorId: 401,
        plantLocation: {
          name: 'Ikeja Plant',
          address: 'Ikeja',
          latitude: 6.6018,
          longitude: 3.3515,
        },
        failedEquipment: {
          equipmentName: 'Conveyor Drive Sprocket',
          failureDescription: 'Stripped teeth',
        },
        fracturePhotoUrls: ['https://storage.dfn.network/photos/sprocket.jpg'],
        corporatePo: {
          poNumber: 'PO-2026-SPROCKET',
          poAmount: 850000,
          issuingEntity: 'Agro Industrial Ltd',
          token: 'TOKEN-SPROCKET',
        },
        materialSpec: {
          alloyGrade: 'AISI 4140',
          form: 'round bar',
          dimensions: 'Ø80mm x 600mm',
          quantity: 1,
        },
        targetDeliveryShop: {
          shopId: 202,
          shopName: "Sunday's Machine Shop",
          address: 'Mushin, Lagos',
          latitude: 6.5298,
          longitude: 3.3562,
        },
      });

      // Legal state progression: DISPATCH_REQUESTED -> COURIER_ASSIGNED
      const step1 = emergencyBreakdownService.updateCourierTransitState(
        ticket.id,
        'COURIER_ASSIGNED',
        'Rider Bamidele acknowledged hot-shot pickup'
      );
      expect(step1.transitState).toBe('COURIER_ASSIGNED');

      // Legal state progression: COURIER_ASSIGNED -> STOCK_PICKED_UP
      const step2 = emergencyBreakdownService.updateCourierTransitState(
        ticket.id,
        'STOCK_PICKED_UP',
        'Alloy billet loaded into carrier rack'
      );
      expect(step2.transitState).toBe('STOCK_PICKED_UP');

      // Legal state progression: STOCK_PICKED_UP -> IN_TRANSIT
      const step3 = emergencyBreakdownService.updateCourierTransitState(
        ticket.id,
        'IN_TRANSIT',
        'En route via Ikorodu road corridor'
      );
      expect(step3.transitState).toBe('IN_TRANSIT');

      // Legal state progression: IN_TRANSIT -> DELIVERED_TO_SHOP
      const step4 = emergencyBreakdownService.updateCourierTransitState(
        ticket.id,
        'DELIVERED_TO_SHOP',
        'Handed over to Sunday at machine shop receiving dock'
      );
      expect(step4.transitState).toBe('DELIVERED_TO_SHOP');

      // Illegal transition: Cannot go backward from DELIVERED_TO_SHOP
      expect(() => {
        emergencyBreakdownService.updateCourierTransitState(ticket.id, 'STOCK_PICKED_UP');
      }).toThrow(InvalidCourierStateTransitionError);
    });
  });

  describe('Emergency Breakdown Routes (API Tests)', () => {
    it('POST /api/v1/emergency/breakdown/intake creates ticket and locks corporate PO hold', async () => {
      const response = await request(app)
        .post('/api/v1/emergency/breakdown/intake')
        .set('Authorization', `Bearer ${plantManagerToken}`)
        .send({
          tenantId: 10,
          plantLocation: {
            name: 'Oregun Extrusion Facility',
            address: 'Plot 3 Oregun Industrial Estate, Lagos',
            latitude: 6.612,
            longitude: 3.364,
          },
          failedEquipment: {
            equipmentName: 'Extruder Feed Screw',
            failureDescription: 'Fractured flight zone',
          },
          fracturePhotoUrls: ['https://storage.dfn.network/photos/screw-fracture.jpg'],
          corporatePo: {
            poNumber: 'PO-CORP-2026-EXTRUDER',
            poAmount: 1400000,
            issuingEntity: 'Plastics Manufacturing Group',
            token: 'AUTH-EXTRUDER-PO',
          },
          materialSpec: {
            alloyGrade: 'AISI 4140 pre-hardened',
            form: 'round bar',
            dimensions: 'Ø80mm x 600mm',
            quantity: 1,
          },
          targetDeliveryShop: {
            shopId: 202,
            shopName: "Sunday's Workshop",
            address: 'Mushin Industrial Estate',
            latitude: 6.5298,
            longitude: 3.3562,
          },
          targetArrivalTimestamp: '09:00 AM WAT',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.ticket.poEscrowHold.authorizedAmount).toBe(1400000);
      expect(response.body.ticket.courierDispatch.transitState).toBe('DISPATCH_REQUESTED');
    });

    it('GET /api/v1/emergency/breakdown/:ticketId returns ticket and tracking details', async () => {
      const ticket = await emergencyBreakdownService.submitEmergencyBreakdown({
        tenantId: 10,
        requestorId: 401,
        plantLocation: {
          name: 'Ilupeju Plant',
          address: 'Ilupeju',
          latitude: 6.551,
          longitude: 3.365,
        },
        failedEquipment: {
          equipmentName: 'Pinion Gear Shaft',
          failureDescription: 'Sheared teeth',
        },
        fracturePhotoUrls: ['https://storage.dfn.network/photos/gear.jpg'],
        corporatePo: {
          poNumber: 'PO-GEAR-01',
          poAmount: 600000,
          issuingEntity: 'Logistics Co',
          token: 'TOKEN-GEAR',
        },
        materialSpec: {
          alloyGrade: 'AISI 4140',
          form: 'round bar',
          dimensions: 'Ø80mm x 600mm',
          quantity: 1,
        },
        targetDeliveryShop: {
          shopId: 202,
          shopName: "Sunday's Shop",
          address: 'Mushin',
          latitude: 6.5298,
          longitude: 3.3562,
        },
      });

      const response = await request(app)
        .get(`/api/v1/emergency/breakdown/${ticket.id}`)
        .set('Authorization', `Bearer ${plantManagerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ticket.id).toBe(ticket.id);
      expect(response.body.ticket.stockReservation.supplierName).toBeDefined();
    });

    it('PATCH /api/v1/emergency/breakdown/:ticketId/courier-transit updates courier state and rejects invalid transition', async () => {
      const ticket = await emergencyBreakdownService.submitEmergencyBreakdown({
        tenantId: 10,
        requestorId: 401,
        plantLocation: {
          name: 'Apapa Depot',
          address: 'Apapa',
          latitude: 6.4474,
          longitude: 3.3591,
        },
        failedEquipment: {
          equipmentName: 'Centrifugal Pump Shaft',
          failureDescription: 'Worn journal',
        },
        fracturePhotoUrls: ['https://storage.dfn.network/photos/pump.jpg'],
        corporatePo: {
          poNumber: 'PO-PUMP-02',
          poAmount: 750000,
          issuingEntity: 'PetroChem Ltd',
          token: 'TOKEN-PUMP',
        },
        materialSpec: {
          alloyGrade: 'AISI 4140',
          form: 'round bar',
          dimensions: 'Ø80mm x 600mm',
          quantity: 1,
        },
        targetDeliveryShop: {
          shopId: 202,
          shopName: "Sunday's Shop",
          address: 'Mushin',
          latitude: 6.5298,
          longitude: 3.3562,
        },
      });

      // Valid progression
      const validRes = await request(app)
        .patch(`/api/v1/emergency/breakdown/${ticket.id}/courier-transit`)
        .set('Authorization', `Bearer ${plantManagerToken}`)
        .send({
          nextState: 'COURIER_ASSIGNED',
          notes: 'Motorcycle rider dispatched from Ikeja stock yard',
        });

      expect(validRes.status).toBe(200);
      expect(validRes.body.courierDispatch.transitState).toBe('COURIER_ASSIGNED');

      // Invalid transition: skipping straight to DELIVERED_TO_SHOP
      const invalidRes = await request(app)
        .patch(`/api/v1/emergency/breakdown/${ticket.id}/courier-transit`)
        .set('Authorization', `Bearer ${plantManagerToken}`)
        .send({
          nextState: 'DELIVERED_TO_SHOP',
        });

      expect(invalidRes.status).toBe(422);
    });

    it('GET /api/v1/emergency/breakdown/stock/nearby returns certified stock within radius', async () => {
      const response = await request(app)
        .get('/api/v1/emergency/breakdown/stock/nearby')
        .query({ lat: 6.5298, lon: 3.3562, material: '4140', radius: 30 })
        .set('Authorization', `Bearer ${plantManagerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stock.length).toBeGreaterThanOrEqual(1);
      expect(response.body.stock[0].distanceKm).toBeLessThanOrEqual(30);
    });
  });
});
