import express from 'express';
import request from 'supertest';
import gatewayRoutes, { topologyHandler } from './gateway.routes';
import { loadBalancerService } from '../services/load-balancer.service';

describe('Product-Line Gateway Routes (dfn-digisec & dfn-finworld)', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  let app: express.Express;

  beforeEach(() => {
    jest.resetAllMocks();
    loadBalancerService.resetForTests();
    process.env = { ...originalEnv };
    delete process.env.DIGISEC_UPSTREAMS;
    delete process.env.FINWORLD_UPSTREAMS;
    delete process.env.DISCOVERY_UPSTREAMS;
    delete process.env.PRISM_UPSTREAMS;
    process.env.DIGISEC_API_URL = 'https://digisec.internal';
    process.env.FINWORLD_API_URL = 'https://finworld.internal';
    process.env.DISCOVERY_API_URL = 'https://discovery.internal';
    process.env.PRISM_API_URL = 'https://prism.internal';

    app = express();
    app.use(express.json());
    app.get('/api/gateway/topology', topologyHandler);
    app.use('/api', gatewayRoutes);
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('publishes Flutterwave-first financial topology and dfn-digisec IdP metadata', async () => {
    const res = await request(app).get('/api/gateway/topology');

    expect(res.status).toBe(200);
    expect(res.body.defaultPaymentGateway).toBe('flutterwave');
    expect(res.body.supportedGateways).toEqual(['flutterwave', 'paystack']);
    expect(res.body.upstreams.identity.name).toBe('dfn-digisec');
    expect(res.body.upstreams.identity.jwksUrl).toBe('https://digisec.internal/.well-known/jwks.json');
    expect(res.body.upstreams.financial.name).toBe('dfn-finworld');
    expect(res.body.productLine.userFacing).toContain('dfn-discovery');
  });

  it('forwards identity and KYC calls to dfn-digisec', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ user: { id: 12, email: 'eng@dfn.ng' } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('eng@dfn.ng');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://digisec.internal/api/auth/me',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          authorization: 'Bearer test-token',
          'x-dfn-gateway': 'digital-fabrication-network',
        }),
      })
    );
  });

  it('redirects browser Google OAuth handshakes to dfn-digisec', async () => {
    const res = await request(app).get('/api/auth/google?state=xyz');
    expect(res.status).toBe(307);
    expect(res.headers.location).toBe('https://digisec.internal/api/auth/google?state=xyz');
  });

  it('forwards legacy /api/rfq/escrow and Flutterwave webhook headers to dfn-finworld', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        gateway: 'flutterwave',
        reference: 'DFN-FLW-001',
        authorizationUrl: 'https://checkout.flutterwave.com/v3/hosted/pay/abc',
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await request(app)
      .post('/api/rfq/escrow/webhook/flutterwave')
      .set('verif-hash', 'flw-secret-hash')
      .send({ event: 'charge.completed', data: { tx_ref: 'DFN-FLW-001' } });

    expect(res.status).toBe(201);
    expect(res.body.gateway).toBe('flutterwave');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://finworld.internal/api/v1/escrow/webhook/flutterwave',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'verif-hash': 'flw-secret-hash',
        }),
      })
    );
  });

  it('returns 502 with upstream diagnostic when downstream service is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED')) as unknown as typeof fetch;

    const res = await request(app).post('/api/v1/billing/quotas/verify').send({ orgId: 'org_1' });

    expect(res.status).toBe(502);
    expect(res.body.upstream).toBe('dfn-finworld');
    expect(res.body.detail).toContain('ECONNREFUSED');
  });

  it('fails over across load-balanced replica upstreams and forwards Discovery & Prism routes', async () => {
    process.env.FINWORLD_UPSTREAMS = 'https://fin-primary.internal,https://fin-secondary.internal';
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce({
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: true, node: 'secondary' }),
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ jobs: [] }),
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'ok', service: 'dfn-prism' }),
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    const finRes = await request(app).get('/api/v1/billing/plans');
    expect(finRes.status).toBe(200);
    expect(finRes.body.node).toBe('secondary');
    expect(finRes.headers['x-dfn-upstream-node']).toBe('https://fin-secondary.internal');

    const discRes = await request(app).get('/api/v1/jobs');
    expect(discRes.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://discovery.internal/api/v1/jobs',
      expect.objectContaining({ method: 'GET' })
    );

    const prismRes = await request(app).get('/api/prism/health');
    expect(prismRes.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://prism.internal/health',
      expect.objectContaining({ method: 'GET' })
    );
  });
});
