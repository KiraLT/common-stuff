/**
 * Checks if value is `number`, supports typescript safeguard.
 *
 * @category Guard
 */
export function isNumber(value: unknown): value is number {
    return typeof value === 'number'
}

/**
 * Checks if value is `boolean`, supports typescript safeguard.
 *
 * @category Guard
 */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean'
}

/**
 * Checks if value is `number`, supports typescript safeguard.
 *
 * @category Guard
 */
export function isString(value: unknown): value is string {
    return typeof value === 'string'
}

/**
 * Checks if value is `array`, supports typescript safeguard.
 *
 * @category Guard
 */
export function isArray<T = unknown>(value: unknown): value is Array<T> {
    return value instanceof Array
}

/**
 * Checks if value is not undefined, supports typescript safeguard.
 *
 * @category Guard
 */
export function notUndefined<T>(value: T | undefined): value is T {
    return value !== undefined
}

/**
 * Checks if value is not `null`, supports typescript safeguard.
 *
 * @category Guard
 */
export function notNull<T>(value: T | null): value is T {
    return value !== null
}

/**
 * Checks if value is not `null` or `undefined`, supports typescript safeguard.
 *
 * @category Guard
 */
export function notNullOrUndefined<T>(value: T | null | undefined): value is T {
    return value != null
}

/**
 * Checks if value is plain object, supports typescript safeguard.
 *
 * @category Guard
 */
export function isPlainObject<T = Record<keyof any, unknown>>(
    value: unknown
): value is T {

    const isObject = (v: unknown): v is object =>
        String(v) === '[object Object]'

    if (!isObject(value)) return false

    const constructor = value.constructor
    if (constructor === undefined) return true

    const prototype = constructor.prototype
    if (!isObject(prototype)) return false

    if (!prototype.hasOwnProperty('isPrototypeOf')) {
        return false
    }

    return true
}
