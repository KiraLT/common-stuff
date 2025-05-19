const tagsToEncode: Record<string, string[]> = {
    '&': ['&amp;', '&#38;'],
    '<': ['&lt;', '&#60;'],
    '>': ['&gt;', '&#62;'],
    '"': ['&quot;', '&#34;'],
    "'": ['&apos;', '&#39;'],
}

/**
 * Encodes text replacing HTML special characters (<>&"')
 *
 * @group Http
 * @param html
 */
export function encodeHtml(html: string): string {
    const re = new RegExp(`[${Object.keys(tagsToEncode).join('')}]`, 'g')
    return html.replace(re, (value) => tagsToEncode[value]?.[0] || value)
}

/**
 * Decodes text restoring HTML encoded characters (<>&"')
 *
 * @group Http
 * @param html
 */
export function decodeHtml(html: string): string {
    return html.replace(
        /&[a-z0-9#]+;/g,
        (value) =>
            Object.entries(tagsToEncode).find((v) =>
                v[1].includes(value),
            )?.[0] || value,
    )
}
