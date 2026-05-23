import assert from 'node:assert/strict'
import test from 'node:test'

import {
    drop,
    dropWhile,
    every,
    filter,
    find,
    flatMap,
    forEach,
    isNumber,
    map,
    partition,
    reduce,
    size,
    some,
    take,
    takeWhile,
    toArray,
    zip,
} from '../src/index.ts'
import { assertType } from './_types.ts'

async function* makeAsync<T>(values: Iterable<T>): AsyncGenerator<T> {
    for (const v of values) {
        await Promise.resolve()
        yield v
    }
}

async function collect<T>(it: AsyncIterable<T>): Promise<T[]> {
    const out: T[] = []
    for await (const v of it) out.push(v)
    return out
}

test('reduce', async (t) => {
    await t.test('types', () => {
        // Sync iterable, no initial → R
        assertType<number>()(reduce([1, 2, 3], (a, b) => a + b))
        // Initial value with different return type
        assertType<string>()(
            reduce([1, 2, 3], (acc: string, v) => acc + v, ''),
        )
        // Async iterable → Promise<R>
        assertType<Promise<number>>()(
            reduce(makeAsync([1, 2]), (a, b) => a + b),
        )
        // Async reducer + sync iterable → Promise<R>
        assertType<Promise<number>>()(
            reduce([1, 2], async (a, b) => a + b, 0),
        )
        // Callback param types are inferred
        reduce([1, 2, 3], (acc, v, i) => {
            assertType<number>()(acc)
            assertType<number>()(v)
            assertType<number>()(i)
            return acc + v
        })
    })

    await t.test('reduces array with initial', () => {
        assert.equal(
            reduce([1, 2, 3], (a, b) => a + b, 0),
            6,
        )
    })

    await t.test('reduces array without initial', () => {
        assert.equal(
            reduce([1, 2, 3], (a, b) => a + b),
            6,
        )
    })

    await t.test('reduces set', () => {
        assert.equal(
            reduce(new Set([1, 2, 3]), (a, b) => a + b, 0),
            6,
        )
    })

    await t.test('reduces custom iterable', () => {
        const customIterable = {
            [Symbol.iterator]: function* () {
                yield 1 as number
                yield 2 as number
                yield 3 as number
            },
        }

        assert.equal(
            reduce(customIterable, (a, b) => a + b),
            6,
        )
    })

    await t.test('reduces async iterable (no initial)', async () => {
        assert.equal(
            await reduce(makeAsync([1, 2, 3]), (a, b) => a + b),
            6,
        )
    })

    await t.test('reduces async iterable (with initial)', async () => {
        assert.equal(
            await reduce(makeAsync([1, 2, 3]), (a, b) => a + b, 0),
            6,
        )
    })

    await t.test('supports async reducer (sync iterable)', async () => {
        assert.equal(
            await reduce([1, 2, 3], async (a, b) => a + b, 0),
            6,
        )
    })

    await t.test('supports async reducer (async iterable)', async () => {
        assert.equal(
            await reduce(makeAsync([1, 2, 3]), async (a, b) => a + b, 0),
            6,
        )
    })

    await t.test('throws on empty iterable without initial', () => {
        assert.throws(() => reduce([] as number[], (a, b) => a + b))
    })

    await t.test('returns initial on empty iterable with initial', () => {
        assert.equal(
            reduce([] as number[], (a, b) => a + b, 10),
            10,
        )
    })

    await t.test('async reducer without initial (sync iterable)', async () => {
        assert.equal(
            await reduce([1, 2, 3], async (a, b) => a + b),
            6,
        )
    })

    await t.test('empty async iterable without initial throws', async () => {
        async function* empty(): AsyncGenerator<number> {}

        await assert.rejects(
            () => reduce(empty(), (a, b) => a + b),
            /Reduce of empty \(async\) iterable with no initial value/,
        )
    })

    await t.test(
        'empty async iterable with initial returns initial',
        async () => {
            async function* empty(): AsyncGenerator<number> {}
            assert.equal(
                await reduce(empty(), (a: number, b: number) => a + b, 5),
                5,
            )
        },
    )

    await t.test('initial value is honored even when undefined', () => {
        const result = reduce(
            [1, 2, 3],
            (acc: number | undefined, v) => (acc ?? 0) + v,
            undefined,
        )
        assert.equal(result, 6)
    })
})

