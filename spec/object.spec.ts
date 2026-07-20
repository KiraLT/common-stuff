import assert from 'node:assert/strict'
import test from 'node:test'

import {
    camelCase,
    clone,
    convertToNested,
    filterRecord,
    flatMapRecord,
    getByKey,
    isEqual,
    mapRecord,
    merge,
    omit,
    pick,
} from '../src/index.ts'
import { assertType } from './_types.ts'

test('isEqual', async (t) => {
    await t.test('types', () => {
        // Inputs are `unknown` so accept anything; result is boolean
        assertType<boolean>()(isEqual(1, 1))
        assertType<boolean>()(isEqual({ a: 1 }, { a: 1 }))
    })

    await t.test('compares strings', () => {
        assert.equal(isEqual('aa', 'aa'), true)
        assert.equal(isEqual('aa', 'a'), false)
    })
    await t.test('compares numbers', () => {
        assert.equal(isEqual(1, 1), true)
        assert.equal(isEqual(1, -1), false)
    })
    await t.test('compares booleans', () => {
        assert.equal(isEqual(true, true), true)
        assert.equal(isEqual(true, false), false)
    })
    await t.test('compares dates', () => {
        assert.equal(isEqual(new Date('2019'), new Date('2019')), true)
        assert.equal(isEqual(new Date('2019'), new Date('2018')), false)
    })
    await t.test('compares arrays', () => {
        assert.equal(isEqual(['a', 9], ['a', 9]), true)
        assert.equal(isEqual([9, 'a'], [9, 'c']), false)
        assert.equal(isEqual([9, 'a'], [9]), false)
        assert.equal(isEqual([9], [9, 'a']), false)
    })
    await t.test('compares objects', () => {
        assert.equal(isEqual({ a: 9, b: 'b' }, { a: 9, b: 'b' }), true)
        assert.equal(isEqual({ a: 9, b: 'b' }, { a: 9, b: 'd' }), false)
        assert.equal(isEqual({ a: 9, b: 'b' }, { a: 9 }), false)
        assert.equal(isEqual({ a: 9, b: 'b' }, { b: 'b' }), false)
    })
    await t.test('compares nested', () => {
        assert.equal(
            isEqual(
                { a: [{ b: [9, 1] }, 3, { a: false }] },
                { a: [{ b: [9, 1] }, 3, { a: false }] },
            ),
            true,
        )
        assert.equal(
            isEqual(
                { a: [{ b: [9] }, 3, { a: false }] },
                { a: [{ b: [9, 1] }, 3, { a: false }] },
            ),
            false,
        )
    })

    await t.test('compares NaN as equal', () => {
        assert.equal(isEqual(Number.NaN, Number.NaN), true)
        assert.equal(isEqual({ a: Number.NaN }, { a: Number.NaN }), true)
        assert.equal(isEqual([Number.NaN, 1], [Number.NaN, 1]), true)
    })

    await t.test('NaN unequal to other numbers', () => {
        assert.equal(isEqual(Number.NaN, 1), false)
        assert.equal(isEqual(1, Number.NaN), false)
    })

    await t.test('compares RegExp by source and flags', () => {
        assert.equal(isEqual(/abc/g, /abc/g), true)
        assert.equal(isEqual(/abc/g, /abc/i), false)
        assert.equal(isEqual(/abc/, /abd/), false)
    })

    await t.test('compares Sets', () => {
        assert.equal(isEqual(new Set([1, 2, 3]), new Set([3, 2, 1])), true)
        assert.equal(isEqual(new Set([1, 2]), new Set([1, 2, 3])), false)
        assert.equal(isEqual(new Set([1, 2]), new Set([1, 3])), false)
    })

    await t.test('compares Sets with object members structurally', () => {
        assert.equal(isEqual(new Set([{ a: 1 }]), new Set([{ a: 1 }])), true)
        assert.equal(isEqual(new Set([{ a: 1 }]), new Set([{ a: 2 }])), false)
    })

    await t.test('compares Maps', () => {
        const a = new Map<string, number>([
            ['a', 1],
            ['b', 2],
        ])
        const b = new Map<string, number>([
            ['b', 2],
            ['a', 1],
        ])
        assert.equal(isEqual(a, b), true)
        assert.equal(isEqual(a, new Map<string, number>([['a', 1]])), false)
        assert.equal(
            isEqual(
                a,
                new Map<string, number>([
                    ['a', 1],
                    ['b', 9],
                ]),
            ),
            false,
        )
    })

    await t.test('compares Maps with object keys structurally', () => {
        assert.equal(
            isEqual(new Map([[{ id: 1 }, 'x']]), new Map([[{ id: 1 }, 'x']])),
            true,
        )
        assert.equal(
            isEqual(new Map([[{ id: 1 }, 'x']]), new Map([[{ id: 1 }, 'y']])),
            false,
        )
    })

    await t.test('different types are not equal', () => {
        assert.equal(isEqual([], {}), false)
        assert.equal(isEqual(new Set([1]), [1]), false)
        assert.equal(isEqual(new Map(), {}), false)
    })
})

