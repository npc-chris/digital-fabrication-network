import { Router, Request, Response } from 'express';
import { getSharedDbMetadata } from '../config/database';
import {
  loadBalancerService,
  ProductServiceKey,
  ServicePoolSnapshot,
} from '../services/load-balancer.service';
import { productQueueService } from '../services/queue.service';

export interface ServiceTopology {
  service: string;
  role: string;
  defaultPaymentGateway: 'flutterwave';
  supportedGateways: string[];
  sharedDb: ReturnType<typeof getSharedDbMetadata>;
  queue: ReturnType<typeof productQueueService.getStats>;
  loadBalancer: Record<ProductServiceKey, ServicePoolSnapshot>;
  authBoundary: {
    identityProvider: string;
    edgeVerification: string;
    jwksUrl: string;
  };
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
    discovery: {
      name: string;
      baseUrl: string;
      routes: string[];
    };
    prism: {
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
  return loadBalancerService.selectUpstream('digisec');
}

export function getFinworldBaseUrl(): string {
  return loadBalancerService.selectUpstream('finworld');
}

export function buildTopologySnapshot(): ServiceTopology {
  const pools = loadBalancerService.getAllSnapshots();
  const digisecPrimary = pools.digisec.nodes[0]?.url || 'http://localhost:4100';
  const finworldPrimary = pools.finworld.nodes[0]?.url || 'http://localhost:4200';
  const discoveryPrimary = pools.discovery.nodes[0]?.url || 'http://localhost:4001';
  const prismPrimary = pools.prism.nodes[0]?.url || 'http://localhost:8000';
  const jwksUrl = process.env.DIGISEC_JWKS_URL || `${digisecPrimary}/.well-known/jwks.json`;

  return {
    service: 'digital-fabrication-network',
    role: 'platform-load-balancer-queue-shareddb-and-gateway',
    defaultPaymentGateway: 'flutterwave',
    supportedGateways: ['flutterwave', 'paystack'],
    sharedDb: getSharedDbMetadata(),
    queue: productQueueService.getStats(),
    loadBalancer: pools,
    authBoundary: {
      identityProvider: 'dfn-digisec',
      edgeVerification: 'rs256-jwks-stateless',
      jwksUrl,
    },
    upstreams: {
      identity: {
        name: 'dfn-digisec',
        baseUrl: digisecPrimary,
        jwksUrl,
        routes: ['/api/auth', '/api/profiles', '/api/verification', '/api/email-verification'],
      },
      financial: {
        name: 'dfn-finworld',
        baseUrl: finworldPrimary,
        routes: ['/api/rfq/escrow', '/api/v1/escrow', '/api/v1/billing', '/api/v1/invoices', '/api/v1/quotas'],
      },
      discovery: {
        name: 'dfn-discovery',
        baseUrl: discoveryPrimary,
        routes: ['/api/discovery', '/api/v1/jobs', '/api/v1/projects', '/api/v1/quotes'],
      },
      prism: {
        name: 'dfn-prism',
        baseUrl: prismPrimary,
        routes: ['/api/prism'],
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

export const healthProbeHandler = async (_req: Request, res: Response): Promise<void> => {
  const [digisec, finworld, discovery, prism] = await Promise.all([
    loadBalancerService.probeService('digisec'),
    loadBalancerService.probeService('finworld'),
    loadBalancerService.probeService('discovery'),
    loadBalancerService.probeService('prism'),
  ]);

  res.json({
    gateway: 'digital-fabrication-network',
    timestamp: new Date().toISOString(),
    sharedDb: getSharedDbMetadata(),
    queue: productQueueService.getStats(),
    pools: { digisec, finworld, discovery, prism },
  });
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
    'x-dfn-service-key',
    'x-prism-key',
  ];

  for (const name of passthroughHeaders) {
    const value = req.headers[name];
    if (typeof value === 'string' && value.length > 0) {
      headers[name] = value;
    }
  }

  headers['x-forwarded-host'] = String(req.headers.host || '');
  headers['x-dfn-gateway'] = 'digital-fabrication-network';

  if (req.user) {
    headers['x-dfn-user-id'] = String(req.user.id);
    headers['x-dfn-user-role'] = String(req.user.role);
    if (req.user.orgId) {
      headers['x-dfn-org-id'] = String(req.user.orgId);
    }
  }

  return headers;
}

export function createLoadBalancedProxy(
  serviceKey: ProductServiceKey,
  upstreamName: string,
  targetPrefix: string
) {
  return async (req: Request, res: Response): Promise<void> => {
    const candidates = loadBalancerService.getCandidateOrder(serviceKey);
    const suffix = req.url === '/' ? '' : req.url;
    const timeoutMs = Number(process.env.GATEWAY_TIMEOUT_MS || 15000);
    const method = req.method.toUpperCase();

    let lastError = 'No healthy upstream instances available';
    let lastTargetUrl = '';

    for (const baseUrl of candidates) {
      const targetUrl = `${baseUrl}${targetPrefix}${suffix}`;
      lastTargetUrl = targetUrl;
      const started = Date.now();
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      try {
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

        if (upstreamRes.status >= 502 && upstreamRes.status <= 504 && candidates.length > 1) {
          loadBalancerService.recordFailure(serviceKey, baseUrl);
          lastError = `Upstream HTTP ${upstreamRes.status}`;
          continue;
        }

        loadBalancerService.recordSuccess(serviceKey, baseUrl, Date.now() - started);
        res.setHeader('X-DFN-Upstream-Node', baseUrl);

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
        return;
      } catch (error) {
        clearTimeout(timeoutHandle);
        loadBalancerService.recordFailure(serviceKey, baseUrl);
        lastError = error instanceof Error ? error.message : 'Upstream connection failed';
      }
    }

    res.status(502).json({
      error: 'Upstream service unavailable',
      upstream: upstreamName,
      targetUrl: lastTargetUrl,
      attemptedNodes: candidates.length,
      detail: lastError,
    });
  };
}

const router = Router();

// Browser OAuth entry points redirect directly to load-balanced dfn-digisec unless proxied
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

// Identity, Auth & KYC routes -> dfn-digisec pool
router.use('/auth', createLoadBalancedProxy('digisec', 'dfn-digisec', '/api/auth'));
router.use('/profiles', createLoadBalancedProxy('digisec', 'dfn-digisec', '/api/profiles'));
router.use('/verification', createLoadBalancedProxy('digisec', 'dfn-digisec', '/api/verification'));
router.use(
  '/email-verification',
  createLoadBalancedProxy('digisec', 'dfn-digisec', '/api/email-verification')
);

// Escrow, Billing & Invoicing routes -> dfn-finworld pool (Flutterwave default)
router.use('/rfq/escrow', createLoadBalancedProxy('finworld', 'dfn-finworld', '/api/v1/escrow'));
router.use('/v1/escrow', createLoadBalancedProxy('finworld', 'dfn-finworld', '/api/v1/escrow'));
router.use('/v1/billing', createLoadBalancedProxy('finworld', 'dfn-finworld', '/api/v1/billing'));
router.use('/v1/invoices', createLoadBalancedProxy('finworld', 'dfn-finworld', '/api/v1/invoices'));
router.use('/v1/quotas', createLoadBalancedProxy('finworld', 'dfn-finworld', '/v1/quotas'));

// Discovery product routes -> dfn-discovery pool
router.use('/discovery', createLoadBalancedProxy('discovery', 'dfn-discovery', ''));
router.use('/v1/jobs', createLoadBalancedProxy('discovery', 'dfn-discovery', '/api/v1/jobs'));
router.use('/v1/projects', createLoadBalancedProxy('discovery', 'dfn-discovery', '/api/v1/projects'));
router.use('/v1/quotes', createLoadBalancedProxy('discovery', 'dfn-discovery', '/api/v1/quotes'));

// CAD Engine routes -> dfn-prism pool
router.use('/prism', createLoadBalancedProxy('prism', 'dfn-prism', ''));

export default router;
