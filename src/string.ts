/**
 * The lowercase letters `abcdefghijklmnopqrstuvwxyz`.
 *
 * @group String
 */
export const asciiLowercase = 'abcdefghijklmnopqrstuvwxyz'

/**
 * The uppercase letters `ABCDEFGHIJKLMNOPQRSTUVWXYZ`.
 *
 * @group String
 */
export const asciiUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * The concatenation of the [[asciiLowercase]] and [[asciiUppercase]] constants.
 *
 * @group String
 */
export const asciiLetters = asciiLowercase + asciiUppercase

/**
 * The string `0123456789`.
 *
 * @group String
 */
export const digits = '0123456789'

/**
 * The string `0123456789abcdefABCDEF`.
 *
 * @group String
 */
export const hexdigits = '0123456789abcdefABCDEF'

/**
 * The string `01234567`.
 *
 * @group String
 */
export const octdigits = '01234567'

/**
 * String of ASCII characters which are considered punctuation characters in the C locale:
 * `!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~.`
 *
 * @group String
 */
export const punctuation = '!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~'

/**
 * Check if given value contains at least one letter.
 *
 * @example
 * ```
 * isLetter('a')
 * // true
* isLetter('-')
 * // false
 * ```
 * @group String
 */
export function isLetter(value: string): boolean {
    return value.toLowerCase() != value.toUpperCase()
}

/**
 * Truncates string
 *
 * @example
 * ```
 * truncate('Hello world', 8)
 * // Hello...
 * ```
 * @group String
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
 * @group String
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
 * @group String
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
 * @group String
 */
export function pascalCase(value: string): string {
    const parsed = camelCase(value)
    return parsed.charAt(0).toUpperCase() + parsed.slice(1)
}

/**
 * Convert the first letter in each to word upper case
 *
 * @example
 * ```
 * titleCase('hello world');
 * // 'Hello World'
 * ```
 * @group String
 */
export function titleCase(value: string): string {
    return value
        .split('')
        .map((char, index, chars) => {
            const prevChar = chars[index - 1]
            if (prevChar && isLetter(prevChar)) {
                return char.toLowerCase()
            }
            return char.toUpperCase()
        })
        .join('')
}
