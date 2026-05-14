import assert from 'node:assert/strict'
import test from 'node:test'

import {
    assertNotError,
    ensureArray,
    ensureError,
    hasKeys,
    isArray,
    isAsyncIterable,
    isBoolean,
    isDate,
    isEmpty,
    isError,
    isFunction,
    isInteger,
    isIterable,
    isMap,
    isNot,
    isNull,
    isNullOrUndefined,
    isNumber,
    isPlainObject,
    isPromise,
    isRegExp,
    isSet,
    isString,
    isUndefined,
    toAsyncIterable,
} from '../src/index.ts'

test('isPlainObject', async (t) => {
    await t.test('checks if is plain object', () => {
        assert.equal(isPlainObject({ a: 1 }), true)
        assert.equal(isPlainObject({}), true)
        assert.equal(isPlainObject({ a: [1, {}] }), true)
        assert.equal(isPlainObject('a' as unknown), false)
        assert.equal(isPlainObject(1 as unknown), false)
        assert.equal(isPlainObject(new Boolean(false) as unknown), false)
        assert.equal(isPlainObject(new Date() as unknown), false)
        assert.equal(isPlainObject([] as unknown), false)
        assert.equal(isPlainObject(null as unknown), false)
        assert.equal(isPlainObject(undefined as unknown), false)
        assert.equal(isPlainObject(new (class A {})() as unknown), false)
    })
    await t.test('handles Object.create(null) without throwing', () => {
        assert.equal(isPlainObject(Object.create(null) as unknown), true)
    })
    await t.test('rejects Map and Set', () => {
        assert.equal(isPlainObject(new Map() as unknown), false)
        assert.equal(isPlainObject(new Set() as unknown), false)
    })
})

test('isArray', async (t) => {
    await t.test('checks if is array', () => {
        assert.equal(isArray(['a']), true)
        assert.equal(isArray('a' as unknown), false)
        assert.equal(isArray({} as unknown), false)
    })
})

test('isBoolean', async (t) => {
    await t.test('checks if is boolean', () => {
        assert.equal(isBoolean(true), true)
        assert.equal(isBoolean(false), true)
        assert.equal(isBoolean('a' as unknown), false)
        assert.equal(isBoolean({} as unknown), false)
    })
})

test('isNumber', async (t) => {
    await t.test('checks if is number', () => {
        assert.equal(isNumber(1), true)
        assert.equal(isNumber(15.59), true)
        assert.equal(isNumber('1' as unknown), false)
        assert.equal(isNumber(new Date() as unknown), false)
    })
})

test('isString', async (t) => {
    await t.test('checks if is string', () => {
        assert.equal(isString('aa'), true)
        assert.equal(isString(String(1)), true)
        assert.equal(isString(['a'] as unknown), false)
        assert.equal(isString(1 as unknown), false)
        assert.equal(isString(new Date() as unknown), false)
    })
})

test('isError', async (t) => {
    await t.test('checks if is error', () => {
        assert.equal(isError(new Error('abc')), true)
        assert.equal(isError(new Object('abc') as unknown), false)
    })
    await t.test('supports negative filtering', () => {
        const err = new Error('ab')
        assert.deepEqual(['a', 'b', err].filter(isNot(isError)), ['a', 'b'])
    })
})

test('isNull', async (t) => {
    await t.test('checks if is null', () => {
        assert.equal(isNull(null), true)
        assert.equal(isNull(undefined as unknown), false)
    })
})

test('isUndefined', async (t) => {
    await t.test('checks if is undefined', () => {
        assert.equal(isUndefined(undefined), true)
        assert.equal(isUndefined(null as unknown), false)
    })
})

test('isNullOrUndefined', async (t) => {
    await t.test('checks if is null or undefined', () => {
        assert.equal(isNullOrUndefined(undefined), true)
        assert.equal(isNullOrUndefined(null), true)
        assert.equal(isNullOrUndefined('' as unknown), false)
    })
})

test('isEmpty', async (t) => {
    await t.test('null and undefined are empty', () => {
        assert.equal(isEmpty(null), true)
        assert.equal(isEmpty(undefined), true)
    })
    await t.test('Set and Map use .size', () => {
        assert.equal(isEmpty(new Set()), true)
        assert.equal(isEmpty(new Set([1])), false)
        assert.equal(isEmpty(new Map()), true)
        assert.equal(isEmpty(new Map([['a', 1]])), false)
    })
    await t.test('supports boolean', () => {
        assert.equal(isEmpty(false), true)
        assert.equal(isEmpty(true), false)
    })
    await t.test('supports string', () => {
        assert.equal(isEmpty(''), true)
        assert.equal(isEmpty(' '), false)
    })
    await t.test('supports number', () => {
        assert.equal(isEmpty(0), true)
        assert.equal(isEmpty(-1 as unknown), false)
    })
    await t.test('supports array', () => {
        assert.equal(isEmpty([]), true)
        assert.equal(isEmpty([1]), false)
    })
    await t.test('supports object', () => {
        assert.equal(isEmpty({}), true)
        assert.equal(isEmpty({ a: 1 }), false)
    })
    await t.test('supports other', () => {
        assert.equal(isEmpty(new Date() as unknown), false)
    })
})

