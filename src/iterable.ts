import { isAsyncIterable, isIterable, isPromise } from './guards'

/**
 * Reduces values of an iterable (Array, Set, Iterable, AsyncIterable) into a single value using the provided reducer function.
 *
 * Works with:
 * * Synchronous iterables (`Array`, `Set`, custom `Iterable`)
 * * Asynchronous iterables (`AsyncIterable` / async generators)
 * * Synchronous or asynchronous reducer functions (if the reducer returns a promise the result becomes a promise)
 *
 * If the initial value isn't provided, the first emitted value is used as the accumulator (same semantics as `Array.prototype.reduce`).
 * When used with an empty iterable without an initial value an error is thrown.
 *
 * @example
 * ```ts
 * // Array (sync)
 * const sum = reduce([1,2,3], (a,b) => a + b, 0) // 6
 *
 * // Set
 * const concatenated = reduce(new Set(['a','b']), (a,b) => a + b) // 'ab'
 *
 * // Custom iterable
 * const iterable = { [Symbol.iterator]: function*(){ yield 1; yield 2 } }
 * const total = reduce(iterable, (a,b) => a + b, 0) // 3
 *
 * // Async iterable
 * async function* gen(){ yield 1; yield 2; yield 3 }
 * const asyncTotal = await reduce(gen(), (a,b) => a + b) // 6
 *
 * // Async reducer (returns Promise)
 * const asyncReduced = await reduce([1,2,3], async (a,b) => a + b, 0) // 6
 * ```
 * @group Iterable
 */
export function reduce<T>(
    iterable: Iterable<T>,
    reducer: (acc: T, value: T, index: number) => T,
): T
export function reduce<T, R>(
    iterable: Iterable<T>,
    reducer: (acc: R, value: T, index: number) => R,
    initial: R,
): R
export function reduce<T>(
    iterable: Iterable<T>,
    reducer: (acc: T, value: T, index: number) => Promise<T>,
): Promise<T>
export function reduce<T, R>(
    iterable: Iterable<T>,
    reducer: (acc: R, value: T, index: number) => Promise<R>,
    initial: R,
): Promise<R>
export function reduce<T>(
    iterable: AsyncIterable<T>,
    reducer: (acc: T, value: T, index: number) => T,
): Promise<T>
export function reduce<T, R>(
    iterable: AsyncIterable<T>,
    reducer: (acc: R, value: T, index: number) => R,
    initial: R,
): Promise<R>
export function reduce<T>(
    iterable: AsyncIterable<T>,
    reducer: (acc: T, value: T, index: number) => Promise<T>,
): Promise<T>
export function reduce<T, R>(
    iterable: AsyncIterable<T>,
    reducer: (acc: R, value: T, index: number) => Promise<R>,
    initial: R,
): Promise<R>
export function reduce(
    iterable: Iterable<unknown> | AsyncIterable<unknown>,
    reducer: (
        acc: unknown,
        value: unknown,
        index: number,
    ) => unknown | Promise<unknown>,
    initial?: unknown,
): unknown {
    const hasInitial = typeof initial !== 'undefined'

    if (isAsyncIterable(iterable)) {
        return (async () => {
            let acc: unknown
            let index = 0
            for await (const value of iterable) {
                if (index === 0 && !hasInitial) {
                    acc = value
                } else {
                    acc = await reducer(
                        index === 0 && hasInitial ? initial : acc,
                        value,
                        index,
                    )
                }
                index++
            }
            if (index === 0 && !hasInitial) {
                throw new Error(
                    'Reduce of empty (async) iterable with no initial value',
                )
            }
            return index === 0 && hasInitial ? initial : acc
        })()
    }

    if (isIterable(iterable)) {
        const iterator = iterable[Symbol.iterator]()
        let index = 0
        let acc: unknown
        const first = iterator.next()

        if (first.done) {
            if (!hasInitial) {
                throw new Error(
                    'Reduce of empty iterable with no initial value',
                )
            }
            return initial
        }

        if (!hasInitial) {
            acc = first.value
        } else {
            // Apply reducer on first value using initial accumulator
            const r = reducer(initial, first.value, index)
            if (isPromise(r)) {
                return continueAsync(r, iterator, index + 1)
            }
            acc = r
        }
        index++

        for (let next = iterator.next(); !next.done; next = iterator.next()) {
            const r = reducer(acc, next.value, index)
            if (isPromise(r)) {
                return continueAsync(r, iterator, index + 1)
            }
            acc = r
            index++
        }

        return acc

        async function continueAsync(
            firstPromise: Promise<unknown>,
            iterator: Iterator<unknown>,
            nextIndex: number,
        ): Promise<unknown> {
            let asyncAcc = await firstPromise
            let i = nextIndex
            for (let n = iterator.next(); !n.done; n = iterator.next()) {
                asyncAcc = await reducer(asyncAcc, n.value, i)
                i++
            }
            return asyncAcc
        }
    }

    throw new TypeError('Provided source is not iterable')
}