test('map', async (t) => {
    await t.test('types', () => {
        // Array → Array
        assertType<number[]>()(map([1, 2, 3], (v) => v * 2))
        // Async mapper on array → Promise<Array>
        assertType<Promise<number[]>>()(map([1, 2, 3], async (v) => v * 2))
        // Negative: async mapper does NOT return a plain array
        // @ts-expect-error — result is Promise<number[]>, not number[]
        assertType<number[]>()(map([1, 2, 3], async (v) => v * 2))
        // Negative: mapper result type is enforced
        // @ts-expect-error — result is string[], not number[]
        assertType<number[]>()(map([1, 2, 3], (v) => v.toString()))
        // Set → Set
        assertType<Set<string>>()(map(new Set([1, 2, 3]), (v) => v.toString()))
        assertType<Promise<Set<number>>>()(
            map(new Set([1, 2]), async (v) => v + 1),
        )
        // Map → Map
        assertType<Map<string, number>>()(
            map(
                new Map<string, number>([['a', 1]]),
                ([k, v]) => [k.toUpperCase(), v * 2] as [string, number],
            ),
        )
        // Record → Record
        assertType<Record<string, number>>()(
            map(
                { a: 1, b: 2 } as Record<string, number>,
                ([k, v]) => [k, v * 2] as [string, number],
            ),
        )
        // AsyncIterable → AsyncIterable
        assertType<AsyncIterable<string>>()(map(makeAsync([1, 2]), (v) => `${v}`))
        // Callback params are inferred (value, index)
        map([1, 2], (v, i) => {
            assertType<number>()(v)
            assertType<number>()(i)
            return v + i
        })
    })

    await t.test('maps array → array', () => {
        const out = map([1, 2, 3], (v) => v * 2)
        assert.ok(Array.isArray(out))
        assert.deepEqual(out, [2, 4, 6])
    })

    await t.test('maps set → set', () => {
        const out = map(new Set([1, 2, 3]), (v) => v * 2)
        assert.ok(out instanceof Set)
        assert.deepEqual([...out], [2, 4, 6])
    })

    await t.test('maps map → map', () => {
        const out = map(
            new Map([
                ['a', 1],
                ['b', 2],
            ]),
            ([k, v]) => [k.toUpperCase(), v * 2] as [string, number],
        )
        assert.ok(out instanceof Map)
        assert.deepEqual(
            [...out.entries()],
            [
                ['A', 2],
                ['B', 4],
            ],
        )
    })

    await t.test('maps record → record', () => {
        const out = map({ a: 1, b: 2 }, ([k, v]) => [k, v * 2] as [string, number])
        assert.deepEqual(out, { a: 2, b: 4 })
    })

    await t.test('maps async iterable → async iterable', async () => {
        const out = map(makeAsync([1, 2, 3]), (v) => v + 1)
        assert.deepEqual(await collect(out), [2, 3, 4])
    })

    await t.test('async iterable supports async mapper', async () => {
        const out = map(makeAsync([1, 2, 3]), async (v) => v * 10)
        assert.deepEqual(await collect(out), [10, 20, 30])
    })

    await t.test('maps generic iterable → iterable', () => {
        const customIter: Iterable<number> = {
            [Symbol.iterator]: function* () {
                yield 1
                yield 2
                yield 3
            },
        }
        const out = map(customIter, (v) => v + 1)
        assert.deepEqual([...out], [2, 3, 4])
    })

    await t.test('passes index', () => {
        assert.deepEqual(
            map(['a', 'b', 'c'], (v, i) => `${i}:${v}`),
            ['0:a', '1:b', '2:c'],
        )
    })

    await t.test('throws on non-iterable', () => {
        assert.throws(() => map(42 as unknown as number[], (v) => v))
    })
})

test('flatMap', async (t) => {
    await t.test('types', () => {
        assertType<number[]>()(flatMap([1, 2], (v) => [v, v * 10]))
        assertType<Promise<number[]>>()(
            flatMap([1, 2], async (v) => [v, v * 10]),
        )
        assertType<AsyncIterable<number>>()(
            flatMap(makeAsync([1, 2]), (v) => [v, v + 1]),
        )
        assertType<Set<number>>()(
            flatMap(new Set([1, 2]), (v) => [v, v + 10]),
        )
        // Map → Map
        assertType<Map<string, number>>()(
            flatMap(
                new Map<string, number>([['a', 1]]),
                ([k, v]) => [[k, v]] as [string, number][],
            ),
        )
    })

    await t.test('flatMaps array → array', () => {
        const out = flatMap([1, 2, 3], (v) => [v, v * 10])
        assert.deepEqual(out, [1, 10, 2, 20, 3, 30])
    })

    await t.test('flatMaps set → set (deduplicated)', () => {
        const out = flatMap(new Set([1, 2]), (v) => [v, v + 10, v])
        assert.ok(out instanceof Set)
        assert.deepEqual([...out].sort((a, b) => a - b), [1, 2, 11, 12])
    })

    await t.test('flatMaps map → map', () => {
        const out = flatMap(new Map([['a', 1]]), ([k, v]) => [
            [k, v],
            [`${k}!`, v + 1],
        ] as [string, number][])
        assert.ok(out instanceof Map)
        assert.deepEqual(
            [...out.entries()],
            [
                ['a', 1],
                ['a!', 2],
            ],
        )
    })

    await t.test('flatMaps record → record', () => {
        const out = flatMap({ a: 1 }, ([k, v]) => [
            [k, v],
            [`${k}!`, v + 1],
        ] as [string, number][])
        assert.deepEqual(out, { a: 1, 'a!': 2 })
    })

    await t.test('flatMaps async iterable → async iterable', async () => {
        const out = flatMap(makeAsync([1, 2]), (v) => [v, v + 100])
        assert.deepEqual(await collect(out), [1, 101, 2, 102])
    })

    await t.test('async iterable accepts async iterable inner', async () => {
        const out = flatMap(makeAsync([1, 2]), (v) => makeAsync([v, v + 100]))
        assert.deepEqual(await collect(out), [1, 101, 2, 102])
    })

    await t.test('flatMaps generic iterable → iterable', () => {
        const customIter: Iterable<number> = {
            [Symbol.iterator]: function* () {
                yield 1
                yield 2
            },
        }
        const out = flatMap(customIter, (v) => [v, v + 10])
        assert.deepEqual([...out], [1, 11, 2, 12])
    })

    await t.test('throws on non-iterable mapper return (async)', async () => {
        await assert.rejects(async () => {
            const out = flatMap(makeAsync([1, 2]), () => 42 as unknown as number[])
            await collect(out)
        })
    })
})

