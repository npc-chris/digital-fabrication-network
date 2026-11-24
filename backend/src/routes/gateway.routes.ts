import { Router, Request, Response } from 'express';

export interface ServiceTopology {
  service: string;
  role: string;
  defaultPaymentGateway: 'flutterwave';
  supportedGateways: string[];
  upstreams: {
    identity: {
      name: string;
      baseUrl: string;
      jwksUrl: string;
      routes: string[];
    };
    financial: {
      name: string;
      baseUrl: string;
      routes: string[];
    };
  };
  productLine: {
    userFacing: string[];
    underlying: string[];
  };
}

export function getDigisecBaseUrl(): string {
  return (process.env.DIGISEC_API_URL || 'http://localhost:4100').replace(/\/$/, '');
}

export function getFinworldBaseUrl(): string {
  return (process.env.FINWORLD_API_URL || 'http://localhost:4200').replace(/\/$/, '');
}

export function buildTopologySnapshot(): ServiceTopology {
  const digisecUrl = getDigisecBaseUrl();
  const finworldUrl = getFinworldBaseUrl();
  const jwksUrl = process.env.DIGISEC_JWKS_URL || `${digisecUrl}/.well-known/jwks.json`;

  return {
    service: 'digital-fabrication-network',
    role: 'platform-gateway-and-marketing',
    defaultPaymentGateway: 'flutterwave',
    supportedGateways: ['flutterwave', 'paystack'],
    upstreams: {
      identity: {
        name: 'dfn-digisec',
        baseUrl: digisecUrl,
        jwksUrl,
        routes: ['/api/auth', '/api/profiles', '/api/verification', '/api/email-verification'],
      },
      financial: {
        name: 'dfn-finworld',
        baseUrl: finworldUrl,
        routes: ['/api/rfq/escrow', '/api/v1/escrow', '/api/v1/billing', '/api/v1/invoices'],
      },
    },
    productLine: {
      userFacing: ['digital-fabrication-network', 'dfn-discovery'],
      underlying: ['dfn-digisec', 'dfn-finworld', 'dfn-prism', 'dfn-parametrics'],
    },
  };
}

export const topologyHandler = (_req: Request, res: Response): void => {
  res.json(buildTopologySnapshot());
};

function buildForwardHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const passthroughHeaders = [
    'authorization',
    'content-type',
    'accept',
    'x-request-id',
    'verif-hash',
    'x-paystack-signature',
    'x-dfn-internal-key',
  ];

  for (const name of passthroughHeaders) {
    const value = req.headers[name];
    if (typeof value === 'string' && value.length > 0) {
      headers[name] = value;
    }
  }

  headers['x-forwarded-host'] = String(req.headers.host || '');
  headers['x-dfn-gateway'] = 'digital-fabrication-network';
  return headers;
}

export function createUpstreamProxy(
  upstreamName: string,
  resolveBaseUrl: () => string,
  targetPrefix: string
) {
  return async (req: Request, res: Response): Promise<void> => {
    const baseUrl = resolveBaseUrl();
    const suffix = req.url === '/' ? '' : req.url;
    const targetUrl = `${baseUrl}${targetPrefix}${suffix}`;
    const timeoutMs = Number(process.env.GATEWAY_TIMEOUT_MS || 15000);

    try {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      const method = req.method.toUpperCase();
      const headers = buildForwardHeaders(req);
      const init: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (method !== 'GET' && method !== 'HEAD' && req.body !== undefined) {
        if (!headers['content-type']) {
          headers['content-type'] = 'application/json';
        }
        init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }

      const upstreamRes = await fetch(targetUrl, init).finally(() => clearTimeout(timeoutHandle));
      const contentType = upstreamRes.headers.get('content-type') || '';

      res.status(upstreamRes.status);
      if (contentType.includes('application/json')) {
        const jsonBody = await upstreamRes.json();
        res.json(jsonBody);
        return;
      }

      const textBody = await upstreamRes.text();
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      res.send(textBody);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upstream connection failed';
      res.status(502).json({
        error: 'Upstream service unavailable',
        upstream: upstreamName,
        targetUrl,
        detail: message,
      });
    }
  };
}

const router = Router();

// Browser OAuth entry points redirect directly to dfn-digisec unless explicitly proxied
router.get('/auth/google', (req: Request, res: Response, next) => {
  if (req.headers['x-gateway-mode'] === 'proxy') {
    return next();
  }
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  return res.redirect(307, `${getDigisecBaseUrl()}/api/auth/google${query}`);
});

router.get('/auth/google/callback', (req: Request, res: Response, next) => {
  if (req.headers['x-gateway-mode'] === 'proxy') {
    return next();
  }
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  return res.redirect(307, `${getDigisecBaseUrl()}/api/auth/google/callback${query}`);
});

// Identity, Auth & KYC routes -> dfn-digisec
router.use('/auth', createUpstreamProxy('dfn-digisec', getDigisecBaseUrl, '/api/auth'));
router.use('/profiles', createUpstreamProxy('dfn-digisec', getDigisecBaseUrl, '/api/profiles'));
router.use('/verification', createUpstreamProxy('dfn-digisec', getDigisecBaseUrl, '/api/verification'));
router.use(
  '/email-verification',
  createUpstreamProxy('dfn-digisec', getDigisecBaseUrl, '/api/email-verification')
);

// Escrow, Billing & Invoicing routes -> dfn-finworld (Flutterwave default)
router.use('/rfq/escrow', createUpstreamProxy('dfn-finworld', getFinworldBaseUrl, '/api/v1/escrow'));
router.use('/v1/escrow', createUpstreamProxy('dfn-finworld', getFinworldBaseUrl, '/api/v1/escrow'));
router.use('/v1/billing', createUpstreamProxy('dfn-finworld', getFinworldBaseUrl, '/api/v1/billing'));
router.use('/v1/invoices', createUpstreamProxy('dfn-finworld', getFinworldBaseUrl, '/api/v1/invoices'));
router.use('/v1/quotas', createUpstreamProxy('dfn-finworld', getFinworldBaseUrl, '/v1/quotas'));

export default router;
