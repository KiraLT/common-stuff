/**
 * A function decorated with a `.cancel()` method that aborts pending invocations.
 *
 * @group Async
 */
export type Cancellable<F extends (...args: never[]) => unknown> = F & {
    /**
     * Cancels any pending invocation. Calls already in flight are unaffected.
     */
    cancel(): void
}

/**
 * Returns a promise that resolves after the specified number of milliseconds.
 *
 * @group Async
 * @example
 * ```
 * await delay(1000) // wait for 1 second
 * ```
 */
export function delay(
    /**
     * The number of milliseconds to delay.
     */
    timeInMs: number,
): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, timeInMs)
    })
}

/**
 * Creates and returns a new debounced version of the passed function that will postpone its execution
 * until after wait milliseconds have elapsed since the last time it was invoked.
 *
 * The returned function exposes `.cancel()` to discard a pending trailing call.
 *
 * @group Async
 * @example
 * ```
 * const debounced = debounce(() => console.log('debounced'), 100)
 * debounced() // will be called after 100ms
 * debounced.cancel() // discard the pending call
 * ```
 */
export function debounce<A extends unknown[]>(
    /**
     * The function to be debounced.
     */
    func: (...args: A) => void,
    /**
     * The number of milliseconds to delay.
     */
    timeInMs: number,
): Cancellable<(this: unknown, ...args: A) => void> {
    let timer: ReturnType<typeof setTimeout> | undefined

    function debounced(this: unknown, ...args: A): void {
        if (timer !== undefined) clearTimeout(timer)
        timer = setTimeout(() => {
            timer = undefined
            func.apply(this, args)
        }, timeInMs)
    }

    debounced.cancel = (): void => {
        if (timer !== undefined) {
            clearTimeout(timer)
            timer = undefined
        }
    }

    return debounced
}

/**
 * Creates a throttled function that will execute `func` at most once per `timeInMs` interval.
 *
 * The returned function exposes `.cancel()` to discard the pending trailing call.
 *
 * @group Async
 * @example
 * ```
 * const throttled = throttle(() => console.log('throttled'), 100)
 * throttled() // will be called immediately
 * throttled() // will be ignored
 * await delay(100)
 * throttled() // will be called after 100ms
 * ```
 */
export function throttle<A extends unknown[]>(
    /**
     * The function to be throttled.
     */
    func: (...args: A) => void,
    /**
     * The number of milliseconds to throttle invocations to.
     */
    timeInMs: number,
    /**
     * Options object.
     */
    options?: {
        /**
         * If `true` the `func` will be executed on the leading edge of the timeout.
         * @defaultValue `true`
         */
        leading?: boolean
        /**
         * If `true` the `func` will be executed on the trailing edge of the timeout.
         * @defaultValue `true`
         */
        trailing?: boolean
    },
): Cancellable<(this: unknown, ...args: A) => void> {
    let lastCallTime: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let lastArgs: A
    let lastThis: unknown

    const { leading = true, trailing = true } = options ?? {}

    function throttled(this: unknown, ...args: A): void {
        const now = Date.now()
        lastArgs = args
        lastThis = this

        if (leading && lastCallTime === undefined) {
            lastCallTime = now
            func.apply(lastThis, lastArgs)
        } else if (
            lastCallTime !== undefined &&
            now - lastCallTime >= timeInMs
        ) {
            if (timer !== undefined) clearTimeout(timer)
            lastCallTime = now
            func.apply(lastThis, lastArgs)
        } else if (trailing && timer === undefined) {
            timer = setTimeout(
                () => {
                    lastCallTime = now
                    func.apply(lastThis, lastArgs)
                    timer = undefined
                },
                lastCallTime === undefined
                    ? timeInMs
                    : timeInMs - (now - lastCallTime),
            )
        }
    }

    throttled.cancel = (): void => {
        if (timer !== undefined) {
            clearTimeout(timer)
            timer = undefined
        }
        lastCallTime = undefined
    }

    return throttled
}

/**
 * Error thrown by [[timeout]] when the deadline is reached.
 *
 * @group Async
 */
