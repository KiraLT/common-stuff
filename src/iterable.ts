import {
    isArray,
    isAsyncIterable,
    isIterable,
    isMap,
    isPlainObject,
    isPromise,
    isSet,
} from './guards.ts'

// biome-ignore lint/suspicious/noExplicitAny: required for overload implementation variance
type AnyFn = (...args: any[]) => any

/**
 * Element type of any sync or async iterable.
 */
type IterableItem<I> = I extends AsyncIterable<infer T>
    ? T
    : I extends Iterable<infer T>
      ? T
      : never

/**
 * Reduce return type:
 *  - For an `AsyncIterable` input, always `Promise<resolved R>`.
 *  - For a sync `Iterable`, `R` directly (which is itself a `Promise` when the reducer is async).
 */
type ReduceResult<I, R> = I extends AsyncIterable<unknown>
    ? Promise<Awaited<R>>
    : R

/**
 * Awaits all promises in the array if any is found, otherwise returns the array as-is.
 * Lets a single code path handle both sync and async callback returns.
 */
function resolveAll<T>(
    values: ReadonlyArray<T | Promise<T>>,
): T[] | Promise<T[]> {
    return values.some(isPromise) ? Promise.all(values) : (values as T[])
}

/**
 * Materializes any sync iterable structure into an array of items.
 * For Maps and plain objects the items are `[key, value]` entries.
 */
function toItems(input: unknown): unknown[] {
    if (isArray(input)) return input
    if (isSet(input)) return Array.from(input)
    if (isMap(input)) return Array.from(input)
    if (isIterable(input)) return Array.from(input)
    if (isPlainObject(input)) return Object.entries(input)
    throw new TypeError('Provided source is not iterable')
}

/**
 * Returns the index of the first element where `predicate` returns truthy, or `-1`.
 * Switches to async mode automatically when `predicate` returns a Promise.
 */
function findIndexMaybeAsync(
    items: ReadonlyArray<unknown>,
    predicate: (value: unknown, index: number) => unknown,
): number | Promise<number> {
    for (let i = 0; i < items.length; i++) {
        const r = predicate(items[i], i)
        if (isPromise(r)) return continueAsync(i, r)
        if (r) return i
    }
    return -1

    async function continueAsync(
        idx: number,
        currentResult: Promise<unknown>,
    ): Promise<number> {
        if (await currentResult) return idx
        for (let i = idx + 1; i < items.length; i++) {
            if (await predicate(items[i], i)) return i
        }
        return -1
    }
}

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
export function reduce<
    I extends Iterable<unknown> | AsyncIterable<unknown>,
    R,
>(
    iterable: I,
    reducer: (
        acc: IterableItem<I>,
        value: IterableItem<I>,
        index: number,
    ) => R,
): ReduceResult<I, R>
export function reduce<
    I extends Iterable<unknown> | AsyncIterable<unknown>,
    R,
>(
    iterable: I,
    reducer: (acc: Awaited<R>, value: IterableItem<I>, index: number) => R,
    initial: Awaited<R>,
): ReduceResult<I, R>
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
 * * `Iterable` → lazy `Iterable` (eagerly resolved when mapper is async)
 * * `AsyncIterable` → lazy `AsyncIterable` (mapper may be async)
 *
 * When the mapper returns a `Promise`, the function returns a `Promise` of the resulting container.
 *
 * @example
 * ```ts
 * map([1, 2, 3], v => v * 2)            // [2, 4, 6]
 * await map([1, 2, 3], async v => v*2)  // [2, 4, 6] (Promise)
 * map(new Set([1, 2]), v => v + 1)      // Set { 2, 3 }
 * ```
 * @group Iterable
 */
