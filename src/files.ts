import { findIndex } from '.'

/**
 * Converts bytes number to string representation (e.g. `15.25 GB`).
 *
 * @example
 * ```
 * formatBytes(1648 * 9884)
 * // '15.53 MB'
 * ```
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes <= 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Parses size string to bytes.
 *
 * @example
 * ```
 * parseSize('15.53 MB')
 * // 16288832
 * ```
 * @returns parsed bytes or `-1` on fail
 */
export function parseSize(value: string): number {
    const [_, rawSize, rawUnit] =
        value.match(/^(\d+(?:[.]\d+|))\s*([a-z]+)$/i) ?? []

    const k = 1024
    const units = [
        ['bytes', 'byte', 'b'],
        ['kb'],
        ['mb'],
        ['gb'],
        ['tb'],
        ['pb'],
        ['eb'],
        ['zb'],
        ['yb'],
    ]

    if (rawSize && rawUnit) {
        const size = parseFloat(rawSize)
        const unit = rawUnit.toLowerCase()

        let index = findIndex(units, (v) => v.indexOf(unit) !== -1)

        let bytes = size
        while (index > 0) {
            bytes = bytes * k
            index--
        }

        return bytes
    }

    return 0
}

/**
 * Split the pathname path into a pair (root, ext) such that root + ext == path,
 * and ext is empty or begins with a period and contains at most one period.
 * Leading periods on the basename are ignored.
 *
 * @example
 * ```
 * getFileParts('file.txt')
 * // ['file', '.txt']
 *
 * getFileParts('.cshrc')
 * // ['.cshrc', '']
 * ```
 */
export function getFileParts(pathname: string): [string, string] {
    const lastDirectory = pathname.split('/').pop() ?? ''
    const parts = lastDirectory.split('.')
    const hasLeadingDot = lastDirectory[0] === '.'
    const minDotCount = hasLeadingDot ? 2 : 1
    const extension = parts.length > minDotCount ? parts.pop() : undefined

    return [
        extension ? pathname.slice(0, -1 * (extension.length + 1)) : pathname,
        extension ? `.${extension}` : '',
    ]
}