test('mapRecord', async (t) => {
    await t.test('types', () => {
        // Deprecated wrapper; key/value remapping inferred from callback
        assertType<Record<string, 'a'>>()(
            mapRecord({ a: 'b' }, ([k, v]) => [v, k]),
        )
        // Entry param is inferred ([key, value])
        mapRecord({ a: 1 }, ([k, v]) => {
            assertType<'a'>()(k)
            assertType<number>()(v)
            return [k, v] as ['a', number]
        })
    })

    await t.test('swaps entries', () => {
        assert.deepEqual(
            mapRecord({ a: 'b' }, ([k, v]) => [v, k]),
            { b: 'a' },
        )
    })
})

test('flatMapRecord', async (t) => {
    await t.test('types', () => {
        // Keys/values inferred from callback's return tuples
        assertType<Record<'a', string>>()(
            flatMapRecord({ a: 'b' }, ([k, v]) => [[k, v]]),
        )
    })

    await t.test('create multiple items', () => {
        assert.deepEqual(
            flatMapRecord({ a: 'b' }, ([k, v]) => [
                [k, v],
                [`${k}2`, v],
            ]),
            { a: 'b', a2: 'b' },
        )
    })
    await t.test('filters items', () => {
        assert.deepEqual(
            flatMapRecord({ a: 'b', b: 'c' }, ([k, v]) =>
                k === 'a' ? [[k, v]] : [],
            ),
            { a: 'b' },
        )
    })
})

test('filterRecord', async (t) => {
    await t.test('types', () => {
        // Preserves key & value types
        assertType<Record<'a' | 'b', string>>()(
            filterRecord({ a: 'b', b: 'c' }, ([k]) => k === 'b'),
        )
    })

    await t.test('filters entries', () => {
        assert.deepEqual(
            filterRecord(
                { a: 'b', b: 'c' },
                ([k, v]) => k === 'b' && v === 'c',
            ),
            { b: 'c' },
        )
    })
})

test('merge', async (t) => {
    await t.test('types', () => {
        // Object merge: return type is `A & B`
        assertType<{ a: number } & { b: number }>()(merge({ a: 1 }, { b: 2 }))
        // Nested intersection (deep merge typing)
        assertType<{ a: { x: number } } & { a: { y: number } }>()(
            merge({ a: { x: 1 } }, { a: { y: 2 } }),
        )
        // Falls back to unknown when both inputs are unknown
        assertType<unknown>()(merge(1 as unknown, 2 as unknown))
        // Array overwrite (default) → source array (B)
        assertType<number[]>()(merge([1, 2], [3, 4]))
        // Array merge policy → (A[number] | B[number])[]
        assertType<(number | string)[]>()(
            merge([1, 2], ['a'], { arrayPolicy: 'merge' }),
        )
        // Custom array merge function → function's return type
        assertType<number[]>()(
            merge([1, 2], [3, 4], {
                arrayPolicy: (t, s) => (t as number[]).concat(s as number[]),
            }),
        )
    })

    await t.test('merges objects', () => {
        assert.deepEqual(merge({ a: 1 }, { b: 2 }), { a: 1, b: 2 })
    })
    await t.test('merges recursive objects', () => {
        assert.deepEqual(
            merge({ a: 1, c: { a: 1 } }, { a: { b: 2 }, b: 2, c: { b: 1 } }),
            { a: { b: 2 }, b: 2, c: { a: 1, b: 1 } },
        )
    })
    await t.test('overwrites arrays', () => {
        assert.deepEqual(merge({ a: [1, 2], b: 3 }, { a: [1] }), {
            a: [1],
            b: 3,
        })
    })
    await t.test('merges arrays', () => {
        assert.deepEqual(
            merge([1, 2], [3, 4], { arrayPolicy: 'merge' }),
            [1, 2, 3, 4],
        )
    })
    await t.test('supports custom array merge function', () => {
        assert.deepEqual(
            merge([1, 2], [3, 4], { arrayPolicy: (a, b) => b.concat(a) }),
            [3, 4, 1, 2],
        )
    })
    await t.test('skip nulls', () => {
        assert.deepEqual(merge({ a: 1 }, { a: null }, { skipNulls: true }), {
            a: 1,
        })
    })
    await t.test('skipNulls also skips undefined source values', () => {
        assert.deepEqual(
            merge({ a: 1, b: 2 }, { a: undefined, b: 3 }, { skipNulls: true }),
            { a: 1, b: 3 },
        )
    })
    await t.test('without skipNulls, null overwrites', () => {
        assert.deepEqual(merge({ a: 1 }, { a: null }), { a: null })
    })
    await t.test('non-objects: source wins', () => {
        assert.equal(merge(1 as unknown, 2 as unknown), 2)
    })
})

