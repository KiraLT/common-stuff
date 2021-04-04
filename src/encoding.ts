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
 * Generates GUID
 */
export function generateUUID() {
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
 * Encodes given value with base64 algorithm
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
 * Decodes base64 encoded value
 */
export function base64Encode(value: string): string {
    return btoa(
        encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, p1) => {
            return String.fromCharCode(`0x${p1}` as any)
        })
    )
}
