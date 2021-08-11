import { isPlainObject, isArray } from '.'

/**
 * Builds a new iterable data structure by applying a function to all elements.
 * 
 * Supported structures:
 * * Array
 * * Simple object
 * * Set
 * * Map
 *
 * @example
 * ```
 * map([1, 2], v => v + 1)
 * // [2, 3]
 *
 * map({'a': 2}, ([k, v]) => [v, k])
 * // {'2': 'a, '3': 'b}
 * 
 * map(new Map([['a', 2]]), ([k, v]) => [v, k])
 * // Map({2: 'a'})
 * 
 * map(new Set([1, 2]), v => v + 1)
 * // Set([2, 3])
 * ```
 * @category Iterable
 */
export function map<T, R>(
    obj: T[],
    callback: (entry: T) => R
): R[]
export function map<T, R>(
    obj: ReadonlyArray<T>,
    callback: (entry: T) => R
): ReadonlyArray<R>
export function map<T, R>(
    obj: Set<T>,
    callback: (entry: T) => R
): Set<R>
export function map<K extends keyof any, V, RK extends keyof any, RV>(
    obj: Map<K, V>,
    callback: (entry: [K, V]) => [RK, RV]
): Map<RK, RV>
export function map<K extends keyof any, V, RK extends keyof any, RV>(
    obj: Record<K, V>,
    callback: (entry: [K, V]) => [RK, RV]
): Record<RK, RV>
export function map(
    value: unknown,
    callback: (entry: any) => unknown
): unknown {
    return flatMap(value as any, v => [callback(v)])
}

/**
 * Calls a defined callback function on each element of an array. Then, flattens the result into
 * a new array.
 * 
 * Supported structures:
 * * Array
 * * Simple object
 * * Set
 * * Map
 *
 * @example
 * ```
 * flatMap([1, 2], v => [v + 1])
 * // [2, 3]
 *
 * flatMap({'a': 2}, ([k, v]) => [[v, k]])
 * // {'2': 'a, '3': 'b}
 * 
 * flatMap(new Map([['a', 2]]), ([k, v]) => [[v, k]])
 * // Map({2: 'a'})
 * 
 * flatMap(new Set([1, 2]), v => [v + 1])
 * // Set([2, 3])
 * ```
 * @category Iterable
 */
export function flatMap<T, R>(
    obj: T[],
    callback: (entry: T) => ReadonlyArray<R>
): R[]
export function flatMap<T, R>(
    obj: ReadonlyArray<T>,
    callback: (entry: T) => ReadonlyArray<R>
): ReadonlyArray<R>
export function flatMap<T, R>(
    obj: Set<T>,
    callback: (entry: T) => ReadonlyArray<R>
): Set<R>
export function flatMap<K extends keyof any, V, RK extends keyof any, RV>(
    obj: Map<K, V>,
    callback: (entry: [K, V]) => ReadonlyArray<[RK, RV]>
): Map<RK, RV>
export function flatMap<K extends keyof any, V, RK extends keyof any, RV>(
    obj: Record<K, V>,
    callback: (entry: [K, V]) => ReadonlyArray<[RK, RV]>
): Record<RK, RV>
export function flatMap(
    value: unknown,
    callback: (entry: any) => ReadonlyArray<unknown>
): unknown {
    if (isArray(value)) {
        return value.reduce<unknown[]>(
            (acc, cur) => {
                acc.push(...callback(cur))
                return acc
            },
            []
        )
    }

    if (typeof Set !== 'undefined' && value instanceof Set) {
        const newSet = new Set()
        value.forEach(cur => {
            callback(cur).forEach(v => {
                newSet.add(v)
            })
        })
        return newSet
    }

    if (typeof Map !== 'undefined' && value instanceof Map) {
        const newMap = new Map()
        value.forEach((v, k) => {
            const values = callback([k, v]) as [keyof any, unknown][]
            values.forEach(([newK, newV]) => {
                newMap.set(newK, newV)
            })
        })
        return newMap
    }

    if (isPlainObject(value)) {
        return Object.entries(value).reduce((acc, [key, value]) => {
            const entries = callback([key, value]) as [string | number, unknown][]
            entries.forEach(([newK, newV]) => {
                acc[newK] = newV
            })
            return acc
        }, {} as Record<keyof any, unknown>) as any
    }

    return value
}

/**
 * 
 * @param obj 
 * @param callback 
 */
export function filter<T>(
    obj: T[],
    callback: (entry: T) => boolean
): T[]
export function filter<T>(
    obj: boolean,
    callback: (entry: T) => boolean
): ReadonlyArray<T>
export function filter<T>(
    obj: Set<T>,
    callback: (entry: T) => boolean
): Set<T>
export function filter<K extends keyof any, V>(
    obj: Map<K, V>,
    callback: (entry: [K, V]) => boolean
): Map<K, V>
export function filter<K extends keyof any, V>(
    obj: Record<K, V>,
    callback: (entry: [K, V]) => boolean
): Record<K, V>
export function filter(
    value: unknown,
    callback: (entry: any) => boolean
): unknown {
    return flatMap(value as any, (v) => (callback(v) ? [v] : []))
}
