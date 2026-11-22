import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import emergencyBreakdownService, {
  InvalidCourierStateTransitionError,
} from '../services/emergency-breakdown.service';

const router = Router();

/**
 * POST /api/v1/emergency/breakdown/intake
 * Night-shift emergency intake accepting corporate POs, triggering SMS alerts,
 * locating nearby certified stock, and dispatching motorcycle hot-shot couriers.
 */
router.post('/breakdown/intake', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      idempotencyKey,
      tenantId,
      requestorId,
      plantLocation,
      failedEquipment,
      fracturePhotoUrls,
      corporatePo,
      materialSpec,
      targetDeliveryShop,
      onCallAePhones,
      targetArrivalTimestamp,
    } = req.body;

    if (!tenantId || !plantLocation || !failedEquipment || !corporatePo || !materialSpec || !targetDeliveryShop) {
      return res.status(400).json({
        error: 'Missing required emergency breakdown fields (tenantId, plantLocation, failedEquipment, corporatePo, materialSpec, targetDeliveryShop)',
      });
    }

    const ticket = await emergencyBreakdownService.submitEmergencyBreakdown({
      idempotencyKey,
      tenantId: Number(tenantId),
      requestorId: Number(requestorId || req.user?.id || 1),
      plantLocation,
      failedEquipment,
      fracturePhotoUrls: Array.isArray(fracturePhotoUrls) ? fracturePhotoUrls : [],
      corporatePo,
      materialSpec,
      targetDeliveryShop,
      onCallAePhones,
      targetArrivalTimestamp,
    });

    return res.status(201).json({
      success: true,
      ticket,
      message: 'Emergency breakdown logged. Corporate PO locked in escrow, on-call AEs alerted, and hot-shot courier dispatched.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error processing emergency breakdown intake' });
  }
});

/**
 * GET /api/v1/emergency/breakdown/:ticketId
 * Retrieve emergency breakdown ticket status, tracking, and courier transit state.
 */
router.get('/breakdown/:ticketId', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const rawTicketId = req.params.ticketId;
    const ticketId = Array.isArray(rawTicketId) ? rawTicketId[0] : String(rawTicketId);
    const ticket = emergencyBreakdownService.getTicket(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Emergency breakdown ticket not found' });
    }
    return res.status(200).json({ success: true, ticket });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error retrieving emergency ticket' });
  }
});

/**
 * PATCH /api/v1/emergency/breakdown/:ticketId/courier-transit
 * Progress hot-shot courier transit state machine.
 */
router.patch('/breakdown/:ticketId/courier-transit', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { nextState, notes, currentGps } = req.body;
    if (!nextState) {
      return res.status(400).json({ error: 'nextState is required to update courier transit' });
    }

    const rawTicketId = req.params.ticketId;
    const ticketId = Array.isArray(rawTicketId) ? rawTicketId[0] : String(rawTicketId);

    const courierDispatch = emergencyBreakdownService.updateCourierTransitState(
      ticketId,
      nextState,
      notes,
      currentGps
    );

    return res.status(200).json({
      success: true,
      courierDispatch,
      message: `Courier transit state progressed to ${nextState}`,
    });
  } catch (error: any) {
    if (error instanceof InvalidCourierStateTransitionError) {
      return res.status(422).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Error updating courier transit state' });
  }
});

/**
 * GET /api/v1/emergency/breakdown/stock/nearby
 * Query available regional certified stock by coordinates and alloy grade.
 */
router.get('/breakdown/stock/nearby', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const material = String(req.query.material || '4140');
    const radius = req.query.radius ? Number(req.query.radius) : 30.0;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid numeric lat and lon query parameters are required' });
    }

    const stock = emergencyBreakdownService.findNearbyCertifiedStock(lat, lon, material, radius);
    return res.status(200).json({ success: true, material, stock });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error searching nearby certified stock' });
  }
});

export default router;
