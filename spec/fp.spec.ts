import assert from 'node:assert/strict'
import test from 'node:test'

import { __, compose, curry, pipe, tryCatch } from '../src/index.ts'

test('pipe', async (t) => {
    await t.test('applies pipe', () => {
        assert.deepEqual(
            pipe([1.5, 5.6, 6.1], (v) => v.map(Math.round)),
            [2, 6, 6],
        )
    })
    await t.test('supports up to 7 functions', () => {
        assert.deepEqual(
            pipe(
                [1.5, 5.6, 6.1],
                (v) => v.map(Math.round),
                (v) => v,
                (v) => v,
                (v) => v,
                (v) => v,
                (v) => v,
                (v) => v,
            ).map((v) => v.toFixed()),
            ['2', '6', '6'],
        )
    })
})

test('compose', async (t) => {
    await t.test('applies pipe', () => {
        const func = compose(
            (value) => ({ value }),
            (value: string) => parseInt(value, 10),
        )
        assert.deepEqual(func('1'), { value: 1 })
    })
})

test('curry', async (t) => {
    await t.test('accepts one argument at the time', () => {
        const myFunc = (a: number, b: string, c: boolean) => a + b + c
        assert.equal(curry(myFunc)(5)('5')(true), '55true')
    })
    await t.test('accepts multiple arguments', () => {
        const myFunc = (a: number, b: string, c: boolean) => a + b + c
        assert.equal(curry(myFunc)(5, '5')(true), '55true')
    })
    await t.test('accepts all arguments', () => {
        const myFunc = (a: number, b: string, c: boolean) => a + b + c
        assert.equal(curry(myFunc)(5, '5', true), '55true')
    })
    await t.test('supports placeholder', () => {
        const myFunc = (a: number, b: string, c: boolean) => a + b + c
        assert.equal(curry(myFunc)(__, '5', __)(5, true), '55true')
        assert.equal(curry(myFunc)(__, '5', __)(5)(true), '55true')
    })
})

test('tryCatch', async (t) => {
    await t.test('returns value and error union', () => {
        const value = tryCatch(() => 'abc')
        assert.equal(value, 'abc')
    })
    await t.test('catches error', () => {
        const value = tryCatch(() => {
            const shouldThrow = true
            if (shouldThrow) throw new Error('abc')
            return 'abc'
        })
        assert.ok(value instanceof Error)
    })
    await t.test('supports promise', async () => {
        const value = tryCatch(async () => {
            const shouldThrow = true
            if (shouldThrow) throw new Error('abc')
            return 'abc'
        })
        assert.ok((await value) instanceof Error)
    })
    await t.test('supports default value', () => {
        const value = tryCatch(() => {
            const shouldThrow = true
            if (shouldThrow) throw new Error('abc')
            return 'abc'
        }, 'bc')
        assert.equal(value.toLocaleLowerCase(), 'bc')
    })
    await t.test('supports promise with default value', async () => {
        const value = tryCatch(async () => {
            const shouldThrow = true
            if (shouldThrow) throw new Error('abc')
            return 'abc'
        }, 'bc')
        assert.equal(await value, 'bc')
    })
})
