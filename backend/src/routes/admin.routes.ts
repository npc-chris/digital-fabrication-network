import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { users, profiles, components, services, communityPosts, verificationDocuments, affiliateStores } from '../models/schema';
import { authenticate, authorize } from '../middleware/auth';
import { eq, like, or, desc, and, count } from 'drizzle-orm';

const router = Router();

// Simple in-memory rate limiting for admin routes
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const adminRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id || req.ip;
  const key = `admin:${userId}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // 100 requests per minute

  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({ 
      error: 'Too many requests',
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
  }

  record.count++;
  return next();
};

// All admin routes require rate limiting, authentication and admin role
// Rate limiting applied first to prevent DoS attacks before auth checks
router.use(adminRateLimiter);
router.use(authenticate);
router.use(authorize('admin', 'platform_manager'));

// Get platform statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Get total counts
    const [userCount] = await db.select({ count: count() }).from(users);
    const [componentCount] = await db.select({ count: count() }).from(components);
    const [serviceCount] = await db.select({ count: count() }).from(services);
    const [postCount] = await db.select({ count: count() }).from(communityPosts);
    
    // Get counts by role
    const explorerCount = await db.select({ count: count() }).from(users).where(eq(users.role, 'explorer'));
    const providerCount = await db.select({ count: count() }).from(users).where(eq(users.role, 'provider'));
    
    // Get pending provider upgrade requests (users who haven't completed onboarding but requested provider)
    const pendingProviders = await db.select({ count: count() })
      .from(users)
      .where(and(
        eq(users.role, 'provider'),
        eq(users.providerApproved, false)
      ));
    
    // Get pending verification documents
    const pendingVerifications = await db.select({ count: count() })
      .from(verificationDocuments)
      .where(eq(verificationDocuments.status, 'pending'));

    res.json({
      users: {
        total: userCount.count,
        explorers: explorerCount[0]?.count || 0,
        providers: providerCount[0]?.count || 0,
      },
      content: {
        components: componentCount.count,
        services: serviceCount.count,
        posts: postCount.count,
      },
      pending: {
        providerRequests: pendingProviders[0]?.count || 0,
        verifications: pendingVerifications[0]?.count || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search users by ID, email, or username
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { search, role, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      isVerified: users.isVerified,
      onboardingCompleted: users.onboardingCompleted,
      providerApproved: users.providerApproved,
      createdAt: users.createdAt,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      company: profiles.company,
      location: profiles.location,
      phone: profiles.phone,
      verificationStatus: profiles.verificationStatus,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(users.createdAt));

    const conditions = [];

    if (search) {
      const searchStr = search as string;
      // Check if it's a numeric ID
      const searchId = parseInt(searchStr);
      if (!isNaN(searchId)) {
        conditions.push(eq(users.id, searchId));
      } else {
        conditions.push(
          or(
            like(users.email, `%${searchStr}%`),
            like(profiles.firstName, `%${searchStr}%`),
            like(profiles.lastName, `%${searchStr}%`),
            like(profiles.company, `%${searchStr}%`)
          )
        );
      }
    }

    if (role && role !== 'all') {
      conditions.push(eq(users.role, role as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const usersList = await (query as any).limit(limitNum).offset(offset);

    // Get total count for pagination
    let countQuery = db.select({ count: count() }).from(users);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }
    const [totalCount] = await countQuery;

    res.json({
      users: usersList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details by ID
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    const [user] = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      isVerified: users.isVerified,
      onboardingCompleted: users.onboardingCompleted,
      providerApproved: users.providerApproved,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));

    // Get user's components (if provider)
    const userComponents = await db.select().from(components).where(eq(components.providerId, userId));

    // Get user's services (if provider)
    const userServices = await db.select().from(services).where(eq(services.providerId, userId));

    // Get user's posts
    const userPosts = await db.select().from(communityPosts).where(eq(communityPosts.authorId, userId));

    // Get verification documents
    const docs = await db.select().from(verificationDocuments).where(eq(verificationDocuments.userId, userId));

    res.json({
      user,
      profile: profile || null,
      stats: {
        components: userComponents.length,
        services: userServices.length,
        posts: userPosts.length,
      },
      components: userComponents,
      services: userServices,
      verificationDocuments: docs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (upgrade/downgrade)
router.patch('/users/:id/role', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { role, providerApproved } = req.body;

    const validRoles = ['explorer', 'provider'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "explorer" or "provider"' });
    }

    const updateData: any = { updatedAt: new Date() };
    if (role) updateData.role = role;
    if (providerApproved !== undefined) updateData.providerApproved = providerApproved;

    const [updated] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ban/unban user account
router.patch('/users/:id/ban', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { banned } = req.body;

    // We'll use isVerified as a soft-ban mechanism for now
    // In a production system, you'd add a proper 'banned' column
    const [updated] = await db.update(users)
      .set({ isVerified: !banned, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove user's component listing
router.delete('/components/:id', async (req: Request, res: Response) => {
  try {
    const componentId = parseInt(req.params.id);

    await db.delete(components).where(eq(components.id, componentId));

    res.json({ message: 'Component removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove user's service listing
router.delete('/services/:id', async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id);

    await db.delete(services).where(eq(services.id, serviceId));

    res.json({ message: 'Service removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove community post
router.delete('/posts/:id', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);

    await db.delete(communityPosts).where(eq(communityPosts.id, postId));

    res.json({ message: 'Post removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending provider upgrade requests
router.get('/provider-requests', async (req: Request, res: Response) => {
  try {
    const pendingProviders = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      company: profiles.company,
      bio: profiles.bio,
      location: profiles.location,
      phone: profiles.phone,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(
      eq(users.role, 'provider'),
      eq(users.providerApproved, false)
    ))
    .orderBy(desc(users.createdAt));

    res.json(pendingProviders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/reject provider upgrade request
router.patch('/provider-requests/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { approved, reason } = req.body;

    if (approved) {
      // Approve the provider
      const [updated] = await db.update(users)
        .set({ providerApproved: true, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      res.json({ message: 'Provider approved successfully', user: updated });
    } else {
      // Reject - downgrade back to explorer
      const [updated] = await db.update(users)
        .set({ role: 'explorer', providerApproved: false, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      res.json({ message: 'Provider request rejected', user: updated, reason });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending affiliate store approvals
router.get('/affiliate-requests', async (req: Request, res: Response) => {
  try {
    const pendingStores = await db.select({
      store: affiliateStores,
      owner: {
        id: users.id,
        email: users.email,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      }
    })
    .from(affiliateStores)
    .leftJoin(users, eq(affiliateStores.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(affiliateStores.isApproved, false))
    .orderBy(desc(affiliateStores.createdAt));

    res.json(pendingStores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
