/**
 * Base logger interface, compactible  with `console` or [winston](https://github.com/winstonjs/winston) logger
 *
 * @category Logging
 */
export interface Logger {
    error(message: unknown, ...meta: unknown[]): void
    warn(message: unknown, ...meta: unknown[]): void
    info(message: unknown, ...meta: unknown[]): void
    debug(message: unknown, ...meta: unknown[]): void
}

/**
 * Creates dummy logger object which ignores all logs
 *
 * @category Logging
 */
export function createDummyLogger(): Logger {
    return {
        error() {},
        warn() {},
        info() {},
        debug() {},
    }
}
