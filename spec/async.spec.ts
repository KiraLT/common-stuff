import assert from 'node:assert/strict'
import test from 'node:test'

import {
    TimeoutError,
    debounce,
    delay,
    pLimit,
    pSeries,
    retry,
    throttle,
    timeout,
} from '../src/index.ts'
import { assertType } from './_types.ts'

type MockFn<Args extends unknown[] = unknown[], R = void> = ((
    ...args: Args
) => R) & {
    mock: { calls: Args[] }
}

function createMock<Args extends unknown[] = unknown[], R = void>(): MockFn<
    Args,
    R
> {
    const fn = ((...args: Args) => {
        fn.mock.calls.push(args)
    }) as MockFn<Args, R>
    fn.mock = { calls: [] as Args[] }
    return fn
}

test('delay', async (t) => {
    await t.test('types', () => {
        assertType<Promise<void>>()(delay(100))
    })

    await t.test('delay action', async () => {
        const start = Date.now()
        await delay(250)
        assert.ok(Math.abs(Date.now() - start - 250) < 10)
    })
})

test('debounce', async (t) => {
    await t.test('types', () => {
        // Returned function shares parameter list with input function
        const cb = debounce((_a: number, _b: string) => {}, 100)
        assertType<[number, string]>()(
            null as unknown as Parameters<typeof cb>,
        )
        // .cancel() is exposed on the returned function
        assertType<() => void>()(cb.cancel)
    })

    await t.test('debounce action', async () => {
        const mock = createMock<[number]>()
        const cb = debounce(mock, 100)

        cb(1)
        await delay(90)
        assert.equal(mock.mock.calls.length, 0)

        cb(2)

        assert.equal(mock.mock.calls.length, 0)

        await delay(90)

        assert.equal(mock.mock.calls.length, 0)

        await delay(10)

        assert.equal(mock.mock.calls.length, 1)
    })

    await t.test('supports arguments', async () => {
        const mock = createMock<[number]>()
        const cb = debounce(mock, 100)

        cb(1)
        cb(2)
        cb(3)

        await delay(110)
        assert.equal(mock.mock.calls.length, 1)
        assert.equal(mock.mock.calls[0]?.[0], 3)
    })

    await t.test('supports async function', async () => {
        const mock = createMock<[string]>()
        const cb = debounce(async (value: string) => {
            await delay(50)
            mock(value)
        }, 50)

        cb('nope')
        await delay(1)
        cb('nope 2')
        await delay(1)
        cb('it works')

        await delay(110)

        assert.equal(mock.mock.calls.length, 1)
        assert.equal(mock.mock.calls[0]?.[0], 'it works')
    })

    await t.test('cancel() drops pending invocation', async () => {
        const mock = createMock<[number]>()
        const cb = debounce(mock, 50)

        cb(1)
        cb.cancel()
        await delay(60)
        assert.equal(mock.mock.calls.length, 0)
    })

    await t.test('cancel() before any call is a no-op', () => {
        const mock = createMock<[number]>()
        const cb = debounce(mock, 50)
        assert.doesNotThrow(() => cb.cancel())
    })

    await t.test('preserves `this` context', async () => {
        const ctx = { value: 42 }
        let captured: unknown
        const cb = debounce(function (this: typeof ctx) {
            captured = this.value
        }, 10)
        cb.call(ctx)
        await delay(20)
        assert.equal(captured, 42)
    })
})

test('throttle', async (t) => {
    await t.test('types', () => {
        const cb = throttle((_a: number) => {}, 100)
        assertType<[number]>()(
            null as unknown as Parameters<typeof cb>,
        )
        assertType<() => void>()(cb.cancel)
    })

    await t.test('should throttle function invocation', async () => {
        const mock = createMock<[number]>()
        const cb = throttle(mock, 100)

        cb(1)
        assert.equal(mock.mock.calls.length, 1)

        await delay(90)

        cb(2)
        assert.equal(mock.mock.calls.length, 1)

        await delay(10)

        assert.equal(mock.mock.calls.length, 2)
    })

    await t.test('without leading', async () => {
        const mock = createMock<[number]>()
        const cb = throttle(mock, 100, { leading: false })

        cb(1)
        assert.equal(mock.mock.calls.length, 0)

        await delay(90)

        cb(2)
        assert.equal(mock.mock.calls.length, 0)

        await delay(10)

        assert.equal(mock.mock.calls.length, 1)
    })

    await t.test('without trailing', async () => {
        const mock = createMock<[number]>()
        const cb = throttle(mock, 100, { trailing: false })

        assert.equal(mock.mock.calls.length, 0)

        cb(1)
        assert.equal(mock.mock.calls.length, 1)

        await delay(50)

        cb(2)
        assert.equal(mock.mock.calls.length, 1)

        await delay(50)

        assert.equal(mock.mock.calls.length, 1)

        cb(3)

        assert.equal(mock.mock.calls.length, 2)

        await delay(100)

        assert.equal(mock.mock.calls.length, 2)
    })

    await t.test('cancel() drops pending trailing invocation', async () => {
        const mock = createMock<[number]>()
        const cb = throttle(mock, 100)

        cb(1) // leading fires immediately
        assert.equal(mock.mock.calls.length, 1)
        cb(2) // schedules trailing
        cb.cancel()
        await delay(120)
        assert.equal(mock.mock.calls.length, 1)
    })
})

