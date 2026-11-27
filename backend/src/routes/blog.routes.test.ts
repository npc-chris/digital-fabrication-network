import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import blogRoutes, { resetBlogMemoryForTests } from './blog.routes';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/dfn_gateway_test';
process.env.JWT_SECRET = 'blog-test-secret-minimum-32-characters-long';

describe('Blog CMS Routes (SharedDB + Admin RBAC)', () => {
  let app: express.Express;

  const adminToken = jwt.sign(
    { id: 1, email: 'admin@fabnetwork.com.ng', role: 'admin' },
    process.env.JWT_SECRET!
  );
  const explorerToken = jwt.sign(
    { id: 2, email: 'user@fabnetwork.com.ng', role: 'explorer' },
    process.env.JWT_SECRET!
  );

  beforeEach(() => {
    resetBlogMemoryForTests();
    app = express();
    app.use(express.json());
    app.use('/api/blog', blogRoutes);
  });

  it('enforces admin role when creating blog posts and allows publishing', async () => {
    const denied = await request(app)
      .post('/api/blog/posts')
      .set('Authorization', `Bearer ${explorerToken}`)
      .send({ title: 'Unauthorized', htmlContent: '<p>Nope</p>' });
    expect(denied.status).toBe(403);

    const created = await request(app)
      .post('/api/blog/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Flutterwave Multi-Milestone Escrow Architecture',
        content: 'Escrow technical notes for Nigerian fabrication clusters.',
        htmlContent: '<p>Escrow technical notes for Nigerian fabrication clusters.</p>',
        status: 'published',
        category: 'Architecture',
      });

    expect(created.status).toBe(201);
    const createdPost = created.body.post;
    expect(createdPost.status).toBe('published');
    expect(createdPost.slug).toContain('flutterwave-multi-milestone-escrow-architecture');

    const listRes = await request(app).get('/api/blog/posts?status=published');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);

    const detailRes = await request(app).get(`/api/blog/posts/${createdPost.slug}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.post.title).toBe('Flutterwave Multi-Milestone Escrow Architecture');
  });
});
