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
    return value.toLowerCase() !== value.toUpperCase()
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
    ending = '...',
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

/**
 * Splits a string into words at case boundaries, punctuation, and whitespace.
 * Internal helper used by case-conversion functions.
 *
 * `'fooBarBaz'`, `'foo_bar-baz'`, `'XMLHttpRequest'` all become `['foo','Bar','Baz']`-style splits.
 */
function splitWords(value: string): string[] {
    return value
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .split(/[^a-zA-Z0-9]+/)
        .filter((w) => w.length > 0)
}

/**
 * Convert a string to `kebab-case`.
 *
 * @example
 * ```
 * kebabCase('fooBar')          // 'foo-bar'
 * kebabCase('Foo Bar baz')     // 'foo-bar-baz'
 * kebabCase('XMLHttpRequest')  // 'xml-http-request'
 * ```
 * @group String
 */
export function kebabCase(value: string): string {
    return splitWords(value)
        .map((w) => w.toLowerCase())
        .join('-')
}

/**
 * Convert a string to `snake_case`.
 *
 * @example
 * ```
 * snakeCase('fooBar')          // 'foo_bar'
 * snakeCase('Foo Bar baz')     // 'foo_bar_baz'
 * snakeCase('XMLHttpRequest')  // 'xml_http_request'
 * ```
 * @group String
 */
export function snakeCase(value: string): string {
    return splitWords(value)
        .map((w) => w.toLowerCase())
        .join('_')
}

/**
 * Remove diacritical marks from characters (e.g. `á → a`, `ñ → n`).
 *
 * Uses Unicode NFD normalization, so it handles arbitrary scripts.
 *
 * @example
 * ```
 * stripAccents('árvíztűrő tükörfúrógép')
 * // 'arvizturo tukorfurogep'
 * ```
 * @group String
 */
export function stripAccents(value: string): string {
    return value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

/**
 * Convert a string to a URL-safe slug.
 *
 * Strips diacritics, lowercases, and replaces non-alphanumeric runs with `-`.
 * Trailing/leading dashes are removed.
 *
 * @example
 * ```
 * slugify('Hello, World!')        // 'hello-world'
 * slugify('Árvíztűrő tükörfúrógép') // 'arvizturo-tukorfurogep'
 * ```
 * @group String
 */
export function slugify(value: string): string {
    return stripAccents(value)
        .replace(/([a-z\d])([A-Z])/g, '$1-$2')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/**
 * Escape a string for safe use inside a `RegExp` literal.
 *
 * @example
 * ```
 * new RegExp(escapeRegex('a.b+c'))
 * // /a\.b\+c/
 * ```
 * @group String
 */
export function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Remove leading indentation from multiline string literals.
 * @param strings
 * @param values
 * @returns
 */
export function outdent(
    strings: TemplateStringsArray,
    ...values: unknown[]
): string {
    const interpolate = (s: TemplateStringsArray, v: unknown[]) =>
        s.reduce(
            (acc, part, i) => acc + part + (i < v.length ? String(v[i]) : ''),
            '',
        )

    const trimOuterBlankLine = (t: string) =>
        t
            .replace(/^[ \t]*(?:\r\n|\r|\n)/, '')
            .replace(/(?:\r\n|\r|\n)[ \t]*$/, '')

    const text = trimOuterBlankLine(interpolate(strings, values))
    const lines = text.split(/\r\n|\n|\r/)
    const lead = lines.map((l) => l.match(/^[ \t]*/)?.[0].length ?? 0)
    const hasContent = lines.some((l) => l.trim().length > 0)
    if (!hasContent) return ''

    const indents = lead.filter((_, i) => (lines[i] || '').trim().length > 0)
    const common = Math.min(...indents)

    return lines
        .map((l, i) => l.slice(Math.min(lead[i] ?? 0, common)))
        .join('\n')
}
