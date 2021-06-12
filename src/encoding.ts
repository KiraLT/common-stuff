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

const keyStr =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

/**
 * Decodes [Base64](https://en.wikipedia.org/wiki/Base64) encoded value.
 */
export function base64Decode(input: string): string {
    let output = ''
    let i = 0

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')

    while (i < input.length) {
        const enc1 = keyStr.indexOf(input.charAt(i++))
        const enc2 = keyStr.indexOf(input.charAt(i++))
        const enc3 = keyStr.indexOf(input.charAt(i++))
        const enc4 = keyStr.indexOf(input.charAt(i++))

        const chr1 = (enc1 << 2) | (enc2 >> 4)
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
        const chr3 = ((enc3 & 3) << 6) | enc4

        output = output + String.fromCharCode(chr1)

        if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2)
        }
        if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3)
        }
    }

    output = decodeUTF8(output)

    return output
}

/**
 * Encodes given value with [Base64](https://en.wikipedia.org/wiki/Base64) algorithm.
 */
export function base64Encode(input: string): string {
    let output = ''
    let i = 0
    input = encodeUTF8(input)
    while (i < input.length) {
        const chr1 = input.charCodeAt(i++)
        const chr2 = input.charCodeAt(i++)
        const chr3 = input.charCodeAt(i++)
        const enc1 = chr1 >> 2
        const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
        let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
        let enc4 = chr3 & 63
        if (isNaN(chr2)) {
            enc3 = enc4 = 64
        } else if (isNaN(chr3)) {
            enc4 = 64
        }
        output =
            output +
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4)
    }
    return output
}

function encodeUTF8(input: string): string {
    input = input.replace(/\r\n/g, '\n')
    let utf8Text = ''

    for (let n = 0; n < input.length; n++) {
        const c = input.charCodeAt(n)

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
    let c1 = 0
    let c2 = 0
    let c3 = 0
    while (i < utf8Text.length) {
        c1 = utf8Text.charCodeAt(i)

        if (c1 < 128) {
            str += String.fromCharCode(c1)
            i++
        } else if (c1 > 191 && c1 < 224) {
            c2 = utf8Text.charCodeAt(i + 1)
            str += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63))
            i += 2
        } else {
            c2 = utf8Text.charCodeAt(i + 1)
            c3 = utf8Text.charCodeAt(i + 2)
            str += String.fromCharCode(
                ((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
            )
            i += 3
        }
    }
    return str
}
