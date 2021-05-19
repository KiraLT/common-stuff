import { isPlainObject } from '.'

/**
 * Compares two values.
 *
 * Supported types: all primitives, `null`, `undefined`, `array`, `object`, `Date`
 *
 * @category Object
 * @param a any value to compare
 * @param b any value to compare
 * @returns `true` if values are equal
 */
export function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true
    }

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
    }

    if (a instanceof Array && b instanceof Array) {
        if (a.length !== b.length) {
            return false
        }

        return a.every((v, i) => isEqual(v, b[i]))
    }

    if (isPlainObject(a) && isPlainObject(b)) {
        const entriesA = Object.entries(a)

        if (entriesA.length !== Object.keys(b).length) {
            return false
        }
        return entriesA.every(([k, v]) => isEqual(v, b[k]))
    }

    return false
}

/**
 * Converts object to entries, map's it with provided callback and flattens entry list.
 *
 * _Example:_
 *
 * ```
 * flatMapRecord({'a': 2}, ([k, v]) => [[k, v]])
 * >> {'a': 2, 'b': 3}
 * flatMapRecord({'a': 2, 'b': 3}, ([k, v]) => v === 2 ? [[k, v]] : [])
 * >> {'a': 2}
 * ```
 *
 * @category Object
 * @param obj `Record` like object
 * @param callback map callback, accepts entry pair (`[key, value]`) and should return list of entry pairs
 * @returns new mapped object
 */
export function flatMapRecord<K extends keyof any, V, RK extends keyof any, RV>(
    obj: Record<K, V>,
    callback: (entry: [key: K, value: V]) => Array<[RK, RV]>
): Record<RK, RV> {
    const entries = Object.entries(obj) as Array<[K, V]>

    return entries.map(callback).reduce((prev, values) => {
        values.forEach(([key, value]) => {
            prev[key] = value
        })
        return prev
    }, {} as Record<RK, RV>)
}

/**
 * Converts object to entries and map's it with provided callback.
 *
 * _Example:_
 *
 * ```
 * mapRecord({'a': 2}, ([k, v]) => [v, k * 2])
 * >> {'b': 4}
 * mapRecord({'a': 'b'}, ([k, v]) => [v, k])
 * >> {'b': 'a'}
 * ```
 *
 * @category Object
 * @param obj `Record` like plain object
 * @param callback map callback, accepts entry pair (`[key, value]`) and should return entry pair
 * @returns new mapped object
 */
export function mapRecord<K extends keyof any, V, RK extends keyof any, RV>(
    obj: Record<K, V>,
    callback: (entry: [key: K, value: V]) => [RK, RV]
): Record<RK, RV> {
    return flatMapRecord(obj, (v) => [callback(v)])
}

/**
 * Filter object by provided callback.
 *
 * _Example:_
 *
 * ```
 * filterRecord({'a': 2, 'b': 3}, ([k, v]) => v === 2)
 * >> {'a': 2}
 * ```
 *
 * @category Object
 * @param obj `Record` like plain object
 * @param callback map callback, accepts entry pair (`[key, value]`) and should booleean value
 * @returns new filtered object
 */
export function filterRecord<K extends keyof any, V>(
    obj: Record<K, V>,
    callback: (entry: [key: K, value: V]) => boolean
): Record<K, V> {
    return flatMapRecord(obj, (v) => (callback(v) ? [v] : []))
}

/**
 * Merges `source` to `target` recursively
 *
 * @category Object
 */
export function merge<T>(
    target: unknown,
    source: unknown,
    options?: {
        /**
         * When `source` has `null` or `undefined` value, do not overwrite `target`
         */
        skipNulls: false
        /**
         * Array merge policy, defaul is `overwrite`
         *
         * Available policies:
         * * `overwrite` - always replace `target` array with `source`
         * * `merge` - merge `target` and `source` array values
         * * `(target, source) => source` - custom array merge function
         */
        arrayPolicy:
            | 'overwrite'
            | 'merge'
            | ((target: unknown, source: unknown) => unknown)
    }
): T {
    const { skipNulls = false, arrayPolicy = 'overwrite' } = options ?? {}

    if (isPlainObject(target) && isPlainObject(source)) {
        return (Object.entries(source).reduce(
            (prev, [key, value]) => {
                prev[key] = merge(prev[key], value)
                return prev
            },
            { ...target }
        ) as any) as T
    }

    if (target instanceof Array && source instanceof Array) {
        if (arrayPolicy === 'merge') {
            return (target.concat(source) as any) as T
        } else if (typeof arrayPolicy === 'function') {
            return (arrayPolicy(target, source) as any) as T
        } else {
            return (source as any) as T
        }
    }

    if (skipNulls && source == null) {
        return target as T
    }

    return source as T
}

/**
 * Return a clone of given value
 *
 * @category Object
 * @param value any value
 * @param recursive should recursive values (object and array) be cloned
 */
export function clone<T>(value: T, recursive = true): T {
    if (isPlainObject(value)) {
        return (Object.entries(value).reduce((prev, [k, v]) => {
            prev[k] = recursive ? clone(v) : v
            return prev
        }, {} as Record<keyof any, unknown>) as any) as T
    }

    if (value instanceof Array) {
        return (value.map((v) => (recursive ? clone(v) : v)) as any) as T
    }

    return value
}
