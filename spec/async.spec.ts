import { delay, debounce } from '../src'

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
