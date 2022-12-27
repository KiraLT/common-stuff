import { isPlainObject, map, flatMap } from '.'

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
 * @example
 * ```
 * flatMapRecord({'a': 2}, ([k, v]) => [[k, v]])
 * >> {'a': 2, 'b': 3}
 * flatMapRecord({'a': 2, 'b': 3}, ([k, v]) => v === 2 ? [[k, v]] : [])
 * >> {'a': 2}
 * ```
 * @category Object
 * @param obj `Record` like object
 * @param callback map callback, accepts entry pair (`[key, value]`) and should return list of entry pairs
 * @returns new mapped object
 * @deprecated use [[flatMap]]
 */
export function flatMapRecord<K extends keyof any, V, RK extends keyof any, RV>(
    obj: Record<K, V>,
    callback: (entry: [K, V]) => Array<[RK, RV]>
): Record<RK, RV> {
    return flatMap(obj, callback)
}

/**
 * Converts object to entries and map's it with provided callback.
 *
 * @example
 * ```
 * mapRecord({'a': 2}, ([k, v]) => [v, k * 2])
 * >> {'b': 4}
 * mapRecord({'a': 'b'}, ([k, v]) => [v, k])
 * >> {'b': 'a'}
 * ```
 * @category Object
 * @param obj `Record` like plain object
 * @param callback map callback, accepts entry pair (`[key, value]`) and should return entry pair
 * @returns new mapped object
 * @deprecated use [[map]]
 */
export function mapRecord<K extends keyof any, V, RK extends keyof any, RV>(
    obj: Record<K, V>,
    callback: (entry: [K, V]) => [RK, RV]
): Record<RK, RV> {
    return map(obj, callback)
}

/**
 * Filter object by provided callback.
 *
 * @example
 * ```
 * filterRecord({'a': 2, 'b': 3}, ([k, v]) => v === 2)
 * >> {'a': 2}
 * ```
 * @category Object
 * @param obj `Record` like plain object
 * @param callback map callback, accepts entry pair (`[key, value]`) and should boolean value
 * @returns new filtered object
 */
export function filterRecord<K extends keyof any, V>(
    obj: Record<K, V>,
    callback: (entry: [K, V]) => boolean
): Record<K, V> {
    return flatMapRecord(obj, (v) => (callback(v) ? [v] : []))
}

/**
 * Merges `source` to `target` recursively
 *
 * @example
 * ```
 * merge({ a: 1 }, { b: 2 }))
 * // { a: 1, b: 2 }
 * ```
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
         * Array merge policy, default is `overwrite`
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
        return Object.entries(source).reduce(
            (prev, [key, value]) => {
                prev[key] = merge(prev[key], value)
                return prev
            },
            { ...target }
        ) as any as T
    }

    if (target instanceof Array && source instanceof Array) {
        if (arrayPolicy === 'merge') {
            return target.concat(source) as any as T
        } else if (typeof arrayPolicy === 'function') {
            return arrayPolicy(target, source) as any as T
        } else {
            return source as any as T
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
        return Object.entries(value).reduce((prev, [k, v]) => {
            prev[k] = recursive ? clone(v) : v
            return prev
        }, {} as Record<keyof any, unknown>) as any as T
    }

    if (value instanceof Array) {
        return value.map((v) => (recursive ? clone(v) : v)) as any as T
    }

    return value
}

/**
 * Parse one level object to nested structure based on key separator
 *
 * @example
 * ```
 * // ENV: config__host=0.0.0.0 config__port=3000
 * convertToNested(process.env, { separator: '__' })
 * // {config: { host: '0.0.0.0', port: 3000 } }
 *
 * // ENV: CONFIG__PRIVATE_KEY="my key"
 * // ENV: CONFIG__PUBLIC_KEY="my key"
 * // ENV: CONFIG__ALLOWED_IPS='["127.0.0.1", "localhost"]'
 * convertToNested(process.env, {
 *    separator: '__',
 *    transformKey: camelCase
 * }).config
 * // { privateKey: 'my key', publicKey: 'my key', allowedIps: ['127.0.0.1', 'localhost'] }
 * ```
 * @category Object
 */
export function convertToNested<T = Record<string, unknown>>(
    array: Record<string, unknown>,
    options?: {
        /**
         * Key separator, default `.`
         */
        separator?: string
        /**
         * Key transform function, e.g. `camelCase` or `pascalCase`
         */
        transformKey?: (value: string) => string
        /**
         * Value transform function, by default `JSON.parse` is used.
         */
        transformValue?: (value: unknown) => unknown
    }
): T {
    const sep = options?.separator ?? '.'
    const keyTransformer = options?.transformKey ?? ((v) => v)
    const valueTransformer =
        options?.transformValue ??
        ((v) => {
            if (typeof v === 'string') {
                try {
                    return JSON.parse(v)
                } catch {
                    return v
                }
            }
            return v
        })

    const createValue = (
        [target, ...keys]: string[],
        value: unknown
    ): unknown => {
        if (!target) {
            return value
        }
        return {
            [target]: createValue(keys, value),
        }
    }

    return Object.entries(array)
        .map(
            ([key, value]) =>
                [
                    key.split(sep).map(keyTransformer),
                    valueTransformer(value),
                ] as const
        )
        .filter(([keys]) => keys.every((v) => !!v))
        .sort((a, b) => a[0].length - b[0].length)
        .reduce(
            (prev, [key, value]) => merge(prev, createValue(key, value)),
            {} as T
        )
}
