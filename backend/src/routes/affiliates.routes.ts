import { Router, Response } from 'express';
import { db } from '../config/database';
import { affiliateStores, users, profiles, components } from '../models/schema';
import { authenticate, authorize } from '../middleware/auth';
import { eq, desc, like, and, or } from 'drizzle-orm';

const router = Router();

// Get all affiliate stores (public)
router.get('/', async (req, res) => {
  try {
    const { search, location, supplierType, verified } = req.query as any;

    const conditions = [eq(affiliateStores.isActive, true), eq(affiliateStores.isApproved, true)];

    if (search) {
      conditions.push(
        or(
          like(affiliateStores.storeName, `%${search}%`),
          like(affiliateStores.description, `%${search}%`)
        ) as any
      );
    }

    if (location) {
      conditions.push(like(affiliateStores.location, `%${location}%`) as any);
    }

    if (supplierType) {
      conditions.push(eq(affiliateStores.supplierType, supplierType));
    }

    if (verified === 'true') {
      conditions.push(eq(affiliateStores.verificationStatus, 'verified'));
    }

    const stores = await db
      .select({
        store: affiliateStores,
        owner: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
        }
      })
      .from(affiliateStores)
      .leftJoin(users, eq(affiliateStores.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(...conditions))
      .orderBy(desc(affiliateStores.rating), desc(affiliateStores.totalSales));

    res.json(stores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single affiliate store
router.get('/:id', async (req, res) => {
  try {
    const storeId = parseInt(req.params.id);

    const [store] = await db
      .select({
        store: affiliateStores,
        owner: {
          id: users.id,
          email: users.email,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          company: profiles.company,
        }
      })
      .from(affiliateStores)
      .leftJoin(users, eq(affiliateStores.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(affiliateStores.id, storeId));

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get store's products
    const products = await db
      .select()
      .from(components)
      .where(eq(components.affiliateStoreId, storeId))
      .limit(20);

    res.json({
      ...store,
      products,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create affiliate store (requires authentication)
router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      storeName,
      description,
      website,
      logo,
      location,
      supplierType,
      apiEndpoint,
      apiKey,
      apiFormat,
      endpointMappings,
    } = req.body;

    // Check if user already has a store
    const [existing] = await db
      .select()
      .from(affiliateStores)
      .where(eq(affiliateStores.userId, userId));

    if (existing) {
      return res.status(400).json({ error: 'You already have an affiliate store' });
    }

    const [newStore] = await db
      .insert(affiliateStores)
      .values({
        userId,
        storeName,
        description: description || null,
        website: website || null,
        logo: logo || null,
        location: location || null,
        supplierType: supplierType || 'local',
        apiEndpoint: apiEndpoint || null,
        apiKey: apiKey || null,
        apiFormat: apiFormat || null,
        endpointMappings: endpointMappings ? JSON.stringify(endpointMappings) : null,
        verificationStatus: 'pending',
      })
      .returning();

    res.status(201).json(newStore);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update affiliate store
router.put('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const storeId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check ownership
    const [existing] = await db
      .select()
      .from(affiliateStores)
      .where(eq(affiliateStores.id, storeId));

    if (!existing) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (existing.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updateData: any = {};
    const allowedFields = [
      'storeName', 'description', 'website', 'logo', 'location',
      'supplierType', 'apiEndpoint', 'apiKey', 'apiFormat', 'endpointMappings'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'endpointMappings') {
          updateData[field] = JSON.stringify(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    const [updated] = await db
      .update(affiliateStores)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(affiliateStores.id, storeId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/verify affiliate store (admin only)
router.post('/:id/verify', authenticate, authorize('admin'), async (req: any, res: Response) => {
  try {
    const storeId = parseInt(req.params.id);
    const { verificationStatus, isApproved } = req.body;

    const [updated] = await db
      .update(affiliateStores)
      .set({
        verificationStatus: verificationStatus || 'verified',
        isApproved: isApproved !== undefined ? isApproved : true,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(affiliateStores.id, storeId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle store active status
router.post('/:id/toggle-active', authenticate, async (req: any, res: Response) => {
  try {
    const storeId = parseInt(req.params.id);
    const userId = req.user.id;

    const [existing] = await db
      .select()
      .from(affiliateStores)
      .where(eq(affiliateStores.id, storeId));

    if (!existing) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (existing.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [updated] = await db
      .update(affiliateStores)
      .set({
        isActive: !existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(affiliateStores.id, storeId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get my affiliate store
router.get('/my/store', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const [store] = await db
      .select()
      .from(affiliateStores)
      .where(eq(affiliateStores.userId, userId));

    if (!store) {
      return res.status(404).json({ error: 'No store found' });
    }

    // Get store stats
    const products = await db
      .select()
      .from(components)
      .where(eq(components.affiliateStoreId, store.id));

    res.json({
      store,
      stats: {
        totalProducts: products.length,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
