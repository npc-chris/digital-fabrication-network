import crypto from 'crypto';
import jwt, { JwtHeader, JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface DfnJwtPayload extends BaseJwtPayload {
  id?: number;
  userId?: number;
  email?: string;
  role?: string;
  'https://fabnetwork.com.ng/user_id'?: number;
  'https://fabnetwork.com.ng/role'?: string;
  'https://fabnetwork.com.ng/org_id'?: string;
  'https://fabnetwork.com.ng/orgId'?: string;
  'https://fabnetwork.com.ng/orgRole'?: string;
  'https://fabnetwork.com.ng/plan'?: string;
  'https://fabnetwork.com.ng/features'?: string[];
}

interface JwkRecord {
  kty: string;
  kid?: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
  [key: string]: unknown;
}

interface CachedJwks {
  keys: JwkRecord[];
  fetchedAt: number;
}

const JWKS_CACHE_TTL_MS = 5 * 60 * 1000;
let jwksCache: CachedJwks | null = null;

export function resetJwksCacheForTests(): void {
  jwksCache = null;
}

export function resolveJwksUrl(): string {
  if (process.env.DIGISEC_JWKS_URL) {
    return process.env.DIGISEC_JWKS_URL;
  }
  const baseUrl = (process.env.DIGISEC_API_URL || 'http://localhost:4100').replace(/\/$/, '');
  return `${baseUrl}/.well-known/jwks.json`;
}

async function fetchJwks(forceRefresh = false): Promise<JwkRecord[]> {
  const now = Date.now();
  if (!forceRefresh && jwksCache && now - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS) {
    return jwksCache.keys;
  }

  const response = await fetch(resolveJwksUrl(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`JWKS fetch failed with status ${response.status}`);
  }

  const body = (await response.json()) as { keys?: JwkRecord[] };
  const keys = Array.isArray(body.keys) ? body.keys : [];
  jwksCache = { keys, fetchedAt: now };
  return keys;
}

async function resolvePublicKey(kid?: string): Promise<crypto.KeyObject> {
  let keys = await fetchJwks(false);
  let matched = kid ? keys.find((key) => key.kid === kid) : keys[0];

  if (!matched) {
    keys = await fetchJwks(true);
    matched = kid ? keys.find((key) => key.kid === kid) : keys[0];
  }

  if (!matched) {
    throw new Error(`No matching JWK found for kid=${kid || 'default'}`);
  }

  return crypto.createPublicKey({
    key: matched as unknown as crypto.JsonWebKeyInput['key'],
    format: 'jwk',
  });
}

function parseNumericUserId(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    const cleaned = raw.startsWith('digisec|') ? raw.slice(8) : raw;
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function normalizeUserClaims(decoded: DfnJwtPayload): Express.User {
  const namespacedUserId = decoded['https://fabnetwork.com.ng/user_id'];
  const rawId = namespacedUserId ?? decoded.userId ?? decoded.id ?? decoded.sub ?? 0;

  return {
    id: parseNumericUserId(rawId),
    email: String(decoded.email || ''),
    role: String(decoded['https://fabnetwork.com.ng/role'] || decoded.role || 'explorer'),
    orgId:
      decoded['https://fabnetwork.com.ng/orgId'] ||
      decoded['https://fabnetwork.com.ng/org_id'] ||
      undefined,
    orgRole: decoded['https://fabnetwork.com.ng/orgRole'] || undefined,
    plan: decoded['https://fabnetwork.com.ng/plan'] || undefined,
  };
}

function resolveAllowedIssuers(): [string, ...string[]] | undefined {
  const raw = process.env.DIGISEC_ISSUER;
  if (!raw) return undefined;
  const trimmed = raw.replace(/\/+$/, '');
  return [trimmed, `${trimmed}/`];
}

/**
 * Verifies bearer tokens against dfn-digisec RS256 JWKS by default, with HS256
 * JWT_SECRET support retained for transition and local test tokens.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedComplete = jwt.decode(token, { complete: true });
    if (!decodedComplete || typeof decodedComplete === 'string') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const header = decodedComplete.header as JwtHeader;

    if (header.alg === 'RS256') {
      const publicKey = await resolvePublicKey(header.kid);
      const issuers = resolveAllowedIssuers();
      const verifyOptions: jwt.VerifyOptions = {
        algorithms: ['RS256'],
        ...(issuers ? { issuer: issuers } : {}),
      };

      const verified = jwt.verify(token, publicKey, verifyOptions) as DfnJwtPayload;
      req.user = normalizeUserClaims(verified);
      return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured for symmetric fallback');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as DfnJwtPayload;
    req.user = normalizeUserClaims(decoded);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};
