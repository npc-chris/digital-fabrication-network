import crypto from 'crypto';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { authenticate, authorize, resetJwksCacheForTests } from './auth';

describe('Platform Gateway Auth Middleware (RS256 JWKS + HS256 Fallback)', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  let app: express.Express;

  beforeEach(() => {
    jest.resetAllMocks();
    resetJwksCacheForTests();
    process.env = { ...originalEnv };
    delete process.env.DIGISEC_ISSUER;
    process.env.DIGISEC_API_URL = 'https://idp.fabnetwork.test';
    process.env.JWT_SECRET = 'fallback-symmetric-secret-32-chars-min';

    app = express();
    app.get('/protected', authenticate, (req: Request, res: Response) => {
      res.json({ user: req.user });
    });
    app.get('/admin-only', authenticate, authorize('admin', 'platform_manager'), (req: Request, res: Response) => {
      res.json({ admin: true, user: req.user });
    });
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('verifies RS256 token against dfn-digisec JWKS and normalizes DFN namespace claims', async () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    const publicJwk = publicKey.export({ format: 'jwk' });
    const kid = 'digisec-key-1';

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        keys: [{ ...publicJwk, kid, alg: 'RS256', use: 'sig' }],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const token = jwt.sign(
      {
        email: 'founder@fablab.ng',
        'https://fabnetwork.com.ng/user_id': 42,
        'https://fabnetwork.com.ng/role': 'provider',
        'https://fabnetwork.com.ng/org_id': 'org_lagos_01',
      },
      privateKey,
      { algorithm: 'RS256', keyid: kid, issuer: 'https://idp.fabnetwork.test', expiresIn: '1h' }
    );

    process.env.DIGISEC_ISSUER = 'https://idp.fabnetwork.test';

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({
      id: 42,
      email: 'founder@fablab.ng',
      role: 'provider',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://idp.fabnetwork.test/.well-known/jwks.json',
      expect.any(Object)
    );

    // Second request uses cached JWKS without another HTTP call
    const resCached = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(resCached.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes JWKS cache when encountering an unknown rotated kid', async () => {
    const key1 = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const key2 = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

    const jwk1 = { ...key1.publicKey.export({ format: 'jwk' }), kid: 'kid-v1', alg: 'RS256' };
    const jwk2 = { ...key2.publicKey.export({ format: 'jwk' }), kid: 'kid-v2', alg: 'RS256' };

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ keys: [jwk1] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ keys: [jwk1, jwk2] }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const token1 = jwt.sign({ id: 10, email: 'u1@dfn.ng', role: 'explorer' }, key1.privateKey, {
      algorithm: 'RS256',
      keyid: 'kid-v1',
    });
    const token2 = jwt.sign({ id: 11, email: 'u2@dfn.ng', role: 'admin' }, key2.privateKey, {
      algorithm: 'RS256',
      keyid: 'kid-v2',
    });

    const first = await request(app).get('/protected').set('Authorization', `Bearer ${token1}`);
    expect(first.status).toBe(200);

    const second = await request(app).get('/admin-only').set('Authorization', `Bearer ${token2}`);
    expect(second.status).toBe(200);
    expect(second.body.admin).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('supports HS256 JWT_SECRET verification fallback for local transition tokens', async () => {
    const token = jwt.sign(
      { id: 7, email: 'local@dfn.ng', role: 'explorer' },
      process.env.JWT_SECRET!,
      { algorithm: 'HS256' }
    );

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({
      id: 7,
      email: 'local@dfn.ng',
      role: 'explorer',
    });

    const denied = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);
    expect(denied.status).toBe(403);
  });

  it('rejects missing, malformed, and wrong-key tokens cleanly', async () => {
    const rogue = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const real = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        keys: [{ ...real.publicKey.export({ format: 'jwk' }), kid: 'kid-real', alg: 'RS256' }],
      }),
    }) as unknown as typeof fetch;

    const forged = jwt.sign({ id: 99, role: 'admin' }, rogue.privateKey, {
      algorithm: 'RS256',
      keyid: 'kid-real',
    });

    expect((await request(app).get('/protected')).status).toBe(401);
    expect((await request(app).get('/protected').set('Authorization', 'Bearer bad.jwt')).status).toBe(401);
    expect((await request(app).get('/protected').set('Authorization', `Bearer ${forged}`)).status).toBe(401);
  });
});