export function map<V, R>(
    input: V[],
    mapper: (value: V, index: number) => Promise<R>,
): Promise<R[]>
export function map<V, R>(
    input: V[],
    mapper: (value: V, index: number) => R,
): R[]
export function map<K, V, K2, V2>(
    input: Map<K, V>,
    mapper: (value: [K, V], index: number) => Promise<[K2, V2]>,
): Promise<Map<K2, V2>>
export function map<K, V, K2, V2>(
    input: Map<K, V>,
    mapper: (value: [K, V], index: number) => [K2, V2],
): Map<K2, V2>
export function map<T, R>(
    input: Set<T>,
    mapper: (value: T, index: number) => Promise<R>,
): Promise<Set<R>>
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
    mapper: (value: T, index: number) => Promise<R>,
): Promise<Iterable<R>>
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
export function map<
    K extends PropertyKey,
    V,
    K2 extends PropertyKey,
    V2,
>(
    input: Record<K, V>,
    mapper: (value: [K, V], index: number) => Promise<[K2, V2]>,
): Promise<Record<K2, V2>>
export function map(input: unknown, mapper: AnyFn): unknown {
    if (isAsyncIterable(input)) {
        return (async function* () {
            let i = 0
            for await (const value of input) {
                yield await mapper(value, i++)
            }
        })()
    }

    if (isArray(input)) {
        const results = input.map(mapper)
        return resolveAll(results)
    }

    if (isSet(input)) {
        const results = Array.from(input).map(mapper)
        const resolved = resolveAll(results)
        return isPromise(resolved)
            ? resolved.then((r) => new Set(r))
            : new Set(resolved)
    }

    if (isMap(input)) {
        const results = Array.from(input).map(mapper)
        const resolved = resolveAll(results)
        return isPromise(resolved)
            ? resolved.then(
                  (entries) =>
                      new Map(entries as Iterable<[unknown, unknown]>),
              )
            : new Map(resolved as Iterable<[unknown, unknown]>)
    }

    if (isIterable(input)) {
        const results = Array.from(input).map(mapper)
        const resolved = resolveAll(results)
        if (isPromise(resolved)) return resolved
        return (function* () {
            for (const v of resolved) yield v
        })()
    }

    if (isPlainObject(input)) {
        const entries = Object.entries(input).map(mapper)
        const resolved = resolveAll(entries)
        return isPromise(resolved)
            ? resolved.then((es) =>
                  Object.fromEntries(es as Iterable<[PropertyKey, unknown]>),
              )
            : Object.fromEntries(resolved as Iterable<[PropertyKey, unknown]>)
    }

    throw new TypeError('Provided source is not iterable')
}

/**
 * Maps each element to an iterable, then flattens one level — preserving the original container type.
 *
 * When the mapper returns a `Promise`, the function returns a `Promise` of the resulting container.
 *
 * @example
 * ```ts
 * flatMap([1, 2, 3], v => [v, v]) // [1, 1, 2, 2, 3, 3]
 * await flatMap([1, 2], async v => [v, v + 10]) // [1, 11, 2, 12]
 * ```
 * @group Iterable
 */
export function flatMap<V, R>(
    input: V[],
    mapper: (value: V, index: number) => Promise<Iterable<R>>,
): Promise<R[]>
export function flatMap<V, R>(
    input: V[],
    mapper: (value: V, index: number) => Iterable<R>,
): R[]
export function flatMap<K, V, K2, V2>(
    input: Map<K, V>,
    mapper: (value: [K, V], index: number) => Promise<Iterable<[K2, V2]>>,
): Promise<Map<K2, V2>>
export function flatMap<K, V, K2, V2>(
    input: Map<K, V>,
    mapper: (value: [K, V], index: number) => Iterable<[K2, V2]>,
): Map<K2, V2>
export function flatMap<T, R>(
    input: Set<T>,
    mapper: (value: T, index: number) => Promise<Iterable<R>>,
): Promise<Set<R>>
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
    mapper: (value: T, index: number) => Promise<Iterable<R>>,
): Promise<Iterable<R>>
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
export function flatMap<
    K extends PropertyKey,
    V,
    K2 extends PropertyKey,
    V2,
