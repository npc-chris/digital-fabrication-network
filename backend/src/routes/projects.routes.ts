import { Router, Response } from 'express';
import { db } from '../config/database';
import { projects, projectBoms, projectLikes, projectCompletions, components, users, profiles } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, desc, and, sql, like, or } from 'drizzle-orm';

const router = Router();

// Get all projects with filters
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, visibility = 'public', authorId } = req.query;
    
    const conditions = [];
    
    if (visibility && typeof visibility === 'string') {
      conditions.push(eq(projects.visibility, visibility as 'public' | 'unlisted' | 'private'));
    }
    if (category && typeof category === 'string') {
      conditions.push(eq(projects.category, category));
    }
    if (difficulty && typeof difficulty === 'string') {
      conditions.push(eq(projects.difficulty, difficulty));
    }
    if (authorId && typeof authorId === 'string') {
      conditions.push(eq(projects.authorId, parseInt(authorId)));
    }
    if (search && typeof search === 'string') {
      conditions.push(
        or(
          like(projects.title, `%${search}%`),
          like(projects.description, `%${search}%`)
        )
      );
    }

    const projectsList = await db
      .select({
        project: projects,
        author: {
          id: users.id,
          email: users.email,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
        }
      })
      .from(projects)
      .leftJoin(users, eq(projects.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(projects.createdAt));

    res.json(projectsList);
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get single project with BOM
router.get('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    const [project] = await db
      .select({
        project: projects,
        author: {
          id: users.id,
          email: users.email,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
          company: profiles.company,
        }
      })
      .from(projects)
      .leftJoin(users, eq(projects.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(projects.id, projectId));

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get BOM with linked components
    const bom = await db
      .select({
        bomItem: projectBoms,
        component: components,
      })
      .from(projectBoms)
      .leftJoin(components, eq(projectBoms.componentId, components.id))
      .where(eq(projectBoms.projectId, projectId))
      .orderBy(projectBoms.sortOrder);

    // Increment view count
    await db
      .update(projects)
      .set({ viewCount: sql`${projects.viewCount} + 1` })
      .where(eq(projects.id, projectId));

    res.json({
      ...project,
      bom,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new project
router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      category,
      tags,
      images,
      visibility,
      difficulty,
      estimatedCost,
      estimatedTime,
      instructions,
      toolsRequired,
      isOpenForCollaboration,
      bom,
    } = req.body;

    const [newProject] = await db
      .insert(projects)
      .values({
        authorId: userId,
        title,
        description,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        images: images ? JSON.stringify(images) : null,
        visibility: visibility || 'public',
        difficulty,
        estimatedCost,
        estimatedTime,
        instructions,
        toolsRequired: toolsRequired ? JSON.stringify(toolsRequired) : null,
        isOpenForCollaboration: isOpenForCollaboration || false,
      })
      .returning();

    // Add BOM items if provided
    if (bom && Array.isArray(bom) && bom.length > 0) {
      const bomItems = bom.map((item: any, index: number) => ({
        projectId: newProject.id,
        componentName: item.componentName,
        componentId: item.componentId || null,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || null,
        supplier: item.supplier || null,
        notes: item.notes || null,
        alternativeComponents: item.alternativeComponents ? JSON.stringify(item.alternativeComponents) : null,
        sortOrder: item.sortOrder || index,
      }));

      await db.insert(projectBoms).values(bomItems);
    }

    res.status(201).json(newProject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check ownership
    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existing.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    const updateData: any = {};
    const allowedFields = [
      'title', 'description', 'category', 'tags', 'images', 'visibility',
      'difficulty', 'estimatedCost', 'estimatedTime', 'instructions',
      'toolsRequired', 'isOpenForCollaboration', 'collaborators'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (['tags', 'images', 'toolsRequired', 'collaborators'].includes(field)) {
          updateData[field] = JSON.stringify(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    const [updated] = await db
      .update(projects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.id;

    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existing.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this project' });
    }

    // Delete related records
    await db.delete(projectBoms).where(eq(projectBoms.projectId, projectId));
    await db.delete(projectLikes).where(eq(projectLikes.projectId, projectId));
    await db.delete(projectCompletions).where(eq(projectCompletions.projectId, projectId));
    await db.delete(projects).where(eq(projects.id, projectId));

    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Like/Unlike project
router.post('/:id/like', authenticate, async (req: any, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check if already liked
    const [existing] = await db
      .select()
      .from(projectLikes)
      .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));

    if (existing) {
      // Unlike
      await db
        .delete(projectLikes)
        .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));

      await db
        .update(projects)
        .set({ likeCount: sql`${projects.likeCount} - 1` })
        .where(eq(projects.id, projectId));

      res.json({ liked: false });
    } else {
      // Like
      await db.insert(projectLikes).values({ projectId, userId });

      await db
        .update(projects)
        .set({ likeCount: sql`${projects.likeCount} + 1` })
        .where(eq(projects.id, projectId));

      res.json({ liked: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark project as completed by user
router.post('/:id/complete', authenticate, async (req: any, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.id;
    const { images, notes, rating } = req.body;

    // Check if already completed
    const [existing] = await db
      .select()
      .from(projectCompletions)
      .where(and(eq(projectCompletions.projectId, projectId), eq(projectCompletions.userId, userId)));

    if (existing) {
      return res.status(400).json({ error: 'Project already marked as completed' });
    }

    const [completion] = await db
      .insert(projectCompletions)
      .values({
        projectId,
        userId,
        images: images ? JSON.stringify(images) : null,
        notes,
        rating,
      })
      .returning();

    // Increment completion count
    await db
      .update(projects)
      .set({ completedCount: sql`${projects.completedCount} + 1` })
      .where(eq(projects.id, projectId));

    res.status(201).json(completion);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get project completions (showcases)
router.get('/:id/completions', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    const completionsList = await db
      .select({
        completion: projectCompletions,
        user: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
        }
      })
      .from(projectCompletions)
      .leftJoin(users, eq(projectCompletions.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(projectCompletions.projectId, projectId))
      .orderBy(desc(projectCompletions.createdAt));

    res.json(completionsList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// BOM management routes
router.post('/:id/bom', authenticate, async (req: any, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project || project.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { componentName, componentId, quantity, unitPrice, supplier, notes, alternativeComponents } = req.body;

    const [bomItem] = await db
      .insert(projectBoms)
      .values({
        projectId,
        componentName,
        componentId: componentId || null,
        quantity: quantity || 1,
        unitPrice: unitPrice || null,
        supplier: supplier || null,
        notes: notes || null,
        alternativeComponents: alternativeComponents ? JSON.stringify(alternativeComponents) : null,
      })
      .returning();

    res.status(201).json(bomItem);
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const bomId = parseInt(req.params.bomId);
    const userId = req.user.id;

    // Check ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project || project.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.delete(projectBoms).where(eq(projectBoms.id, bomId));

    res.json({ message: 'BOM item deleted successfully' });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
