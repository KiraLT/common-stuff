/**
 * Truncates string
 *
 * _Example:_
 * ```
 * truncate('Hello world', 8)
 * // Hello...
 * ```
 *
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
 * _Example:_
 * ```
 * extractWords('Hello-world!')
 * // ['Hello', 'world']
 * ```
 *
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
 * _Example:_
 * ```
 * camelCase('foo-bar');
 * // 'fooBar'
 * ```
 *
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
 * _Example:_
 * ```
 * pascalCase('foo-bar');
 * // 'FooBar'
 * ```
 *
 * @param value
 */
export function pascalCase(value: string): string {
    const parsed = camelCase(value)
    return parsed.charAt(0).toUpperCase() + parsed.slice(1)
}
