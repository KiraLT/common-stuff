import assert from 'node:assert/strict'
import test from 'node:test'

import { debounce, delay, throttle } from '../src'

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
    await t.test('delay action', async () => {
        const start = Date.now()
        await delay(250)
        assert.ok(Math.abs(Date.now() - start - 250) < 10)
    })
})

test('debounce', async (t) => {
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
        assert.equal(mock.mock.calls[0][0], 3)
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
        assert.equal(mock.mock.calls[0][0], 'it works')
    })
})

test('throttle', async (t) => {
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
})
