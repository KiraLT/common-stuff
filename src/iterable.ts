import {
    isArray,
    isAsyncIterable,
    isIterable,
    isMap,
    isPlainObject,
    isPromise,
    isSet,
} from './guards.ts'

type AnyRecord = Record<PropertyKey, unknown>

// biome-ignore lint/suspicious/noExplicitAny: required for overload implementation variance
type AnyFn = (...args: any[]) => any

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
 * reduce([1,2,3], (a,b) => a + b, 0) // 6
 * reduce(new Set(['a','b']), (a,b) => a + b) // 'ab'
 * await reduce(asyncGen(), (a,b) => a + b) // 6
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
    reducer: (acc: T, value: T, index: number) => T | Promise<T>,
): Promise<T>
export function reduce<T, R>(
    iterable: AsyncIterable<T>,
    reducer: (acc: R, value: T, index: number) => R | Promise<R>,
    initial: R,
): Promise<R>
export function reduce(
    iterable: Iterable<unknown> | AsyncIterable<unknown>,
    reducer: AnyFn,
    ...rest: [unknown?]
): unknown {
    const hasInitial = rest.length > 0
    const initial = rest[0]

    if (isAsyncIterable(iterable)) {
        return (async () => {
            let acc: unknown = initial
            let index = 0
            let started = hasInitial
            for await (const value of iterable) {
                if (!started) {
                    acc = value
                    started = true
                } else {
                    acc = await reducer(acc, value, index)
                }
                index++
            }
            if (!started) {
                throw new Error(
                    'Reduce of empty (async) iterable with no initial value',
                )
            }
            return acc
        })()
    }

    if (isIterable(iterable)) {
        const iterator = iterable[Symbol.iterator]()
        const first = iterator.next()

        if (first.done) {
            if (!hasInitial) {
                throw new Error(
                    'Reduce of empty iterable with no initial value',
                )
            }
            return initial
        }

        let index = 0
        let acc: unknown
        if (!hasInitial) {
            acc = first.value
        } else {
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
            iter: Iterator<unknown>,
            nextIndex: number,
        ): Promise<unknown> {
            let asyncAcc = await firstPromise
            let i = nextIndex
            for (let n = iter.next(); !n.done; n = iter.next()) {
                asyncAcc = await reducer(asyncAcc, n.value, i)
                i++
            }
            return asyncAcc
        }
    }

    throw new TypeError('Provided source is not iterable')
}

/**
 * Maps each element of an iterable structure preserving the original container type.
 *
 * * `Array` → `Array`
 * * `Set` → `Set`
 * * `Map` → `Map` (mapper receives and returns `[key, value]`)
 * * `Record` → `Record` (mapper receives and returns `[key, value]`)
 * * `Iterable` → lazy `Iterable`
 * * `AsyncIterable` → lazy `AsyncIterable` (mapper may be async)
 *
 * @example
 * ```ts
 * map([1, 2, 3], v => v * 2) // [2, 4, 6]
 * map(new Set([1, 2]), v => v + 1) // Set { 2, 3 }
 * map(new Map([['a', 1]]), ([k, v]) => [k, v + 1]) // Map { 'a' => 2 }
 * map({ a: 1, b: 2 }, ([k, v]) => [k, v * 2]) // { a: 2, b: 4 }
 * ```
 * @group Iterable
 */
export function map<V, R>(
    input: V[],
    mapper: (value: V, index: number) => R,
): R[]
export function map<K, V, K2, V2>(
    input: Map<K, V>,
    mapper: (value: [K, V], index: number) => [K2, V2],
): Map<K2, V2>
export function map<T, R>(
    input: Set<T>,
    mapper: (value: T, index: number) => R,
): Set<R>
export function map<T, R>(
    input: AsyncIterable<T>,
    mapper: (value: T, index: number) => R | Promise<R>,
): AsyncIterable<R>
export function map<T, R>(
    input: Iterable<T>,
    mapper: (value: T, index: number) => R,
): Iterable<R>
export function map<
    K extends PropertyKey,
    V,
    K2 extends PropertyKey,
    V2,
>(
    input: Record<K, V>,
    mapper: (value: [K, V], index: number) => [K2, V2],
): Record<K2, V2>
export function map(input: unknown, mapper: AnyFn): unknown {
    return flatMap(input as Iterable<unknown>, ((value: unknown, index: number) => [
        mapper(value, index),
    ]) as AnyFn)
}

