/**
 * Creates sort callback which can be used for `array.sort` input.
 * A custom key function can be supplied to customize the sort order.
 * Key can return any nested data struture, supports number, booleans, arrays.
 *
 * Usage:
 * ```
 * // Sort by object key
 * arr.sort(sortByCb(v => v.myKey))
 * // Sort by number in reversed order
 * arr.sort(sortByCb(v => v.numberKey * -1))
 * // Sort by object key, then by boolean value in revered order
 * arr.sort(sortByCb(v => [v.myKey, !v.boolValue])
 * ```
 */
export function sortByCb<T>(
    key: (item: T) => unknown = (v) => v
): (a: T, b: T) => number {
    return (a, b) => {
        const doCompare = (keyA: unknown, keyB: unknown): number => {
            if (typeof keyA === 'number' && typeof keyB === 'number') {
                return keyA < keyB ? -1 : keyA > keyB ? 1 : 0
            }

            if (typeof keyA === 'boolean' && typeof keyB === 'boolean') {
                return keyA < keyB ? -1 : keyA > keyB ? 1 : 0
            }

            if (keyA instanceof Date && keyB instanceof Date) {
                return doCompare(keyA.getTime(), keyB.getTime())
            }

            if (keyA instanceof Array && keyB instanceof Array) {
                const res = keyA
                    .map((v, i) => doCompare(v, keyB[i]))
                    .filter((v) => v !== 0)
                return res[0] ?? 1
            }

            const stringA = String(keyA)
            const stringB = String(keyB)

            return stringA < stringB ? -1 : stringA > stringB ? 1 : 0
        }

        return doCompare(key(a), key(b))
    }
}

/**
 * Stable sort using provided callback without modifications.
 * A custom key function can be supplied to customize the sort order.
 * Key can return any nested data struture, supports number, booleans, arrays, objects.
 *
 * Usage:
 * ```
 * // Sort by object key
 * arr.sort(sortByCb(v => v.myKey))
 * // Sort by number in reversed order
 * arr.sort(sortByCb(v => v.numberKey * -1))
 * // Sort by object key, then by boolean value in revered order
 * arr.sort(sortByCb(v => [v.myKey, !v.boolValue])
 * ```
 */
export function sortBy<T>(
    arr: readonly T[],
    key?: (item: T) => unknown
): readonly T[]
export function sortBy<T>(arr: T[], key?: (item: T) => unknown): T[]
export function sortBy<T>(
    arr: readonly T[],
    key: (item: T) => unknown = (v) => v
): T[] {
    return arr
        .map((v, i) => [v, i] as const)
        .sort(sortByCb(([v, i]) => [key(v), i]))
        .map((v) => v[0])
}

/**
 * Return an object that produces a array of numbers from start (inclusive) to stop (exclusive) by step.
 *
 * _Example:_
 * ```
 *  >>> range(4)
 *  [0, 1, 2, 3]
 *  >>> range(3,6)
 *  [3, 4, 5]
 *  >>> range(0,10,2)
 *  [0, 2, 4, 6, 8]
 *  >>> range(10,0,-1)
 *  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
 *  >>> range(8,2,-2)
 *  [8, 6, 4]
 *  ```
 */
export function generateRange(stop: number): number[]
export function generateRange(
    start: number,
    stop: number,
    step?: number
): number[]
export function generateRange(
    start: number,
    stop?: number,
    step?: number
): number[] {
    if (stop === undefined) {
        stop = start
        start = 0
    }

    if (step === undefined) {
        step = 1
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return []
    }

    const result = []
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i)
    }

    return result
}