>(
    input: Record<K, V>,
    mapper: (value: [K, V], index: number) => Promise<Iterable<[K2, V2]>>,
): Promise<Record<K2, V2>>
export function flatMap(input: unknown, mapper: AnyFn): unknown {
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

    const items = toItems(input)
    const mapped = items.map(mapper)
    const resolved = resolveAll(mapped)

    const flatten = (groups: ReadonlyArray<unknown>): unknown[] => {
        const out: unknown[] = []
        for (const group of groups) {
            for (const inner of group as Iterable<unknown>) out.push(inner)
        }
        return out
    }

    if (isArray(input)) {
        return isPromise(resolved)
            ? resolved.then((g) => flatten(g))
            : flatten(resolved)
    }

    if (isSet(input)) {
        return isPromise(resolved)
            ? resolved.then((g) => new Set(flatten(g)))
            : new Set(flatten(resolved))
    }

    if (isMap(input)) {
        return isPromise(resolved)
            ? resolved.then(
                  (g) =>
                      new Map(flatten(g) as Iterable<[unknown, unknown]>),
              )
            : new Map(flatten(resolved) as Iterable<[unknown, unknown]>)
    }

    if (isIterable(input)) {
        if (isPromise(resolved)) return resolved.then((g) => flatten(g))
        return (function* () {
            for (const v of flatten(resolved)) yield v
        })()
    }

    // Plain object (Record)
    return isPromise(resolved)
        ? resolved.then((g) =>
              Object.fromEntries(
                  flatten(g) as Iterable<[PropertyKey, unknown]>,
              ),
          )
        : Object.fromEntries(
              flatten(resolved) as Iterable<[PropertyKey, unknown]>,
          )
}

/**
 * Filters an iterable structure preserving the original container type.
 *
 * When the predicate returns a `Promise`, the function returns a `Promise` of the resulting container.
 *
 * @example
 * ```ts
 * filter([1, 2, 3, 4], v => v % 2 === 0)            // [2, 4]
 * await filter([1, 2, 3], async v => v > 1)          // [2, 3]
 * ```
 * @group Iterable
 */
export function filter<V>(
    input: V[],
    predicate: (value: V, index: number) => Promise<boolean>,
): Promise<V[]>
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
    predicate: (value: [K, V], index: number) => Promise<boolean>,
): Promise<Map<K, V>>
export function filter<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): Map<K, V>
export function filter<T>(
    input: Set<T>,
    predicate: (value: T, index: number) => Promise<boolean>,
): Promise<Set<T>>
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
    predicate: (value: T, index: number) => Promise<boolean>,
): Promise<Iterable<T>>
export function filter<T>(
    input: Iterable<T>,
    predicate: (value: T, index: number) => boolean,
): Iterable<T>
export function filter<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => Promise<boolean>,
): Promise<Record<K, V>>
export function filter<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): Record<K, V>
export function filter(input: unknown, predicate: AnyFn): unknown {
    if (isAsyncIterable(input)) {
        return (async function* () {
            let i = 0
            for await (const value of input) {
                if (await predicate(value, i++)) yield value
            }
        })()
    }

    const items = toItems(input)
    const decisions = items.map(predicate)
    const resolved = resolveAll(decisions)

    const select = (kept: ReadonlyArray<unknown>): unknown[] =>
        items.filter((_, i) => Boolean(kept[i]))

    if (isArray(input)) {
        return isPromise(resolved)
            ? resolved.then((d) => select(d))
            : select(resolved)
    }

    if (isSet(input)) {
        return isPromise(resolved)
            ? resolved.then((d) => new Set(select(d)))
            : new Set(select(resolved))
    }

    if (isMap(input)) {
        return isPromise(resolved)
            ? resolved.then(
                  (d) =>
                      new Map(select(d) as Iterable<[unknown, unknown]>),
              )
            : new Map(select(resolved) as Iterable<[unknown, unknown]>)
    }

    if (isIterable(input)) {
        if (isPromise(resolved)) return resolved.then((d) => select(d))
        return (function* () {
            for (const v of select(resolved)) yield v
        })()
    }

    // Plain object (Record)
    return isPromise(resolved)
        ? resolved.then((d) =>
              Object.fromEntries(
                  select(d) as Iterable<[PropertyKey, unknown]>,
              ),
          )
        : Object.fromEntries(
              select(resolved) as Iterable<[PropertyKey, unknown]>,
          )
}

