/**
 * Checks if value is `number`, acts as a typescript safeguard.
 *
 * @example
 * ```
 * [1, 'b', 2].filter(isNumber)
 * > [1, 2]
 * ```
 * @group Guard
 */
export function isNumber<T>(value: T | number): value is number {
    return typeof value === 'number'
}

/**
 * Checks if value is `boolean`, acts as a typescript safeguard.
 *
 * @example
 * ```
 * [true, 'b', false].filter(isBoolean)
 * > [true, false]
 * ```
 * @group Guard
 */
export function isBoolean<T>(value: T | boolean): value is boolean {
    return typeof value === 'boolean'
}

/**
 * Checks if value is `string`, acts as a typescript safeguard.
 *
 * @example
 * ```
 * [1, 'b', false].filter(isString)
 * > ['b']
 * ```
 * @group Guard
 */
export function isString<T>(value: T | string): value is string {
    return typeof value === 'string'
}

/**
 * Checks if value is `array`, acts as a typescript safeguard.
 *
 * @example
 * ```
 * [[1], ['b'], false].filter(isArray)
 * > [[1], ['b']]
 * ```
 * @group Guard
 */
export function isArray<T>(
    value: T | Array<T> | ReadonlyArray<T>,
): value is Array<T> {
    return value instanceof Array
}

/**
 * Checks if value is instance of `Error`, acts as a typescript safeguard.
 *
 * @example
 * ```
 * [new Error('error'), 1, 5].filter(isError)
 * > [new Error('error')]
 *
 * [new Error('error'), 1, 5].filter(isNot(isError))
 * > [1, 5]
 * ```
 * @group Guard
 */
export function isError<T>(data: T | Error): data is Error {
    return data instanceof Error
}

/**
 * Checks if value is `undefined`, acts as a typescript safeguard.
 *
 * @example
 * ```
 * [null, undefined, 1, 5].filter(isUndefined)
 * > [undefined]
 *
 * [null, undefined, 1, 5].filter(isNot(isUndefined))
 * > [null, 1, 5]
 * ```
 * @group Guard
 */
export function isUndefined<T>(value: T | undefined): value is undefined {
    return value === undefined
}

/**
 * Checks if value is `null`, acts as a typescript safeguard.
 *
 * @example
 * ```
 * [null, undefined, 1, 5].filter(isUndefined)
 * > [undefined]
 *
 * [null, undefined, 1, 5].filter(isNot(isUndefined))
 * > [null, 1, 5]
 * ```
 * @group Guard
 */
export function isNull<T>(value: T | null): value is null {
    return value === null
}

/**
 * Checks if value is not `null` or `undefined`, acts as a typescript safeguard.
 *
 * @example
 * ```
 * [null, undefined, 1, 5].filter(isUndefined)
 * > [null, undefined]
 *
 * [null, undefined, 1, 5].filter(isNot(isUndefined))
 * > [1, 5]
 * ```
 * @group Guard
 */
export function isNullOrUndefined<T>(
    value: T | null | undefined,
): value is null | undefined {
    return value == null
}

/**
 * Checks if the value is an empty.
 *
 * Supports following types:
 * * Object - `false` if object is empty
 * * Array - `false` if array is empty
 * * Boolean - `false` if boolean is `false`
 * * Number - `false` if string is `''`
 * * Number - `false` if number is `0`
 *
 * @group Guard
 */
export function isEmpty<T>(value: T): boolean {
    if (value == null) {
        return false
    }

    if (typeof value === 'boolean') {
        return value === false
    }

    if (typeof value === 'string') {
        return value === ''
    }

    if (typeof value === 'number') {
        return value === 0
    }

    if (value instanceof Array) {
        return value.length === 0
    }

    if (isPlainObject(value)) {
        return Object.keys(value).length === 0
    }

    return false
}

/**
 * Inverse guard
 *
 * @example
 * ```
 * [new Error('Error'), 1, 2].filter(isNot(isError))
 * // [1, 2]
 * ```
 * @param guard - guard function
 * @group Guard
 */
export function isNot<T, S extends T>(
    guard: (data: T) => data is S,
): (data: T) => data is Exclude<T, S> {
    return (data: T): data is Exclude<T, S> => !guard(data)
}

/**
 * Checks if value is plain object, acts as a typescript safeguard.
 *
 * @example
 * ```
 * isPlainObject({a: 1})
 * // true
 *
 * isPlainObject([1])
 * // false
 * ```
 * @group Guard
 */
export function isPlainObject<T = Record<string | number | symbol, unknown>>(
    value: unknown,
): value is T {
    const isObject = (v: unknown): v is object =>
        String(v) === '[object Object]'

    if (!isObject(value)) return false

    const constructor = value.constructor
    if (constructor === undefined) return true

    const prototype = constructor.prototype
    if (!isObject(prototype)) return false

    // Checks if it is not a class
    if (!prototype.hasOwnProperty('isPrototypeOf')) {
        return false
    }

    return true
}

/**
 * Checks if given value is `Error` if it's subclass and then throw it.
 *
 * @example
 * ```
 * const value = new Error()
 * const value2 = assertNotError(value)
 * // throws error
 * ```
 * @group Guard
 * @param value any value
 * @returns `value` if it is not an instance of `Error`
 * @throws `value` if it is an instance of `Error`
 */
export function assertNotError<T>(value: Error | T): T {
    if (value instanceof Error) {
        throw value
    }
    return value
}

/**
 * Returns original value if it is array or wraps it to array.
 *
 * @example
 * ```
 * ensureArray('hello')
 * // ['hello']
 * ensureArray(['hello'])
 * // ['hello']
 * ```
 * @group Guard
 */
export function ensureArray<T>(value: T | T[]): T[]
export function ensureArray<T>(value: T | ReadonlyArray<T>): ReadonlyArray<T>
export function ensureArray<T>(value: T | readonly T[]): ReadonlyArray<T> {
    return value instanceof Array ? value : [value]
}

/**
 * Returns `value` if it is instance of error otherwise wraps `value` to new `Error` instance.
 *
 * @param value `Error` or other value
 * @returns `value` if it instance of error `Error` otherwise wraps `value` to new `Error` instance
 * @group Guard
 */
export function ensureError(value: unknown): Error {
    if (value instanceof Error) {
        return value
    }
    return new Error(String(value))
}

/**
 * Checks if unknown object have provided keys.
 *
 * @example
 * ```
 * if (hasKeys(value, ['a', 'b'])) {
 *     console.log(value.a, value.b)
 * }
 * ```
 * @group Guard
 */
export function hasKeys<
    T extends unknown,
    Key extends string | number | symbol,
>(
    obj: T,
    keys: ReadonlyArray<Key>,
): obj is T extends { [K in Key]: any }
    ? Extract<{ [K in Key]: any }, T>
    : Extract<{ [K in Key]: unknown }, T> {
    if (isPlainObject(obj) && keys.every((v) => v in obj)) {
        return true
    }

    return false
}