test('timeout', async (t) => {
    await t.test('types', () => {
        assertType<Promise<number>>()(timeout(Promise.resolve(5), 100))
        // TimeoutError extends Error (subtype check)
        const _e: Error = new TimeoutError()
        void _e
        assertType<TimeoutError>()(new TimeoutError())
    })

    await t.test('resolves before deadline', async () => {
        const result = await timeout(
            new Promise<string>((resolve) =>
                setTimeout(() => resolve('done'), 20),
            ),
            100,
        )
        assert.equal(result, 'done')
    })

    await t.test('rejects with TimeoutError past deadline', async () => {
        await assert.rejects(
            () =>
                timeout(
                    new Promise<string>((resolve) =>
                        setTimeout(() => resolve('done'), 100),
                    ),
                    20,
                ),
            (err: Error) => err instanceof TimeoutError,
        )
    })

    await t.test('original rejection propagates', async () => {
        await assert.rejects(
            () => timeout(Promise.reject(new Error('boom')), 100),
            /boom/,
        )
    })
})

test('retry', async (t) => {
    await t.test('types', () => {
        assertType<Promise<number>>()(retry(async () => 5))
        assertType<Promise<string>>()(retry(async () => 'x', { attempts: 3 }))
        // backoff function receives 1-indexed attempt number
        retry(async () => 1, {
            backoff: (n) => {
                assertType<number>()(n)
                return 0
            },
        })
    })

    await t.test('returns value on first success', async () => {
        let calls = 0
        const result = await retry(async () => {
            calls++
            return 42
        })
        assert.equal(result, 42)
        assert.equal(calls, 1)
    })

    await t.test('retries until success', async () => {
        let calls = 0
        const result = await retry(
            async () => {
                calls++
                if (calls < 3) throw new Error('fail')
                return 'ok'
            },
            { attempts: 5 },
        )
        assert.equal(result, 'ok')
        assert.equal(calls, 3)
    })

    await t.test('rethrows after all attempts exhausted', async () => {
        let calls = 0
        await assert.rejects(
            () =>
                retry(
                    async () => {
                        calls++
                        throw new Error(`attempt-${calls}`)
                    },
                    { attempts: 3 },
                ),
            /attempt-3/,
        )
        assert.equal(calls, 3)
    })

    await t.test('honors fixed backoff delay', async () => {
        let calls = 0
        const start = Date.now()
        await assert.rejects(() =>
            retry(
                async () => {
                    calls++
                    throw new Error('fail')
                },
                { attempts: 3, backoff: 30 },
            ),
        )
        const elapsed = Date.now() - start
        // 2 inter-attempt delays of ~30ms each
        assert.ok(elapsed >= 55, `expected ≥55ms, got ${elapsed}`)
        assert.equal(calls, 3)
    })

    await t.test('honors backoff function (1-indexed)', async () => {
        const seen: number[] = []
        await assert.rejects(() =>
            retry(
                async () => {
                    throw new Error('fail')
                },
                {
                    attempts: 3,
                    backoff: (n) => {
                        seen.push(n)
                        return 0
                    },
                },
            ),
        )
        assert.deepEqual(seen, [1, 2])
    })
})

test('pLimit', async (t) => {
    await t.test('types', () => {
        const limit = pLimit(2)
        // Each call infers its own T
        assertType<Promise<number>>()(limit(async () => 5))
        assertType<Promise<string>>()(limit(async () => 'x'))
    })

    await t.test('caps concurrency', async () => {
        const limit = pLimit(2)
        let active = 0
        let peak = 0
        const task = async () => {
            active++
            peak = Math.max(peak, active)
            await delay(20)
            active--
        }
        await Promise.all([
            limit(task),
            limit(task),
            limit(task),
            limit(task),
            limit(task),
        ])
        assert.equal(peak, 2)
    })

    await t.test('returns task results', async () => {
        const limit = pLimit(2)
        const out = await Promise.all([
            limit(async () => 1),
            limit(async () => 2),
            limit(async () => 3),
        ])
        assert.deepEqual(out, [1, 2, 3])
    })

    await t.test('propagates rejections', async () => {
        const limit = pLimit(2)
        await assert.rejects(
            () => limit(async () => Promise.reject(new Error('boom'))),
            /boom/,
        )
        // Subsequent tasks still work
        assert.equal(await limit(async () => 'ok'), 'ok')
    })

    await t.test('throws on invalid concurrency', () => {
        assert.throws(() => pLimit(0), RangeError)
    })
})

test('pSeries', async (t) => {
    await t.test('types', () => {
        // Tuple shape preserved when task return types match
        assertType<Promise<[number, number]>>()(
            pSeries([async () => 1, async () => 2]),
        )
        // Heterogeneous task return types are inferred as a tuple
        assertType<Promise<[number, string]>>()(
            pSeries([async () => 1, async () => 'a']),
        )
    })

    await t.test('runs sequentially', async () => {
        const order: number[] = []
        const out = await pSeries([
            async () => {
                order.push(1)
                await delay(20)
                order.push(2)
                return 'a'
            },
            async () => {
                order.push(3)
                await delay(10)
                order.push(4)
                return 'b'
            },
            async () => {
                order.push(5)
                return 'c'
            },
        ])
        assert.deepEqual(order, [1, 2, 3, 4, 5])
        assert.deepEqual(out, ['a', 'b', 'c'])
    })

    await t.test('stops at first rejection', async () => {
        const order: number[] = []
        await assert.rejects(
            () =>
                pSeries([
                    async () => {
                        order.push(1)
                        return 'a'
                    },
                    async () => {
                        order.push(2)
                        throw new Error('boom')
                    },
                    async () => {
                        order.push(3)
                        return 'c'
                    },
                ]),
            /boom/,
        )
        assert.deepEqual(order, [1, 2])
    })

    await t.test('empty input resolves to empty array', async () => {
        assert.deepEqual(await pSeries([]), [])
    })
})