test('ensureArray', async (t) => {
    await t.test('returns original value if array', () => {
        const value = [1]
        assert.equal(ensureArray(value), value)
    })
    await t.test('wraps to array if value is not an array', () => {
        assert.deepEqual(ensureArray(1), [1])
    })
})

test('ensureError', async (t) => {
    await t.test('returns original value if error', () => {
        const value = new Error()
        assert.equal(ensureError(value), value)
    })
    await t.test('wraps to error if value is not an error', () => {
        assert.ok(ensureError('a') instanceof Error)
    })
})

test('hasKeys', async (t) => {
    await t.test('checks object keys', () => {
        assert.equal(hasKeys({ a: 1, b: 1 }, ['a', 'b']), true)
        assert.equal(hasKeys({ a: 1, b: 1 }, ['c', 'b']), false)
    })
    await t.test('Supports object', () => {
        const a = { a: 1, b: 1 }
        if (hasKeys(a, ['a', 'b'])) {
            assert.equal(a.a.toFixed(1), a.b.toFixed(1))
        }
    })
    await t.test('Supports unknown', () => {
        const a = { a: 1, b: 1 } as unknown
        if (hasKeys(a, ['a', 'b'])) {
            const aObj = a as { a: number; b: number }
            assert.equal(aObj.a, aObj.b)
            assert.equal(aObj.a.toFixed(1), '1.0')
        }
    })
    await t.test('Supports unions', () => {
        const a = { a: 1, b: 1 } as { a: number } | { b: number }
        if (hasKeys(a, ['a'])) {
            assert.equal(a.a.toFixed(1), '1.0')
        }
    })
})

test('assertNotError', async (t) => {
    await t.test('returns original value if not error', () => {
        const value = new Object()
        assert.equal(assertNotError(value), value)
    })
    await t.test('throws value if error', () => {
        assert.throws(() => assertNotError(new Error('abc')), /abc/)
    })
})

test('isSet', async (t) => {
    await t.test('checks if is Set', () => {
        assert.equal(isSet(new Set([1, 2])), true)
        assert.equal(isSet([1, 2] as unknown), false)
        assert.equal(isSet(null as unknown), false)
    })
})

test('isMap', async (t) => {
    await t.test('checks if is Map', () => {
        assert.equal(isMap(new Map()), true)
        assert.equal(isMap({} as unknown), false)
        assert.equal(isMap(null as unknown), false)
    })
})

test('isPromise', async (t) => {
    await t.test('checks if is Promise', () => {
        assert.equal(isPromise(Promise.resolve(5)), true)
        assert.equal(isPromise(5 as unknown as Promise<number>), false)
        assert.equal(isPromise({} as unknown as Promise<unknown>), false)
    })
    await t.test('rejects thenable that is not a real Promise', () => {
        // biome-ignore lint/suspicious/noThenProperty: deliberate thenable for guard test
        const thenable = { then() {} }
        assert.equal(
            isPromise(thenable as unknown as Promise<unknown>),
            false,
        )
    })
})

test('isIterable', async (t) => {
    await t.test('checks if is iterable', () => {
        assert.equal(isIterable([1, 2, 3]), true)
        assert.equal(isIterable(new Set([1])), true)
        assert.equal(isIterable('abc'), true)
        assert.equal(isIterable({} as unknown), false)
        assert.equal(isIterable(null as unknown), false)
        assert.equal(isIterable(42 as unknown), false)
    })
})

test('isAsyncIterable', async (t) => {
    await t.test('checks if is async iterable', () => {
        async function* gen() {
            yield 1
        }
        assert.equal(isAsyncIterable(gen()), true)
        assert.equal(isAsyncIterable([1, 2, 3] as unknown), false)
        assert.equal(isAsyncIterable(null as unknown), false)
    })
})

test('toAsyncIterable', async (t) => {
    await t.test('wraps iterable as async iterable', async () => {
        const out: number[] = []
        for await (const v of toAsyncIterable([1, 2, 3])) {
            out.push(v)
        }
        assert.deepEqual(out, [1, 2, 3])
    })
})

test('isFunction', async (t) => {
    await t.test('checks if is function', () => {
        assert.equal(isFunction(() => 1), true)
        // biome-ignore lint/complexity/useArrowFunction: testing recognition of `function` expressions
        assert.equal(isFunction(function () {}), true)
        assert.equal(isFunction(class {}), true)
        assert.equal(isFunction('fn' as unknown), false)
        assert.equal(isFunction(null as unknown), false)
    })
})

test('isDate', async (t) => {
    await t.test('checks if is Date', () => {
        assert.equal(isDate(new Date()), true)
        assert.equal(isDate(new Date('invalid')), true) // still a Date instance
        assert.equal(isDate(Date.now() as unknown), false)
        assert.equal(isDate('2024' as unknown), false)
    })
})

test('isRegExp', async (t) => {
    await t.test('checks if is RegExp', () => {
        assert.equal(isRegExp(/abc/), true)
        assert.equal(isRegExp('/abc/' as unknown), false)
    })
})

test('isInteger', async (t) => {
    await t.test('checks if is integer', () => {
        assert.equal(isInteger(0), true)
        assert.equal(isInteger(-7), true)
        assert.equal(isInteger(1.5), false)
        assert.equal(isInteger(Number.NaN), false)
        assert.equal(isInteger(Number.POSITIVE_INFINITY), false)
        assert.equal(isInteger('1' as unknown), false)
    })
})