test('filter', async (t) => {
    await t.test('types', () => {
        assertType<number[]>()(filter([1, 2, 3, 4], (v) => v % 2 === 0))
        assertType<Promise<number[]>>()(
            filter([1, 2, 3], async (v) => v > 1),
        )
        // Negative: async predicate must be awaited
        // @ts-expect-error — result is Promise<number[]>, not number[]
        assertType<number[]>()(filter([1, 2, 3], async (v) => v > 1))
        // Type-predicate narrows array contents
        const mixedArr: (number | string)[] = [1, 'a', 2]
        assertType<number[]>()(filter(mixedArr, isNumber))
        // Type-predicate narrows Set contents
        const mixedSet = new Set<number | string>([1, 'a', 2])
        assertType<Set<number>>()(filter(mixedSet, isNumber))
        // Map → Map
        assertType<Map<string, number>>()(
            filter(new Map<string, number>([['a', 1]]), ([, v]) => v > 0),
        )
        // Record → Record
        assertType<Record<string, number>>()(
            filter(
                { a: 1, b: 2 } as Record<string, number>,
                ([, v]) => v > 0,
            ),
        )
        // AsyncIterable → AsyncIterable
        assertType<AsyncIterable<number>>()(
            filter(makeAsync([1, 2]), (v) => v > 0),
        )
    })

    await t.test('filters array → array', () => {
        const out = filter([1, 2, 3, 4], (v) => v % 2 === 0)
        assert.deepEqual(out, [2, 4])
    })

    await t.test('filters set → set', () => {
        const out = filter(new Set([1, 2, 3, 4]), (v) => v > 2)
        assert.ok(out instanceof Set)
        assert.deepEqual([...out], [3, 4])
    })

    await t.test('filters map → map', () => {
        const out = filter(
            new Map([
                ['a', 1],
                ['b', 2],
            ]),
            ([, v]) => v > 1,
        )
        assert.ok(out instanceof Map)
        assert.deepEqual([...out.entries()], [['b', 2]])
    })

    await t.test('filters record → record', () => {
        const out = filter({ a: 1, b: 2, c: 3 }, ([, v]) => v % 2 === 1)
        assert.deepEqual(out, { a: 1, c: 3 })
    })

    await t.test('filters async iterable → async iterable', async () => {
        const out = filter(makeAsync([1, 2, 3, 4]), (v) => v % 2 === 0)
        assert.deepEqual(await collect(out), [2, 4])
    })

    await t.test('async iterable supports async predicate', async () => {
        const out = filter(makeAsync([1, 2, 3]), async (v) => v > 1)
        assert.deepEqual(await collect(out), [2, 3])
    })

    await t.test('filters generic iterable → iterable', () => {
        const customIter: Iterable<number> = {
            [Symbol.iterator]: function* () {
                yield 1
                yield 2
                yield 3
            },
        }
        const out = filter(customIter, (v) => v !== 2)
        assert.deepEqual([...out], [1, 3])
    })
})

test('forEach', async (t) => {
    await t.test('types', () => {
        // Sync iterable → void
        assertType<void>()(forEach([1, 2, 3], () => {}))
        // Async iterable → Promise<void>
        assertType<Promise<void>>()(forEach(makeAsync([1, 2]), () => {}))
        // Async callback on sync iterable → Promise<void>
        assertType<Promise<void>>()(forEach([1, 2], async () => {}))
        // Callback params inferred
        forEach(new Map<string, number>([['a', 1]]), (entry, i) => {
            assertType<[string, number]>()(entry)
            assertType<number>()(i)
        })
    })

    await t.test('iterates array', () => {
        const seen: number[] = []
        forEach([1, 2, 3], (v) => seen.push(v))
        assert.deepEqual(seen, [1, 2, 3])
    })

    await t.test('iterates set', () => {
        const seen: number[] = []
        forEach(new Set([1, 2, 3]), (v) => seen.push(v))
        assert.deepEqual(seen, [1, 2, 3])
    })

    await t.test('iterates map with [k,v] entries', () => {
        const seen: [string, number][] = []
        forEach(new Map([['a', 1], ['b', 2]]), (entry) => seen.push(entry))
        assert.deepEqual(seen, [
            ['a', 1],
            ['b', 2],
        ])
    })

    await t.test('iterates record with [k,v] entries', () => {
        const seen: [string, number][] = []
        forEach({ a: 1, b: 2 }, (entry) => seen.push(entry))
        assert.deepEqual(seen, [
            ['a', 1],
            ['b', 2],
        ])
    })

    await t.test('iterates async iterable returns Promise', async () => {
        const seen: number[] = []
        const result = forEach(makeAsync([1, 2, 3]), (v) => {
            seen.push(v)
        })
        assert.ok(result instanceof Promise)
        await result
        assert.deepEqual(seen, [1, 2, 3])
    })

    await t.test('passes index', () => {
        const seen: [number, string][] = []
        forEach(['a', 'b', 'c'], (v, i) => seen.push([i, v]))
        assert.deepEqual(seen, [
            [0, 'a'],
            [1, 'b'],
            [2, 'c'],
        ])
    })
})

