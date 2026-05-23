import assert from 'node:assert/strict'
import test from 'node:test'

import { __, compose, curry, pipe, tryCatch } from '../src/index.ts'
import { assertType } from './_types.ts'

test('pipe', async (t) => {
    await t.test('types', () => {
        // Each step's input type is inferred from the previous step's output
        assertType<number>()(
            pipe(
                [1, 2, 3],
                (arr) => arr.map((v) => v * 2),
                (arr) => arr.length,
            ),
        )
        assertType<string>()(
            pipe(
                5,
                (n) => n + 1,
                (n) => n.toString(),
            ),
        )
        // Negative: a step that expects `string` when the previous step
        // returned `number` fails overload resolution.
        // @ts-expect-error — incompatible step input type
        pipe(
            5,
            (n) => n + 1,
            (s: string) => s.length,
        )
    })

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
    await t.test('types', () => {
        // Right-to-left composition: first arg processes last
        const f = compose(
            (n: number) => n.toString(),
            (s: string) => parseInt(s, 10),
        )
        assertType<(input: string) => string>()(f)
        assertType<string>()(f('1'))
    })

    await t.test('applies pipe', () => {
        const func = compose(
            (value) => ({ value }),
            (value: string) => parseInt(value, 10),
        )
        assert.deepEqual(func('1'), { value: 1 })
    })
    await t.test('composes right-to-left with multiple functions', () => {
        const f = compose(
            (n: number) => n + 1,
            (n: number) => n * 2,
            (n: number) => n - 3,
        )
        assert.equal(f(10), (10 - 3) * 2 + 1)
    })
})

test('curry', async (t) => {
    await t.test('types', () => {
        const fn3 = (a: number, b: string, c: boolean) => `${a}${b}${c}`
        const curried = curry(fn3)
        // All args at once
        assertType<string>()(curried(1, 'x', true))
        // One arg at a time
        assertType<string>()(curried(1)('x')(true))
        // Mixed
        assertType<string>()(curried(1, 'x')(true))
        // Placeholder fills the gap
        assertType<string>()(curried(__, 'x', true)(1))
    })

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
    await t.test('types', () => {
        // Sync callback → T | Error
        assertType<number | Error>()(tryCatch(() => 5))
        // Async callback → Promise<T | Error>
        assertType<Promise<number | Error>>()(tryCatch(async () => 5))
        // With default value (widened) → T | T2
        const defaultValue: string = 'fallback'
        assertType<number | string>()(tryCatch(() => 5, defaultValue))
        // UX QUIRK: literal default values preserve their literal type,
        // making the return more specific than usually desired.
        assertType<number | 'fallback'>()(tryCatch(() => 5, 'fallback'))
        // Async + default → Promise<T | T2>
        assertType<Promise<number | string>>()(
            tryCatch(async () => 5, defaultValue),
        )
        // Negative: sync `tryCatch` is NOT a Promise
        // @ts-expect-error — sync result is not a Promise
        assertType<Promise<number | Error>>()(tryCatch(() => 5))
        // Negative: without a default value, Error is part of the result
        // @ts-expect-error — `| Error` is required
        assertType<number>()(tryCatch(() => 5))
    })

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
    await t.test('catches rejected Promise (not thrown)', async () => {
        const value = tryCatch(() => Promise.reject(new Error('rejected')))
        assert.ok((await value) instanceof Error)
    })
    await t.test('default value can differ in type', () => {
        const value = tryCatch(() => {
            throw new Error('x')
        }, null as null)
        assert.equal(value, null)
    })
    await t.test('wraps non-Error throw values', () => {
        const value = tryCatch(() => {
            throw 'not-an-error'
        })
        assert.ok(value instanceof Error)
        assert.equal((value as Error).message, 'not-an-error')
    })
    await t.test('returns Promise-of-result for async callback', async () => {
        const result = tryCatch(async () => 42)
        assert.ok(result instanceof Promise)
        assert.equal(await result, 42)
    })
})
