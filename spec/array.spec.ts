import assert from 'node:assert/strict'
import test from 'node:test'

import {
    chunk,
    compact,
    countBy,
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
import { assertType } from './_types.ts'

test('sortBy', async (t) => {
    await t.test('types', () => {
        assertType<number[]>()(sortBy([1, 2, 3]))
        assertType<{ a: number }[]>()(sortBy([{ a: 1 }, { a: 2 }], (v) => v.a))
        // Readonly input preserves readonly result
        assertType<readonly number[]>()(sortBy([1, 2, 3] as readonly number[]))
    })

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
    await t.test('types', () => {
        assertType<number[]>()(generateRange(4))
        assertType<number[]>()(generateRange(0, 10, 2))
    })

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
    await t.test('types', () => {
        // Plain array stays the same
        assertType<number[]>()(flatten([1, 2, 3]))
        // Mixed array — default depth = 1 flattens one level
        assertType<(number | number[])[]>()(flatten([1, [2, 3], [[4]]]))
    })

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
    await t.test('types', () => {
        // Returns [G, T[]][] (entries form)
        assertType<[number, string[]][]>()(
            groupBy(['a', 'bb'], (v) => v.length),
        )
        assertType<[boolean, number[]][]>()(groupBy([1, 2, 3], (v) => v > 1))
    })

    await t.test('groups by primitive key (insertion order)', () => {
        assert.deepEqual(groupBy([6.1, 4.2, 6.3], Math.floor), [
            [6, [6.1, 6.3]],
            [4, [4.2]],
        ])
    })

    await t.test(
        'identity keys: distinct object instances are distinct groups',
        () => {
            // Each call to the callback creates a new array → each item is its
            // own group. Callers who want value-based grouping should return a
            // primitive key (string/number).
            const out = groupBy(['one', 'two', 'three'], (v) => [
                v.length,
                v.includes('a'),
            ])
            assert.equal(out.length, 3)
        },
    )

    await t.test('does not crash on circular references', () => {
        const a: { self?: unknown } = {}
        a.self = a
        // Would throw in the v1 JSON.stringify-based implementation.
        const out = groupBy([{ ref: a }, { ref: a }], (v) => v.ref)
        assert.equal(out.length, 1)
        assert.equal(out[0]?.[1].length, 2)
    })

    await t.test('handles function/symbol keys without collision', () => {
        const fnA = () => 1
        const fnB = () => 2
        const out = groupBy([1, 2, 3], (v) => (v < 3 ? fnA : fnB))
        assert.deepEqual(out, [
            [fnA, [1, 2]],
            [fnB, [3]],
        ])
    })
})

test('indexBy', async (t) => {
    await t.test('types', () => {
        assertType<Record<string, string[]>>()(indexBy(['a', 'b'], (v) => v))
        assertType<Record<string, number[]>>()(
            indexBy([1, 2, 3], (v) => v.toString()),
        )
    })

    await t.test('creates index', () => {
        assert.deepEqual(
            indexBy(['one', 'two', 'three'], (v) => v.length),
            {
                '5': ['three'],
                '3': ['one', 'two'],
            },
        )
    })

    await t.test('supports array', async () => {
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
    await t.test('types', () => {
        assertType<number[]>()(deduplicate([1, 2, 1]))
        assertType<string[]>()(deduplicate(['a', 'b']))
    })

    await t.test('de-duplicates any type', () => {
        const obj1 = {}
        assert.deepEqual(
            deduplicate([obj1, 1, '5', true, 5, 1, obj1, false, true]),
            [obj1, 1, '5', true, 5, false],
        )
    })
})

test('deduplicateBy', async (t) => {
    await t.test('types', () => {
        assertType<{ id: number }[]>()(
            deduplicateBy([{ id: 1 }, { id: 1 }], (v) => v.id),
        )
    })

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
    await t.test('types', () => {
        assertType<number[][]>()(chunk([1, 2, 3, 4], 2))
        // Readonly input preserves readonly result
        assertType<readonly (readonly number[])[]>()(
            chunk([1, 2, 3, 4] as readonly number[], 2),
        )
    })

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
    await t.test('types', () => {
        assertType<number[]>()(difference([1, 2], [2, 3]))
        // Readonly input preserves readonly result
        assertType<readonly number[]>()(
            difference([1, 2] as readonly number[], [2, 3]),
        )
    })

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
    await t.test('types', () => {
        assertType<number[]>()(
            intersection([
                [2, 1],
                [2, 3],
            ]),
        )
    })

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
    await t.test('types', () => {
        assertType<number[]>()(
            union([
                [2, 1],
                [2, 3],
            ]),
        )
    })

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
    await t.test('types', () => {
        assertType<boolean>()(includesAny([1, 2], [2, 3]))
    })

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
    await t.test('types', () => {
        assertType<boolean>()(includesAll([1, 2, 3], [1, 2]))
    })

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
    await t.test('types', () => {
        assertType<number>()(findIndex([1, 2, 3], (v) => v > 1))
    })

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

test('compact', async (t) => {
    await t.test('types', () => {
        // Narrows element type via NonNullable<T>
        assertType<number[]>()(
            compact([1, null, 2, undefined] as (number | null | undefined)[]),
        )
        assertType<string[]>()(compact(['a', null] as (string | null)[]))
        // Non-null/undefined falsy values are preserved
        // @ts-expect-error — `0` is still in the result
        assertType<never[]>()(compact([0, null]))
    })

    await t.test('removes null and undefined', () => {
        assert.deepEqual(compact([1, null, 2, undefined, 3]), [1, 2, 3])
    })

    await t.test('preserves other falsy values', () => {
        assert.deepEqual(compact([0, '', false, null, undefined]), [
            0,
            '',
            false,
        ])
    })

    await t.test('empty input yields empty output', () => {
        assert.deepEqual(compact([]), [])
    })
})

test('countBy', async (t) => {
    await t.test('types', () => {
        assertType<[number, number][]>()(countBy(['a', 'bb'], (v) => v.length))
        assertType<[boolean, number][]>()(countBy([1, 2, 3], (v) => v > 1))
    })

    await t.test('counts occurrences by primitive key', () => {
        assert.deepEqual(
            countBy(['apple', 'banana', 'avocado'], (v) => v[0]),
            [
                ['a', 2],
                ['b', 1],
            ],
        )
    })

    await t.test('preserves first-seen order', () => {
        assert.deepEqual(
            countBy([1, 2, 1, 3, 2, 1], (v) => v),
            [
                [1, 3],
                [2, 2],
                [3, 1],
            ],
        )
    })

    await t.test('handles function/symbol keys', () => {
        const fnA = () => 1
        const fnB = () => 2
        const out = countBy([1, 2, 3, 4], (v) => (v < 3 ? fnA : fnB))
        assert.deepEqual(out, [
            [fnA, 2],
            [fnB, 2],
        ])
    })

    await t.test('empty input yields empty output', () => {
        assert.deepEqual(
            countBy([] as number[], (v) => v),
            [],
        )
    })
})
