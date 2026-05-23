import { isPlainObject } from './guards.ts'
import { filter, flatMap, map } from './iterable.ts'

/**
 * Compares two values structurally.
 *
 * Supported types: all primitives (including `NaN === NaN`), `null`, `undefined`,
 * `Array`, plain `object`, `Date`, `RegExp`, `Set`, `Map`.
 *
 * @group Object
 * @param a any value to compare
 * @param b any value to compare
 * @returns `true` if values are structurally equal
 */
export function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true
    }

    if (typeof a === 'number' && typeof b === 'number') {
        return Number.isNaN(a) && Number.isNaN(b)
    }

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
    }

    if (a instanceof RegExp && b instanceof RegExp) {
        return a.source === b.source && a.flags === b.flags
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false
        return a.every((v, i) => isEqual(v, b[i]))
    }

    if (a instanceof Set && b instanceof Set) {
        if (a.size !== b.size) return false
        const bArr = Array.from(b)
        return Array.from(a).every(
            (v) => b.has(v) || bArr.some((candidate) => isEqual(v, candidate)),
        )
    }

    if (a instanceof Map && b instanceof Map) {
        if (a.size !== b.size) return false
        const bEntries = Array.from(b)
        return Array.from(a).every(([k, v]) =>
            b.has(k)
                ? isEqual(v, b.get(k))
                : bEntries.some(([k2, v2]) => isEqual(k, k2) && isEqual(v, v2)),
        )
    }

    if (isPlainObject(a) && isPlainObject(b)) {
        const entriesA = Object.entries(a)
        if (entriesA.length !== Object.keys(b).length) return false
        return entriesA.every(([k, v]) => isEqual(v, b[k]))
    }

    return false
}

/**
 * Converts object to entries, maps it with provided callback and flattens entry list.
 *
 * @example
 * ```
 * flatMapRecord({'a': 2}, ([k, v]) => [[k, v]])
 * >> {'a': 2, 'b': 3}
 * flatMapRecord({'a': 2, 'b': 3}, ([k, v]) => v === 2 ? [[k, v]] : [])
 * >> {'a': 2}
 * ```
 * @deprecated Use [[flatMap]] from `iterable` instead — it handles `Record` directly along with `Array`, `Set`, `Map`, and (async) iterables.
 * @group Object
 * @param obj `Record` like object
 * @param callback map callback, accepts entry pair (`[key, value]`) and should return list of entry pairs
 * @returns new mapped object
 */
export function flatMapRecord<
    K extends PropertyKey,
    V,
    RK extends PropertyKey,
    RV,
>(
    obj: Record<K, V>,
    callback: (entry: [K, V]) => Array<[RK, RV]>,
): Record<RK, RV> {
    return flatMap(obj, callback) as Record<RK, RV>
}

/**
 * Converts object to entries and maps it with provided callback.
 *
 * @example
 * ```
 * mapRecord({'a': 2}, ([k, v]) => [v, k * 2])
 * >> {'b': 4}
 * mapRecord({'a': 'b'}, ([k, v]) => [v, k])
 * >> {'b': 'a'}
 * ```
 * @deprecated Use [[map]] from `iterable` instead — it handles `Record` directly along with `Array`, `Set`, `Map`, and (async) iterables.
 * @group Object
 * @param obj `Record` like plain object
 * @param callback map callback, accepts entry pair (`[key, value]`) and should return entry pair
 * @returns new mapped object
 */
export function mapRecord<K extends PropertyKey, V, RK extends PropertyKey, RV>(
    obj: Record<K, V>,
    callback: (entry: [K, V]) => [RK, RV],
): Record<RK, RV> {
    return map(obj, callback) as Record<RK, RV>
}

/**
 * Filter object by provided callback.
 *
 * @example
 * ```
 * filterRecord({'a': 2, 'b': 3}, ([k, v]) => v === 2)
 * >> {'a': 2}
 * ```
 * @deprecated Use [[filter]] from `iterable` instead — it handles `Record` directly along with `Array`, `Set`, `Map`, and (async) iterables.
 * @group Object
 * @param obj `Record` like plain object
 * @param callback map callback, accepts entry pair (`[key, value]`) and should boolean value
 * @returns new filtered object
 */
