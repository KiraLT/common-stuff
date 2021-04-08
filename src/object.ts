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
 * Converts object to entries and map's it with provided callback.
 *
 * @param obj `Record` like object
 * @param callback map callback, accepts entry pair (`[key, value]`) and should also return entry pair
 * @returns new mapped object
 */
export function mapRecord<K extends keyof any, V, RK extends keyof any, RV>(obj: Record<K, V>, callback: (entry: [key: K, value: V]) => [RK, RV]): Record<RK, RV> {
    const entries = Object.entries(obj) as Array<[K, V]>

    return entries.map(callback).reduce((prev, [key, value]) => {
        prev[key] = value
        return prev
    }, {} as Record<RK, RV>)
}
