import {
    sortBy,
    generateRange,
    flatMap,
    flatten,
    groupBy,
    indexBy,
    deduplicate,
    deduplicateBy,
    chunk,
} from '../src'

describe('sortBy', () => {
    it('is stable', () => {
        expect(sortBy([1, 2, 3, 4, 5], (k) => k <= 3)).toEqual([4, 5, 1, 2, 3])
    })

    it('supports readonly array', () => {
        expect(sortBy([1, 2] as const)).toEqual([1, 2])
    })

    it('sorts by number', () => {
        expect(sortBy([4, 5, 1, 2, 3])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts by number in reverse', () => {
        expect(sortBy([4, 5, 1, 2, 3], (v) => v * -1)).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts boolean', () => {
        expect(sortBy([false, true, false, true])).toEqual([
            false,
            false,
            true,
            true,
        ])
    })

    it('sorts date', () => {
        const d1 = new Date('Sun, 01 Apr 2021 13:57:03 GMT')
        const d2 = new Date('Sun, 02 Apr 2021 13:57:03 GMT')
        const d3 = new Date('Sun, 03 Apr 2021 13:57:03 GMT')
        expect(sortBy([d2, d1, d3])).toEqual([d1, d2, d3])
    })

    it('sorts by array', () => {
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
        expect(generateRange(8, 2)).toEqual([])
    })

    it('supports step', () => {
        expect(generateRange(0, 10, 2)).toEqual([0, 2, 4, 6, 8])
        expect(generateRange(10, 0, -1)).toEqual([
            10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
        ])
        expect(generateRange(8, 2, -2)).toEqual([8, 6, 4])
        expect(generateRange(8, 2, 2)).toEqual([])
        expect(generateRange(1, 5, -1)).toEqual([])
        expect(generateRange(1, 5, -2)).toEqual([])
    })
})

describe('flatMap', () => {
    it('flattens response', () => {
        expect(flatMap([1, 2, 3, 4], (x) => [x * 2])).toEqual([2, 4, 6, 8])
    })

    it('only one level is flattened', () => {
        expect(flatMap([1, 2, 3, 4], (x) => [[x * 2]])).toEqual([
            [2],
            [4],
            [6],
            [8],
        ])
    })
})

describe('flatten', () => {
    it('flattens array', () => {
        expect(flatten([1, 2, [3, 4]])).toEqual([1, 2, 3, 4])
    })

    it('flattens one level by default', () => {
        expect(flatten([1, 2, [3, 4, [5, 6]]])).toEqual([1, 2, 3, 4, [5, 6]])
    })

    it('supports custom depth', () => {
        expect(flatten([1, 2, [3, 4, [5, 6]]], 2)).toEqual([1, 2, 3, 4, 5, 6])
    })
})

describe('groupBy', () => {
    it('groups by number', () => {
        expect(groupBy([6.1, 4.2, 6.3], Math.floor)).toEqual([
            [4, [4.2]],
            [6, [6.1, 6.3]],
        ])
    })

    it('groups by multiple conditions', () => {
        expect(
            groupBy(['one', 'two', 'three'], (v) => [v.length, v.includes('a')])
        ).toEqual([
            [[5, false], ['three']],
            [
                [3, false],
                ['one', 'two'],
            ],
        ])
    })
})

describe('indexBy', () => {
    it('creates index', () => {
        expect(indexBy(['one', 'two', 'three'], (v) => v.length)).toEqual({
            '5': ['three'],
            '3': ['one', 'two'],
        })
    })
})

describe('deduplicate', () => {
    it('de-duplicates any type', () => {
        const obj1 = {}
        expect(
            deduplicate([obj1, 1, '5', true, 5, 1, obj1, false, true])
        ).toEqual([obj1, 1, '5', true, 5, false])
    })
})

describe('deduplicateBy', () => {
    it('de-duplicates any type by callback', () => {
        const obj1 = {}
        expect(
            deduplicateBy(
                [
                    {
                        a: obj1,
                    },
                    {
                        a: 1,
                    },
                    {
                        a: 5,
                    },
                    {
                        a: obj1,
                    },
                    {
                        a: true,
                    },
                    {
                        a: 1,
                    },
                ],
                (v) => v.a
            )
        ).toEqual([
            {
                a: obj1,
            },
            {
                a: 1,
            },
            {
                a: 5,
            },
            {
                a: true,
            },
        ])
    })
})

describe('chunk', () => {
    it('chunks array', () => {
        expect(chunk([1, 2, 3, 4], 2)).toEqual([
            [1, 2],
            [3, 4],
        ])
        expect(chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]])
        expect(chunk([], 2)).toEqual([])
    })
})
