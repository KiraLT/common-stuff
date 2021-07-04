import { cache } from '../src'

describe('cache', () => {
    it('caches function', () => {
        const mockCallback = jest.fn((a: number, b: number) => a + b)
        const cachedCallback = cache(mockCallback)

        expect(cachedCallback(1, 5)).toBe(6)
        expect(cachedCallback(1, 5)).toBe(6)
        expect(cachedCallback(1, 5)).toBe(6)
        expect(mockCallback.mock.calls).toEqual([[1, 5]])
    })

    it('supports promises', async () => {
        const mockCallback = jest.fn((a: number, b: number) =>
            Promise.resolve(a + b)
        )
        const cachedCallback = cache(mockCallback)

        expect(await cachedCallback(1, 5)).toBe(6)
        expect(await cachedCallback(1, 5)).toBe(6)
        expect(await cachedCallback(1, 5)).toBe(6)
        expect(mockCallback.mock.calls).toEqual([[1, 5]])
    })
})
