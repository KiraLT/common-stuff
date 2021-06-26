/**
 * Returns `Promise` delayed for specified time in MS.
 *
 * @category Async
 */
export function delay(timeInMs: number): Promise<void> {
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
 * @category Async
 */
export function debounce<A extends unknown[]>(
    func: (...args: A) => unknown,
    timeInMs: number
): (...args: A) => void {
    let timer: NodeJS.Timeout
    return function (this: unknown, ...args: A) {
        clearTimeout(timer)
        timer = setTimeout(async () => {
            func.apply(this, args)
        }, timeInMs)
    }
}