test('find', async (t) => {
    await t.test('types', () => {
        assertType<number | undefined>()(find([1, 2, 3, 4], (v) => v > 2))
        // Negative: `find` always includes `| undefined`
        // @ts-expect-error — must include `| undefined`
        assertType<number>()(find([1, 2, 3, 4], (v) => v > 2))
        // Type-predicate narrows
        const mixedArr: (number | string)[] = [1, 'a', 2]
        assertType<number | undefined>()(find(mixedArr, isNumber))
        // Map → entry-tuple
        assertType<[string, number] | undefined>()(
            find(new Map<string, number>([['a', 1]]), ([, v]) => v > 0),
        )
        // Async iterable → Promise
        assertType<Promise<number | undefined>>()(
            find(makeAsync([1, 2]), (v) => v > 0),
        )
        // Async predicate on sync iterable → Promise
        assertType<Promise<number | undefined>>()(
            find([1, 2, 3], async (v) => v > 1),
        )
    })

    await t.test('finds in array', () => {
        assert.equal(
            find([1, 2, 3, 4], (v) => v > 2),
            3,
        )
    })

    await t.test('returns undefined when nothing matches array', () => {
        assert.equal(
            find([1, 2, 3], (v) => v > 10),
            undefined,
        )
    })

    await t.test('finds in set', () => {
        assert.equal(
            find(new Set([1, 2, 3]), (v) => v === 2),
            2,
        )
    })

    await t.test('finds in map (returns entry)', () => {
        assert.deepEqual(
            find(new Map([['a', 1], ['b', 2]]), ([, v]) => v === 2),
            ['b', 2],
        )
    })

    await t.test('finds in record (returns entry)', () => {
        assert.deepEqual(
            find({ a: 1, b: 2 }, ([, v]) => v === 2),
            ['b', 2],
        )
    })

    await t.test('finds in async iterable', async () => {
        assert.equal(
            await find(makeAsync([1, 2, 3, 4]), (v) => v > 2),
            3,
        )
    })
})

test('some', async (t) => {
    await t.test('types', () => {
        assertType<boolean>()(some([1, 2], (v) => v > 1))
        assertType<Promise<boolean>>()(some([1, 2], async (v) => v > 1))
        assertType<Promise<boolean>>()(some(makeAsync([1, 2]), (v) => v > 0))
        assertType<boolean>()(
            some(new Map<string, number>([['a', 1]]), ([, v]) => v > 0),
        )
    })

    await t.test('returns true when any match (array)', () => {
        assert.equal(
            some([1, 2, 3], (v) => v === 2),
            true,
        )
    })

    await t.test('returns false when none match (array)', () => {
        assert.equal(
            some([1, 2, 3], (v) => v === 99),
            false,
        )
    })

    await t.test('works on map', () => {
        assert.equal(
            some(new Map([['a', 1]]), ([, v]) => v === 1),
            true,
        )
    })

    await t.test('works on record', () => {
        assert.equal(
            some({ a: 1, b: 2 }, ([, v]) => v > 1),
            true,
        )
    })

    await t.test('works on async iterable', async () => {
        assert.equal(
            await some(makeAsync([1, 2, 3]), (v) => v === 2),
            true,
        )
    })

    await t.test('short-circuits', () => {
        let count = 0
        some([1, 2, 3, 4], (v) => {
            count++
            return v === 2
        })
        assert.equal(count, 2)
    })
})

test('every', async (t) => {
    await t.test('types', () => {
        assertType<boolean>()(every([1, 2], (v) => v > 0))
        assertType<Promise<boolean>>()(every([1, 2], async (v) => v > 0))
        assertType<Promise<boolean>>()(every(makeAsync([1, 2]), (v) => v > 0))
    })

    await t.test('returns true when all match', () => {
        assert.equal(
            every([2, 4, 6], (v) => v % 2 === 0),
            true,
        )
    })

    await t.test('returns false when one fails', () => {
        assert.equal(
            every([2, 4, 5], (v) => v % 2 === 0),
            false,
        )
    })

    await t.test('vacuously true on empty', () => {
        assert.equal(
            every([] as number[], (v) => v > 0),
            true,
        )
    })

    await t.test('works on async iterable', async () => {
        assert.equal(
            await every(makeAsync([2, 4, 6]), (v) => v % 2 === 0),
            true,
        )
    })

    await t.test('short-circuits', () => {
        let count = 0
        every([2, 3, 4, 5], (v) => {
            count++
            return v % 2 === 0
        })
        assert.equal(count, 2)
    })
})

test('size', async (t) => {
    await t.test('types', () => {
        assertType<number>()(size([1, 2]))
        assertType<number>()(size(new Set([1])))
        assertType<number>()(size(new Map([['a', 1]])))
        assertType<number>()(size({ a: 1, b: 2 }))
        assertType<Promise<number>>()(size(makeAsync([1, 2])))
    })

    await t.test('counts array', () => {
        assert.equal(size([1, 2, 3]), 3)
    })

    await t.test('counts set', () => {
        assert.equal(size(new Set([1, 2, 3])), 3)
    })

    await t.test('counts map', () => {
        assert.equal(size(new Map([['a', 1]])), 1)
    })

    await t.test('counts record keys', () => {
        assert.equal(size({ a: 1, b: 2, c: 3 }), 3)
    })

    await t.test('counts iterable by traversal', () => {
        const customIter: Iterable<number> = {
            [Symbol.iterator]: function* () {
                yield 1
                yield 2
            },
        }
        assert.equal(size(customIter), 2)
    })

    await t.test('counts async iterable', async () => {
        assert.equal(await size(makeAsync([1, 2, 3, 4])), 4)
    })
})

