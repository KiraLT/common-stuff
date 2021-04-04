import { sortBy, generateRange } from '../src'

describe('sortBy', () => {
    it('is stable', () => {
        expect(sortBy([1, 2, 3, 4, 5], (k) => k <= 3)).toEqual([4, 5, 1, 2, 3])
    })

    it('sort by number', () => {
        expect(sortBy([4, 5, 1, 2, 3])).toEqual([1, 2, 3, 4, 5])
    })

    it('sort by number in reverse', () => {
        expect(sortBy([4, 5, 1, 2, 3], (v) => v * -1)).toEqual([5, 4, 3, 2, 1])
    })

    it('sort boolean', () => {
        expect(sortBy([false, true, false, true])).toEqual([
            false,
            false,
            true,
            true,
        ])
    })

    it('sort date', () => {
        const d1 = new Date('Sun, 01 Apr 2021 13:57:03 GMT')
        const d2 = new Date('Sun, 02 Apr 2021 13:57:03 GMT')
        const d3 = new Date('Sun, 03 Apr 2021 13:57:03 GMT')
        expect(sortBy([d2, d1, d3])).toEqual([d1, d2, d3])
    })

    it('sort by array', () => {
        const v1 = { a: 1, b: true, c: 'A' }
        const v2 = { a: 1, b: false, c: 'B' }
        const v3 = { a: 2, b: true, c: 'C' }
        const v4 = { a: 2, b: false, c: 'D' }

        expect(sortBy([v1, v2, v3, v4], (k) => [k.a, k.b, k.c])).toEqual([
            v2,
            v1,
            v4,
            v3,
        ])
    })
})

describe('generateRange', () => {
    it('generates range', () => {
        expect(generateRange(4)).toEqual([0, 1, 2, 3])
        expect(generateRange(3, 6)).toEqual([3, 4, 5])
        expect(generateRange(0, 10, 2)).toEqual([0, 2, 4, 6, 8])
        expect(generateRange(10, 0, -1)).toEqual([
            10,
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2,
            1,
        ])
        expect(generateRange(8, 2, -2)).toEqual([8, 6, 4])
        expect(generateRange(8, 2)).toEqual([])
        expect(generateRange(8, 2, 2)).toEqual([])
        expect(generateRange(1, 5, -1)).toEqual([])
        expect(generateRange(1, 5, -2)).toEqual([])
    })
})
