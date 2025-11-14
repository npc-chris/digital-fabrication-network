import { Router } from 'express';
import { db } from '../config/database';
import { services } from '../models/schema';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { eq, like, and, or } from 'drizzle-orm';

const router = Router();

// Get all services with filters
router.get('/', async (req, res) => {
  try {
    const { category, location, search } = req.query;
    
    let query = db.select().from(services);
    const conditions = [];

    if (category) {
      conditions.push(eq(services.category, category as string));
    }
    if (location) {
      conditions.push(like(services.location, `%${location}%`));
    }
    if (search) {
      conditions.push(
        or(
          like(services.name, `%${search}%`),
          like(services.description, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const [service] = await db.select().from(services).where(eq(services.id, parseInt(req.params.id)));
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create service (service providers only)
router.post('/', authenticate, authorize('service_provider'), async (req: AuthRequest, res) => {
  try {
    const [service] = await db.insert(services).values({
      providerId: req.user!.id,
      ...req.body,
    }).returning();
    res.status(201).json(service);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update service
router.put('/:id', authenticate, authorize('service_provider'), async (req: AuthRequest, res) => {
  try {
    const [service] = await db.update(services)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(services.id, parseInt(req.params.id)))
      .returning();
    res.json(service);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete service
router.delete('/:id', authenticate, authorize('service_provider'), async (req: AuthRequest, res) => {
  try {
    await db.delete(services).where(eq(services.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