test('toArray', async (t) => {
    await t.test('types', () => {
        assertType<number[]>()(toArray([1, 2, 3]))
        assertType<number[]>()(toArray(new Set([1, 2, 3])))
        assertType<[string, number][]>()(
            toArray(new Map<string, number>([['a', 1]])),
        )
        assertType<Promise<string[]>>()(toArray(makeAsync(['a', 'b'])))
    })

    await t.test('copies array', () => {
        const src = [1, 2, 3]
        const out = toArray(src)
        assert.deepEqual(out, [1, 2, 3])
        assert.notEqual(out, src)
    })

    await t.test('converts set', () => {
        assert.deepEqual(toArray(new Set([1, 2, 3])), [1, 2, 3])
    })

    await t.test('converts map to entries', () => {
        assert.deepEqual(
            toArray(
                new Map([
                    ['a', 1],
                    ['b', 2],
                ]),
            ),
            [
                ['a', 1],
                ['b', 2],
            ],
        )
    })

    await t.test('converts record to entries', () => {
        assert.deepEqual(toArray({ a: 1, b: 2 }), [
            ['a', 1],
            ['b', 2],
        ])
    })

    await t.test('drains async iterable', async () => {
        assert.deepEqual(await toArray(makeAsync([1, 2, 3])), [1, 2, 3])
    })

    await t.test('drains generic iterable', () => {
        const customIter: Iterable<number> = {
            [Symbol.iterator]: function* () {
                yield 1
                yield 2
            },
        }
        assert.deepEqual(toArray(customIter), [1, 2])
    })
})

test('take', async (t) => {
    await t.test('types', () => {
        assertType<number[]>()(take([1, 2, 3], 2))
        assertType<Set<number>>()(take(new Set([1, 2, 3]), 2))
        assertType<Map<string, number>>()(
            take(new Map<string, number>([['a', 1]]), 1),
        )
        assertType<AsyncIterable<number>>()(take(makeAsync([1, 2, 3]), 2))
        // Iterable preserved (generic)
        function* gen(): Generator<number> { yield 1 }
        assertType<Iterable<number>>()(take(gen(), 1))
    })

    await t.test('array', () => {
        assert.deepEqual(take([1, 2, 3, 4], 2), [1, 2])
        assert.deepEqual(take([1, 2], 5), [1, 2])
        assert.deepEqual(take([1, 2, 3], 0), [])
        assert.deepEqual(take([1, 2, 3], -1), [])
    })
    await t.test('set', () => {
        const out = take(new Set([1, 2, 3, 4]), 2)
        assert.ok(out instanceof Set)
        assert.deepEqual([...out], [1, 2])
    })
    await t.test('map', () => {
        const out = take(
            new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]),
            2,
        )
        assert.ok(out instanceof Map)
        assert.deepEqual([...out.entries()], [
            ['a', 1],
            ['b', 2],
        ])
    })
    await t.test('record', () => {
        assert.deepEqual(take({ a: 1, b: 2, c: 3 }, 2), { a: 1, b: 2 })
    })
    await t.test('async iterable stops source after n', async () => {
        let pulled = 0
        async function* gen() {
            for (let i = 1; i <= 100; i++) {
                pulled++
                yield i
            }
        }
        const collected: number[] = []
        for await (const v of take(gen(), 3)) collected.push(v)
        assert.deepEqual(collected, [1, 2, 3])
        assert.equal(pulled, 3)
    })
    await t.test('generic iterable lazy', () => {
        const customIter: Iterable<number> = {
            [Symbol.iterator]: function* () {
                yield 1
                yield 2
                yield 3
            },
        }
        assert.deepEqual([...take(customIter, 2)], [1, 2])
    })
})

test('drop', async (t) => {
    await t.test('types', () => {
        assertType<number[]>()(drop([1, 2, 3], 1))
        assertType<Set<number>>()(drop(new Set([1, 2, 3]), 1))
        // Record return is `Partial<Record<K, V>>` since drop removes keys
        assertType<Partial<Record<'a' | 'b' | 'c', number>>>()(
            drop({ a: 1, b: 2, c: 3 }, 1),
        )
        assertType<AsyncIterable<number>>()(drop(makeAsync([1, 2, 3]), 1))
    })

    await t.test('array', () => {
        assert.deepEqual(drop([1, 2, 3, 4], 2), [3, 4])
        assert.deepEqual(drop([1, 2], 5), [])
        assert.deepEqual(drop([1, 2, 3], 0), [1, 2, 3])
        assert.deepEqual(drop([1, 2, 3], -1), [1, 2, 3])
    })
    await t.test('set', () => {
        const out = drop(new Set([1, 2, 3, 4]), 2)
        assert.ok(out instanceof Set)
        assert.deepEqual([...out], [3, 4])
    })
    await t.test('map', () => {
        const out = drop(
            new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]),
            1,
        )
        assert.deepEqual([...out.entries()], [
            ['b', 2],
            ['c', 3],
        ])
    })
    await t.test('record', () => {
        assert.deepEqual(drop({ a: 1, b: 2, c: 3 }, 1), { b: 2, c: 3 })
    })
    await t.test('async iterable', async () => {
        async function* gen() {
            yield 1
            yield 2
            yield 3
            yield 4
        }
        const collected: number[] = []
        for await (const v of drop(gen(), 2)) collected.push(v)
        assert.deepEqual(collected, [3, 4])
    })
})

