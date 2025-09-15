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
} from '../src/index.ts'

test('isEqual', async (t) => {
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
})

test('mapRecord', async (t) => {
    await t.test('swaps entries', () => {
        assert.deepEqual(
            mapRecord({ a: 'b' }, ([k, v]) => [v, k]),
            { b: 'a' },
        )
    })
})

test('flatMapRecord', async (t) => {
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
})

test('clone', async (t) => {
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
})

test('convertToNested', async (t) => {
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
})
