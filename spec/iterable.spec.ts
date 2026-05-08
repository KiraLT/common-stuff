import assert from 'node:assert/strict'
import test from 'node:test'

import {
    every,
    filter,
    find,
    flatMap,
    forEach,
    map,
    reduce,
    size,
    some,
    toArray,
} from '../src/index.ts'

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