test('clone', async (t) => {
    await t.test('types', () => {
        // Preserves the source type
        assertType<{ a: number }>()(clone({ a: 1 }))
        assertType<number[]>()(clone([1, 2, 3]))
        assertType<Date>()(clone(new Date()))
        assertType<Set<number>>()(clone(new Set([1, 2])))
        assertType<Map<string, number>>()(
            clone(new Map<string, number>([['a', 1]])),
        )
    })

    await t.test('clones object', () => {
        const obj = { a: 1 }
        const objClone = clone(obj)
        objClone.a = 10
        assert.deepEqual(obj, { a: 1 })
    })
    await t.test('clones array', () => {
        const obj = [1, 2]
        const objClone = clone(obj)
        objClone.push(3)
        assert.deepEqual(obj, [1, 2])
    })
    await t.test('clones recursive object', () => {
        const obj = { a: { b: 1 } }
        const objClone = clone(obj)
        objClone.a.b = 10
        assert.deepEqual(obj, { a: { b: 1 } })
    })
    await t.test('clones recursive array', () => {
        const obj = [
            [1, 2],
            [3, 4],
        ]
        const objClone = clone(obj)
        objClone[0]?.push(3)
        assert.deepEqual(obj, [
            [1, 2],
            [3, 4],
        ])
    })
    await t.test('supports shallow clone', () => {
        const obj = { a: { b: 1 } }
        const objClone = clone(obj, false)
        objClone.a.b = 10
        assert.deepEqual(obj, { a: { b: 10 } })
    })
    await t.test('clones Date independently', () => {
        const original = new Date('2024-01-01T00:00:00Z')
        const copy = clone(original)
        assert.notEqual(copy, original)
        assert.equal(copy.getTime(), original.getTime())
    })
    await t.test('clones RegExp independently', () => {
        const original = /abc/gi
        const copy = clone(original)
        assert.notEqual(copy, original)
        assert.equal(copy.source, 'abc')
        assert.equal(copy.flags, 'gi')
    })
    await t.test('clones Set independently with deep values', () => {
        const inner = { a: 1 }
        const original = new Set([inner])
        const copy = clone(original)
        assert.notEqual(copy, original)
        const copiedInner = [...copy][0] as { a: number }
        assert.notEqual(copiedInner, inner)
        assert.deepEqual(copiedInner, { a: 1 })
    })
    await t.test('clones Map independently with deep values', () => {
        const original = new Map<string, { v: number }>([['k', { v: 1 }]])
        const copy = clone(original)
        assert.notEqual(copy, original)
        const innerOrig = original.get('k')
        const innerCopy = copy.get('k')
        assert.notEqual(innerCopy, innerOrig)
        assert.deepEqual(innerCopy, { v: 1 })
    })
})

test('convertToNested', async (t) => {
    await t.test('types', () => {
        // UX QUIRK: result type defaults to Record<string, unknown> because the
        // function can't statically infer the nested shape from runtime keys.
        // Caller must specify T to get a typed result.
        assertType<Record<string, unknown>>()(convertToNested({ 'a.b': 1 }))
        assertType<{ a: { b: number } }>()(
            convertToNested<{ a: { b: number } }>({ 'a.b': 1 }),
        )
    })

    await t.test('converts nested', () => {
        assert.deepEqual(
            convertToNested({
                'a.b': 1,
                'a.a': 2,
            }),
            {
                a: {
                    a: 2,
                    b: 1,
                },
            },
        )
    })
    await t.test('supports separator', () => {
        assert.deepEqual(
            convertToNested(
                {
                    a__b: 1,
                    a__a: 2,
                },
                { separator: '__' },
            ),
            {
                a: {
                    a: 2,
                    b: 1,
                },
            },
        )
    })
    await t.test('supports custom key transformation', () => {
        assert.deepEqual(
            convertToNested(
                {
                    CONFIG__PRIVATE_KEY: 'a',
                    CONFIG__PUBLIC_KEY: 'b',
                },
                { separator: '__', transformKey: camelCase },
            ),
            {
                config: {
                    privateKey: 'a',
                    publicKey: 'b',
                },
            },
        )
    })
    await t.test('parses JSON values', () => {
        assert.deepEqual(
            convertToNested({
                'a.b': '[1, 2, 3]',
                'a.a': `"abc"`,
                'a.c': '["1", "2", "3"]',
            }),
            {
                a: {
                    a: 'abc',
                    b: [1, 2, 3],
                    c: ['1', '2', '3'],
                },
            },
        )
    })
    await t.test('longer keys applied last', () => {
        assert.deepEqual(
            convertToNested({
                'a.b': 2,
                a: `{"b": 1}`,
            }),
            {
                a: {
                    b: 2,
                },
            },
        )
    })
    await t.test('ignore empty keys', () => {
        assert.deepEqual(
            convertToNested(
                {
                    NODE_ENV: 'development',
                    _: 'test',
                },
                {
                    separator: '__',
                    transformKey: camelCase,
                },
            ),
            {
                nodeEnv: 'development',
            },
        )
    })
})

