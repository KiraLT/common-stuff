/**
 * Generates hash of given value
 */
export function hashCode(value: unknown): number {
    const jsonString = JSON.stringify(value || '')
    let hash = 0
    if (jsonString.length === 0) hash
    for (let i = 0; i < jsonString.length; i++) {
        const chr = jsonString.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0
    }
    return hash
}

/**
 * Generates v4 like [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) (Universally unique identifier).
 *
 * > Be aware that UUID uniqueness relies heavily on the underlying random number generator (RNG).
 * > The solution above uses Math.random() for brevity, however Math.random() is not guaranteed to be a high-quality RNG.
 * > For a more robust solution, consider using the [uuid](https://github.com/uuidjs/uuid) module, which uses higher quality RNG APIs.
 *
 * @example
 * ```
 * generateUUID()
 * // '8e07ef4a-0d1f-45c2-b06b-9495e869b299'
 * ```
 **/
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
        }
    )
}

/**
 * Encodes given value with [Base64](https://en.wikipedia.org/wiki/Base64) algorithm.
 */
export function base64Decode(value: string): string {
    return decodeURIComponent(
        atob(value)
            .split('')
            .map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            })
            .join('')
    )
}

/**
 * Decodes [Base64](https://en.wikipedia.org/wiki/Base64) encoded value.
 */
export function base64Encode(value: string): string {
    return btoa(
        encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, p1) => {
            return String.fromCharCode(`0x${p1}` as any)
        })
    )
}
