import assert from 'node:assert/strict'
import test from 'node:test'

import {
    chunk,
    deduplicate,
    deduplicateBy,
    difference,
    findIndex,
    flatten,
    generateRange,
    groupBy,
    includesAll,
    includesAny,
    indexBy,
    intersection,
    sortBy,
    union,
} from '../src/index.ts'

test('sortBy', async (t) => {
    await t.test('is stable', () => {
        assert.deepEqual(
            sortBy([1, 2, 3, 4, 5], (k) => k <= 3),
            [4, 5, 1, 2, 3],
        )
    })

    await t.test('supports readonly array', () => {
        assert.deepEqual(sortBy([1, 2] as const), [1, 2])
    })

    await t.test('sorts by number', () => {
        assert.deepEqual(sortBy([4, 5, 1, 2, 3]), [1, 2, 3, 4, 5])
    })

    await t.test('sorts by number in reverse', () => {
        assert.deepEqual(
            sortBy([4, 5, 1, 2, 3], (v) => v * -1),
            [5, 4, 3, 2, 1],
        )
    })

    await t.test('sorts boolean', () => {
        assert.deepEqual(sortBy([false, true, false, true]), [
            false,
            false,
            true,
            true,
        ])
    })

    await t.test('sorts date', () => {
        const d1 = new Date('Sun, 01 Apr 2021 13:57:03 GMT')
        const d2 = new Date('Sun, 02 Apr 2021 13:57:03 GMT')
        const d3 = new Date('Sun, 03 Apr 2021 13:57:03 GMT')
        assert.deepEqual(sortBy([d2, d1, d3]), [d1, d2, d3])
    })

    await t.test('sorts by array', () => {
        const v1 = { a: 1, b: true, c: 'A' }
        const v2 = { a: 1, b: false, c: 'B' }
        const v3 = { a: 2, b: true, c: 'C' }
        const v4 = { a: 2, b: false, c: 'D' }

        assert.deepEqual(
            sortBy([v1, v2, v3, v4], (k) => [k.a, k.b, k.c]),
            [v2, v1, v4, v3],
        )
    })
})

test('generateRange', async (t) => {
    await t.test('generates range', () => {
        assert.deepEqual(generateRange(4), [0, 1, 2, 3])
        assert.deepEqual(generateRange(3, 6), [3, 4, 5])
        assert.deepEqual(generateRange(8, 2), [])
    })

    await t.test('supports step', () => {
        assert.deepEqual(generateRange(0, 10, 2), [0, 2, 4, 6, 8])
        assert.deepEqual(
            generateRange(10, 0, -1),
            [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        )
        assert.deepEqual(generateRange(8, 2, -2), [8, 6, 4])
        assert.deepEqual(generateRange(8, 2, 2), [])
        assert.deepEqual(generateRange(1, 5, -1), [])
        assert.deepEqual(generateRange(1, 5, -2), [])
    })
    await t.test('rejects step=0', () => {
        assert.throws(() => generateRange(5, 0, 0), RangeError)
        assert.throws(() => generateRange(0, 5, 0), RangeError)
    })
})

test('flatten', async (t) => {
    await t.test('flattens array', () => {
        assert.deepEqual(flatten([1, 2, [3, 4]]), [1, 2, 3, 4])
    })

    await t.test('flattens one level by default', () => {
        assert.deepEqual(flatten([1, 2, [3, 4, [5, 6]]]), [1, 2, 3, 4, [5, 6]])
    })

    await t.test('supports custom depth', () => {
        assert.deepEqual(flatten([1, 2, [3, 4, [5, 6]]], 2), [1, 2, 3, 4, 5, 6])
    })
})

test('groupBy', async (t) => {
    await t.test('groups by number (insertion order)', () => {
        assert.deepEqual(groupBy([6.1, 4.2, 6.3], Math.floor), [
            [6, [6.1, 6.3]],
            [4, [4.2]],
        ])
    })

    await t.test('groups by multiple conditions (insertion order)', () => {
        assert.deepEqual(
            groupBy(['one', 'two', 'three'], (v) => [
                v.length,
                v.includes('a'),
            ]),
            [
                [
                    [3, false],
                    ['one', 'two'],
                ],
                [[5, false], ['three']],
            ],
        )
    })
})

test('indexBy', async (t) => {
    await t.test('creates index', () => {
        assert.deepEqual(
            indexBy(['one', 'two', 'three'], (v) => v.length),
            {
                '5': ['three'],
                '3': ['one', 'two'],
            },
        )
    })

    await t.test('supports array', async (t) => {
        assert.deepEqual(
            indexBy(['one', 'two', 'three'], (v) => [v.length, v.length + 1]),
            {
                '5': ['three'],
                '6': ['three'],
                '3': ['one', 'two'],
                '4': ['one', 'two'],
            },
        )
    })

    await t.test('separate keys produce independent arrays', () => {
        const out = indexBy(['one', 'two', 'three'], (v) => [
            v.length,
            v.length + 1,
        ])
        // Pushing into one bucket must not affect the other
        out['3']?.push('mutation')
        assert.deepEqual(out['4'], ['one', 'two'])
    })
})

test('deduplicate', async (t) => {
    await t.test('de-duplicates any type', () => {
        const obj1 = {}
        assert.deepEqual(
            deduplicate([obj1, 1, '5', true, 5, 1, obj1, false, true]),
            [obj1, 1, '5', true, 5, false],
        )
    })
})

test('deduplicateBy', async (t) => {
    await t.test('de-duplicates any type by callback', () => {
        const obj1 = {}
        assert.deepEqual(
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
                (v) => v.a,
            ),
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
                    a: true,
                },
            ],
        )
    })
})

