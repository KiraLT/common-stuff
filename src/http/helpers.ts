/**
 * Generates cookie string
 *
 * _Example:_
 * ```
 * // Create a cookie, valid across the entire site:
 * document.cookie = generateCookie('name', 'value')
 *
 * // Create a cookie that expires 7 days from now, valid across the entire site:
 * document.cookie = generateCookie('name', 'value', { expires: 7 })
 * ```
 *
 * @param name cookie name
 * @param value cookie value
 */
export function generateCookie(
    name: string,
    value: string,
    options?: {
        /**
         * Expire cookie after x days (negative to remove cookie)
         */
        expires?: number
    }
): string {
    const { expires } = options ?? {}

    return [
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
        expires ? `expires=${new Date(expires * 864e5).toUTCString()}` : ''
    ].filter(v => !!v).join(';')
}

/**
 * Parses cookies string
 *
 * _Example:_
 * ```
 * parseCookies(document.cookie)
 * // {session: '26e761be168533cbf0742f8c295176c7'}
 * ```
 *
 * @category Http
 * @param cookieString `document.cookie` value
 */
export function parseCookies(cookieString: string): Record<string, string> {
    return cookieString.split(/; /).reduce((prev, cur) => {
        const [name, value] = cur.split('=', 2)
        if (name != null && value != null) {
            prev[decodeURIComponent(name)] = decodeURIComponent(
                value[0] === '"' ? value.slice(1, -1) : value
            )
        }
        return prev
    }, {} as Record<string, string>)
}