/**
 * Maps each element to an iterable, then flattens one level — preserving the original container type.
 *
 * @example
 * ```ts
 * flatMap([1, 2, 3], v => [v, v]) // [1, 1, 2, 2, 3, 3]
 * flatMap(new Set([1, 2]), v => [v, v + 10]) // Set { 1, 11, 2, 12 }
 * flatMap({ a: 1 }, ([k, v]) => [[k, v], [k + '!', v + 1]]) // { a: 1, 'a!': 2 }
 * ```
 * @group Iterable
 */
export function flatMap<V, R>(
    input: V[],
    mapper: (value: V, index: number) => Iterable<R>,
): R[]
export function flatMap<K, V, K2, V2>(
    input: Map<K, V>,
    mapper: (value: [K, V], index: number) => Iterable<[K2, V2]>,
): Map<K2, V2>
export function flatMap<T, R>(
    input: Set<T>,
    mapper: (value: T, index: number) => Iterable<R>,
): Set<R>
export function flatMap<T, R>(
    input: AsyncIterable<T>,
    mapper: (
        value: T,
        index: number,
    ) =>
        | Iterable<R>
        | AsyncIterable<R>
        | Promise<Iterable<R> | AsyncIterable<R>>,
): AsyncIterable<R>
export function flatMap<T, R>(
    input: Iterable<T>,
    mapper: (value: T, index: number) => Iterable<R>,
): Iterable<R>
export function flatMap<
    K extends PropertyKey,
    V,
    K2 extends PropertyKey,
    V2,
>(
    input: Record<K, V>,
    mapper: (value: [K, V], index: number) => Iterable<[K2, V2]>,
): Record<K2, V2>
export function flatMap(input: unknown, mapper: AnyFn): unknown {
    if (isArray(input)) {
        const out: unknown[] = []
        let i = 0
        for (const value of input) {
            for (const inner of mapper(value, i++) as Iterable<unknown>) {
                out.push(inner)
            }
        }
        return out
    }

    if (isSet(input)) {
        const out = new Set<unknown>()
        let i = 0
        for (const value of input) {
            for (const inner of mapper(value, i++) as Iterable<unknown>) {
                out.add(inner)
            }
        }
        return out
    }

    if (isMap(input)) {
        const out = new Map<unknown, unknown>()
        let i = 0
        for (const entry of input) {
            const inners = mapper(entry, i++) as Iterable<[unknown, unknown]>
            for (const inner of inners) {
                out.set(inner[0], inner[1])
            }
        }
        return out
    }

    if (isAsyncIterable(input)) {
        return (async function* () {
            let i = 0
            for await (const value of input) {
                const mapped = await mapper(value, i++)
                if (isAsyncIterable(mapped)) {
                    for await (const inner of mapped) yield inner
                } else if (isIterable(mapped)) {
                    for (const inner of mapped) yield inner
                } else {
                    throw new TypeError(
                        'flatMap mapper must return an iterable',
                    )
                }
            }
        })()
    }

    if (isIterable(input)) {
        return (function* () {
            let i = 0
            for (const value of input) {
                for (const inner of mapper(value, i++) as Iterable<unknown>) {
                    yield inner
                }
            }
        })()
    }

    if (isPlainObject(input)) {
        const out: AnyRecord = {}
        let i = 0
        for (const entry of Object.entries(input)) {
            const inners = mapper(entry, i++) as Iterable<[PropertyKey, unknown]>
            for (const inner of inners) {
                out[inner[0]] = inner[1]
            }
        }
        return out
    }

    throw new TypeError('Provided source is not iterable')
}

/**
 * Filters an iterable structure preserving the original container type.
 *
 * @example
 * ```ts
 * filter([1, 2, 3, 4], v => v % 2 === 0) // [2, 4]
 * filter(new Map([['a', 1], ['b', 2]]), ([, v]) => v > 1) // Map { 'b' => 2 }
 * filter({ a: 1, b: 2 }, ([, v]) => v > 1) // { b: 2 }
 * ```
 * @group Iterable
 */
