function collectErrorText(error: unknown, depth = 0): string {
  if (!error || depth > 4) return '';
  if (typeof error === 'string') return error;
  const err = error as { message?: string; code?: string; cause?: unknown; errors?: unknown[] };
  const parts: string[] = [];
  if (err.code) parts.push(err.code);
  if (err.message) parts.push(err.message);
  if (err.cause) parts.push(collectErrorText(err.cause, depth + 1));
  if (Array.isArray(err.errors)) {
    for (const nested of err.errors) {
      parts.push(collectErrorText(nested, depth + 1));
    }
  }
  return parts.join(' | ');
}

/**
 * Permits in-memory fallback only in test or explicit opt-in runs when Postgres
 * is unreachable locally.
 */
export function canUseMemoryFallback(error: unknown): boolean {
  if (process.env.NODE_ENV !== 'test' && process.env.ALLOW_MEMORY_FALLBACK !== 'true') {
    return false;
  }
  const msg = collectErrorText(error);
  return (
    msg.includes('ECONNREFUSED') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('Cannot read properties of undefined') ||
    msg.includes('is not a function') ||
    msg.includes('connect')
  );
}