/**
 * Iterates each element of an iterable structure, calling `fn` for side effects.
 *
 * Returns `Promise<void>` for `AsyncIterable` inputs and when `fn` returns a `Promise`,
 * `void` otherwise. Sequential ordering is preserved with async callbacks.
 *
 * @group Iterable
 */
export function forEach<V>(
    input: V[],
    fn: (value: V, index: number) => Promise<void>,
): Promise<void>
export function forEach<V>(
    input: V[],
    fn: (value: V, index: number) => void,
): void
export function forEach<K, V>(
    input: Map<K, V>,
    fn: (value: [K, V], index: number) => Promise<void>,
): Promise<void>
export function forEach<K, V>(
    input: Map<K, V>,
    fn: (value: [K, V], index: number) => void,
): void
export function forEach<T>(
    input: Set<T>,
    fn: (value: T, index: number) => Promise<void>,
): Promise<void>
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
    fn: (value: T, index: number) => Promise<void>,
): Promise<void>
export function forEach<T>(
    input: Iterable<T>,
    fn: (value: T, index: number) => void,
): void
export function forEach<K extends PropertyKey, V>(
    input: Record<K, V>,
    fn: (value: [K, V], index: number) => Promise<void>,
): Promise<void>
export function forEach<K extends PropertyKey, V>(
    input: Record<K, V>,
    fn: (value: [K, V], index: number) => void,
): void
export function forEach(input: unknown, fn: AnyFn): unknown {
    if (isAsyncIterable(input)) {
        return (async () => {
            let i = 0
            for await (const value of input) await fn(value, i++)
        })()
    }

    const items = toItems(input)
    for (let i = 0; i < items.length; i++) {
        const r = fn(items[i], i)
        if (isPromise(r)) return continueAsync(r, i + 1)
    }
    return undefined

    async function continueAsync(
        currentResult: Promise<unknown>,
        nextIdx: number,
    ): Promise<void> {
        await currentResult
        for (let i = nextIdx; i < items.length; i++) {
            await fn(items[i], i)
        }
    }
}

/**
 * Returns the first element matching the predicate, or `undefined` if none match.
 *
 * Returns `Promise` when input is an `AsyncIterable` or the predicate returns a `Promise`.
 * Sequential evaluation with short-circuit when the predicate is async.
 *
 * @group Iterable
 */
export function find<V>(
    input: V[],
    predicate: (value: V, index: number) => Promise<boolean>,
): Promise<V | undefined>
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
    predicate: (value: [K, V], index: number) => Promise<boolean>,
): Promise<[K, V] | undefined>
export function find<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): [K, V] | undefined
export function find<T>(
    input: Set<T>,
    predicate: (value: T, index: number) => Promise<boolean>,
): Promise<T | undefined>
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
    predicate: (value: T, index: number) => Promise<boolean>,
): Promise<T | undefined>
export function find<T>(
    input: Iterable<T>,
    predicate: (value: T, index: number) => boolean,
): T | undefined
export function find<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => Promise<boolean>,
): Promise<[K, V] | undefined>
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

    const items = toItems(input)
    const idx = findIndexMaybeAsync(items, predicate)
    if (isPromise(idx)) {
        return idx.then((i) => (i === -1 ? undefined : items[i]))
    }
    return idx === -1 ? undefined : items[idx]
}

/**
 * Returns `true` if at least one element matches the predicate.
 *
 * Returns a `Promise` when input is an `AsyncIterable` or the predicate returns a `Promise`.
 *
 * @group Iterable
 */
export function some<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => Promise<boolean>,
): Promise<boolean>
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
    predicate: (value: V, index: number) => Promise<boolean>,
): Promise<boolean>
export function some<V>(
    input: V[] | Set<V> | Iterable<V>,
    predicate: (value: V, index: number) => boolean,
): boolean
export function some<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => Promise<boolean>,
): Promise<boolean>
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

    const items = toItems(input)
    const idx = findIndexMaybeAsync(items, predicate)
    if (isPromise(idx)) return idx.then((i) => i !== -1)
    return idx !== -1
}

/**
 * Returns `true` if every element matches the predicate (vacuously true for empty inputs).
 *
 * Returns a `Promise` when input is an `AsyncIterable` or the predicate returns a `Promise`.
 *
 * @group Iterable
 */
