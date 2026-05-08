import assert from 'node:assert/strict'
import test from 'node:test'

import { cache, delay } from '../src/index.ts'

test('cache', async (t) => {
    await t.test('caches same arguments', () => {
        const calls: Array<[number, number]> = []
        const cached = cache((a: number, b: number) => {
            calls.push([a, b])
            return a + b
        })
        assert.equal(cached(1, 5), 6)
        assert.equal(cached(1, 5), 6)
        assert.equal(cached(1, 5), 6)
        assert.deepEqual(calls, [[1, 5]])
    })

    await t.test('different arguments produce separate entries', () => {
        const calls: Array<[number, number]> = []
        const cached = cache((a: number, b: number) => {
            calls.push([a, b])
            return a + b
        })
        cached(1, 2)
        cached(3, 4)
        cached(1, 2)
        cached(3, 4)
        assert.deepEqual(calls, [
            [1, 2],
            [3, 4],
        ])
    })

    await t.test('caches promises (single inflight per key)', async () => {
        const calls: Array<[number]> = []
        const cached = cache(async (a: number) => {
            calls.push([a])
            await delay(5)
            return a * 2
        })
        const [a, b, c] = await Promise.all([cached(7), cached(7), cached(7)])
        assert.equal(a, 14)
        assert.equal(b, 14)
        assert.equal(c, 14)
        // Synchronous parallel calls share one inflight; later call hits cache
        await cached(7)
        assert.deepEqual(calls, [[7]])
    })

    await t.test('does not cache rejected promises', async () => {
        let attempt = 0
        const cached = cache(async (id: string) => {
            attempt++
            if (attempt === 1) throw new Error('boom')
            return `${id}:ok`
        })
        await assert.rejects(() => cached('x'), /boom/)
        assert.equal(await cached('x'), 'x:ok')
        assert.equal(attempt, 2)
    })

    await t.test('clear() drops every entry', () => {
        let calls = 0
        const cached = cache((n: number) => {
            calls++
            return n * 2
        })
        cached(1)
        cached(2)
        assert.equal(calls, 2)
        cached.clear()
        cached(1)
        cached(2)
        assert.equal(calls, 4)
    })

    await t.test('delete() drops one entry only', () => {
        let calls = 0
        const cached = cache((n: number) => {
            calls++
            return n
        })
        cached(1)
        cached(2)
        assert.equal(calls, 2)
        cached.delete(1)
        cached(1) // recomputed
        cached(2) // still cached
        assert.equal(calls, 3)
    })

    await t.test('maxSize evicts least-recently-used', () => {
        let calls = 0
        const cached = cache(
            (n: number) => {
                calls++
                return n
            },
            { maxSize: 2 },
        )
        cached(1) // miss → [1]
        cached(2) // miss → [1, 2]
        cached(3) // miss, evict 1 → [2, 3]
        assert.equal(calls, 3)
        cached(2) // hit
        cached(3) // hit
        assert.equal(calls, 3)
        cached(1) // miss, recomputed
        assert.equal(calls, 4)
    })

    await t.test('maxSize touches LRU on hit', () => {
        let calls = 0
        const cached = cache(
            (n: number) => {
                calls++
                return n
            },
            { maxSize: 2 },
        )
        cached(1) // [1]
        cached(2) // [1, 2]
        cached(1) // hit; promotes 1 to MRU → [2, 1]
        cached(3) // miss; should evict 2, not 1 → [1, 3]
        assert.equal(calls, 3)
        cached(1) // still cached
        cached(3) // still cached
        assert.equal(calls, 3)
        cached(2) // recomputed
        assert.equal(calls, 4)
    })

    await t.test('ttl expires entries', async () => {
        let calls = 0
        const cached = cache(
            (n: number) => {
                calls++
                return n
            },
            { ttl: 30 },
        )
        cached(1)
        cached(1)
        assert.equal(calls, 1)
        await delay(50)
        cached(1) // expired, recomputed
        assert.equal(calls, 2)
    })

    await t.test('ttl + maxSize work together', async () => {
        let calls = 0
        const cached = cache(
            (n: number) => {
                calls++
                return n
            },
            { ttl: 30, maxSize: 5 },
        )
        cached(1)
        cached(2)
        cached(1)
        assert.equal(calls, 2)
        await delay(50)
        cached(1)
        assert.equal(calls, 3)
    })

    await t.test('handles zero-arg functions', () => {
        let calls = 0
        const cached = cache(() => {
            calls++
            return 42
        })
        assert.equal(cached(), 42)
        assert.equal(cached(), 42)
        assert.equal(calls, 1)
    })

    await t.test('preserves `this` context', () => {
        const obj = {
            multiplier: 3,
            mul(this: { multiplier: number }, n: number) {
                return n * this.multiplier
            },
        }
        const cached = cache(obj.mul)
        assert.equal(cached.call(obj, 4), 12)
        assert.equal(cached.call(obj, 4), 12)
    })
})
