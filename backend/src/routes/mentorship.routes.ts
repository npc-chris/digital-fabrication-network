import { Router, Response } from 'express';
import { db } from '../config/database';
import { mentorshipRequests, users, profiles } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

// Get all mentorship requests (filtered)
router.get('/', async (req, res) => {
  try {
    const { status, mentorId, menteeId } = req.query as any;

    const conditions = [];

    if (status) {
      conditions.push(eq(mentorshipRequests.status, status));
    }

    if (mentorId) {
      conditions.push(eq(mentorshipRequests.mentorId, parseInt(mentorId)));
    }

    if (menteeId) {
      conditions.push(eq(mentorshipRequests.menteeId, parseInt(menteeId)));
    }

    const requests = await db
      .select({
        request: mentorshipRequests,
        mentee: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
        },
      })
      .from(mentorshipRequests)
      .leftJoin(users, eq(mentorshipRequests.menteeId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(mentorshipRequests.createdAt));

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get available mentors
router.get('/mentors', async (req, res) => {
  try {
    // const { area } = req.query as any;

    const conditions = [eq(profiles.isMentor, true)];

    const mentors = await db
      .select({
        user: {
          id: users.id,
          email: users.email,
        },
        profile: profiles,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(profiles.rating));

    res.json(mentors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single mentorship request
router.get('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);

    const [request] = await db
      .select({
        request: mentorshipRequests,
        mentee: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
          bio: profiles.bio,
        },
      })
      .from(mentorshipRequests)
      .leftJoin(users, eq(mentorshipRequests.menteeId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(mentorshipRequests.id, requestId));

    if (!request) {
      return res.status(404).json({ error: 'Mentorship request not found' });
    }

    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create mentorship request
router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { mentorId, topic, description, goals } = req.body;

    const [newRequest] = await db
      .insert(mentorshipRequests)
      .values({
        menteeId: userId,
        mentorId: mentorId || null,
        topic,
        description,
        goals: goals || null,
        status: mentorId ? 'matched' : 'open',
      })
      .returning();

    res.status(201).json(newRequest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update mentorship request
router.put('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.id;

    const [existing] = await db
      .select()
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.id, requestId));

    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (existing.menteeId !== userId && existing.mentorId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updateData: any = {};
    ['topic', 'description', 'goals', 'status', 'startDate', 'endDate'].forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const [updated] = await db
      .update(mentorshipRequests)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(mentorshipRequests.id, requestId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept mentorship request (for mentors)
router.post('/:id/accept', authenticate, async (req: any, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.id;

    const [existing] = await db
      .select()
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.id, requestId));

    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (existing.status !== 'open') {
      return res.status(400).json({ error: 'Request is not open' });
    }

    // Verify user is a mentor
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (!profile || !profile.isMentor) {
      return res.status(403).json({ error: 'You must be a registered mentor' });
    }

    const [updated] = await db
      .update(mentorshipRequests)
      .set({
        mentorId: userId,
        status: 'matched',
        startDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mentorshipRequests.id, requestId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete mentorship
router.post('/:id/complete', authenticate, async (req: any, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.id;

    const [existing] = await db
      .select()
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.id, requestId));

    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (existing.menteeId !== userId && existing.mentorId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [updated] = await db
      .update(mentorshipRequests)
      .set({
        status: 'completed',
        endDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mentorshipRequests.id, requestId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Register as mentor
router.post('/register-mentor', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { mentorshipAreas, mentorBio } = req.body;

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const [updated] = await db
      .update(profiles)
      .set({
        isMentor: true,
        mentorshipAreas: mentorshipAreas ? JSON.stringify(mentorshipAreas) : null,
        mentorBio: mentorBio || null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
