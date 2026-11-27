export type ProductServiceKey = 'digisec' | 'finworld' | 'discovery' | 'prism';

export interface UpstreamNodeState {
  url: string;
  healthy: boolean;
  consecutiveFailures: number;
  circuitOpenUntil: number;
  totalRequests: number;
  totalErrors: number;
  lastLatencyMs: number | null;
  lastCheckedAt: string | null;
}

export interface ServicePoolSnapshot {
  service: ProductServiceKey;
  nodes: UpstreamNodeState[];
  healthyCount: number;
  totalCount: number;
}

const DEFAULT_ENDPOINTS: Record<ProductServiceKey, string> = {
  digisec: 'http://localhost:4100',
  finworld: 'http://localhost:4200',
  discovery: 'http://localhost:4001',
  prism: 'http://localhost:8000',
};

const POOL_ENV_KEYS: Record<ProductServiceKey, { listKey: string; singleKey: string }> = {
  digisec: { listKey: 'DIGISEC_UPSTREAMS', singleKey: 'DIGISEC_API_URL' },
  finworld: { listKey: 'FINWORLD_UPSTREAMS', singleKey: 'FINWORLD_API_URL' },
  discovery: { listKey: 'DISCOVERY_UPSTREAMS', singleKey: 'DISCOVERY_API_URL' },
  prism: { listKey: 'PRISM_UPSTREAMS', singleKey: 'PRISM_API_URL' },
};

const DEFAULT_CIRCUIT_THRESHOLD = 3;
const DEFAULT_COOLDOWN_MS = 30_000;

/**
 * Health-aware round-robin load balancer and passive circuit breaker
 * across the DFN product-line services.
 */
export class LoadBalancerService {
  private pools = new Map<ProductServiceKey, UpstreamNodeState[]>();
  private signatures = new Map<ProductServiceKey, string>();
  private cursors = new Map<ProductServiceKey, number>();

  private resolveUrls(service: ProductServiceKey): string[] {
    const keys = POOL_ENV_KEYS[service];
    const rawPool = process.env[keys.listKey];
    const rawSingle = process.env[keys.singleKey];
    const source = rawPool && rawPool.trim().length > 0 ? rawPool : rawSingle || DEFAULT_ENDPOINTS[service];

    const parsed = source
      .split(',')
      .map((entry) => entry.trim().replace(/\/+$/, ''))
      .filter(Boolean);

    return Array.from(new Set(parsed.length > 0 ? parsed : [DEFAULT_ENDPOINTS[service]]));
  }

  private ensurePool(service: ProductServiceKey): UpstreamNodeState[] {
    const urls = this.resolveUrls(service);
    const sig = urls.join('|');
    const prevSig = this.signatures.get(service);

    if (!this.pools.has(service) || prevSig !== sig) {
      const existingByUrl = new Map<string, UpstreamNodeState>();
      for (const node of this.pools.get(service) || []) {
        existingByUrl.set(node.url, node);
      }

      const nextNodes = urls.map((url) => {
        const preserved = existingByUrl.get(url);
        return (
          preserved || {
            url,
            healthy: true,
            consecutiveFailures: 0,
            circuitOpenUntil: 0,
            totalRequests: 0,
            totalErrors: 0,
            lastLatencyMs: null,
            lastCheckedAt: null,
          }
        );
      });

      this.pools.set(service, nextNodes);
      this.signatures.set(service, sig);
      if (!this.cursors.has(service)) {
        this.cursors.set(service, 0);
      }
    }

    return this.pools.get(service)!;
  }

  public getCandidateOrder(service: ProductServiceKey): string[] {
    const nodes = this.ensurePool(service);
    const now = Date.now();
    const activeNodes = nodes.filter((node) => node.circuitOpenUntil <= now);
    const poolToUse = activeNodes.length > 0 ? activeNodes : nodes;

    const currentCursor = this.cursors.get(service) || 0;
    const startIdx = currentCursor % poolToUse.length;
    this.cursors.set(service, (currentCursor + 1) % poolToUse.length);

    const ordered: string[] = [];
    for (let i = 0; i < poolToUse.length; i++) {
      ordered.push(poolToUse[(startIdx + i) % poolToUse.length].url);
    }
    return ordered;
  }

  public selectUpstream(service: ProductServiceKey): string {
    return this.getCandidateOrder(service)[0];
  }

  public recordSuccess(service: ProductServiceKey, url: string, latencyMs: number): void {
    const nodes = this.ensurePool(service);
    const normalized = url.replace(/\/+$/, '');
    const node = nodes.find((n) => n.url === normalized);
    if (!node) return;

    node.healthy = true;
    node.consecutiveFailures = 0;
    node.circuitOpenUntil = 0;
    node.totalRequests += 1;
    node.lastLatencyMs = Math.max(0, Math.round(latencyMs));
    node.lastCheckedAt = new Date().toISOString();
  }

  public recordFailure(service: ProductServiceKey, url: string): void {
    const nodes = this.ensurePool(service);
    const normalized = url.replace(/\/+$/, '');
    const node = nodes.find((n) => n.url === normalized);
    if (!node) return;

    const threshold = Number(process.env.CIRCUIT_BREAKER_THRESHOLD || DEFAULT_CIRCUIT_THRESHOLD);
    const cooldownMs = Number(process.env.CIRCUIT_BREAKER_COOLDOWN_MS || DEFAULT_COOLDOWN_MS);

    node.totalRequests += 1;
    node.totalErrors += 1;
    node.consecutiveFailures += 1;
    node.lastCheckedAt = new Date().toISOString();

    if (node.consecutiveFailures >= threshold) {
      node.healthy = false;
      node.circuitOpenUntil = Date.now() + cooldownMs;
    }
  }

  public async probeService(service: ProductServiceKey): Promise<ServicePoolSnapshot> {
    const nodes = this.ensurePool(service);
    const probeTimeout = Number(process.env.GATEWAY_PROBE_TIMEOUT_MS || 2500);

    await Promise.all(
      nodes.map(async (node) => {
        const started = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), probeTimeout);
        try {
          const res = await fetch(`${node.url}/health`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          }).finally(() => clearTimeout(timer));

          const latency = Date.now() - started;
          if (res.ok) {
            node.healthy = true;
            node.consecutiveFailures = 0;
            node.circuitOpenUntil = 0;
            node.lastLatencyMs = latency;
          } else {
            node.healthy = false;
            node.lastLatencyMs = latency;
          }
          node.lastCheckedAt = new Date().toISOString();
        } catch {
          node.healthy = false;
          node.lastLatencyMs = null;
          node.lastCheckedAt = new Date().toISOString();
        }
      })
    );

    return this.getPoolSnapshot(service);
  }

  public getPoolSnapshot(service: ProductServiceKey): ServicePoolSnapshot {
    const nodes = this.ensurePool(service);
    const now = Date.now();
    const cloned = nodes.map((n) => ({
      ...n,
      healthy: n.healthy && n.circuitOpenUntil <= now,
    }));
    return {
      service,
      nodes: cloned,
      healthyCount: cloned.filter((n) => n.healthy).length,
      totalCount: cloned.length,
    };
  }

  public getAllSnapshots(): Record<ProductServiceKey, ServicePoolSnapshot> {
    return {
      digisec: this.getPoolSnapshot('digisec'),
      finworld: this.getPoolSnapshot('finworld'),
      discovery: this.getPoolSnapshot('discovery'),
      prism: this.getPoolSnapshot('prism'),
    };
  }

  public resetForTests(): void {
    this.pools.clear();
    this.signatures.clear();
    this.cursors.clear();
  }
}

export const loadBalancerService = new LoadBalancerService();
