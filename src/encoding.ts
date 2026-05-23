/**
 * Minimal shape of the global APIs we feature-detect.
 * Both Node (`Buffer`) and browser (`btoa`/`atob`/`crypto.randomUUID`) variants are listed.
 */
type RuntimeGlobals = {
    Buffer?: {
        from(
            input: string,
            encoding: string,
        ): {
            toString(encoding: string): string
        }
    }
    btoa?: (input: string) => string
    atob?: (input: string) => string
    crypto?: { randomUUID?: () => string }
}

const _global = globalThis as unknown as RuntimeGlobals

/**
 * Generates a 32-bit hash of the given value.
 *
 * The hash includes the value's `typeof` so distinct falsy primitives don't
 * collide (`0` ≠ `false` ≠ `null` ≠ `undefined` ≠ `''`). Values that
 * `JSON.stringify` can't represent (functions, symbols, plain `undefined`) are
 * still distinguished from one another via their `typeof` tag.
 */
export function hashCode(value: unknown): number {
    const jsonString = `${typeof value}:${JSON.stringify(value) ?? ''}`
    let hash = 0
    for (let i = 0; i < jsonString.length; i++) {
        const chr = jsonString.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0
    }
    return hash
}

/**
 * Generates v4 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier).
 *
 * Uses `crypto.randomUUID()` when available (modern Node, browsers, workers) for
 * cryptographically strong randomness. Falls back to a `Math.random()`-based
 * implementation in environments without it.
 *
 * @example
 * ```
 * generateUUID()
 * // '8e07ef4a-0d1f-45c2-b06b-9495e869b299'
 * ```
 **/
export function generateUUID(): string {
    if (typeof _global.crypto?.randomUUID === 'function') {
        return _global.crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

const keyStr =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

/**
 * Decodes [Base64](https://en.wikipedia.org/wiki/Base64) encoded value.
 *
 * Uses `Buffer` (Node) or `atob` (browsers) when available, falling back to a
 * portable JS implementation.
 */
export function base64Decode(input: string): string {
    if (typeof _global.Buffer !== 'undefined') {
        return _global.Buffer.from(input, 'base64').toString('utf-8')
    }
    if (typeof _global.atob === 'function') {
        const binary = _global.atob(input.replace(/[^A-Za-z0-9+/=]/g, ''))
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        return new TextDecoder('utf-8').decode(bytes)
    }
    return base64DecodeFallback(input)
}

/**
 * Encodes given value with [Base64](https://en.wikipedia.org/wiki/Base64) algorithm.
 *
 * Uses `Buffer` (Node) or `btoa` (browsers) when available, falling back to a
 * portable JS implementation.
 */
export function base64Encode(input: string): string {
    if (typeof _global.Buffer !== 'undefined') {
        return _global.Buffer.from(input, 'utf-8').toString('base64')
    }
    if (typeof _global.btoa === 'function') {
        const bytes = new TextEncoder().encode(input)
        let binary = ''
        for (let i = 0; i < bytes.length; i++)
            binary += String.fromCharCode(bytes[i] as number)
        return _global.btoa(binary)
    }
    return base64EncodeFallback(input)
}

function base64EncodeFallback(input: string): string {
    let output = ''
    let i = 0
    const utf8 = encodeUTF8(input)
    while (i < utf8.length) {
        const chr1 = utf8.charCodeAt(i++)
        const chr2 = utf8.charCodeAt(i++)
        const chr3 = utf8.charCodeAt(i++)
        const enc1 = chr1 >> 2
        const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
        let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
        let enc4 = chr3 & 63
        if (Number.isNaN(chr2)) {
            enc3 = enc4 = 64
        } else if (Number.isNaN(chr3)) {
            enc4 = 64
        }
        output +=
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4)
    }
    return output
}

function base64DecodeFallback(input: string): string {
    let output = ''
    let i = 0
    const cleaned = input.replace(/[^A-Za-z0-9+/=]/g, '')

    while (i < cleaned.length) {
        const enc1 = keyStr.indexOf(cleaned.charAt(i++))
        const enc2 = keyStr.indexOf(cleaned.charAt(i++))
        const enc3 = keyStr.indexOf(cleaned.charAt(i++))
        const enc4 = keyStr.indexOf(cleaned.charAt(i++))

        const chr1 = (enc1 << 2) | (enc2 >> 4)
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
        const chr3 = ((enc3 & 3) << 6) | enc4

        output += String.fromCharCode(chr1)
        if (enc3 !== 64) output += String.fromCharCode(chr2)
        if (enc4 !== 64) output += String.fromCharCode(chr3)
    }
    return decodeUTF8(output)
}

function encodeUTF8(input: string): string {
    const normalized = input.replace(/\r\n/g, '\n')
    let utf8Text = ''
    for (let n = 0; n < normalized.length; n++) {
        const c = normalized.charCodeAt(n)
        if (c < 128) {
            utf8Text += String.fromCharCode(c)
        } else if (c > 127 && c < 2048) {
            utf8Text += String.fromCharCode((c >> 6) | 192)
            utf8Text += String.fromCharCode((c & 63) | 128)
        } else {
            utf8Text += String.fromCharCode((c >> 12) | 224)
            utf8Text += String.fromCharCode(((c >> 6) & 63) | 128)
            utf8Text += String.fromCharCode((c & 63) | 128)
        }
    }
    return utf8Text
}

function decodeUTF8(utf8Text: string): string {
    let str = ''
    let i = 0
    while (i < utf8Text.length) {
        const c1 = utf8Text.charCodeAt(i)
        if (c1 < 128) {
            str += String.fromCharCode(c1)
            i++
        } else if (c1 > 191 && c1 < 224) {
            const c2 = utf8Text.charCodeAt(i + 1)
            str += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63))
            i += 2
        } else {
            const c2 = utf8Text.charCodeAt(i + 1)
            const c3 = utf8Text.charCodeAt(i + 2)
            str += String.fromCharCode(
                ((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63),
            )
            i += 3
        }
    }
    return str
}
