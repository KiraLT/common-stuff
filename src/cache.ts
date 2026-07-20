import { hashCode } from './encoding.ts'
import { isPromise } from './guards.ts'

/**
 * A cached version of a function with management methods attached.
 *
 * @group Cache
 */
// biome-ignore lint/suspicious/noExplicitAny: required for generic function typing
export type Cached<F extends (...args: any[]) => any> = F & {
    /**
     * Drops every memoized result.
     */
    clear(): void
    /**
     * Drops the memoized result for a specific argument set.
     */
    delete(...args: Parameters<F>): void
}

/**
 * Caches the result of a function call by its arguments.
 *
 * Returned function exposes `.clear()` and `.delete(...args)` for manual invalidation.
 * Optional `maxSize` enables LRU eviction; optional `ttl` (ms) makes entries expire.
 * Promises are unwrapped — only the resolved value is stored, so concurrent calls share one inflight Promise.
 *
 * @example
 * ```
 * const fetchUser = cache(
 *     (id: string) => fetch(`/users/${id}`).then(r => r.json()),
 *     { maxSize: 100, ttl: 60_000 },
 * )
 * fetchUser('1')          // network call
 * fetchUser('1')          // cached
 * fetchUser.delete('1')   // drop one entry
 * fetchUser.clear()       // drop all
 * ```
 * @group Cache
 */
// biome-ignore lint/suspicious/noExplicitAny: required for generic function typing
export function cache<F extends (...args: any[]) => any>(
    func: F,
    options?: {
        /**
         * When set, evicts the least-recently-used entry once the cache exceeds this size.
         */
        maxSize?: number
        /**
         * Time-to-live in milliseconds. Entries older than this are recomputed on read.
         */
        ttl?: number
    },
): Cached<F> {
    const { maxSize, ttl } = options ?? {}
    const entries = new Map<number, { value: unknown; expiresAt: number }>()

    function touch(key: number, entry: { value: unknown; expiresAt: number }) {
        // Re-insertion preserves LRU order via Map insertion-order semantics.
        entries.delete(key)
        entries.set(key, entry)
    }

    function evictIfNeeded() {
        if (maxSize === undefined) return
        while (entries.size > maxSize) {
            const oldestKey = entries.keys().next().value
            if (oldestKey === undefined) break
            entries.delete(oldestKey)
        }
    }

    const cached = function (this: unknown, ...args: Parameters<F>) {
        const key = hashCode(args)
        const existing = entries.get(key)

        if (
            existing &&
            (ttl === undefined || existing.expiresAt > Date.now())
        ) {
            touch(key, existing)
            return existing.value
        }

        const result = func.apply(this, args)
        const expiresAt = ttl === undefined ? Infinity : Date.now() + ttl

        if (isPromise(result)) {
            // Store the inflight Promise immediately so concurrent calls share it.
            // On resolve: collapse to the plain value for cheaper reads.
            // On reject: drop the entry so the next call retries.
            const wrapped: Promise<unknown> = result.then(
                (resolved: unknown) => {
                    if (entries.get(key)?.value === wrapped) {
                        entries.set(key, { value: resolved, expiresAt })
                    }
                    return resolved
                },
                (err: unknown) => {
                    if (entries.get(key)?.value === wrapped) {
                        entries.delete(key)
                    }
                    throw err
                },
            )
            entries.set(key, { value: wrapped, expiresAt })
            evictIfNeeded()
            return wrapped
        }

        entries.set(key, { value: result, expiresAt })
        evictIfNeeded()
        return result
    } as Cached<F>

    cached.clear = (): void => {
        entries.clear()
    }

    cached.delete = (...args: Parameters<F>): void => {
        entries.delete(hashCode(args))
    }

    return cached
}
