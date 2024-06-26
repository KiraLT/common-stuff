import {
    isEqual,
    mapRecord,
    flatMapRecord,
    filterRecord,
    merge,
    convertToNested,
    camelCase,
    clone,
    getByKey,
} from '../src'

describe('isEqual', () => {
    it('compares strings', () => {
        expect(isEqual('aa', 'aa')).toBeTruthy()
        expect(isEqual('aa', 'a')).toBeFalsy()
    })

    it('compares numbers', () => {
        expect(isEqual(1, 1)).toBeTruthy()
        expect(isEqual(1, -1)).toBeFalsy()
    })

    it('compares booleans', () => {
        expect(isEqual(true, true)).toBeTruthy()
        expect(isEqual(true, false)).toBeFalsy()
    })

    it('compares dates', () => {
        expect(isEqual(new Date('2019'), new Date('2019'))).toBeTruthy()
        expect(isEqual(new Date('2019'), new Date('2018'))).toBeFalsy()
    })

    it('compares arrays', () => {
        expect(isEqual(['a', 9], ['a', 9])).toBeTruthy()
        expect(isEqual([9, 'a'], [9, 'c'])).toBeFalsy()
        expect(isEqual([9, 'a'], [9])).toBeFalsy()
        expect(isEqual([9], [9, 'a'])).toBeFalsy()
    })

    it('compares objects', () => {
        expect(isEqual({ a: 9, b: 'b' }, { a: 9, b: 'b' })).toBeTruthy()
        expect(isEqual({ a: 9, b: 'b' }, { a: 9, b: 'd' })).toBeFalsy()
        expect(isEqual({ a: 9, b: 'b' }, { a: 9 })).toBeFalsy()
        expect(isEqual({ a: 9, b: 'b' }, { b: 'b' })).toBeFalsy()
    })

    it('compares nested', () => {
        expect(
            isEqual(
                { a: [{ b: [9, 1] }, 3, { a: false }] },
                { a: [{ b: [9, 1] }, 3, { a: false }] },
            ),
        ).toBeTruthy()
        expect(
            isEqual(
                { a: [{ b: [9] }, 3, { a: false }] },
                { a: [{ b: [9, 1] }, 3, { a: false }] },
            ),
        ).toBeFalsy()
    })
})

describe('mapRecord', () => {
    it('swaps entries', () => {
        expect(mapRecord({ a: 'b' }, ([k, v]) => [v, k])).toEqual({ b: 'a' })
    })
})

describe('flatMapRecord', () => {
    it('create multiple items', () => {
        expect(
            flatMapRecord({ a: 'b' }, ([k, v]) => [
                [k, v],
                [`${k}2`, v],
            ]),
        ).toEqual({ a: 'b', a2: 'b' })
    })

    it('filters items', () => {
        expect(
            flatMapRecord({ a: 'b', b: 'c' }, ([k, v]) =>
                k === 'a' ? [[k, v]] : [],
            ),
        ).toEqual({ a: 'b' })
    })
})

describe('filterRecord', () => {
    it('filters entries', () => {
        expect(
            filterRecord(
                { a: 'b', b: 'c' },
                ([k, v]) => k === 'b' && v === 'c',
            ),
        ).toEqual({ b: 'c' })
    })
})

describe('merge', () => {
    it('merges objects', () => {
        expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
    })

    it('merges recursive objects', () => {
        expect(
            merge({ a: 1, c: { a: 1 } }, { a: { b: 2 }, b: 2, c: { b: 1 } }),
        ).toEqual({ a: { b: 2 }, b: 2, c: { a: 1, b: 1 } })
    })

    it('overwrites arrays', () => {
        expect(merge({ a: [1, 2], b: 3 }, { a: [1] })).toEqual({ a: [1], b: 3 })
    })

    it('merges arrays', () => {
        expect(merge([1, 2], [3, 4], { arrayPolicy: 'merge' })).toEqual([
            1, 2, 3, 4,
        ])
    })

    it('supports custom array merge function', () => {
        expect(
            merge([1, 2], [3, 4], { arrayPolicy: (a, b) => b.concat(a) }),
        ).toEqual([3, 4, 1, 2])
    })

    it('skip nulls', () => {
        expect(merge({ a: 1 }, { a: null }, { skipNulls: true })).toEqual({
            a: 1,
        })
    })
})

describe('clone', () => {
    it('clones object', () => {
        const obj = { a: 1 }

        const objClone = clone(obj)
        objClone.a = 10

        expect(obj).toEqual({ a: 1 })
    })

    it('clones array', () => {
        const obj = [1, 2]

        const objClone = clone(obj)
        objClone.push(3)

        expect(obj).toEqual([1, 2])
    })

    it('clones recursive object', () => {
        const obj = { a: { b: 1 } }

        const objClone = clone(obj)
        objClone.a.b = 10

        expect(obj).toEqual({ a: { b: 1 } })
    })

    it('clones recursive array', () => {
        const obj = [
            [1, 2],
            [3, 4],
        ]

        const objClone = clone(obj)
        objClone[0]?.push(3)

        expect(obj).toEqual([
            [1, 2],
            [3, 4],
        ])
    })

    it('supports shallow clone', () => {
        const obj = { a: { b: 1 } }

        const objClone = clone(obj, false)
        objClone.a.b = 10

        expect(obj).toEqual({ a: { b: 10 } })
    })
})

describe('convertToNested', () => {
    it('converts nested', () => {
        expect(
            convertToNested({
                'a.b': 1,
                'a.a': 2,
            }),
        ).toEqual({
            a: {
                a: 2,
                b: 1,
            },
        })
    })

    it('supports separator', () => {
        expect(
            convertToNested(
                {
                    a__b: 1,
                    a__a: 2,
                },
                { separator: '__' },
            ),
        ).toEqual({
            a: {
                a: 2,
                b: 1,
            },
        })
    })

    it('supports custom key transformation', () => {
        expect(
            convertToNested(
                {
                    CONFIG__PRIVATE_KEY: 'a',
                    CONFIG__PUBLIC_KEY: 'b',
                },
                { separator: '__', transformKey: camelCase },
            ),
        ).toEqual({
            config: {
                privateKey: 'a',
                publicKey: 'b',
            },
        })
    })

    it('parses JSON values', () => {
        expect(
            convertToNested({
                'a.b': '[1, 2, 3]',
                'a.a': `"abc"`,
                'a.c': '["1", "2", "3"]',
            }),
        ).toEqual({
            a: {
                a: 'abc',
                b: [1, 2, 3],
                c: ['1', '2', '3'],
            },
        })
    })

    it('longer keys applied last', () => {
        expect(
            convertToNested({
                'a.b': 2,
                a: `{"b": 1}`,
            }),
        ).toEqual({
            a: {
                b: 2,
            },
        })
    })

    it('ignore empty keys', () => {
        expect(
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
        ).toEqual({
            nodeEnv: 'development',
        })
    })
})

describe('getByKey', () => {
    it('gets value by string key', () => {
        expect(getByKey({ a: { b: [1, { a: 10 }] } }, 'a.b.1.a')).toBe(10)
    })

    it('gets string value by key path list', () => {
        expect(getByKey({ a: { b: [1, { a: 10 }] } }, ['a', 'b', 1, 'a'])).toBe(
            10,
        )
    })

    it('gets unknown property', () => {
        expect(getByKey(new Date(), ['a', 'b', 1, 'a'])).toBeUndefined()
    })

    it('returns undefined when getting list property', () => {
        expect(getByKey([1, 2, 3], 'length')).toBeUndefined()
    })
})