export function filterRecord<K extends PropertyKey, V>(
    obj: Record<K, V>,
    callback: (entry: [K, V]) => boolean,
): Record<K, V> {
    return filter(obj, callback) as Record<K, V>
}

/**
 * Merges `source` to `target` recursively.
 *
 * The return type is inferred as `A & B`. For nested objects TS intersects each
 * branch (so `merge({ a: { x: 1 } }, { a: { y: 2 } })` is typed as
 * `{ a: { x: number; y: number } }`). Array merging may produce an intersection
 * of element types that doesn't match the runtime — supply an explicit return
 * type via cast if you need precise array typing.
 *
 * @example
 * ```
 * merge({ a: 1 }, { b: 2 })
 * // { a: 1, b: 2 } typed as { a: number; b: number }
 * ```
 * @group Object
 */
export function merge<A, B>(
    target: A,
    source: B,
    options?: {
        /**
         * When `source` has `null` or `undefined` value, do not overwrite `target`
         *
         * @default false
         */
        skipNulls?: boolean
        /**
         * Array merge policy, default is `overwrite`
         *
         * Available policies:
         * * `overwrite` - always replace `target` array with `source`
         * * `merge` - merge `target` and `source` array values
         * * `(target, source) => source` - custom array merge function
         *
         * @default 'overwrite'
         */
        arrayPolicy?:
            | 'overwrite'
            | 'merge'
            | ((target: unknown[], source: unknown[]) => unknown)
    },
): A & B {
    const { skipNulls = false, arrayPolicy = 'overwrite' } = options ?? {}

    if (isPlainObject(target) && isPlainObject(source)) {
        const result = { ...target } as Record<string | number | symbol, unknown>
        for (const [key, value] of Object.entries(source)) {
            result[key] = merge(result[key], value, options)
        }
        return result as unknown as A & B
    }

    if (Array.isArray(target) && Array.isArray(source)) {
        if (arrayPolicy === 'merge') {
            return target.concat(source) as unknown as A & B
        } else if (typeof arrayPolicy === 'function') {
            return arrayPolicy(target, source) as unknown as A & B
        } else {
            return source as unknown as A & B
        }
    }

    if (skipNulls && source == null) {
        return target as unknown as A & B
    }

    return source as unknown as A & B
}

/**
 * Return a clone of given value.
 *
 * Handles plain objects, arrays, `Date`, `RegExp`, `Set`, `Map`. Other types
 * (class instances, functions, primitives) are returned as-is.
 *
 * @group Object
 * @param value any value
 * @param recursive should recursive values (object, array, set, map) be cloned
 */
export function clone<T>(value: T, recursive = true): T {
    if (value instanceof Date) {
        return new Date(value.getTime()) as T
    }

    if (value instanceof RegExp) {
        return new RegExp(value.source, value.flags) as T
    }

    if (value instanceof Set) {
        return new Set(
            recursive
                ? Array.from(value).map((v) => clone(v))
                : Array.from(value),
        ) as T
    }

    if (value instanceof Map) {
        return new Map(
            recursive
                ? Array.from(value).map(([k, v]) => [clone(k), clone(v)])
                : Array.from(value),
        ) as T
    }

    if (isPlainObject(value)) {
        return Object.entries(value).reduce(
            (prev, [k, v]) => {
                prev[k] = recursive ? clone(v) : v
                return prev
            },
            {} as Record<string | number | symbol, unknown>,
        ) as unknown as T
    }

    if (Array.isArray(value)) {
        return value.map((v) => (recursive ? clone(v) : v)) as T
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
 * @group Object
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
    },
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
        value: unknown,
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
                ] as const,
        )
        .filter(([keys]) => keys.every((v) => !!v))
        .sort((a, b) => a[0].length - b[0].length)
        .reduce(
            (prev, [key, value]) => merge(prev, createValue(key, value)),
            {} as T,
        )
}