export function every<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => Promise<boolean>,
): Promise<boolean>
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
    predicate: (value: V, index: number) => Promise<boolean>,
): Promise<boolean>
export function every<V>(
    input: V[] | Set<V> | Iterable<V>,
    predicate: (value: V, index: number) => boolean,
): boolean
export function every<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => Promise<boolean>,
): Promise<boolean>
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

    const items = toItems(input)
    const negated = (v: unknown, i: number) => {
        const r = predicate(v, i)
        return isPromise(r) ? r.then((b) => !b) : !r
    }
    const idx = findIndexMaybeAsync(items, negated)
    if (isPromise(idx)) return idx.then((i) => i === -1)
    return idx === -1
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

/**
 * Returns a new container with the first `n` elements of the input,
 * preserving the original container type.
 *
 * For `AsyncIterable`/`Iterable` the result is lazy and stops the source iterator
 * after `n` elements. Negative `n` is treated as `0`.
 *
 * @example
 * ```ts
 * take([1, 2, 3, 4], 2)            // [1, 2]
 * take(new Set([1, 2, 3]), 2)      // Set { 1, 2 }
 * take({ a: 1, b: 2, c: 3 }, 2)    // { a: 1, b: 2 }
 * ```
 * @group Iterable
 */
export function take<V>(input: V[], n: number): V[]
export function take<K, V>(input: Map<K, V>, n: number): Map<K, V>
export function take<T>(input: Set<T>, n: number): Set<T>
export function take<T>(input: AsyncIterable<T>, n: number): AsyncIterable<T>
export function take<T>(input: Iterable<T>, n: number): Iterable<T>
export function take<K extends PropertyKey, V>(
    input: Record<K, V>,
    n: number,
): Record<K, V>
export function take(input: unknown, n: number): unknown {
    const limit = Math.max(0, n)

    if (isAsyncIterable(input)) {
        return (async function* () {
            if (limit === 0) return
            let i = 0
            for await (const v of input) {
                yield v
                if (++i >= limit) return
            }
        })()
    }

    if (isArray(input)) return input.slice(0, limit)
    if (isSet(input)) return new Set(Array.from(input).slice(0, limit))
    if (isMap(input)) return new Map(Array.from(input).slice(0, limit))

    if (isIterable(input)) {
        return (function* () {
            if (limit === 0) return
            let i = 0
            for (const v of input) {
                yield v
                if (++i >= limit) return
            }
        })()
    }

    if (isPlainObject(input)) {
        return Object.fromEntries(Object.entries(input).slice(0, limit))
    }

    throw new TypeError('Provided source is not iterable')
}

/**
 * Returns a new container skipping the first `n` elements of the input,
 * preserving the original container type.
 *
 * Negative `n` is treated as `0`.
 *
 * @example
 * ```ts
 * drop([1, 2, 3, 4], 2)            // [3, 4]
 * drop(new Set([1, 2, 3]), 1)      // Set { 2, 3 }
 * ```
 * @group Iterable
 */
export function drop<V>(input: V[], n: number): V[]
export function drop<K, V>(input: Map<K, V>, n: number): Map<K, V>
export function drop<T>(input: Set<T>, n: number): Set<T>
export function drop<T>(input: AsyncIterable<T>, n: number): AsyncIterable<T>
export function drop<T>(input: Iterable<T>, n: number): Iterable<T>
export function drop<K extends PropertyKey, V>(
    input: Record<K, V>,
    n: number,
): Partial<Record<K, V>>
export function drop(input: unknown, n: number): unknown {
    const skip = Math.max(0, n)

    if (isAsyncIterable(input)) {
        return (async function* () {
            let i = 0
            for await (const v of input) {
                if (i++ < skip) continue
                yield v
            }
        })()
    }

    if (isArray(input)) return input.slice(skip)
    if (isSet(input)) return new Set(Array.from(input).slice(skip))
    if (isMap(input)) return new Map(Array.from(input).slice(skip))

    if (isIterable(input)) {
        return (function* () {
            let i = 0
            for (const v of input) {
                if (i++ < skip) continue
                yield v
            }
        })()
    }

    if (isPlainObject(input)) {
        return Object.fromEntries(Object.entries(input).slice(skip))
    }

    throw new TypeError('Provided source is not iterable')
}

