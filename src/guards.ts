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
 * Preserves the readonly/mutable distinction of the narrowed type.
 *
 * @example
 * ```
 * [[1], ['b'], false].filter(isArray)
 * > [[1], ['b']]
 * ```
 * @group Guard
 */
export function isArray<T>(value: T | Array<T>): value is Array<T>
export function isArray<T>(
    value: T | ReadonlyArray<T>,
): value is ReadonlyArray<T>
export function isArray(value: unknown): boolean {
    return Array.isArray(value)
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
 * Checks if the value is empty.
 *
 * Supported types and what counts as empty:
 * * `null` / `undefined` — empty
 * * `boolean` — `false` is empty
 * * `string` — `''` is empty
 * * `number` — `0` is empty (`NaN` is not)
 * * `Array` — empty array
 * * `Set` / `Map` — `.size === 0`
 * * Plain object — no own enumerable keys
 * * Anything else — not empty
 *
 * @group Guard
 */
export function isEmpty<T>(value: T): boolean {
    if (value == null) {
        return true
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

    if (Array.isArray(value)) {
        return value.length === 0
    }

    if (value instanceof Set || value instanceof Map) {
        return value.size === 0
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
    if (value === null || typeof value !== 'object') return false

    const proto = Object.getPrototypeOf(value)
    return proto === null || proto === Object.prototype
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
    return Array.isArray(value) ? value : [value as T]
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
export function hasKeys<T, Key extends string | number | symbol>(
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

/**
 * Checks if value is `AsyncIterable`, acts as a typescript safeguard.
 *
 * @group Guard
 * @example
 * ```
 * isAsyncIterable((async function* () { yield 5 })())
 * // true
 * isAsyncIterable([1, 2, 3])
 * // false
 * ```
 */
export function isAsyncIterable<T = unknown>(
    v: unknown,
): v is AsyncIterable<T> {
    return (
        !!v &&
        typeof (v as { [Symbol.asyncIterator]?: unknown })[
            Symbol.asyncIterator
        ] === 'function'
    )
}

export async function* toAsyncIterable<T>(
    iterable: Iterable<T>,
): AsyncIterable<T> {
    for (const item of iterable) {
        yield item
    }
}

/**
 * Checks if value is `Iterable`, acts as a typescript safeguard.
 *
 * @group Guard
 * @example
 * ```
 * isIterable([1, 2, 3])
 * // true
 * isIterable((async function* () { yield 5 })())
 * // false
 * ```
 */
export function isIterable<T = unknown>(v: unknown): v is Iterable<T> {
    return (
        !!v &&
        typeof (v as { [Symbol.iterator]?: unknown })[Symbol.iterator] ===
            'function'
    )
}

/**
 * Checks if value is `Promise`, acts as a typescript safeguard.
 *
 * Narrows `T | Promise<T>` to `Promise<T>` cleanly in normal usage; works
 * with `Array.prototype.filter` to extract promises from a mixed array.
 *
 * @group Guard
 * @example
 * ```
 * isPromise(Promise.resolve(5))   // true
 * isPromise(5)                    // false
 *
 * function check(v: Promise<number> | number) {
 *     if (isPromise(v)) {
 *         // v: Promise<number>
 *     }
 * }
 *
 * const arr: (Promise<number> | number)[] = [...]
 * arr.filter(isPromise) // Promise<number>[]
 * ```
 */
export function isPromise<T>(v: T | Promise<T>): v is Promise<T> {
    return v instanceof Promise
}

export function isSet<T = unknown>(v: unknown): v is Set<T> {
    return v instanceof Set
}

export function isMap<K = unknown, V = unknown>(v: unknown): v is Map<K, V> {
    return v instanceof Map
}

/**
 * Checks if value is a function, acts as a typescript safeguard.
 *
 * @group Guard
 * @example
 * ```
 * isFunction(() => 1)  // true
 * isFunction('abc')    // false
 * ```
 */
// biome-ignore lint/suspicious/noExplicitAny: function guard accepts any function shape
export function isFunction(v: unknown): v is (...args: any[]) => any {
    return typeof v === 'function'
}

/**
 * Checks if value is a `Date` instance, acts as a typescript safeguard.
 *
 * @group Guard
 * @example
 * ```
 * isDate(new Date())  // true
 * isDate('2024')      // false
 * ```
 */
export function isDate(v: unknown): v is Date {
    return v instanceof Date
}

/**
 * Checks if value is a `RegExp`, acts as a typescript safeguard.
 *
 * @group Guard
 * @example
 * ```
 * isRegExp(/abc/)   // true
 * isRegExp('/abc/') // false
 * ```
 */
export function isRegExp(v: unknown): v is RegExp {
    return v instanceof RegExp
}

/**
 * Checks if value is an integer (whole, finite number).
 *
 * @group Guard
 * @example
 * ```
 * isInteger(42)    // true
 * isInteger(1.5)   // false
 * isInteger('42')  // false
 * ```
 */
export function isInteger(v: unknown): v is number {
    return Number.isInteger(v)
}
