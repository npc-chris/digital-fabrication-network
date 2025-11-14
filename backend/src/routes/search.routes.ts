import { Router, Request as Request, Response } from 'express';
import { db } from '../config/database';
import { components, services, communityPosts, users, profiles } from '../models/schema';
import { sql, or, ilike, and } from 'drizzle-orm';

const router = Router();

/**
 * @route GET /api/search
 * @desc Search across all platform entities
 * @query {string} q - Search query
 * @query {string} type - Entity type filter (components|services|posts|users)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const type = req.query.type as string;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchPattern = `%${query}%`;
    const results: any = {
      components: [],
      services: [],
      posts: [],
      users: [],
    };

    // Search components
    if (!type || type === 'components') {
      results.components = await db
        .select()
        .from(components)
        .where(
          or(
            ilike(components.name, searchPattern),
            ilike(components.description, searchPattern),
            ilike(components.location, searchPattern)
          )
        )
        .limit(10);
    }

    // Search services
    if (!type || type === 'services') {
      results.services = await db
        .select()
        .from(services)
        .where(
          or(
            ilike(services.name, searchPattern),
            ilike(services.description, searchPattern),
            ilike(services.category, searchPattern),
            ilike(services.location, searchPattern)
          )
        )
        .limit(10);
    }

    // Search community posts
    if (!type || type === 'posts') {
      results.posts = await db
        .select()
        .from(communityPosts)
        .where(
          or(
            ilike(communityPosts.title, searchPattern),
            ilike(communityPosts.content, searchPattern),
            ilike(communityPosts.category, searchPattern)
          )
        )
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
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

export default router;
