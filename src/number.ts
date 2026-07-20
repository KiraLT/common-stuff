/**
 * Parses a value into a finite number, returning `undefined` if parsing fails.
 *
 * Unlike `parseFloat`, this is strict: trailing non-numeric characters
 * (e.g. `'1.5abc'`) cause it to return `undefined`. Whitespace is trimmed.
 *
 * @example
 * ```ts
 * toFloat('1.5')      // 1.5
 * toFloat('  -3.2  ') // -3.2
 * toFloat('1.5abc')   // undefined
 * toFloat('abc')      // undefined
 * toFloat('')         // undefined
 * toFloat(NaN)        // undefined
 * toFloat(2)          // 2
 * ```
 * @group Number
 */
export function toFloat(value: string | number): number | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined
    }
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed === '') return undefined
        const num = Number(trimmed)
        return Number.isFinite(num) ? num : undefined
    }
    return undefined
}

/**
 * Parses a value into a finite integer, returning `undefined` if parsing fails.
 *
 * Floats are truncated toward zero. Trailing non-numeric characters
 * (e.g. `'42abc'`) cause it to return `undefined`. Whitespace is trimmed.
 *
 * @example
 * ```ts
 * toInt('42')      // 42
 * toInt('  -7  ')  // -7
 * toInt('1.9')     // 1
 * toInt('42abc')   // undefined
 * toInt('abc')     // undefined
 * toInt('')        // undefined
 * toInt(3.7)       // 3
 * ```
 * @group Number
 */
export function toInt(value: string | number): number | undefined {
    const num = toFloat(value)
    return num === undefined ? undefined : Math.trunc(num)
}