test('takeWhile', async (t) => {
    await t.test('types', () => {
        assertType<number[]>()(takeWhile([1, 2, 3], (v) => v < 3))
        assertType<Promise<number[]>>()(
            takeWhile([1, 2, 3], async (v) => v < 3),
        )
        assertType<Set<number>>()(
            takeWhile(new Set([1, 2, 3]), (v) => v < 3),
        )
        assertType<Map<string, number>>()(
            takeWhile(
                new Map<string, number>([['a', 1]]),
                ([, v]) => v > 0,
            ),
        )
        assertType<Partial<Record<'a' | 'b' | 'c', number>>>()(
            takeWhile({ a: 1, b: 2, c: 3 }, ([, v]) => v < 3),
        )
        assertType<AsyncIterable<number>>()(
            takeWhile(makeAsync([1, 2, 3]), (v) => v < 3),
        )
    })

    await t.test('takes leading elements (array)', () => {
        assert.deepEqual(
            takeWhile([1, 2, 3, 1, 0], (v) => v < 3),
            [1, 2],
        )
    })

    await t.test('all match returns full container', () => {
        assert.deepEqual(
            takeWhile([1, 2, 3], () => true),
            [1, 2, 3],
        )
    })

    await t.test('none match returns empty', () => {
        assert.deepEqual(
            takeWhile([1, 2, 3], () => false),
            [],
        )
    })

    await t.test('preserves Set container', () => {
        const out = takeWhile(new Set([1, 2, 3, 1]), (v) => v < 3)
        assert.ok(out instanceof Set)
        assert.deepEqual([...out], [1, 2])
    })

    await t.test('preserves Map container', () => {
        const out = takeWhile(
            new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]),
            ([, v]) => v < 3,
        )
        assert.ok(out instanceof Map)
        assert.deepEqual(
            [...out.entries()],
            [
                ['a', 1],
                ['b', 2],
            ],
        )
    })

    await t.test('preserves Record container', () => {
        assert.deepEqual(
            takeWhile({ a: 1, b: 2, c: 3 }, ([, v]) => v < 3),
            { a: 1, b: 2 },
        )
    })

    await t.test('passes index', () => {
        assert.deepEqual(
            takeWhile([10, 20, 30, 40], (_v, i) => i < 2),
            [10, 20],
        )
    })

    await t.test('async predicate on sync iterable returns Promise', async () => {
        const result = takeWhile([1, 2, 3, 1], async (v) => v < 3)
        assert.ok(result instanceof Promise)
        assert.deepEqual(await result, [1, 2])
    })

    await t.test('async iterable', async () => {
        const out: number[] = []
        for await (const v of takeWhile(makeAsync([1, 2, 3, 1]), (v) => v < 3)) {
            out.push(v)
        }
        assert.deepEqual(out, [1, 2])
    })

    await t.test('async iterable with async predicate', async () => {
        const out: number[] = []
        for await (const v of takeWhile(
            makeAsync([1, 2, 3, 1]),
            async (v) => v < 3,
        )) {
            out.push(v)
        }
        assert.deepEqual(out, [1, 2])
    })
})

test('dropWhile', async (t) => {
    await t.test('types', () => {
        assertType<number[]>()(dropWhile([1, 2, 3], (v) => v < 3))
        assertType<Promise<number[]>>()(
            dropWhile([1, 2, 3], async (v) => v < 3),
        )
        assertType<Set<number>>()(
            dropWhile(new Set([1, 2, 3]), (v) => v < 3),
        )
        assertType<Map<string, number>>()(
            dropWhile(
                new Map<string, number>([['a', 1]]),
                ([, v]) => v < 5,
            ),
        )
        assertType<Partial<Record<'a' | 'b' | 'c', number>>>()(
            dropWhile({ a: 1, b: 2, c: 3 }, ([, v]) => v < 3),
        )
        assertType<AsyncIterable<number>>()(
            dropWhile(makeAsync([1, 2, 3]), (v) => v < 3),
        )
    })

    await t.test('drops leading elements (array)', () => {
        assert.deepEqual(
            dropWhile([1, 2, 3, 1, 0], (v) => v < 3),
            [3, 1, 0],
        )
    })

    await t.test('all match returns empty', () => {
        assert.deepEqual(
            dropWhile([1, 2, 3], () => true),
            [],
        )
    })

    await t.test('none match returns full container', () => {
        assert.deepEqual(
            dropWhile([1, 2, 3], () => false),
            [1, 2, 3],
        )
    })

    await t.test('preserves Record container', () => {
        assert.deepEqual(
            dropWhile({ a: 1, b: 2, c: 3 }, ([, v]) => v < 2),
            { b: 2, c: 3 },
        )
    })

    await t.test('preserves Map container', () => {
        const out = dropWhile(
            new Map([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ]),
            ([, v]) => v < 3,
        )
        assert.ok(out instanceof Map)
        assert.deepEqual([...out.entries()], [['c', 3]])
    })

    await t.test('async predicate on sync iterable returns Promise', async () => {
        const result = dropWhile([1, 2, 3, 1], async (v) => v < 3)
        assert.ok(result instanceof Promise)
        assert.deepEqual(await result, [3, 1])
    })

    await t.test('async iterable', async () => {
        const out: number[] = []
        for await (const v of dropWhile(makeAsync([1, 2, 3, 1]), (v) => v < 3)) {
            out.push(v)
        }
        assert.deepEqual(out, [3, 1])
    })
})

