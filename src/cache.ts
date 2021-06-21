import { hashCode } from '.'

export function cache<T extends Function>(func: T): T {
    const cachedCalls: Record<number, unknown> = {}

    return function (this: unknown) {
        const argsHash = hashCode(arguments)

        if (!(argsHash in cachedCalls)) {
            const result = func.apply(this, arguments)

            if (typeof Promise !== 'undefined' && result instanceof Promise) {
                return result.then((resolvedResult) => {
                    cachedCalls[argsHash] = resolvedResult

                    return resolvedResult
                })
            }

            cachedCalls[argsHash] = result
        }

        return cachedCalls[argsHash]
    } as any
}