export function filter<V, R extends V>(
    input: V[],
    predicate: (value: V, index: number) => value is R,
): R[]
export function filter<V>(
    input: V[],
    predicate: (value: V, index: number) => boolean,
): V[]
export function filter<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): Map<K, V>
export function filter<T, R extends T>(
    input: Set<T>,
    predicate: (value: T, index: number) => value is R,
): Set<R>
export function filter<T>(
    input: Set<T>,
    predicate: (value: T, index: number) => boolean,
): Set<T>
export function filter<T>(
    input: AsyncIterable<T>,
    predicate: (value: T, index: number) => boolean | Promise<boolean>,
): AsyncIterable<T>
export function filter<T>(
    input: Iterable<T>,
    predicate: (value: T, index: number) => boolean,
): Iterable<T>
export function filter<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): Record<K, V>
export function filter(input: unknown, predicate: AnyFn): unknown {
    if (isArray(input)) {
        return input.filter((v, i) => Boolean(predicate(v, i)))
    }

    if (isSet(input)) {
        const out = new Set<unknown>()
        let i = 0
        for (const value of input) {
            if (predicate(value, i++)) out.add(value)
        }
        return out
    }

    if (isMap(input)) {
        const out = new Map<unknown, unknown>()
        let i = 0
        for (const entry of input) {
            if (predicate(entry, i++)) out.set(entry[0], entry[1])
        }
        return out
    }

    if (isAsyncIterable(input)) {
        return (async function* () {
            let i = 0
            for await (const value of input) {
                if (await predicate(value, i++)) yield value
            }
        })()
    }

    if (isIterable(input)) {
        return (function* () {
            let i = 0
            for (const value of input) {
                if (predicate(value, i++)) yield value
            }
        })()
    }

    if (isPlainObject(input)) {
        const out: AnyRecord = {}
        let i = 0
        for (const entry of Object.entries(input)) {
            if (predicate(entry, i++)) out[entry[0]] = entry[1]
        }
        return out
    }

    throw new TypeError('Provided source is not iterable')
}

/**
 * Iterates each element of an iterable structure, calling `fn` for side effects.
 *
 * Returns `Promise<void>` for `AsyncIterable` inputs, `void` otherwise.
 *
 * @group Iterable
 */
export function forEach<V>(
    input: V[],
    fn: (value: V, index: number) => void,
): void
export function forEach<K, V>(
    input: Map<K, V>,
    fn: (value: [K, V], index: number) => void,
): void
export function forEach<T>(
    input: Set<T>,
    fn: (value: T, index: number) => void,
): void
export function forEach<T>(
    input: AsyncIterable<T>,
    fn: (value: T, index: number) => void | Promise<void>,
): Promise<void>
export function forEach<T>(
    input: Iterable<T>,
    fn: (value: T, index: number) => void,
): void
export function forEach<K extends PropertyKey, V>(
    input: Record<K, V>,
    fn: (value: [K, V], index: number) => void,
): void
export function forEach(input: unknown, fn: AnyFn): unknown {
    if (isAsyncIterable(input)) {
        return (async () => {
            let i = 0
            for await (const value of input) {
                await fn(value, i++)
            }
        })()
    }

    if (isIterable(input)) {
        let i = 0
        for (const value of input) {
            fn(value, i++)
        }
        return
    }

    if (isPlainObject(input)) {
        let i = 0
        for (const entry of Object.entries(input)) {
            fn(entry, i++)
        }
        return
    }

    throw new TypeError('Provided source is not iterable')
}

/**
 * Returns the first element matching the predicate, or `undefined` if none match.
 *
 * Returns `Promise` for `AsyncIterable` inputs.
 *
 * @group Iterable
 */
export function find<V, R extends V>(
    input: V[],
    predicate: (value: V, index: number) => value is R,
): R | undefined
export function find<V>(
    input: V[],
    predicate: (value: V, index: number) => boolean,
): V | undefined
export function find<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): [K, V] | undefined
export function find<T, R extends T>(
    input: Set<T>,
    predicate: (value: T, index: number) => value is R,
): R | undefined
export function find<T>(
    input: Set<T>,
    predicate: (value: T, index: number) => boolean,
): T | undefined
export function find<T>(
    input: AsyncIterable<T>,
    predicate: (value: T, index: number) => boolean | Promise<boolean>,
): Promise<T | undefined>
export function find<T>(
    input: Iterable<T>,
    predicate: (value: T, index: number) => boolean,
): T | undefined
export function find<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): [K, V] | undefined
export function find(input: unknown, predicate: AnyFn): unknown {
    if (isAsyncIterable(input)) {
        return (async () => {
            let i = 0
            for await (const value of input) {
                if (await predicate(value, i++)) return value
            }
            return undefined
        })()
    }

    if (isIterable(input)) {
        let i = 0
        for (const value of input) {
            if (predicate(value, i++)) return value
        }
        return undefined
    }

    if (isPlainObject(input)) {
        let i = 0
        for (const entry of Object.entries(input)) {
            if (predicate(entry, i++)) return entry
        }
        return undefined
    }

    throw new TypeError('Provided source is not iterable')
}