test('partition', async (t) => {
    await t.test('types', () => {
        assertType<[number[], number[]]>()(
            partition([1, 2, 3], (v) => v > 1),
        )
        assertType<Promise<[number[], number[]]>>()(
            partition([1, 2, 3], async (v) => v > 1),
        )
        assertType<[Set<number>, Set<number>]>()(
            partition(new Set([1, 2, 3]), (v) => v > 1),
        )
        assertType<[Map<string, number>, Map<string, number>]>()(
            partition(
                new Map<string, number>([['a', 1]]),
                ([, v]) => v > 0,
            ),
        )
        assertType<Promise<[number[], number[]]>>()(
            partition(makeAsync([1, 2, 3]), (v) => v > 1),
        )
    })

    await t.test('array → [matching, rest]', () => {
        assert.deepEqual(
            partition([1, 2, 3, 4], (v) => v % 2 === 0),
            [
                [2, 4],
                [1, 3],
            ],
        )
    })
    await t.test('set → two sets', () => {
        const [yes, no] = partition(new Set([1, 2, 3, 4]), (v) => v > 2)
        assert.ok(yes instanceof Set)
        assert.ok(no instanceof Set)
        assert.deepEqual([...yes], [3, 4])
        assert.deepEqual([...no], [1, 2])
    })
    await t.test('map → two maps', () => {
        const [yes, no] = partition(
            new Map([
                ['a', 1],
                ['b', 2],
            ]),
            ([, v]) => v > 1,
        )
        assert.ok(yes instanceof Map)
        assert.deepEqual([...yes.entries()], [['b', 2]])
        assert.deepEqual([...no.entries()], [['a', 1]])
    })
    await t.test('record → two records', () => {
        const [yes, no] = partition({ a: 1, b: 2, c: 3 }, ([, v]) => v > 1)
        assert.deepEqual(yes, { b: 2, c: 3 })
        assert.deepEqual(no, { a: 1 })
    })
    await t.test('async iterable returns Promise', async () => {
        async function* gen() {
            yield 1
            yield 2
            yield 3
        }
        const [yes, no] = await partition(gen(), (v) => v > 1)
        assert.deepEqual(yes, [2, 3])
        assert.deepEqual(no, [1])
    })
    await t.test('async predicate on array returns Promise', async () => {
        const result = partition([1, 2, 3], async (v) => v > 1)
        assert.ok(result instanceof Promise)
        const [yes, no] = await result
        assert.deepEqual(yes, [2, 3])
        assert.deepEqual(no, [1])
    })
})

test('zip', async (t) => {
    await t.test('types', () => {
        assertType<[number, string][]>()(zip([1, 2], ['a', 'b']))
        // Negative: tuple order matters
        // @ts-expect-error — actual is [number, string][], not [string, number][]
        assertType<[string, number][]>()(zip([1, 2], ['a', 'b']))
        assertType<[number, string, boolean][]>()(
            zip([1, 2], ['a', 'b'], [true, false]),
        )
        // Mixed sync/async → Promise
        assertType<Promise<[number, string][]>>()(
            zip([1, 2, 3], makeAsync(['a'])),
        )
    })

    await t.test('two arrays', () => {
        assert.deepEqual(zip([1, 2, 3], ['a', 'b', 'c']), [
            [1, 'a'],
            [2, 'b'],
            [3, 'c'],
        ])
    })
    await t.test('three iterables', () => {
        assert.deepEqual(zip([1, 2], ['a', 'b'], [true, false]), [
            [1, 'a', true],
            [2, 'b', false],
        ])
    })
    await t.test('stops at shortest', () => {
        assert.deepEqual(zip([1, 2, 3], ['a', 'b']), [
            [1, 'a'],
            [2, 'b'],
        ])
    })
    await t.test('empty input yields empty', () => {
        assert.deepEqual(zip([], [1, 2]), [])
    })
    await t.test('mixes Set/Iterable', () => {
        const customIter: Iterable<number> = {
            [Symbol.iterator]: function* () {
                yield 10
                yield 20
            },
        }
        assert.deepEqual(zip(new Set([1, 2]), customIter), [
            [1, 10],
            [2, 20],
        ])
    })
    await t.test('async iterable returns Promise', async () => {
        async function* gen() {
            yield 'a'
            yield 'b'
        }
        const result = zip([1, 2, 3], gen())
        assert.ok(result instanceof Promise)
        assert.deepEqual(await result, [
            [1, 'a'],
            [2, 'b'],
        ])
    })
})

