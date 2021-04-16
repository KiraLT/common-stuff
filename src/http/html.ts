const tagsToEncode: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&apos;'
}
const tagsToDecode = Object.entries(tagsToEncode).reduce((prev, [key, value]) => {
    prev[value] = key
    return prev
}, {} as Record<string, string>)

/**
 * Encodes text replacing HTML special characters (<>&"')
 *
 * @category Http
 * @param html
 */
export function encodeHtml(html: string): string {
    const re = new RegExp(`[${Object.keys(tagsToEncode).join('')}]`, 'g')
    return html.replace(re, value => tagsToEncode[value] || value)
}

/**
 * Decodes text restoring HTML encoded characters (<>&"')
 *
 * @category Http
 * @param html
 */
export function decodeHtml(html: string): string {
    return html.replace(/&[a-z]+;/g, value => tagsToDecode[value] || value)
}