/**
 * Takes leading elements as long as `predicate` returns truthy, stopping at the
 * first falsy result. Preserves the input container type.
 *
 * Async predicate or `AsyncIterable` input wraps the result in a `Promise`
 * (or `AsyncIterable` for `AsyncIterable` input).
 *
 * @example
 * ```
 * takeWhile([1, 2, 3, 1], v => v < 3)      // [1, 2]
 * takeWhile(new Set([1, 2, 3]), v => v < 3) // Set { 1, 2 }
 * ```
 * @group Iterable
 */
export function takeWhile<V>(
    input: V[],
    predicate: (value: V, index: number) => Promise<boolean>,
): Promise<V[]>
export function takeWhile<V>(
    input: V[],
    predicate: (value: V, index: number) => boolean,
): V[]
export function takeWhile<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): Map<K, V>
export function takeWhile<T>(
    input: Set<T>,
    predicate: (value: T, index: number) => boolean,
): Set<T>
export function takeWhile<T>(
    input: AsyncIterable<T>,
    predicate: (value: T, index: number) => boolean | Promise<boolean>,
): AsyncIterable<T>
export function takeWhile<T>(
    input: Iterable<T>,
    predicate: (value: T, index: number) => boolean,
): Iterable<T>
export function takeWhile<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): Partial<Record<K, V>>
export function takeWhile(input: unknown, predicate: AnyFn): unknown {
    if (isAsyncIterable(input)) {
        return (async function* () {
            let i = 0
            for await (const v of input) {
                if (!(await predicate(v, i++))) return
                yield v
            }
        })()
    }

    const items = toItems(input)

    const collectSync = (): unknown[] | Promise<unknown[]> => {
        const out: unknown[] = []
        for (let i = 0; i < items.length; i++) {
            const r = predicate(items[i], i)
            if (isPromise(r)) return continueAsync(out, i, r)
            if (!r) return out
            out.push(items[i])
        }
        return out
    }

    async function continueAsync(
        out: unknown[],
        startIdx: number,
        firstResult: Promise<unknown>,
    ): Promise<unknown[]> {
        if (!(await firstResult)) return out
        out.push(items[startIdx])
        for (let i = startIdx + 1; i < items.length; i++) {
            if (!(await predicate(items[i], i))) return out
            out.push(items[i])
        }
        return out
    }

    const taken = collectSync()
    const finalize = (kept: unknown[]): unknown => {
        if (isArray(input)) return kept
        if (isSet(input)) return new Set(kept)
        if (isMap(input)) return new Map(kept as Iterable<[unknown, unknown]>)
        if (isIterable(input)) {
            return (function* () {
                for (const v of kept) yield v
            })()
        }
        // Plain object
        return Object.fromEntries(kept as Iterable<[PropertyKey, unknown]>)
    }

    return isPromise(taken) ? taken.then(finalize) : finalize(taken)
}

/**
 * Drops leading elements as long as `predicate` returns truthy, then yields
 * the rest. Preserves the input container type.
 *
 * Async predicate or `AsyncIterable` input wraps the result in a `Promise`
 * (or `AsyncIterable` for `AsyncIterable` input).
 *
 * @example
 * ```
 * dropWhile([1, 2, 3, 1], v => v < 3)      // [3, 1]
 * dropWhile({ a: 1, b: 2, c: 3 }, ([, v]) => v < 2)
 * // { b: 2, c: 3 }
 * ```
 * @group Iterable
 */
