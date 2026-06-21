import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/**
 * Liveness/readiness probe. Returns 200 when the app can reach the database,
 * 503 otherwise. Used by container orchestration health checks and the
 * deployment smoke test.
 */
export async function GET() {
  try {
    const payload = await getPayloadClient()
    // Cheapest possible DB round-trip to confirm connectivity.
    await payload.find({ collection: 'projects', limit: 1, depth: 0 })
    return Response.json({ status: 'ok' }, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    return Response.json({ status: 'error' }, { status: 503 })
  }
}