/**
 * Returns `true` if at least one element matches the predicate.
 * Returns a `Promise` for `AsyncIterable` inputs.
 *
 * @group Iterable
 */
export function some<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): boolean
export function some<T>(
    input: AsyncIterable<T>,
    predicate: (value: T, index: number) => boolean | Promise<boolean>,
): Promise<boolean>
export function some<V>(
    input: V[] | Set<V> | Iterable<V>,
    predicate: (value: V, index: number) => boolean,
): boolean
export function some<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): boolean
export function some(input: unknown, predicate: AnyFn): unknown {
    if (isAsyncIterable(input)) {
        return (async () => {
            let i = 0
            for await (const value of input) {
                if (await predicate(value, i++)) return true
            }
            return false
        })()
    }

    if (isIterable(input)) {
        let i = 0
        for (const value of input) {
            if (predicate(value, i++)) return true
        }
        return false
    }

    if (isPlainObject(input)) {
        let i = 0
        for (const entry of Object.entries(input)) {
            if (predicate(entry, i++)) return true
        }
        return false
    }

    throw new TypeError('Provided source is not iterable')
}

/**
 * Returns `true` if every element matches the predicate (vacuously true for empty inputs).
 * Returns a `Promise` for `AsyncIterable` inputs.
 *
 * @group Iterable
 */
export function every<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): boolean
export function every<T>(
    input: AsyncIterable<T>,
    predicate: (value: T, index: number) => boolean | Promise<boolean>,
): Promise<boolean>
export function every<V>(
    input: V[] | Set<V> | Iterable<V>,
    predicate: (value: V, index: number) => boolean,
): boolean
export function every<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): boolean
export function every(input: unknown, predicate: AnyFn): unknown {
    if (isAsyncIterable(input)) {
        return (async () => {
            let i = 0
            for await (const value of input) {
                if (!(await predicate(value, i++))) return false
            }
            return true
        })()
    }

    if (isIterable(input)) {
        let i = 0
        for (const value of input) {
            if (!predicate(value, i++)) return false
        }
        return true
    }

    if (isPlainObject(input)) {
        let i = 0
        for (const entry of Object.entries(input)) {
            if (!predicate(entry, i++)) return false
        }
        return true
    }

    throw new TypeError('Provided source is not iterable')
}

/**
 * Returns the number of elements in any iterable structure.
 *
 * For `AsyncIterable` returns `Promise<number>` (full traversal).
 * For `Array`, `Set`, `Map`, `Record` uses native `length`/`size`/key count.
 *
 * @group Iterable
 */
export function size<T>(input: T[] | Set<T> | Map<unknown, T>): number
export function size<T>(input: AsyncIterable<T>): Promise<number>
export function size<T>(input: Iterable<T>): number
export function size(input: Record<PropertyKey, unknown>): number
export function size(input: unknown): unknown {
    if (isArray(input)) return input.length
    if (isSet(input) || isMap(input)) return input.size

    if (isAsyncIterable(input)) {
        return (async () => {
            let n = 0
            for await (const _ of input) n++
            return n
        })()
    }

    if (isIterable(input)) {
        let n = 0
        for (const _ of input) n++
        return n
    }

    if (isPlainObject(input)) return Object.keys(input).length

    throw new TypeError('Provided source is not iterable')
}

/**
 * Collects all elements of an iterable structure into a fresh array.
 *
 * For `Map` and `Record` produces an array of `[key, value]` entries.
 * For `AsyncIterable` returns a `Promise<T[]>`.
 *
 * @group Iterable
 */
export function toArray<V>(input: V[] | Set<V>): V[]
export function toArray<K, V>(input: Map<K, V>): [K, V][]
export function toArray<T>(input: AsyncIterable<T>): Promise<T[]>
export function toArray<T>(input: Iterable<T>): T[]
export function toArray<K extends PropertyKey, V>(
    input: Record<K, V>,
): [K, V][]
export function toArray(input: unknown): unknown {
    if (isArray(input)) return input.slice()
    if (isSet(input)) return Array.from(input)
    if (isMap(input)) return Array.from(input)

    if (isAsyncIterable(input)) {
        return (async () => {
            const out: unknown[] = []
            for await (const value of input) out.push(value)
            return out
        })()
    }

    if (isIterable(input)) return Array.from(input)

    if (isPlainObject(input)) return Object.entries(input)

    throw new TypeError('Provided source is not iterable')
}