test('getByKey', async (t) => {
    await t.test('types', () => {
        // String literal paths are walked at the type level
        assertType<number>()(getByKey({ a: 1 }, 'a'))
        assertType<string>()(getByKey({ a: { b: 'x' } }, 'a.b'))
        // Tuple paths (via `as const`) work the same way
        assertType<string>()(getByKey({ a: { b: 'x' } }, ['a', 'b'] as const))
        // Numeric path segments index arrays/tuples
        const data = { a: [1, 2, { b: 'x' as string }] as const }
        assertType<string>()(getByKey(data, 'a.2.b'))
        // Unknown segments yield `undefined`
        assertType<undefined>()(getByKey({ a: 1 }, 'missing'))
        // Dynamic string path → unknown (caller may pass explicit T)
        const dynamicPath: string = 'a'
        assertType<unknown>()(getByKey({ a: 1 }, dynamicPath))
        assertType<number>()(getByKey<number>({ a: 1 }, dynamicPath))
        // Non-tuple array path also falls back to unknown
        const dynamicArr: string[] = ['a']
        assertType<unknown>()(getByKey({ a: 1 }, dynamicArr))

        // Negative assertions
        // @ts-expect-error — wrong leaf type
        assertType<string>()(getByKey({ a: 1 }, 'a'))
        // @ts-expect-error — missing key narrows to undefined, not number
        assertType<number>()(getByKey({ a: 1 }, 'missing'))
    })

    await t.test('gets value by string key', () => {
        assert.equal(getByKey({ a: { b: [1, { a: 10 }] } }, 'a.b.1.a'), 10)
    })
    await t.test('gets string value by key path list', () => {
        assert.equal(
            getByKey({ a: { b: [1, { a: 10 }] } }, ['a', 'b', 1, 'a']),
            10,
        )
    })
    await t.test('gets unknown property', () => {
        assert.equal(getByKey(new Date(), ['a', 'b', 1, 'a']), undefined)
    })
    await t.test('returns undefined when getting list property', () => {
        assert.equal(getByKey([1, 2, 3], 'length'), undefined)
    })
    await t.test('empty key path returns target as-is', () => {
        const t = { a: 1 }
        assert.equal(getByKey(t, []), t)
    })
    await t.test('non-numeric index on array returns undefined', () => {
        assert.equal(getByKey([1, 2, 3], 'foo'), undefined)
    })
    await t.test('missing key returns undefined', () => {
        assert.equal(getByKey({ a: { b: 1 } }, 'a.c'), undefined)
    })
})

test('pick', async (t) => {
    await t.test('types', () => {
        assertType<{ a: number; c: number }>()(
            pick({ a: 1, b: 2, c: 3 }, ['a', 'c']),
        )
        // @ts-expect-error — 'd' is not a key of the source object
        pick({ a: 1, b: 2 }, ['d'])
    })

    await t.test('returns selected keys only', () => {
        assert.deepEqual(pick({ a: 1, b: 2, c: 3 }, ['a', 'c']), {
            a: 1,
            c: 3,
        })
    })

    await t.test(
        'skips missing keys (does not introduce undefined props)',
        () => {
            // Cast to allow asking for a key that's typed-but-missing
            const obj: { a?: number; b: number } = { b: 2 }
            const out = pick(obj, ['a', 'b'])
            assert.deepEqual(out, { b: 2 })
            assert.ok(!('a' in out))
        },
    )

    await t.test('empty keys list yields empty object', () => {
        assert.deepEqual(pick({ a: 1 }, []), {})
    })
})

test('omit', async (t) => {
    await t.test('types', () => {
        assertType<{ a: number; c: number }>()(
            omit({ a: 1, b: 2, c: 3 }, ['b']),
        )
        // @ts-expect-error — 'z' is not a key of the source object
        omit({ a: 1 }, ['z'])
    })

    await t.test('removes the listed keys', () => {
        assert.deepEqual(omit({ a: 1, b: 2, c: 3 }, ['b']), { a: 1, c: 3 })
    })

    await t.test('empty keys list returns a copy', () => {
        const src = { a: 1, b: 2 }
        const out = omit(src, [])
        assert.deepEqual(out, src)
        assert.notEqual(out, src)
    })

    await t.test('removing all keys yields empty object', () => {
        assert.deepEqual(omit({ a: 1, b: 2 }, ['a', 'b']), {})
    })
})
