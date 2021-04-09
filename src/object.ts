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
    if (a instanceof Date && b instanceof Date) {
        return isEqual(a.getTime(), b.getTime())
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

    return a === b
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
