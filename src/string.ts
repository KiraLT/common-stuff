/**
 * The lowercase letters `abcdefghijklmnopqrstuvwxyz`.
 *
 * @category String
 */
export const asciiLowercase = 'abcdefghijklmnopqrstuvwxyz'

/**
 * The uppercase letters `ABCDEFGHIJKLMNOPQRSTUVWXYZ`.
 */
export const asciiUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * The concatenation of the [[asciiLowercase]] and [[asciiUppercase]] constants.
 */
export const asciiLetters = asciiLowercase + asciiUppercase

/**
 * The string '0123456789'.
 */
export const digits = '0123456789'

/**
 * The string '0123456789abcdefABCDEF'.
 */
export const hexdigits = '0123456789abcdefABCDEF'

/**
 * The string '01234567'.
 */
export const octdigits = '01234567'

/**
 * String of ASCII characters which are considered punctuation characters in the C locale:
 * `!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~.`
 */
export const punctuation = '!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~'

/**
 * Truncates string
 *
 * @example
 * ```
 * truncate('Hello world', 8)
 * // Hello...
 * ```
 * @category String
 */
export function truncate(
    value: string,
    length: number,
    ending = '...'
): string {
    if (value.length > length) {
        return value.substring(0, length - ending.length) + ending
    } else {
        return value
    }
}

/**
 * Extract words from text.
 *
 * @example
 * ```
 * extractWords('Hello-world!')
 * // ['Hello', 'world']
 * ```
 * @category String
 */
export function extractWords(value: string): string[] {
    return value
        .split(/[ -./\\()"',;<>~!@#$%^&*|+=[\]{}`~?:]+/)
        .filter((v) => v !== '')
}

/**
 * Convert a dash/dot/underscore/space separated string to camelCase
 *
 * @example
 * ```
 * camelCase('foo-bar');
 * // 'fooBar'
 * ```
 * @param value
 */
export function camelCase(value: string): string {
    return value
        .replace(/^[_.\- ]+/, '')
        .toLowerCase()
        .replace(/[_.\- ]+(\w|$)/g, (_, p1) => p1.toUpperCase())
        .replace(/\d+(\w|$)/g, (m) => m.toUpperCase())
}

/**
 * Convert a dash/dot/underscore/space separated string to PascalCase
 *
 * @example
 * ```
 * pascalCase('foo-bar');
 * // 'FooBar'
 * ```
 * @param value
 */
export function pascalCase(value: string): string {
    const parsed = camelCase(value)
    return parsed.charAt(0).toUpperCase() + parsed.slice(1)
}
