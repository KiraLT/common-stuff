import { isPlainObject } from '.'

/**
 * Compares two values, supports array, dates and objects
 */
export function isEqual(a: unknown, b: unknown): boolean {
    if (a instanceof Date && b instanceof Date) {
        return isEqual(a.getTime(), b.getTime())
    }

    if (a instanceof Array && b instanceof Array) {
        if (a.length !== b.length) {
            return false
        }

        return a.every((v, i) => isEqual(v, b[i]))
    }

    if (isPlainObject(a) && isPlainObject(b)) {
        const entriesA = Object.entries(a)

        if (entriesA.length !== Object.keys(b).length) {
            return false
        }
        return entriesA.every(([k, v]) => isEqual(v, b[k]))
    }

    return a === b
}
