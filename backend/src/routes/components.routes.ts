import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { components } from '../models/schema';
import { authenticate, authorize } from '../middleware/auth';
import { eq, like, and, or } from 'drizzle-orm';

const router = Router();

// Get all components with filters
router.get('/', async (req, res) => {
  try {
    const { type, location, search } = req.query;
    
    let query = db.select().from(components);
    const conditions = [];

    if (type) {
      conditions.push(eq(components.type, type as any));
    }
    if (location) {
      conditions.push(like(components.location, `%${location}%`));
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

// Create component (sellers only)
router.post('/', authenticate, authorize('seller'), async (req: Request, res) => {
  try {
    const [component] = await db.insert(components).values({
      sellerId: ((req as any).user).id,
      ...req.body,
    }).returning();
    res.status(201).json(component);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update component
router.put('/:id', authenticate, authorize('seller'), async (req: Request, res) => {
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
router.delete('/:id', authenticate, authorize('seller'), async (req: Request, res) => {
  try {
    await db.delete(components).where(eq(components.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
