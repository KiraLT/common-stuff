/**
 * Creates sort callback which can be used for `array.sort` input.
 * A custom key function can be supplied to customize the sort order.
 * Key can return any nested data struture, supports number, booleans, arrays.
 *
 * Usage:
 * ```typescript
 * // Sort by object key
 * arr.sort(sortByCb(v => v.myKey))
 * // Sort by number in reversed order
 * arr.sort(sortByCb(v => v.numberKey * -1))
 * // Sort by object key, then by boolean value in revered order
 * arr.sort(sortByCb(v => [v.myKey, !v.boolValue])
 * ```
 *
 * @category Array
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
 *
 * @category Array
 */
export function sortBy<T>(arr: T[], key?: (item: T) => unknown): T[]
export function sortBy<T>(
    arr: readonly T[],
    key?: (item: T) => unknown
): readonly T[]
export function sortBy<T, A extends ReadonlyArray<T>>(
    arr: A,
    key: (item: T) => unknown = (v) => v
): A {
    return arr
        .map((v, i) => [v, i] as const)
        .sort(sortByCb(([v, i]) => [key(v), i]))
        .map((v) => v[0]) as any
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
 *
 * @category Array
 * @param stop an integer number specifying at which position to stop (not included)
 */
export function generateRange(stop: number): number[]
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
 *
 * @category Array
 * @param start an integer number specifying at which position to start
 * @param stop an integer number specifying at which position to stop (not included)
 * @param step an integer number specifying the incrementation
 */
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

/**
 * Calls a defined callback function on each element of an array. Then, flattens the result into
 * a new array.
 * This is identical to a map followed by flat with depth 1.
 *
 * Use [Array.flatMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap) if possible or polyfill grobaly:
 *
 * ```
 * Array.prototype.flatMap = function(callback) {
 *     return flatMap(this, callback)
 * }
 * ```
 *
 * _Examples:_
 * ```
 * const arr1 = [1, 2, 3, 4]
 *
 * arr1.map(x => [x * 2])
 * // [[2], [4], [6], [8]]
 *
 * flatMap(arr1, x => [x * 2])
 * // [2, 4, 6, 8]
 *
 * // only one level is flattened
 * flatMap(arr1, x => [[x * 2]])
 * // [[2], [4], [6], [8]]
 * ```
 *
 * @category Array
 * @tutorial https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap
 * @param array any array
 * @param callback A function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array.
 */
export function flatMap<T, U>(
    array: T[],
    callback: (item: T, index: number, array: T[]) => U | readonly U[]
): U[]
export function flatMap<T, U>(
    array: readonly T[],
    callback: (item: T, index: number, array: readonly T[]) => U | readonly U[]
): readonly U[]
export function flatMap<T, U>(
    array: readonly T[],
    callback: (item: T, index: number, array: T[]) => U | readonly U[]
): readonly U[] {
    return array.reduce(
        (acc, v, index) => acc.concat(callback(v, index, array as T[])),
        [] as U[]
    )
}

type FlatArray<Arr, Depth extends number> = {
    done: Arr
    recur: Arr extends ReadonlyArray<infer InnerArr>
        ? FlatArray<
              InnerArr,
              [
                  -1,
                  0,
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  9,
                  10,
                  11,
                  12,
                  13,
                  14,
                  15,
                  16,
                  17,
                  18,
                  19,
                  20
              ][Depth]
          >
        : Arr
}[Depth extends -1 ? 'done' : 'recur']

/**
 * Returns a new array with all sub-array elements concatenated into it recursively up to the specified depth.
 *
 * Use [Array.flat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) if possible or polyfill globally:
 *
 * ```
 * Array.prototype.flat = function(depth) {
 *     return flatten(this as any, depth)
 * }
 * ```
 *
 * _Examples:_
 * ```
 * flatten([1, 2, [3, 4]])
 * // [1, 2, 3, 4]
 *
 * flatten([1, 2, [3, 4, [5, 6]]])
 * // [1, 2, 3, 4, [5, 6]]
 *
 * flatten([1, 2, [3, 4, [5, 6]]], 2)
 * // [1, 2, 3, 4, 5, 6]
 * ```
 *
 * @category Array
 * @tutorial https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
 * @param depth The maximum recursion depth
 */
export function flatten<A extends unknown[], D extends number = 1>(
    array: A,
    depth?: D
): FlatArray<A, D>[]
export function flatten<A extends readonly unknown[], D extends number = 1>(
    array: A,
    depth?: D
): readonly FlatArray<A, D>[]
export function flatten<A extends readonly unknown[], D extends number = 1>(
    array: A,
    depth?: D
): FlatArray<A, D>[] {
    const d = depth ?? 1

    if (d > 0) {
        return array.reduce<unknown[]>(
            (acc, val) =>
                acc.concat(val instanceof Array ? flatten(val, d - 1) : val),
            []
        ) as FlatArray<A, D>[]
    }

    return array.slice() as FlatArray<A, D>[]
}
