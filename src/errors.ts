/**
 * Checks if given value is `Error` if it's subclass and then throw it.
 *
 * @param value any value
 * @returns `value` if it is not an instance of `Error`
 * @throws `value` if it is an instance of `Error`
 */
export function assertError<T, E extends Error>(value: T | E): T {
    if (value instanceof Error) {
        throw value
    }
    return value
}
