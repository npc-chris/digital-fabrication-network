import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { components, users, profiles } from '../models/schema';
import { authenticate, authorize } from '../middleware/auth';
import { eq, like, and, or, inArray } from 'drizzle-orm';

const router = Router();

// Get distinct filter options
router.get('/filters', async (req, res) => {
  try {
    const { type } = req.query;

    // Distinct locations, optionally filtered by type
    let locationsQuery = db
      .select({ value: components.location })
      .from(components);

    if (type) {
      locationsQuery = (locationsQuery.where(eq(components.type, type as any)) as any);
    }

    // Use GROUP BY to emulate DISTINCT
    const locationsRaw = await (locationsQuery as any).groupBy(components.location);
    const locations = (locationsRaw || [])
      .map((r: any) => r.value)
      .filter((v: any) => v && typeof v === 'string');

    // Distinct types present in DB
    const typesRaw = await (db
      .select({ value: components.type })
      .from(components) as any)
      .groupBy(components.type);
    const types = (typesRaw || []).map((r: any) => r.value).filter((v: any) => !!v);

    res.json({ locations, types });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all components with filters
router.get('/', async (req, res) => {
  try {
    const { type, location, search } = req.query as { [key: string]: any };
    
    let query = db.select({
      id: components.id,
      providerId: components.providerId,
      name: components.name,
      description: components.description,
      type: components.type,
      price: components.price,
      availability: components.availability,
      images: components.images,
      technicalDetails: components.technicalDetails,
      datasheetUrl: components.datasheetUrl,
      compatibilities: components.compatibilities,
      location: components.location,
      rating: components.rating,
      reviewCount: components.reviewCount,
      createdAt: components.createdAt,
      updatedAt: components.updatedAt,
      providerName: profiles.firstName,
      providerLastName: profiles.lastName,
      providerCompany: profiles.company,
    })
    .from(components)
    .leftJoin(users, eq(components.providerId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId));
    const conditions: any[] = [];

    if (type) {
      let types: string[] = [];
      if (Array.isArray(type)) {
        types = type as string[];
      } else if (typeof type === 'string') {
        types = type.split(',').map((t) => t.trim()).filter(Boolean);
      }
      if (types.length === 1) {
        conditions.push(eq(components.type, types[0] as any));
      } else if (types.length > 1) {
        conditions.push(inArray(components.type, types as any));
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
        conditions.push(like(components.location, `%${locations[0]}%`));
      } else if (locations.length > 1) {
        conditions.push(or(...locations.map(l => like(components.location, `%${l}%`))));
      }
    }
    if (search) {
      conditions.push(
        or(
          like(components.name, `%${search}%`),
          like(components.description, `%${search}%`)
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

// Get single component
router.get('/:id', async (req, res) => {
  try {
    const [component] = await db.select().from(components).where(eq(components.id, parseInt(req.params.id)));
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    res.json(component);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create component (providers only)
router.post('/', authenticate, authorize('provider'), async (req: Request, res) => {
  try {
    const [component] = await db.insert(components).values({
      providerId: ((req as any).user).id,
      ...req.body,
    }).returning();
    res.status(201).json(component);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update component
router.put('/:id', authenticate, authorize('provider'), async (req: Request, res) => {
  try {
    const [component] = await db.update(components)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(components.id, parseInt(req.params.id)))
      .returning();
    res.json(component);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete component
router.delete('/:id', authenticate, authorize('provider'), async (req: Request, res) => {
  try {
    await db.delete(components).where(eq(components.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