test('chunk', async (t) => {
    await t.test('chunks array', () => {
        assert.deepEqual(chunk([1, 2, 3, 4], 2), [
            [1, 2],
            [3, 4],
        ])
        assert.deepEqual(chunk([1, 2, 3], 2), [[1, 2], [3]])
        assert.deepEqual(chunk([], 2), [])
    })
    await t.test('size 1 yields singleton chunks', () => {
        assert.deepEqual(chunk([1, 2, 3], 1), [[1], [2], [3]])
    })
    await t.test('size larger than length yields one chunk', () => {
        assert.deepEqual(chunk([1, 2], 10), [[1, 2]])
    })
    await t.test('rejects non-positive size', () => {
        assert.throws(() => chunk([1, 2, 3], 0), RangeError)
        assert.throws(() => chunk([1, 2, 3], -1), RangeError)
        assert.throws(() => chunk([1, 2, 3], 1.5), RangeError)
    })
})

test('difference', async (t) => {
    await t.test('finds difference', () => {
        assert.deepEqual(difference([2, 1], [2, 3]), [1])
    })

    await t.test('supports key callback', () => {
        assert.deepEqual(
            difference([2, 1], ['2', '3'], (v) => parseInt(v.toString(), 10)),
            [1],
        )
    })
})

test('intersection', async (t) => {
    await t.test('finds intersection', () => {
        assert.deepEqual(
            intersection([
                [2, 1],
                [2, 3],
            ]),
            [2],
        )
    })

    await t.test('supports empty array', () => {
        assert.deepEqual(intersection([[], [2, 3]]), [])
        assert.deepEqual(intersection([[2, 3], []]), [])
    })

    await t.test('supports key callback', () => {
        assert.deepEqual(
            intersection<string | number>(
                [
                    [2, 1],
                    ['2', '3'],
                ],
                (v) => parseInt(v.toString(), 10),
            ),
            [2],
        )
    })

    await t.test('supports empty array key callback', () => {
        assert.deepEqual(
            intersection([[], ['2', '3']], (v) => parseInt(v.toString(), 10)),
            [],
        )
        assert.deepEqual(
            intersection([['2', '3'], []], (v) => parseInt(v.toString(), 10)),
            [],
        )
    })

    await t.test('supports empty array', () => {
        assert.deepEqual(intersection([]), [])
    })
})

test('union', async (t) => {
    await t.test('finds intersection', () => {
        assert.deepEqual(
            union([
                [2, 1],
                [2, 3],
            ]),
            [2, 1, 3],
        )
    })

    await t.test('supports key callback', () => {
        assert.deepEqual(
            union<string | number>(
                [
                    [2, 1],
                    ['2', '3'],
                ],
                (v) => parseInt(v.toString(), 10),
            ),
            [2, 1, '3'],
        )
    })
})

test('includesAny', async (t) => {
    await t.test('checks if includes', () => {
        assert.ok(includesAny([2, 1], [2, 3]))
    })

    await t.test('checks if not includes', () => {
        assert.ok(!includesAny([2, 1], [0, 3]))
    })

    await t.test('supports key callback', () => {
        assert.ok(
            includesAny([2, 1], ['2', '3'], (v) => parseInt(v.toString(), 10)),
        )
    })
})

test('includesAll', async (t) => {
    await t.test('checks if includes', () => {
        assert.ok(includesAll([3, 2, 1], [2, 3]))
    })

    await t.test('checks if not includes', () => {
        assert.ok(!includesAll([2, 1], [2, 3]))
    })

    await t.test('supports key callback', () => {
        assert.ok(
            includesAll([2, 1], ['1', '2'], (v) => parseInt(v.toString(), 10)),
        )
    })
})

test('findIndex', async (t) => {
    await t.test('finds index', () => {
        assert.equal(
            findIndex([1, 2, 3, 4], (v) => v === 4),
            3,
        )
    })

    await t.test('returns -1 if not found', () => {
        assert.equal(
            findIndex([1, 2, 3, 4], (v) => v === 10),
            -1,
        )
    })
})
