// ponytail: in-memory, per-instance fixed-window rate limiter.
// Ceiling: state lives in this process and resets on restart; with multiple
// replicas each instance keeps its own counters, so the effective global limit
// is limit × replicas. That is fine for a portfolio contact form. Upgrade path:
// back the Map with a shared store (e.g. Redis) for a strict distributed limit.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/**
 * Fixed-window rate limit. Returns whether the call is allowed and, when not,
 * how many seconds until the window resets.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfter: number } {
  const now = Date.now()

  // Opportunistically prune expired buckets to keep memory bounded.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (now > b.resetAt) buckets.delete(k)
    }
  }

  const bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { allowed: true, retryAfter: 0 }
}
