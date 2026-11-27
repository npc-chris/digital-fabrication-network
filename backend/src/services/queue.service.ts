import crypto from 'crypto';
import { eq, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { queueJobs } from '../models/schema';
import { getOptionalRedisClient } from '../config/redis';
import { loadBalancerService, ProductServiceKey } from './load-balancer.service';
import { canUseMemoryFallback } from '../utils/persistence';

export type QueueJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'dead_letter';

export interface EnqueueJobInput {
  queueName?: string;
  jobType: string;
  targetService: ProductServiceKey;
  orgId?: string;
  payload: Record<string, unknown>;
  maxAttempts?: number;
}

export interface QueueJobRecord {
  jobId: string;
  queueName: string;
  jobType: string;
  targetService: ProductServiceKey;
  orgId?: string;
  payload: Record<string, unknown>;
  status: QueueJobStatus;
  attempts: number;
  maxAttempts: number;
  dispatchedToUrl?: string;
  result?: unknown;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export type QueueDispatcher = (
  targetUrl: string,
  job: QueueJobRecord
) => Promise<{ ok: boolean; data?: unknown; error?: string }>;

const defaultDispatcher: QueueDispatcher = async (targetUrl, job) => {
  const endpoint = `${targetUrl}/api/v1/queue/dispatch`;
  const started = Date.now();
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dfn-gateway': 'digital-fabrication-network',
        ...(process.env.DFN_INTERNAL_SERVICE_KEY
          ? { 'x-dfn-service-key': process.env.DFN_INTERNAL_SERVICE_KEY }
          : {}),
      },
      body: JSON.stringify({
        jobId: job.jobId,
        queueName: job.queueName,
        jobType: job.jobType,
        orgId: job.orgId,
        payload: job.payload,
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `Upstream HTTP ${res.status}` };
    }
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();
    loadBalancerService.recordSuccess(job.targetService, targetUrl, Date.now() - started);
    return { ok: true, data };
  } catch (error) {
    loadBalancerService.recordFailure(job.targetService, targetUrl);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Queue dispatch failed',
    };
  }
};

export class ProductQueueService {
  private memoryJobs = new Map<string, QueueJobRecord>();
  private memoryLists = new Map<ProductServiceKey, string[]>();
  private dispatcher: QueueDispatcher = defaultDispatcher;

  public setDispatcher(custom: QueueDispatcher): void {
    this.dispatcher = custom;
  }

  public resetForTests(): void {
    this.memoryJobs.clear();
    this.memoryLists.clear();
    this.dispatcher = defaultDispatcher;
  }

  public async enqueueJob(input: EnqueueJobInput): Promise<QueueJobRecord> {
    if (!input.jobType || !input.targetService) {
      throw new Error('jobType and targetService are required');
    }

    const now = new Date().toISOString();
    const jobId = `DFN-Q-${input.targetService.toUpperCase()}-${Date.now()}-${crypto
      .randomBytes(3)
      .toString('hex')}`;
    const queueName = input.queueName || `dfn.${input.targetService}.default`;
    const maxAttempts = Math.max(1, Number(input.maxAttempts || 3));

    const record: QueueJobRecord = {
      jobId,
      queueName,
      jobType: input.jobType,
      targetService: input.targetService,
      orgId: input.orgId,
      payload: input.payload || {},
      status: 'queued',
      attempts: 0,
      maxAttempts,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.insert(queueJobs).values({
        jobId: record.jobId,
        queueName: record.queueName,
        jobType: record.jobType,
        targetService: record.targetService,
        orgId: record.orgId ?? null,
        payload: JSON.stringify(record.payload),
        status: 'queued',
        attempts: 0,
        maxAttempts: record.maxAttempts,
      });
    } catch (error) {
      if (!canUseMemoryFallback(error)) {
        throw error;
      }
    }

    this.memoryJobs.set(record.jobId, record);
    const pendingList = this.memoryLists.get(input.targetService) || [];
    pendingList.push(record.jobId);
    this.memoryLists.set(input.targetService, pendingList);

    const redis = getOptionalRedisClient();
    if (redis && redis.isOpen) {
      await redis.rPush(`dfn:queue:${input.targetService}`, JSON.stringify(record));
    }

    return record;
  }