export function dropWhile<V>(
    input: V[],
    predicate: (value: V, index: number) => Promise<boolean>,
): Promise<V[]>
export function dropWhile<V>(
    input: V[],
    predicate: (value: V, index: number) => boolean,
): V[]
export function dropWhile<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): Map<K, V>
export function dropWhile<T>(
    input: Set<T>,
    predicate: (value: T, index: number) => boolean,
): Set<T>
export function dropWhile<T>(
    input: AsyncIterable<T>,
    predicate: (value: T, index: number) => boolean | Promise<boolean>,
): AsyncIterable<T>
export function dropWhile<T>(
    input: Iterable<T>,
    predicate: (value: T, index: number) => boolean,
): Iterable<T>
export function dropWhile<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): Partial<Record<K, V>>
export function dropWhile(input: unknown, predicate: AnyFn): unknown {
    if (isAsyncIterable(input)) {
        return (async function* () {
            let dropping = true
            let i = 0
            for await (const v of input) {
                if (dropping && (await predicate(v, i++))) continue
                dropping = false
                yield v
            }
        })()
    }

    const items = toItems(input)

    const collectSync = (): unknown[] | Promise<unknown[]> => {
        for (let i = 0; i < items.length; i++) {
            const r = predicate(items[i], i)
            if (isPromise(r)) return continueAsync(i, r)
            if (!r) return items.slice(i)
        }
        return []
    }

    async function continueAsync(
        startIdx: number,
        firstResult: Promise<unknown>,
    ): Promise<unknown[]> {
        if (!(await firstResult)) return items.slice(startIdx)
        for (let i = startIdx + 1; i < items.length; i++) {
            if (!(await predicate(items[i], i))) return items.slice(i)
        }
        return []
    }

    const dropped = collectSync()
    const finalize = (kept: unknown[]): unknown => {
        if (isArray(input)) return kept
        if (isSet(input)) return new Set(kept)
        if (isMap(input)) return new Map(kept as Iterable<[unknown, unknown]>)
        if (isIterable(input)) {
            return (function* () {
                for (const v of kept) yield v
            })()
        }
        // Plain object
        return Object.fromEntries(kept as Iterable<[PropertyKey, unknown]>)
    }

    return isPromise(dropped) ? dropped.then(finalize) : finalize(dropped)
}

/**
 * Splits an iterable structure into two — `[matching, rest]` — by a predicate.
 *
 * Both halves preserve the input container type. With an async predicate the
 * result is wrapped in a `Promise`.
 *
 * @example
 * ```ts
 * partition([1, 2, 3, 4], v => v % 2 === 0)
 * // [[2, 4], [1, 3]]
 *
 * partition({ a: 1, b: 2 }, ([, v]) => v > 1)
 * // [{ b: 2 }, { a: 1 }]
 * ```
 * @group Iterable
 */
export function partition<V>(
    input: V[],
    predicate: (value: V, index: number) => Promise<boolean>,
): Promise<[V[], V[]]>
export function partition<V>(
    input: V[],
    predicate: (value: V, index: number) => boolean,
): [V[], V[]]
export function partition<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => Promise<boolean>,
): Promise<[Map<K, V>, Map<K, V>]>
export function partition<K, V>(
    input: Map<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): [Map<K, V>, Map<K, V>]
