import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { services, users, profiles } from '../models/schema';
import { authenticate, authorize } from '../middleware/auth';
import { eq, like, and, or, inArray } from 'drizzle-orm';

const router = Router();

// Get distinct filter options
router.get('/filters', async (req, res) => {
  try {
    const { category } = req.query;

    // Distinct locations, optionally filtered by category
    let locationsQuery = db
      .select({ value: services.location })
      .from(services);

    if (category) {
      locationsQuery = (locationsQuery.where(eq(services.category, category as string)) as any);
    }

    const locationsRaw = await (locationsQuery as any).groupBy(services.location);
    const locations = (locationsRaw || [])
      .map((r: any) => r.value)
      .filter((v: any) => v && typeof v === 'string');

    // Distinct categories present in DB
    const categoriesRaw = await (db
      .select({ value: services.category })
      .from(services) as any)
      .groupBy(services.category);
    const categories = (categoriesRaw || []).map((r: any) => r.value).filter((v: any) => !!v);

    res.json({ locations, categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all services with filters
router.get('/', async (req, res) => {
  try {
    const { category, location, search } = req.query as { [key: string]: any };
    
    let query = db.select({
      id: services.id,
      providerId: services.providerId,
      name: services.name,
      description: services.description,
      category: services.category,
      equipmentSpecs: services.equipmentSpecs,
      pricingModel: services.pricingModel,
      pricePerUnit: services.pricePerUnit,
      leadTime: services.leadTime,
      images: services.images,
      location: services.location,
      rating: services.rating,
      reviewCount: services.reviewCount,
      createdAt: services.createdAt,
      updatedAt: services.updatedAt,
      providerName: profiles.firstName,
      providerLastName: profiles.lastName,
      providerCompany: profiles.company,
    })
    .from(services)
    .leftJoin(users, eq(services.providerId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId));
    const conditions: any[] = [];

    if (category) {
      let categories: string[] = [];
      if (Array.isArray(category)) {
        categories = category as string[];
      } else if (typeof category === 'string') {
        categories = category.split(',').map((c) => c.trim()).filter(Boolean);
      }
      if (categories.length === 1) {
        conditions.push(eq(services.category, categories[0]));
      } else if (categories.length > 1) {
        conditions.push(inArray(services.category, categories));
      }
    }
    if (location) {
      let locations: string[] = [];
      if (Array.isArray(location)) {
        locations = location as string[];
      } else if (typeof location === 'string') {
        locations = location.split(',').map((l) => l.trim()).filter(Boolean);
      }
      if (locations.length === 1) {
        conditions.push(like(services.location, `%${locations[0]}%`));
      } else if (locations.length > 1) {
        conditions.push(or(...locations.map(l => like(services.location, `%${l}%`))));
      }
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
router.post('/', authenticate, authorize('provider'), async (req: Request, res) => {
  try {
    const [service] = await db.insert(services).values({
      providerId: ((req as any).user).id,
      ...req.body,
    }).returning();
    res.status(201).json(service);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update service
router.put('/:id', authenticate, authorize('provider'), async (req: Request, res) => {
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
router.delete('/:id', authenticate, authorize('provider'), async (req: Request, res) => {
  try {
    await db.delete(services).where(eq(services.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
