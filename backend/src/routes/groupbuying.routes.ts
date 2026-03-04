import { Router, Response } from 'express';
import { db } from '../config/database';
import { groupBuyingCampaigns, groupBuyingParticipants, users, profiles } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();

// Get all group buying campaigns
router.get('/', async (req, res) => {
  try {
    const { status } = req.query as any;

    const conditions = [];

    if (status) {
      conditions.push(eq(groupBuyingCampaigns.status, status));
    } else {
      // Default to open campaigns
      conditions.push(eq(groupBuyingCampaigns.status, 'open'));
    }

    const campaigns = await db
      .select({
        campaign: groupBuyingCampaigns,
        organizer: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
        },
      })
      .from(groupBuyingCampaigns)
      .leftJoin(users, eq(groupBuyingCampaigns.organizerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(groupBuyingCampaigns.createdAt));

    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single campaign with participants
router.get('/:id', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    const [campaign] = await db
      .select({
        campaign: groupBuyingCampaigns,
        organizer: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
          company: profiles.company,
        },
      })
      .from(groupBuyingCampaigns)
      .leftJoin(users, eq(groupBuyingCampaigns.organizerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(groupBuyingCampaigns.id, campaignId));

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get participants
    const participants = await db
      .select({
        participant: groupBuyingParticipants,
        user: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
        },
      })
      .from(groupBuyingParticipants)
      .leftJoin(users, eq(groupBuyingParticipants.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(groupBuyingParticipants.campaignId, campaignId))
      .orderBy(desc(groupBuyingParticipants.createdAt));

    // Calculate progress
    const currentQty = campaign.campaign.currentQuantity || 0;
    const progress = campaign.campaign.maximumQuantity
      ? (currentQty / campaign.campaign.maximumQuantity) * 100
      : (currentQty / campaign.campaign.minimumQuantity) * 100;

    const fundingProgress = campaign.campaign.targetFunding && campaign.campaign.totalFunding
      ? (parseFloat(campaign.campaign.totalFunding) / parseFloat(campaign.campaign.targetFunding)) * 100
      : 0;

    res.json({
      ...campaign,
      participants,
      progress: {
        quantity: Math.min(progress, 100),
        funding: Math.min(fundingProgress, 100),
        isMinimumMet: currentQty >= campaign.campaign.minimumQuantity,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create group buying campaign
router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      componentName,
      componentUrl,
      supplierName,
      supplierCountry,
      unitPrice,
      currency,
      shippingCost,
      customsDuty,
      minimumQuantity,
      maximumQuantity,
      deadline,
      estimatedDelivery,
    } = req.body;

    // Calculate target funding
    const totalUnitCost = parseFloat(unitPrice);
    const shipping = shippingCost ? parseFloat(shippingCost) : 0;
    const duty = customsDuty ? parseFloat(customsDuty) : 0;
    const targetFunding = (totalUnitCost * minimumQuantity) + shipping + duty;

    const [newCampaign] = await db
      .insert(groupBuyingCampaigns)
      .values({
        organizerId: userId,
        title,
        description,
        componentName,
        componentUrl: componentUrl || null,
        supplierName: supplierName || null,
        supplierCountry: supplierCountry || null,
        unitPrice,
        currency: currency || 'USD',
        shippingCost: shippingCost || null,
        customsDuty: customsDuty || null,
        minimumQuantity,
        maximumQuantity: maximumQuantity || null,
        deadline,
        estimatedDelivery: estimatedDelivery || null,
        targetFunding: targetFunding.toString(),
        status: 'open',
      })
      .returning();

    res.status(201).json(newCampaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Join group buying campaign
router.post('/:id/join', authenticate, async (req: any, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id);
    const userId = req.user.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Check campaign
    const [campaign] = await db
      .select()
      .from(groupBuyingCampaigns)
      .where(eq(groupBuyingCampaigns.id, campaignId));

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'open') {
      return res.status(400).json({ error: 'Campaign is not open for joining' });
    }

    if (campaign.deadline && new Date(campaign.deadline) < new Date()) {
      return res.status(400).json({ error: 'Campaign deadline has passed' });
    }

    // Check if already participating
    const [existing] = await db
      .select()
      .from(groupBuyingParticipants)
      .where(
        and(
          eq(groupBuyingParticipants.campaignId, campaignId),
          eq(groupBuyingParticipants.userId, userId)
        )
      );

    if (existing) {
      return res.status(400).json({ error: 'Already participating in this campaign' });
    }

    // Check maximum quantity
    if (campaign.maximumQuantity && (campaign.currentQuantity + quantity) > campaign.maximumQuantity) {
      return res.status(400).json({ error: 'This would exceed the maximum quantity' });
    }

    // Calculate contribution
    const unitPrice = parseFloat(campaign.unitPrice);
    const participantCount = campaign.participantCount || 0;
    const shippingShare = campaign.shippingCost
      ? parseFloat(campaign.shippingCost) / (participantCount + 1)
      : 0;
    const dutyShare = campaign.customsDuty
      ? parseFloat(campaign.customsDuty) / (participantCount + 1)
      : 0;
    const contribution = (unitPrice * quantity) + shippingShare + dutyShare;

    // Add participant
    const [participant] = await db
      .insert(groupBuyingParticipants)
      .values({
        campaignId,
        userId,
        quantity,
        contribution: contribution.toString(),
        isPaid: false,
      })
      .returning();

    // Update campaign
    await db
      .update(groupBuyingCampaigns)
      .set({
        currentQuantity: sql`${groupBuyingCampaigns.currentQuantity} + ${quantity}`,
        participantCount: sql`${groupBuyingCampaigns.participantCount} + 1`,
        totalFunding: sql`${groupBuyingCampaigns.totalFunding} + ${contribution}`,
        updatedAt: new Date(),
      })
      .where(eq(groupBuyingCampaigns.id, campaignId));

    // Check if minimum reached
    const updatedCampaign = await db
      .select()
      .from(groupBuyingCampaigns)
      .where(eq(groupBuyingCampaigns.id, campaignId));

    if (updatedCampaign[0] && updatedCampaign[0].currentQuantity && updatedCampaign[0].currentQuantity >= updatedCampaign[0].minimumQuantity) {
      await db
        .update(groupBuyingCampaigns)
        .set({ status: 'funding' })
        .where(eq(groupBuyingCampaigns.id, campaignId));
    }

    res.status(201).json(participant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Leave group buying campaign
router.delete('/:id/leave', authenticate, async (req: any, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id);
    const userId = req.user.id;

    const [participant] = await db
      .select()
      .from(groupBuyingParticipants)
      .where(
        and(
          eq(groupBuyingParticipants.campaignId, campaignId),
          eq(groupBuyingParticipants.userId, userId)
        )
      );

    if (!participant) {
      return res.status(404).json({ error: 'Not participating in this campaign' });
    }

    if (participant.isPaid) {
      return res.status(400).json({ error: 'Cannot leave after payment' });
    }

    // Remove participant
    await db
      .delete(groupBuyingParticipants)
      .where(eq(groupBuyingParticipants.id, participant.id));

    // Update campaign
    await db
      .update(groupBuyingCampaigns)
      .set({
        currentQuantity: sql`${groupBuyingCampaigns.currentQuantity} - ${participant.quantity}`,
        participantCount: sql`${groupBuyingCampaigns.participantCount} - 1`,
        totalFunding: sql`${groupBuyingCampaigns.totalFunding} - ${participant.contribution}`,
        updatedAt: new Date(),
      })
      .where(eq(groupBuyingCampaigns.id, campaignId));

    res.json({ message: 'Left campaign successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update campaign status (organizer only)
router.put('/:id/status', authenticate, async (req: any, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id);
    const userId = req.user.id;
    const { status } = req.body;

    const [campaign] = await db
      .select()
      .from(groupBuyingCampaigns)
      .where(eq(groupBuyingCampaigns.id, campaignId));

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.organizerId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [updated] = await db
      .update(groupBuyingCampaigns)
      .set({ status, updatedAt: new Date() })
      .where(eq(groupBuyingCampaigns.id, campaignId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