  public async getJob(jobId: string): Promise<QueueJobRecord | null> {
    const cached = this.memoryJobs.get(jobId);
    if (cached) return cached;

    try {
      const rows = await db.select().from(queueJobs).where(eq(queueJobs.jobId, jobId)).limit(1);
      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          jobId: row.jobId,
          queueName: row.queueName,
          jobType: row.jobType,
          targetService: row.targetService as ProductServiceKey,
          orgId: row.orgId ?? undefined,
          payload: JSON.parse(row.payload),
          status: row.status as QueueJobStatus,
          attempts: row.attempts,
          maxAttempts: row.maxAttempts,
          dispatchedToUrl: row.dispatchedToUrl ?? undefined,
          result: row.resultJson ? JSON.parse(row.resultJson) : undefined,
          lastError: row.lastError ?? undefined,
          createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
        };
      }
    } catch (error) {
      if (!canUseMemoryFallback(error)) throw error;
    }

    return null;
  }

  public async processNext(targetService: ProductServiceKey): Promise<QueueJobRecord | null> {
    let job: QueueJobRecord | null = null;

    const redis = getOptionalRedisClient();
    if (redis && redis.isOpen) {
      const raw = await redis.lPop(`dfn:queue:${targetService}`);
      if (raw) {
        job = JSON.parse(raw) as QueueJobRecord;
      }
    }

    if (!job) {
      const list = this.memoryLists.get(targetService) || [];
      const nextId = list.shift();
      this.memoryLists.set(targetService, list);
      if (nextId) {
        job = this.memoryJobs.get(nextId) || null;
      }
    }

    if (!job) return null;

    job.status = 'processing';
    job.attempts += 1;
    job.updatedAt = new Date().toISOString();

    const targetUrl = loadBalancerService.selectUpstream(targetService);
    job.dispatchedToUrl = targetUrl;

    const outcome = await this.dispatcher(targetUrl, job);
    if (outcome.ok) {
      job.status = 'completed';
      job.result = outcome.data;
      job.lastError = undefined;
    } else {
      job.lastError = outcome.error || 'Dispatch error';
      if (job.attempts < job.maxAttempts) {
        job.status = 'queued';
        const list = this.memoryLists.get(targetService) || [];
        list.push(job.jobId);
        this.memoryLists.set(targetService, list);
        if (redis && redis.isOpen) {
          await redis.rPush(`dfn:queue:${targetService}`, JSON.stringify(job));
        }
      } else {
        job.status = 'dead_letter';
      }
    }

    job.updatedAt = new Date().toISOString();
    this.memoryJobs.set(job.jobId, job);

    try {
      await db
        .update(queueJobs)
        .set({
          status: job.status,
          attempts: job.attempts,
          dispatchedToUrl: job.dispatchedToUrl ?? null,
          resultJson: job.result !== undefined ? JSON.stringify(job.result) : null,
          lastError: job.lastError ?? null,
          updatedAt: new Date(),
        })
        .where(eq(queueJobs.jobId, job.jobId));
    } catch (error) {
      if (!canUseMemoryFallback(error)) throw error;
    }

    return job;
  }

  public async listRecentJobs(limit = 25): Promise<QueueJobRecord[]> {
    try {
      const rows = await db.select().from(queueJobs).orderBy(desc(queueJobs.createdAt)).limit(limit);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((row) => ({
          jobId: row.jobId,
          queueName: row.queueName,
          jobType: row.jobType,
          targetService: row.targetService as ProductServiceKey,
          orgId: row.orgId ?? undefined,
          payload: JSON.parse(row.payload),
          status: row.status as QueueJobStatus,
          attempts: row.attempts,
          maxAttempts: row.maxAttempts,
          dispatchedToUrl: row.dispatchedToUrl ?? undefined,
          result: row.resultJson ? JSON.parse(row.resultJson) : undefined,
          lastError: row.lastError ?? undefined,
          createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (error) {
      if (!canUseMemoryFallback(error)) throw error;
    }

    return Array.from(this.memoryJobs.values()).slice(-limit).reverse();
  }

  public getStats() {
    const counts: Record<QueueJobStatus, number> = {
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      dead_letter: 0,
    };

    for (const job of this.memoryJobs.values()) {
      counts[job.status] = (counts[job.status] || 0) + 1;
    }

    const redis = getOptionalRedisClient();
    return {
      backend: redis && redis.isOpen ? 'redis+shareddb' : 'shareddb+memory',
      totalTracked: this.memoryJobs.size,
      counts,
    };
  }
}

export const productQueueService = new ProductQueueService();
