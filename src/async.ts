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
 * @group Async
 * @example
 * ```
 * const debounced = debounce(() => console.log('debounced'), 100)
 * debounced() // will be called after 100ms
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
): (this: unknown, ...args: A) => void {
    let timer: ReturnType<typeof setTimeout>
    return function () {
        const args = arguments as unknown as A
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this, args)
        }, timeInMs)
    }
}

/**
 * Creates a throttled function that will execute `func` at most once per `timeInMs` interval.
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
): (this: unknown, ...args: A) => void {
    let lastCallTime: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let lastArgs: A
    let lastThis: unknown

    const { leading = true, trailing = true } = options ?? {}

    return function () {
        const now = Date.now()
        const args = arguments as unknown as A
        lastArgs = args
        lastThis = this

        if (leading && lastCallTime === undefined) {
            lastCallTime = now
            func.apply(lastThis, lastArgs)
        } else if (
            lastCallTime !== undefined &&
            now - lastCallTime >= timeInMs
        ) {
            clearTimeout(timer)
            lastCallTime = now
            func.apply(lastThis, lastArgs)
        } else if (trailing && !timer) {
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
}
