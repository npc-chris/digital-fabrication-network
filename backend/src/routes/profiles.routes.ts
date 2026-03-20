import { Router } from 'express';
import { db } from '../config/database';
import { profiles, users } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

const USERNAME_REGEX = /^[a-z0-9_]{3,50}$/;

function isDatabaseUniqueViolation(err: any): boolean {
  // PostgreSQL unique violation code
  return err?.code === '23505' || /unique|duplicate/i.test(err?.message || '');
}

// Get current user's profile
router.get('/me', authenticate, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update current user's profile
router.put('/me', authenticate, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      username,
      firstName,
      lastName,
      company,
      bio,
      location,
      phone,
      avatar,
      portfolio,
    } = req.body;

    // Validate username when provided
    if (username?.trim()) {
      if (!USERNAME_REGEX.test(username)) {
        return res.status(400).json({
          error: 'Username must be 3–50 characters and contain only lowercase letters, numbers, or underscores.',
        });
      }
    }

    // Check if profile exists
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, userId));

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const [newProfile] = await db.insert(profiles).values({
        userId,
        username: username || null,
        firstName: firstName || null,
        lastName: lastName || null,
        company: company || null,
        bio: bio || null,
        location: location || null,
        phone: phone || null,
        avatar: avatar || null,
        portfolio: portfolio || null,
      }).returning();

      return res.status(201).json(newProfile);
    }

    // Build update object with only provided fields
    interface ProfileUpdate {
      username?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      company?: string | null;
      bio?: string | null;
      location?: string | null;
      phone?: string | null;
      avatar?: string | null;
      portfolio?: string | null;
      updatedAt: Date;
    }
    
    const updateData: ProfileUpdate = { updatedAt: new Date() };
    if (username !== undefined) updateData.username = username;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (company !== undefined) updateData.company = company;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (portfolio !== undefined) updateData.portfolio = portfolio;

    const [updatedProfile] = await db.update(profiles)
      .set(updateData)
      .where(eq(profiles.userId, userId))
      .returning();

    res.json(updatedProfile);
  } catch (error: any) {
    if (isDatabaseUniqueViolation(error)) {
      return res.status(409).json({ error: 'Username is already taken. Please choose a different one.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get profile by user ID (public)
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const [profile] = await db
      .select({
        profile: profiles,
        user: {
          id: users.id,
          email: users.email,
          role: users.role,
        }
      })
      .from(profiles)
      .leftJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.userId, userId));

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
