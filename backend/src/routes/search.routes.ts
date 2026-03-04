import { Router, Request as Request, Response } from 'express';
import { db } from '../config/database';
import { components, services, communityPosts, users, profiles, projects, componentComparisons, affiliateStores } from '../models/schema';
import { sql, or, ilike, and, eq, inArray, desc } from 'drizzle-orm';

const router = Router();

/**
 * @route GET /api/search
 * @desc Search across all platform entities with local-first prioritization
 * @query {string} q - Search query
 * @query {string} type - Entity type filter (components|services|posts|users|projects)
 * @query {boolean} localFirst - Prioritize Nigerian/African suppliers
 * @query {string} location - User's location for better local matching
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const type = req.query.type as string;
    const localFirst = req.query.localFirst === 'true';
    const userLocation = req.query.location as string;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchPattern = `%${query}%`;
    const results: any = {
      components: [],
      services: [],
      posts: [],
      users: [],
      projects: [],
    };

    // Search components with local-first prioritization
    if (!type || type === 'components') {
      let componentQuery = db
        .select({
          component: components,
          provider: {
            id: users.id,
            firstName: profiles.firstName,
            lastName: profiles.lastName,
            company: profiles.company,
          },
          affiliateStore: affiliateStores,
        })
        .from(components)
        .leftJoin(users, eq(components.providerId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .leftJoin(affiliateStores, eq(components.affiliateStoreId, affiliateStores.id))
        .where(
          or(
            ilike(components.name, searchPattern),
            ilike(components.description, searchPattern),
            ilike(components.location, searchPattern)
          )
        );

      // Apply local-first sorting if requested
      if (localFirst) {
        componentQuery = componentQuery.orderBy(
          desc(components.localPriority),
          desc(components.supplierType),
          desc(components.rating)
        ) as any;
      } else {
        componentQuery = componentQuery.orderBy(
          desc(components.rating),
          desc(components.availability)
        ) as any;
      }

      results.components = await componentQuery.limit(10);
    }

    // Search services with location awareness
    if (!type || type === 'services') {
      let serviceQuery = db
        .select({
          service: services,
          provider: {
            id: users.id,
            firstName: profiles.firstName,
            lastName: profiles.lastName,
            company: profiles.company,
          },
        })
        .from(services)
        .leftJoin(users, eq(services.providerId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(
          or(
            ilike(services.name, searchPattern),
            ilike(services.description, searchPattern),
            ilike(services.category, searchPattern),
            ilike(services.location, searchPattern)
          )
        );

      // Prioritize local services if location provided
      if (userLocation) {
        serviceQuery = serviceQuery.orderBy(
          sql`CASE WHEN ${services.location} ILIKE ${`%${userLocation}%`} THEN 1 ELSE 2 END`,
          desc(services.rating)
        ) as any;
      } else {
        serviceQuery = serviceQuery.orderBy(desc(services.rating)) as any;
      }

      results.services = await serviceQuery.limit(10);
    }

    // Search community posts
    if (!type || type === 'posts') {
      results.posts = await db
        .select({
          post: communityPosts,
          author: {
            id: users.id,
            firstName: profiles.firstName,
            lastName: profiles.lastName,
            avatar: profiles.avatar,
          },
        })
        .from(communityPosts)
        .leftJoin(users, eq(communityPosts.authorId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(
          or(
            ilike(communityPosts.title, searchPattern),
            ilike(communityPosts.content, searchPattern),
            ilike(communityPosts.category, searchPattern)
          )
        )
        .orderBy(desc(communityPosts.viewCount))
        .limit(10);
    }

    // Search projects
    if (!type || type === 'projects') {
      results.projects = await db
        .select({
          project: projects,
          author: {
            id: users.id,
            firstName: profiles.firstName,
            lastName: profiles.lastName,
            avatar: profiles.avatar,
          },
        })
        .from(projects)
        .leftJoin(users, eq(projects.authorId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(
          and(
            or(
              ilike(projects.title, searchPattern),
              ilike(projects.description, searchPattern),
              ilike(projects.category, searchPattern)
            ),
            eq(projects.visibility, 'public')
          )
        )
        .orderBy(desc(projects.likeCount), desc(projects.viewCount))
        .limit(10);
    }

    // Search users
    if (!type || type === 'users') {
      const userResults = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          profile: profiles,
        })
        .from(users)
        .leftJoin(profiles, sql`${users.id} = ${profiles.userId}`)
        .where(
          or(
            ilike(users.email, searchPattern),
            ilike(profiles.firstName, searchPattern),
            ilike(profiles.lastName, searchPattern),
            ilike(profiles.company, searchPattern)
          )
        )
        .limit(10);
      results.users = userResults;
    }

    res.json(results);
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/search/compare
 * @desc Compare multiple components side-by-side
 * @body {number[]} componentIds - Array of component IDs to compare
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { componentIds } = req.body;

    if (!Array.isArray(componentIds) || componentIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 component IDs required for comparison' });
    }

    if (componentIds.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 components can be compared at once' });
    }

    const comparisonData = await db
      .select({
        component: components,
        provider: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          company: profiles.company,
          verificationStatus: profiles.verificationStatus,
        },
        affiliateStore: affiliateStores,
      })
      .from(components)
      .leftJoin(users, eq(components.providerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(affiliateStores, eq(components.affiliateStoreId, affiliateStores.id))
      .where(inArray(components.id, componentIds));

    // Calculate comparison metrics
    const comparison = {
      components: comparisonData,
      summary: {
        priceRange: {
          min: Math.min(...comparisonData.map(c => parseFloat(c.component.price))),
          max: Math.max(...comparisonData.map(c => parseFloat(c.component.price))),
        },
        averageRating: comparisonData.reduce((sum, c) => sum + (c.component.rating ? parseFloat(c.component.rating) : 0), 0) / comparisonData.length,
        localSuppliers: comparisonData.filter(c => c.component.supplierType === 'local').length,
        verifiedSuppliers: comparisonData.filter(c => c.provider?.verificationStatus === 'verified').length,
        averageShippingTime: comparisonData
          .filter(c => c.component.shippingTime)
          .reduce((sum, c) => sum + (c.component.shippingTime || 0), 0) / comparisonData.filter(c => c.component.shippingTime).length || 0,
      },
    };

    // Save comparison for analytics (optional user tracking)
    if (req.query.userId) {
      await db.insert(componentComparisons).values({
        userId: parseInt(req.query.userId as string),
        componentIds: JSON.stringify(componentIds),
      });
    }

    res.json(comparison);
  } catch (error: any) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