export class TimeoutError extends Error {
    constructor(message = 'Operation timed out') {
        super(message)
        this.name = 'TimeoutError'
        Object.setPrototypeOf(this, TimeoutError.prototype)
    }
}

/**
 * Rejects with a [[TimeoutError]] if `promise` doesn't settle within `ms` milliseconds.
 *
 * The original promise still runs to completion — there's no cancellation primitive
 * in JS — but the returned promise won't wait for it.
 *
 * @group Async
 * @example
 * ```
 * await timeout(fetch('/slow'), 5000)
 * ```
 */
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new TimeoutError(`Timed out after ${ms}ms`)),
            ms,
        )
        promise.then(
            (value) => {
                clearTimeout(timer)
                resolve(value)
            },
            (err) => {
                clearTimeout(timer)
                reject(err)
            },
        )
    })
}

/**
 * Retries an async function up to `attempts` times.
 *
 * `backoff` controls the delay between attempts in milliseconds — either a fixed number
 * or a function `(attemptNumber) => delayMs` (1-indexed). Defaults to no delay.
 *
 * The error from the last failed attempt is rethrown.
 *
 * @group Async
 * @example
 * ```
 * await retry(() => fetch('/flaky'), { attempts: 3, backoff: 200 })
 * await retry(fetchUser, { attempts: 5, backoff: n => 100 * 2 ** (n - 1) }) // exponential
 * ```
 */
export function retry<T>(
    fn: () => Promise<T>,
    options?: {
        /** Total number of attempts (≥ 1). Default `3`. */
        attempts?: number
        /** Delay between attempts in ms, or a function of attempt number (1-indexed). */
        backoff?: number | ((attempt: number) => number)
    },
): Promise<T> {
    const { attempts = 3, backoff = 0 } = options ?? {}
    const max = Math.max(1, attempts)

    const run = async (attempt: number): Promise<T> => {
        try {
            return await fn()
        } catch (err) {
            if (attempt >= max) throw err
            const wait =
                typeof backoff === 'function' ? backoff(attempt) : backoff
            if (wait > 0) await delay(wait)
            return run(attempt + 1)
        }
    }

    return run(1)
}

/**
 * Returns a wrapper that runs at most `concurrency` async tasks at a time.
 *
 * Tasks queue up beyond the limit. The wrapper returns the same value/rejection
 * the underlying task does, so it composes naturally with `Promise.all`.
 *
 * @group Async
 * @example
 * ```
 * const limit = pLimit(2)
 * await Promise.all(urls.map(u => limit(() => fetch(u))))
 * ```
 */
export function pLimit(
    concurrency: number,
): <T>(fn: () => Promise<T>) => Promise<T> {
    if (concurrency < 1) {
        throw new RangeError('pLimit concurrency must be ≥ 1')
    }

    let active = 0
    const queue: Array<() => void> = []

    const next = () => {
        if (active >= concurrency) return
        const task = queue.shift()
        if (task) task()
    }

    return <T>(fn: () => Promise<T>): Promise<T> =>
        new Promise<T>((resolve, reject) => {
            const run = () => {
                active++
                fn().then(
                    (v) => {
                        active--
                        next()
                        resolve(v)
                    },
                    (err) => {
                        active--
                        next()
                        reject(err)
                    },
                )
            }
            if (active < concurrency) run()
            else queue.push(run)
        })
}

/**
 * Runs the given task functions sequentially and collects their results.
 *
 * Stops at the first rejection. If you want to keep going on errors, wrap each
 * task in a `tryCatch` (from `fp.ts`) before passing it.
 *
 * @group Async
 * @example
 * ```
 * const results = await pSeries([
 *     () => loadUser(1),
 *     () => loadUser(2),
 *     () => loadUser(3),
 * ])
 * ```
 */
export async function pSeries<T>(
    tasks: ReadonlyArray<() => Promise<T>>,
): Promise<T[]> {
    return tasks.reduce<Promise<T[]>>(
        (prev, task) => prev.then(async (acc) => [...acc, await task()]),
        Promise.resolve([]),
    )
}
