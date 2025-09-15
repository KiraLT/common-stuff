import assert from 'node:assert/strict'
import test from 'node:test'

import { cache } from '../src/index.ts'

test('cache', async (t) => {
    await t.test('caches function', () => {
        const calls: Array<[number, number]> = []
        const mockCallback = (a: number, b: number) => {
            calls.push([a, b])
            return a + b
        }
        const cachedCallback = cache(mockCallback)
        assert.equal(cachedCallback(1, 5), 6)
        assert.equal(cachedCallback(1, 5), 6)
        assert.equal(cachedCallback(1, 5), 6)
        assert.deepEqual(calls, [[1, 5]])
    })
    await t.test('supports promises', async () => {
        const calls: Array<[number, number]> = []
        const mockCallback = (a: number, b: number) => {
            calls.push([a, b])
            return Promise.resolve(a + b)
        }
        const cachedCallback = cache(mockCallback)
        assert.equal(await cachedCallback(1, 5), 6)
        assert.equal(await cachedCallback(1, 5), 6)
        assert.equal(await cachedCallback(1, 5), 6)
        assert.deepEqual(calls, [[1, 5]])
    })
})
