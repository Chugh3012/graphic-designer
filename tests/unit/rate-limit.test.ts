import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rateLimit } from '../../src/lib/rate-limit'

test('allows up to the limit then blocks', () => {
  const key = 'k1'
  for (let i = 0; i < 3; i++) {
    assert.equal(rateLimit(key, 3, 60_000).allowed, true, `call ${i + 1} should be allowed`)
  }
  const blocked = rateLimit(key, 3, 60_000)
  assert.equal(blocked.allowed, false, '4th call should be blocked')
  assert.ok(blocked.retryAfter > 0, 'blocked response reports retryAfter seconds')
})

test('resets after the window elapses', async () => {
  const key = 'k2'
  assert.equal(rateLimit(key, 1, 20).allowed, true)
  assert.equal(rateLimit(key, 1, 20).allowed, false)
  await new Promise((r) => setTimeout(r, 30))
  assert.equal(rateLimit(key, 1, 20).allowed, true, 'window reset re-allows')
})

test('separate keys have independent buckets', () => {
  assert.equal(rateLimit('a', 1, 60_000).allowed, true)
  assert.equal(rateLimit('b', 1, 60_000).allowed, true)
})
