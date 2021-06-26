import { hashCode, ensureArray } from '.'

/**
 * Creates sort callback which can be used for `array.sort` input.
 * A custom key function can be supplied to customize the sort order.
 * Key can return any nested data structure, supports number, booleans, arrays.
 *
 * @example
 * ```
 * // Sort by object key
 * arr.sort(sortByCb(v => v.myKey))
 * // Sort by number in reversed order
 * arr.sort(sortByCb(v => v.numberKey * -1))
 * // Sort by object key, then by boolean value in revered order
 * arr.sort(sortByCb(v => [v.myKey, !v.boolValue])
 * ```
 * @category Array
 * @param key a function to execute to decide the order
 * @returns `array.sort` compatible callback
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
 * Key can return any nested data structure, supports number, booleans, arrays, objects.
 *
 * @example
 * ```
 * // Sort by object key
 * sortBy(arr, v => v.myKey))
 * // Sort by number in reversed order
 * sortBy(arr, v => v.numberKey * -1))
 * // Sort by object key, then by boolean value in revered order
 * sortBy(arr, v => [v.myKey, !v.boolValue])
 * ```
 * @category Array
 * @param arr any array
 * @param key a function to execute to decide the order
 * @returns sorted array copy
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
 * @example
 * ```
 * >>> generateRange(4)
 * [0, 1, 2, 3]
 * >>> generateRange(3,6)
 * [3, 4, 5]
 * >>> generateRange(0,10,2)
 * [0, 2, 4, 6, 8]
 * >>> generateRange(10,0,-1)
 * [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
 * >>> generateRange(8,2,-2)
 * [8, 6, 4]
 * ```
 * @category Array
 * @param stop an integer number specifying at which position to stop (not included)
 * @returns generated array by range
 */
export function generateRange(stop: number): number[]
/**
 * Return an object that produces a array of numbers from start (inclusive) to stop (exclusive) by step.
 *
 * @example
 * ```
 * >>> generateRange(4)
 * [0, 1, 2, 3]
 * >>> generateRange(3,6)
 * [3, 4, 5]
 * >>> generateRange(0,10,2)
 * [0, 2, 4, 6, 8]
 * >>> generateRange(10,0,-1)
 * [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
 * >>> generateRange(8,2,-2)
 * [8, 6, 4]
 * ```
 * @category Array
 * @param start an integer number specifying at which position to start
 * @param stop an integer number specifying at which position to stop (not included)
 * @param step an integer number specifying the incrementation
 * @returns generated array by range
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
 * Use [Array.flatMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap) if possible or polyfill globally:
 *
 * ```
 * Array.prototype.flatMap = function(callback) {
 *     return flatMap(this, callback)
 * }
 * ```
 *
 * @example
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
 * @example
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

/**
 * Splits an array into groups the length of size. If array can't be split evenly, the final chunk will be the remaining elements.
 *
 * @example
 * ```
 * chunk([1, 2, 3, 4, 5], 2)
 * // [[1, 2], [3, 4], [5]]
 * ```
 * @param size Chunk maximum size
 * @category Array
 */
export function chunk<T>(array: T[], size: number): T[][]
export function chunk<T>(
    array: ReadonlyArray<T>,
    size: number
): ReadonlyArray<ReadonlyArray<T>>
export function chunk<T>(array: ReadonlyArray<T>, size: number): T[][] {
    return array.reduce((acc, _, i) => {
        if (i % size === 0) {
            acc.push(array.slice(i, i + size))
        }
        return acc
    }, [] as T[][])
}

/**
 * Groups an array based on callback return value
 *
 * @example
 * ```
 * groupBy([6.1, 4.2, 6.3], Math.floor)
 * // [ [4, [4.2]], [6, [6.1, 6.3]] ]
 *
 * groupBy(['one', 'two', 'three'], v => [v.length, v.includes('a')])
 * // [ [[5, false], ['three']], [[3, false], ['one', 'two']] ]
 * ```
 * @category Array
 */
export function groupBy<T, G>(
    array: T[],
    keyCallback: (value: T) => G
): [G, T[]][]
export function groupBy<T, G>(
    array: ReadonlyArray<T>,
    keyCallback: (value: T) => G
): ReadonlyArray<[G, T[]]>
export function groupBy<T, G>(
    array: ReadonlyArray<T>,
    keyCallback: (value: T) => G
): [G, T[]][] {
    return Object.values(
        array.reduce((prev, cur) => {
            const key = keyCallback(cur)
            const keyHash = hashCode(keyCallback(cur))

            if (keyHash in prev) {
                prev[keyHash]?.[1].push(cur)
            } else {
                prev[keyHash] = [key, [cur]]
            }

            return prev
        }, {} as Record<number, [G, T[]]>)
    )
}

/**
 * Creates indexed object by provided callback.
 * 
 * If array is returned, creates a separate index for each array element.
 *
 * @example
 * ```
 * indexBy(['one', 'two', 'three'], v => v.length)
 * // { '5': ['three'], '3': ['one', 'two'] }
 * 
 * indexBy(['one', 'two', 'three'], v => [v.length, v.length + 1])
 * // { '5': ['three'], '6': ['three'], '3': ['one', 'two'], '4': ['one', 'two'] }
 * ```
 * @category Array
 */
