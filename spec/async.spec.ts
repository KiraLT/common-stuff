import { delay, debounce, throttle } from '../src'

describe('delay', () => {
    it('delay action', async () => {
        const start = Date.now()
        await delay(250)
        expect(Math.abs(Date.now() - start - 250)).toBeLessThan(10)
    })
})

describe('debounce', () => {
    it('debounce action', async () => {
        const mock = jest.fn()
        const cb = debounce(mock, 100)

        cb(1)
        await delay(90)
        expect(mock.mock.calls.length).toBe(0)

        cb(2)

        expect(mock.mock.calls.length).toBe(0)

        await delay(90)

        expect(mock.mock.calls.length).toBe(0)

        await delay(10)

        expect(mock.mock.calls.length).toBe(1)
    })
})

describe('throttle', () => {
    // it('should throttle function invocation', async () => {
    //     const mock = jest.fn()
    //     const cb = throttle(mock, 100)

    //     cb(1)
    //     expect(mock.mock.calls.length).toBe(1)

    //     await delay(90)

    //     cb(2)
    //     expect(mock.mock.calls.length).toBe(1)

    //     await delay(10)

    //     expect(mock.mock.calls.length).toBe(2)
    // })

    // it('without leading', async () => {
    //     const mock = jest.fn()
    //     const cb = throttle(mock, 100, { leading: false })

    //     cb(1)
    //     expect(mock.mock.calls.length).toBe(0)

    //     await delay(90)

    //     cb(2)
    //     expect(mock.mock.calls.length).toBe(0)

    //     await delay(10)

    //     expect(mock.mock.calls.length).toBe(1)
    // })

    it('without trailing', async () => {
        const mock = jest.fn()
        const cb = throttle(mock, 100, { trailing: false })

        expect(mock.mock.calls.length).toBe(0)

        cb(1)
        expect(mock.mock.calls.length).toBe(1)

        await delay(50)

        cb(2)
        expect(mock.mock.calls.length).toBe(1)

        await delay(50)

        expect(mock.mock.calls.length).toBe(1)

        cb(3)

        expect(mock.mock.calls.length).toBe(2)

        await delay(100)

        expect(mock.mock.calls.length).toBe(2)
    })
})