test('non-iterable inputs throw', async (t) => {
    const bad = 42 as unknown as number[]

    await t.test('reduce throws', () => {
        assert.throws(() => reduce(bad, (a, b) => a + b, 0))
    })

    await t.test('flatMap throws', () => {
        assert.throws(() => flatMap(bad, (v) => [v]))
    })

    await t.test('filter throws', () => {
        assert.throws(() => filter(bad, () => true))
    })

    await t.test('forEach throws', () => {
        assert.throws(() => forEach(bad, () => {}))
    })

    await t.test('find throws', () => {
        assert.throws(() => find(bad, () => true))
    })

    await t.test('some throws', () => {
        assert.throws(() => some(bad, () => true))
    })

    await t.test('every throws', () => {
        assert.throws(() => every(bad, () => true))
    })

    await t.test('size throws', () => {
        assert.throws(() => size(bad))
    })

    await t.test('toArray throws', () => {
        assert.throws(() => toArray(bad))
    })
})

test('async no-match return paths', async (t) => {
    await t.test('find on async iterable returns undefined', async () => {
        assert.equal(
            await find(makeAsync([1, 2, 3]), (v) => v > 99),
            undefined,
        )
    })

    await t.test('some on async iterable returns false', async () => {
        assert.equal(
            await some(makeAsync([1, 2, 3]), (v) => v > 99),
            false,
        )
    })

    await t.test('every on async iterable returns true', async () => {
        assert.equal(
            await every(makeAsync([1, 2, 3]), (v) => v > 0),
            true,
        )
    })
})

test('promise support on sync iterables', async (t) => {
    await t.test('map array with async mapper returns Promise<R[]>', async () => {
        const result = map([1, 2, 3], async (v) => v * 2)
        assert.ok(result instanceof Promise)
        assert.deepEqual(await result, [2, 4, 6])
    })

    await t.test('map set with async mapper returns Promise<Set<R>>', async () => {
        const result = map(new Set([1, 2, 3]), async (v) => v * 2)
        assert.ok(result instanceof Promise)
        const out = await result
        assert.ok(out instanceof Set)
        assert.deepEqual([...out], [2, 4, 6])
    })

    await t.test('map map with async mapper returns Promise<Map>', async () => {
        const result = map(
            new Map([['a', 1]]),
            async ([k, v]) => [k.toUpperCase(), v * 2] as [string, number],
        )
        assert.ok(result instanceof Promise)
        const out = await result
        assert.ok(out instanceof Map)
        assert.deepEqual([...out.entries()], [['A', 2]])
    })

    await t.test('map record with async mapper returns Promise<Record>', async () => {
        const result = map({ a: 1 }, async ([k, v]) => [k, v * 2] as [string, number])
        assert.ok(result instanceof Promise)
        assert.deepEqual(await result, { a: 2 })
    })

    await t.test('flatMap with async mapper', async () => {
        const result = flatMap([1, 2], async (v) => [v, v + 10])
        assert.ok(result instanceof Promise)
        assert.deepEqual(await result, [1, 11, 2, 12])
    })

    await t.test('filter array with async predicate', async () => {
        const result = filter([1, 2, 3, 4], async (v) => v % 2 === 0)
        assert.ok(result instanceof Promise)
        assert.deepEqual(await result, [2, 4])
    })

    await t.test('filter set with async predicate', async () => {
        const result = filter(new Set([1, 2, 3]), async (v) => v > 1)
        const out = await result
        assert.ok(out instanceof Set)
        assert.deepEqual([...out], [2, 3])
    })

    await t.test('forEach array with async fn returns Promise<void>', async () => {
        const seen: number[] = []
        const result = forEach([1, 2, 3], async (v) => {
            seen.push(v)
        })
        assert.ok(result instanceof Promise)
        await result
        assert.deepEqual(seen, [1, 2, 3])
    })

    await t.test('forEach is sequential with async fn', async () => {
        const seen: number[] = []
        await forEach([1, 2, 3], async (v) => {
            await Promise.resolve()
            seen.push(v)
        })
        assert.deepEqual(seen, [1, 2, 3])
    })

    await t.test('find with async predicate', async () => {
        const result = find([1, 2, 3, 4], async (v) => v > 2)
        assert.ok(result instanceof Promise)
        assert.equal(await result, 3)
    })

    await t.test('find async returns undefined when no match', async () => {
        const result = find([1, 2, 3], async (v) => v > 99)
        assert.equal(await result, undefined)
    })

    await t.test('some with async predicate short-circuits', async () => {
        let count = 0
        const result = await some([1, 2, 3, 4], async (v) => {
            count++
            return v === 2
        })
        assert.equal(result, true)
        assert.equal(count, 2)
    })

    await t.test('every with async predicate', async () => {
        assert.equal(
            await every([2, 4, 6], async (v) => v % 2 === 0),
            true,
        )
        assert.equal(
            await every([2, 3, 4], async (v) => v % 2 === 0),
            false,
        )
    })
})

test('plain object branches for find/some/every', async (t) => {
    await t.test('find returns undefined when nothing matches record', () => {
        assert.equal(
            find({ a: 1, b: 2 }, ([, v]) => v > 99),
            undefined,
        )
    })

    await t.test('some returns false when nothing matches record', () => {
        assert.equal(
            some({ a: 1, b: 2 }, ([, v]) => v > 99),
            false,
        )
    })

    await t.test('every returns true when all match record', () => {
        assert.equal(
            every({ a: 1, b: 2 }, ([, v]) => v > 0),
            true,
        )
    })

    await t.test('every returns false when one fails record', () => {
        assert.equal(
            every({ a: 1, b: 2 }, ([, v]) => v > 1),
            false,
        )
    })
})