/**
 * Splits a dotted path literal into a tuple of segments at the type level.
 * `'a.b.c'` → `['a', 'b', 'c']`. Non-literal strings collapse to `string[]`.
 */
type SplitPath<S extends string> = string extends S
    ? string[]
    : S extends `${infer Head}.${infer Tail}`
      ? [Head, ...SplitPath<Tail>]
      : [S]

/**
 * Indexes `T` by a single path segment `K`. Handles tuples (numeric-string
 * keys), homogeneous arrays (`T[number]`), records, and unknown shapes.
 */
type IndexBySegment<T, K> = T extends readonly unknown[]
    ? K extends keyof T
        ? T[K]
        : K extends `${number}` | number
          ? T[number] | undefined
          : undefined
    : T extends object
      ? K extends keyof T
          ? T[K]
          : K extends `${number}`
            ? `${number}` extends keyof T
                ? T[`${number}` & keyof T]
                : undefined
            : K extends number
              ? `${K}` extends keyof T
                  ? T[`${K}` & keyof T]
                  : undefined
              : undefined
      : undefined

/**
 * Walks a tuple of path segments through `T`. At each step, an inaccessible
 * segment yields `undefined` and short-circuits.
 */
type WalkPath<T, Path extends readonly unknown[]> = Path extends readonly []
    ? T
    : Path extends readonly [infer Head, ...infer Rest]
      ? Rest extends readonly unknown[]
          ? WalkPath<IndexBySegment<T, Head>, Rest>
          : undefined
      : undefined

/**
 * Compute the return type of `getByKey(T, P)`.
 *
 * - For a string literal path `'a.b.c'` the path is split on `.`.
 * - For a tuple path the segments are walked directly.
 * - For a `string` (non-literal) or `(string | number)[]` (non-tuple) input,
 *   the result falls back to `unknown` — the caller can pass `T` explicitly
 *   when the path isn't statically known.
 */
type GetByPath<
    T,
    P extends string | readonly (string | number)[],
> = P extends string
    ? string extends P
        ? unknown
        : WalkPath<T, SplitPath<P>>
    : P extends readonly (string | number)[]
      ? number extends P['length']
          ? unknown
          : WalkPath<T, P>
      : unknown

/**
 * Get object value by nested keys.
 *
 * When the path is a string literal (`'a.b.c'`) or a tuple of literals
 * (`['a', 'b'] as const`), the return type is inferred from `T` by walking
 * the path. For dynamic paths (variable strings or non-tuple arrays) the
 * return type is `unknown`; pass `T` explicitly via the first generic if
 * you know what to expect.
 *
 * @example
 * ```
 * getByKey({ a: [1, 2, { b: 'value' }] }, 'a.2.b')
 * // 'value' — inferred as string
 *
 * getByKey({ a: [1, 2, { b: 'value' }] }, ['a', 2, 'b'] as const)
 * // 'value' — inferred as string
 *
 * getByKey<number>(data, somePathVariable)
 * // explicit fallback for dynamic paths
 * ```
 * @group Object
 */
export function getByKey<
    T,
    const P extends string | readonly (string | number)[],
>(target: T, keys: P): GetByPath<T, P>
export function getByKey<R = unknown>(
    target: unknown,
    keys: (string | number)[] | string,
): R
export function getByKey(
    target: unknown,
    keys: (string | number)[] | string,
): unknown {
    const keysList = Array.isArray(keys) ? keys : keys.split('.')
    const key = keysList[0]
    const restKeys = keysList.slice(1)

    if (key === undefined || key === '') {
        return target
    }

    if (Array.isArray(target)) {
        const numKey =
            typeof key === 'number' ? key : parseInt(key.toString(), 10)

        return Number.isNaN(numKey)
            ? undefined
            : getByKey(target[numKey], restKeys)
    }

    if (isPlainObject(target)) {
        return getByKey(target[key], restKeys)
    }

    return undefined
}