export function indexBy<T>(
    array: T[],
    keyCallback: (value: T) => string | number | ReadonlyArray<string | number>
): Record<string, T[]>
export function indexBy<T>(
    array: ReadonlyArray<T>,
    keyCallback: (value: T) => string | number | ReadonlyArray<string | number>
): Record<string, ReadonlyArray<T>>
export function indexBy<T>(
    array: ReadonlyArray<T>,
    keyCallback: (value: T) => string | number | ReadonlyArray<string | number>
): Record<string, T[]> {
    return array.reduce((prev, cur) => {
        return ensureArray(keyCallback(cur)).reduce((prev2, key) => {
            if (key in prev) {
                prev2[key]?.push(cur)
            } else {
                prev2[key] = [cur]
            }

            return prev
        }, prev)
    }, {} as Record<string, T[]>)
}

/**
 * Removes duplicate values from the array.
 *
 * @example
 * ```
 * deduplicate([1, 1, 2, 3, 3])
 * // [1, 2, 3]
 * ```
 * @category Array
 */
export function deduplicate<T>(array: T[]): T[]
export function deduplicate<T>(array: ReadonlyArray<T>): ReadonlyArray<T>
export function deduplicate<T>(array: ReadonlyArray<T>): ReadonlyArray<T> {
    return deduplicateBy(array, (v) => v)
}

/**
 * Removes duplicate values from the array by given callback.
 *
 * @example
 * ```
 * deduplicateBy([ { a: 1 }, { a: 1 } ], v => v.a)
 * // [ { a: 1 } ]
 * ```
 * @category Array
 */
export function deduplicateBy<T>(array: T[], key: (value: T) => unknown): T[]
export function deduplicateBy<T>(array: ReadonlyArray<T>, key: (value: T) => unknown): ReadonlyArray<T>
export function deduplicateBy<T>(
    array: ReadonlyArray<T>,
    key: (value: T) => unknown
): ReadonlyArray<T>
export function deduplicateBy<T>(
    array: ReadonlyArray<T>,
    key: (value: T) => unknown
): ReadonlyArray<T> {
    const prims = {
        boolean: {} as Record<keyof any, boolean>,
        number: {} as Record<keyof any, boolean>,
        string: {} as Record<keyof any, boolean>,
    }
    type Prim = keyof typeof prims

    const objs: unknown[] = []

    return array.filter((rawItem) => {
        const item = key(rawItem)
        const type = typeof item
        if (type in prims) {
            if ((item as any) in prims[type as Prim]) {
                return false
            } else {
                return (prims[type as Prim][item as any] = true)
            }
        } else {
            return objs.indexOf(item) !== -1 ? false : objs.push(item)
        }
    })
}


/**
 * Creates an array of array values not included in the other given arrays.
 * 
 * @example
 * ```
 * difference([2, 1], [2, 3])
 * // [1]
 * 
 * difference([2, 1], ['2', '3'], (a, b) => a === parseInt(b))
 * // [1]
 * ```
 * @category Array
 */
export function difference<T, T2>(array: ReadonlyArray<T>, values: ReadonlyArray<T2>, key?: (value: T | T2) => unknown): ReadonlyArray<T>
export function difference<T, T2>(array: T[], values: T2[], key?: (value: T) => unknown): T[]
export function difference<T, T2>(array: ReadonlyArray<T>, values: ReadonlyArray<T2>, key: (value: T | T2) => unknown = v => v): T[] {
    return array.filter(v => !values.some(v2 => key(v) === key(v2)))
}

/**
 * Creates an array of unique values that are included in all given arrays.
 * 
 * @example
 * ```
 * intersection([[2, 1], [2, 3]])
 * // [2]
 * ```
 * @category Array
 */
export function intersection<T>(values: ReadonlyArray<ReadonlyArray<T>>, key?: (value: T) => unknown): ReadonlyArray<T>
export function intersection<T>(values: T[][], key?: (value: T) => unknown): T[]
export function intersection<T>(values: ReadonlyArray<ReadonlyArray<T>>, key: (value: T) => unknown = v => v): T[] {
    const [first, ...rest] = values
    return first ? first.filter(v => rest.every(v2 => v2.some(v3 => key(v) === key(v3)))) : []
}

/**
 * Creates an array of unique values that are included in all given arrays.
 * 
 * @example
 * ```
 * intersection([[2, 1], [2, 3]])
 * // [2]
 * ```
 * @category Array
 */
 export function union<T>(values: ReadonlyArray<ReadonlyArray<T>>, key?: (value: T) => unknown): ReadonlyArray<T>
 export function union<T>(values: T[][], key?: (value: T) => unknown): T[]
 export function union<T>(values: ReadonlyArray<ReadonlyArray<T>>, key: (value: T) => unknown = v => v): T[] {
    return deduplicateBy(values.reduce<T[]>((prev, cur) => {
        prev.push(...cur)
        return prev
     }, []), key)
}

 
/**
 * Checks if any value from provided values array is included in the provided array using provided `comparator` function (or by default comparing using `===`).
 * 
 * @category Array
 * @example
 * ```
 * includesAny([1, 2, 3], [3, 4, 5])
 * // true
 * ```
 */
export function includesAny<T, T2>(array: ReadonlyArray<T>, values: ReadonlyArray<T2>, key: (value: T | T2) => unknown = v => v): boolean {
    return values.some(v => array.some(v2 => key(v2) === key(v)))
}

/**
 * Checks if all values from provided values array are included in the provided array using provided `comparator` function (or by default comparing using `===`).
 * 
 * @category Array
 * @example
 * ```
 * includesAll([1, 2, 3], [1, 2])
 * // true
 * ```
 */
export function includesAll<T, T2>(array: ReadonlyArray<T>, values: ReadonlyArray<T2>, key: (value: T | T2) => unknown = v => v): boolean {
    return values.every(v => array.some(v2 => key(v2) === key(v)))
}
