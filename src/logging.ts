/**
 * Base logger interface, compatible  with `console` or [winston](https://github.com/winstonjs/winston) logger
 *
 * _Example_:
 * ```
 * const logger: Logger = console
 * logger.info('Hello world)
 * ```
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
 * _Example_:
 * ```
 * const logger = createDummyLogger()
 * logger.info('Hello world')
 * // Nothing will be logged
 * ```
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
