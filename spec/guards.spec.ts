import {
    isPlainObject,
    isArray,
    isBoolean,
    isNumber,
    isString,
    notNullOrUndefined,
} from '../src'

describe('isPlainObject', () => {
    it('checks if is plain object', () => {
        expect(isPlainObject({ a: 1 })).toBeTruthy()
        expect(isPlainObject('a')).toBeFalsy()
        expect(isPlainObject(1)).toBeFalsy()
        expect(isPlainObject(new Boolean(false))).toBeFalsy()
        expect(isPlainObject(new Date())).toBeFalsy()
        expect(isPlainObject([])).toBeFalsy()
        expect(isPlainObject(null)).toBeFalsy()
        expect(isPlainObject(undefined)).toBeFalsy()
    })
})

describe('isArray', () => {
    it('checks if is array', () => {
        expect(isArray(['a'])).toBeTruthy()
        expect(isArray('a')).toBeFalsy()
        expect(isArray({})).toBeFalsy()
    })
})

describe('isBoolean', () => {
    it('checks if is boolean', () => {
        expect(isBoolean(true)).toBeTruthy()
        expect(isBoolean(false)).toBeTruthy()
        expect(isBoolean('a')).toBeFalsy()
        expect(isBoolean({})).toBeFalsy()
    })
})

describe('isNumber', () => {
    it('checks if is number', () => {
        expect(isNumber(1)).toBeTruthy()
        expect(isNumber(15.59)).toBeTruthy()
        expect(isNumber('1')).toBeFalsy()
        expect(isNumber(new Date())).toBeFalsy()
    })
})

describe('isString', () => {
    it('checks if is string', () => {
        expect(isString('aa')).toBeTruthy()
        expect(isString(String(1))).toBeTruthy()
        expect(isString(['a'])).toBeFalsy()
        expect(isString(1)).toBeFalsy()
        expect(isString(new Date())).toBeFalsy()
    })
})

describe('notNullOrUndefined', () => {
    it('checks if is array', () => {
        expect(notNullOrUndefined('')).toBeTruthy()
        expect(notNullOrUndefined(0)).toBeTruthy()
        expect(notNullOrUndefined(null)).toBeFalsy()
        expect(notNullOrUndefined(undefined)).toBeFalsy()
    })
})
