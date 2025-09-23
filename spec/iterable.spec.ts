import assert from 'node:assert/strict'
import test from 'node:test'

import { reduce } from '../src/index.ts'

async function* makeAsync(values: number[]) {
    for (const v of values) {
        await Promise.resolve()
        yield v
    }
}

test('reduce', async (t) => {
    await t.test('reduces array with initial', () => {
        const result = reduce([1, 2, 3], (a, b) => a + b, 0)
        assert.equal(result, 6)
    })

    await t.test('reduces array without initial', () => {
        const result = reduce([1, 2, 3], (a, b) => a + b)
        assert.equal(result, 6)
    })

    await t.test('reduces set', () => {
        const result = reduce(new Set([1, 2, 3]), (a, b) => a + b, 0)
        assert.equal(result, 6)
    })

    await t.test('reduces custom iterable', () => {
        const customIterable = {
            [Symbol.iterator]: function* () {
                yield 1 as number
                yield 2 as number
                yield 3 as number
            },
        }

        const result = reduce(customIterable, (a, b) => a + b)
        assert.equal(result, 6)
    })

    await t.test('reduces async iterable (no initial)', async () => {
        const result = await reduce(makeAsync([1, 2, 3]), (a, b) => a + b)
        assert.equal(result, 6)
    })

    await t.test('reduces async iterable (with initial)', async () => {
        const result = await reduce(makeAsync([1, 2, 3]), (a, b) => a + b, 0)
        assert.equal(result, 6)
    })

    await t.test('supports async reducer (sync iterable)', async () => {
        const result = await reduce([1, 2, 3], async (a, b) => a + b, 0)
        assert.equal(result, 6)
    })

    await t.test('supports async reducer (async iterable)', async () => {
        const result = await reduce(
            makeAsync([1, 2, 3]),
            async (a, b) => a + b,
            0,
        )
        assert.equal(result, 6)
    })

    await t.test('throws on empty iterable without initial', () => {
        assert.throws(() => reduce([] as number[], (a, b) => a + b))
    })

    await t.test('returns initial on empty iterable with initial', () => {
        const result = reduce([] as number[], (a, b) => a + b, 10)
        assert.equal(result, 10)
    })

    await t.test('async reducer without initial (sync iterable)', async () => {
        const result = await reduce([1, 2, 3], async (a, b) => a + b)
        assert.equal(result, 6)
    })

    await t.test('empty async iterable without initial throws', async () => {
        async function* empty(): AsyncGenerator<number> {}

        await assert.rejects(
            () => reduce(empty(), (a, b) => a + b),
            /Reduce of empty \(async\) iterable with no initial value/,
        )
    })

    await t.test(
        'empty async iterable with initial returns initial',
        async () => {
            async function* empty() {}
            const result = await reduce(
                empty(),
                (a: number, b: number) => a + b,
                5,
            )
            assert.equal(result, 5)
        },
    )
})
