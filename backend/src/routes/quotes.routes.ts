import { Router, Request as Request, Response } from 'express';
import { db } from '../config/database';
import { quotes, services, notifications } from '../models/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/quotes
 * @desc Request a quote for a service
 * @access Private
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = ((req as any).user).id;
    const { serviceId, projectDescription, specifications } = req.body;

    if (!serviceId || !projectDescription) {
      return res.status(400).json({ error: 'Service ID and project description are required' });
    }

    // Verify service exists
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Create quote
    const [newQuote] = await db
      .insert(quotes)
      .values({
        serviceId,
        userId,
        providerId: service.providerId,
        projectDescription,
        specifications: specifications ? JSON.stringify(specifications) : null,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      })
      .returning();

    // Create notification for provider
    await db.insert(notifications).values({
      userId: service.providerId,
      type: 'quote',
      title: 'New Quote Request',
      message: `You have a new quote request for ${service.name}`,
      relatedType: 'quote',
      relatedId: newQuote.id,
    });

    res.status(201).json(newQuote);
  } catch (error: any) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

/**
 * @route GET /api/quotes
 * @desc Get user quotes (both requested and received)
 * @access Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = ((req as any).user).id;
    const type = req.query.type as string; // 'requested' or 'received'

    let userQuotes;
    if (type === 'requested') {
      userQuotes = await db
        .select()
        .from(quotes)
        .where(eq(quotes.userId, userId))
        .orderBy(desc(quotes.createdAt));
    } else if (type === 'received') {
      userQuotes = await db
        .select()
        .from(quotes)
        .where(eq(quotes.providerId, userId))
        .orderBy(desc(quotes.createdAt));
    } else {
      userQuotes = await db
        .select()
        .from(quotes)
        .where(or(eq(quotes.userId, userId), eq(quotes.providerId, userId)))
        .orderBy(desc(quotes.createdAt));
    }

    res.json(userQuotes);
  } catch (error: any) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

/**
 * @route GET /api/quotes/:id
 * @desc Get quote details
 * @access Private
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = ((req as any).user).id;
    const quoteId = parseInt(req.params.id);

    const [quote] = await db
      .select()
      .from(quotes)
      .where(
        and(
          eq(quotes.id, quoteId),
          or(eq(quotes.userId, userId), eq(quotes.providerId, userId))
        )
      )
      .limit(1);

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(quote);
  } catch (error: any) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

/**
 * @route PATCH /api/quotes/:id
 * @desc Update quote (provider only - add estimate)
 * @access Private
 */
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = ((req as any).user).id;
    const quoteId = parseInt(req.params.id);
    const { estimatedPrice, estimatedDuration, notes, status } = req.body;

    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId))
      .limit(1);

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Only provider can update the estimate
    if (quote.providerId !== userId) {
      return res.status(403).json({ error: 'Only the service provider can update this quote' });
    }

    const updateData: any = { updatedAt: new Date() };
    if (estimatedPrice !== undefined) updateData.estimatedPrice = estimatedPrice;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    const [updatedQuote] = await db
      .update(quotes)
      .set(updateData)
      .where(eq(quotes.id, quoteId))
      .returning();

    // Notify requester
    await db.insert(notifications).values({
      userId: quote.userId,
      type: 'quote',
      title: 'Quote Updated',
      message: `Your quote request has been updated`,
      relatedType: 'quote',
      relatedId: quoteId,
    });

    res.json(updatedQuote);
  } catch (error: any) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

/**
 * @route PATCH /api/quotes/:id/status
 * @desc Update quote status (user can approve/reject)
 * @access Private
 */
router.patch('/:id/status', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = ((req as any).user).id;
    const quoteId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected' });
    }

    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId))
      .limit(1);

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Only requester can approve/reject
    if (quote.userId !== userId) {
      return res.status(403).json({ error: 'Only the requester can update quote status' });
    }

    const [updatedQuote] = await db
      .update(quotes)
      .set({ status, updatedAt: new Date() })
      .where(eq(quotes.id, quoteId))
      .returning();

    // Notify provider
    await db.insert(notifications).values({
      userId: quote.providerId,
      type: 'quote',
      title: `Quote ${status}`,
      message: `Your quote has been ${status}`,
      relatedType: 'quote',
      relatedId: quoteId,
    });

    res.json(updatedQuote);
  } catch (error: any) {
    console.error('Error updating quote status:', error);
    res.status(500).json({ error: 'Failed to update quote status' });
  }
});

export default router;