export function partition<T>(
    input: Set<T>,
    predicate: (value: T, index: number) => Promise<boolean>,
): Promise<[Set<T>, Set<T>]>
export function partition<T>(
    input: Set<T>,
    predicate: (value: T, index: number) => boolean,
): [Set<T>, Set<T>]
export function partition<T>(
    input: AsyncIterable<T>,
    predicate: (value: T, index: number) => boolean | Promise<boolean>,
): Promise<[T[], T[]]>
export function partition<T>(
    input: Iterable<T>,
    predicate: (value: T, index: number) => Promise<boolean>,
): Promise<[T[], T[]]>
export function partition<T>(
    input: Iterable<T>,
    predicate: (value: T, index: number) => boolean,
): [T[], T[]]
export function partition<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => Promise<boolean>,
): Promise<[Record<K, V>, Record<K, V>]>
export function partition<K extends PropertyKey, V>(
    input: Record<K, V>,
    predicate: (value: [K, V], index: number) => boolean,
): [Record<K, V>, Record<K, V>]
export function partition(input: unknown, predicate: AnyFn): unknown {
    if (isAsyncIterable(input)) {
        return (async () => {
            const yes: unknown[] = []
            const no: unknown[] = []
            let i = 0
            for await (const v of input) {
                if (await predicate(v, i++)) yes.push(v)
                else no.push(v)
            }
            return [yes, no]
        })()
    }

    const items = toItems(input)
    const decisions = items.map(predicate)
    const resolved = resolveAll(decisions)

    const split = (
        kept: ReadonlyArray<unknown>,
    ): [unknown[], unknown[]] => {
        const yes: unknown[] = []
        const no: unknown[] = []
        items.forEach((v, i) => {
            if (kept[i]) yes.push(v)
            else no.push(v)
        })
        return [yes, no]
    }

    if (isArray(input)) {
        return isPromise(resolved)
            ? resolved.then((d) => split(d))
            : split(resolved)
    }

    if (isSet(input)) {
        const wrap = ([y, n]: [unknown[], unknown[]]): [Set<unknown>, Set<unknown>] => [
            new Set(y),
            new Set(n),
        ]
        return isPromise(resolved)
            ? resolved.then((d) => wrap(split(d)))
            : wrap(split(resolved))
    }

    if (isMap(input)) {
        const wrap = ([y, n]: [unknown[], unknown[]]): [
            Map<unknown, unknown>,
            Map<unknown, unknown>,
        ] => [
            new Map(y as Iterable<[unknown, unknown]>),
            new Map(n as Iterable<[unknown, unknown]>),
        ]
        return isPromise(resolved)
            ? resolved.then((d) => wrap(split(d)))
            : wrap(split(resolved))
    }

    if (isIterable(input)) {
        return isPromise(resolved)
            ? resolved.then((d) => split(d))
            : split(resolved)
    }

    // Plain object
    const wrap = ([y, n]: [unknown[], unknown[]]): [
        Record<PropertyKey, unknown>,
        Record<PropertyKey, unknown>,
    ] => [
        Object.fromEntries(y as Iterable<[PropertyKey, unknown]>),
        Object.fromEntries(n as Iterable<[PropertyKey, unknown]>),
    ]
    return isPromise(resolved)
        ? resolved.then((d) => wrap(split(d)))
        : wrap(split(resolved))
}

/**
 * Combines multiple iterables element-wise into tuples, stopping at the shortest.
 *
 * If any input is an `AsyncIterable`, the result is a `Promise<Array<…>>`.
 *
 * @example
 * ```ts
 * zip([1, 2, 3], ['a', 'b', 'c'])
 * // [[1, 'a'], [2, 'b'], [3, 'c']]
 *
 * zip([1, 2, 3], ['a', 'b'], [true, false, true])
 * // [[1, 'a', true], [2, 'b', false]]   // shortest wins
 * ```
 * @group Iterable
 */
export function zip<
    T extends ReadonlyArray<Iterable<unknown> | AsyncIterable<unknown>>,
>(
    ...inputs: T
): T[number] extends Iterable<unknown>
    ? Array<{ [K in keyof T]: IterableItem<T[K]> }>
    : Promise<Array<{ [K in keyof T]: IterableItem<T[K]> }>>
export function zip(
    ...inputs: ReadonlyArray<Iterable<unknown> | AsyncIterable<unknown>>
): unknown {
    if (inputs.some(isAsyncIterable)) {
        return (async () => {
            const iters = inputs.map((it) =>
                isAsyncIterable(it)
                    ? it[Symbol.asyncIterator]()
                    : (it as Iterable<unknown>)[Symbol.iterator](),
            )
            const out: unknown[][] = []
            while (true) {
                const results = await Promise.all(
                    iters.map((it) =>
                        Promise.resolve(it.next()) as Promise<
                            IteratorResult<unknown>
                        >,
                    ),
                )
                if (results.some((r) => r.done)) return out
                out.push(results.map((r) => r.value))
            }
        })()
    }

    const iters = (inputs as ReadonlyArray<Iterable<unknown>>).map((it) =>
        it[Symbol.iterator](),
    )
    const out: unknown[][] = []
    while (true) {
        const results = iters.map((it) => it.next())
        if (results.some((r) => r.done)) return out
        out.push(results.map((r) => r.value))
    }
}
