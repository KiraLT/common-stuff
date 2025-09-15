import assert from 'node:assert/strict'
import test from 'node:test'

import {
    assertNotError,
    ensureArray,
    ensureError,
    hasKeys,
    isArray,
    isBoolean,
    isEmpty,
    isError,
    isNot,
    isNull,
    isNullOrUndefined,
    isNumber,
    isPlainObject,
    isString,
    isUndefined,
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
    await t.test('supports null and undefined', () => {
        assert.equal(isEmpty(null), false)
        assert.equal(isEmpty(undefined), false)
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
