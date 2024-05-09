import { generateRange, asciiLetters, digits, punctuation } from '.'

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 *
 * @example
 * ```
 * randomInt(1, 10)
 * // 9
 * ```
 * @group Random
 */
export function randomInt(min: number, max: number): number {
    const roundedMin = Math.ceil(min)
    const roundedMax = Math.floor(max)
    return Math.floor(Math.random() * (max - roundedMax + 1)) + roundedMin
}

/**
 * Returns a random element from the array or `undefined` if the array is empty.
 *
 * @example
 * ```
 * randomChoice([1, 2, 3, 4, 5])
 * // 2
 * ```
 * @group Random
 */
export function randomChoice<T>(array: ReadonlyArray<T>): T | undefined {
    return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generate new array by randomly picking items from provided array
 *
 * @example
 * ```
 * randomChoices([1, 2], 3)
 * // [2, 2, 1]
 * ```
 * @group Random
 */
export function randomChoices<T>(array: ReadonlyArray<T>, length: number): T[] {
    if (!array.length) {
        return []
    }

    return generateRange(length).map(() => randomChoice(array) as T)
}

/**
 * Generates random string between min (inclusive) and max (inclusive) length.
 *
 * By default it uses [[asciiLetters]] + [[digits]] + [[punctuation]]
 *
 * @param length
 * @param options
 * @returns
 */
export function randomString(
    length: number,
    options?: { chars?: string },
): string {
    const { chars = asciiLetters + digits + punctuation } = options ?? {}

    return generateRange(length)
        .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join('')
}

/**
 * Shuffles the the array.
 *
 * @example
 * ```
 * shuffle([1, 2, 3])
 * // [2, 1, 3]
 * ```
 * @group Random
 */
export function shuffle<T>(array: ReadonlyArray<T>): ReadonlyArray<T>
export function shuffle<T>(array: T[]): T[]
export function shuffle<T>(array: ReadonlyArray<T>): T[] {
    const arrayCopy = array.slice()
    let currentIndex = arrayCopy.length
    let randomIndex = 0

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--

        // And swap it with the current element.
        ;[arrayCopy[currentIndex], arrayCopy[randomIndex]] = [
            arrayCopy[randomIndex]!,
            arrayCopy[currentIndex]!,
        ]
    }

    return arrayCopy
}
