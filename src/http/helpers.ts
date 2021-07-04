import { flatMap, ensureArray, Primitive, isNullOrUndefined, isNot } from '../'

/**
 * Generates cookie string
 *
 * @example
 * ```
 * // Create a cookie, valid across the entire site:
 * document.cookie = generateCookie('name', 'value')
 *
 * // Create a cookie that expires 7 days from now, valid across the entire site:
 * document.cookie = generateCookie('name', 'value', { expires: 7 })
 * ```
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
        expires ? `expires=${new Date(expires * 864e5).toUTCString()}` : '',
    ]
        .filter((v) => !!v)
        .join(';')
}

/**
 * Parses cookies string
 *
 * @example
 * ```
 * parseCookies(document.cookie)
 * // {session: '26e761be168533cbf0742f8c295176c7'}
 * ```
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

/**
 * Parse a query string given as a string argument.
 *
 * @example
 * ```
 * location.search
 * // ?page=1&limit=20
 *
 * parseQueryString(location.search)
 * // { page: ['1'], limit: ['20']}
 * ```
 * @category Http
 */
export function parseQueryString(
    query: string,
    options?: {
        /**
         * @default `&`
         */
        separator?: string
    }
): Record<string, string[]> {
    const { separator = '&' } = options ?? {}

    return flatMap(
        (query[0] === '?' ? query.slice(1) : query)
            .split(separator)
            .filter((part) => part.indexOf('=') !== -1),
        (part) => {
            const [key = '', value = ''] = part.split('=', 2)

            if (key) {
                return [
                    [
                        decodeURIComponent(key),
                        [decodeURIComponent(value.replace(/\+/g, ' '))],
                    ],
                ] as const
            }

            return []
        }
    ).reduce<Record<string, string[]>>(
        (prev, [key, value]) => ({
            ...prev,
            [key]: [...(prev[key] || []), ...value],
        }),
        {}
    )
}

/**
 * Generates query string form provided object.
 *
 * @example
 * ```
 * generateQueryString({ page: 1, limit: 20})
 * // 'page=1&limit=20'
 * ```
 * @category Http
 * @param query
 * @param options
 * @returns
 */
export function generateQueryString(
    query: Record<string, Primitive[] | Primitive>,
    options?: {
        /**
         * @default `&`
         */
        separator?: string
    }
): string {
    const { separator = '&' } = options ?? {}
    return flatMap(Object.entries(query), ([key, values]) =>
        ensureArray(values)
            .filter(isNot(isNullOrUndefined))
            .map(
                (v) =>
                    `${encodeURIComponent(key.toString())}=${encodeURIComponent(
                        v.toString()
                    ).replace(/%20/g, '+')}`
            )
    ).join(separator)
}

/**
 * Converts absolute URL to relative
 *
 * @example
 * ```
 * urlToRelative('https://domain.com/index.html')
 * // /index.html
 * ```
 */
export function urlToRelative(url: string): string {
    return `/${url.replace(/^(?:\/\/|[^/]+)*\//, '')}`
}

// /**
//  * Construct a full (`absolute`) URL by combining a `base URL` with another URL.
//  *
//  * @example
//  * ```
//  * urlToAbsolute('https://domain.com', 'index.html')
//  * // https://domain.com/index.html
//  * ```
//  */
// export function urlJoin(base: string, relative: string): string {
//     const stack = base.split('/')
//     const parts = relative.split('/')

//     const minimalBase = base[0] && (!base[1] && !base[2]) ? base.slice(0, 3) : []
//     parts.forEach((value, index) => {
//         if (index === 0) {
//             stack.pop()
//         } else if (value === '.') {
//             return
//         } else if (value === '..') {
//             stack.pop()
//         } else {
//             stack.push(value)
//         }
//     })

//     return stack.join('/');
// }

// /**
//  * Parses url string to separate parts.
//  */
// export function urlParse(url: string): {
//     hash: string
//     host: string
//     hostname: string
//     href: string
//     origin: string
//     pathname: string
//     port: string
//     protocol: string
//     search: string
//     username: string
//     password: string
// } {
//     const match = url.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/)
//     const value = {
//             hash: match?.[10] || "",
//             host: match?.[3] || "",
//             hostname: match?.[6] || "",
//             href: match?.[0] || "",
//             origin: match?.[1] || "",
//             pathname: match?.[8] || (match?.[1] ? "/" : ""),
//             port: match?.[7] || "",
//             protocol: match?.[2] || "",
//             search: match?.[9] || "",
//             username: match?.[4] || "",
//             password: match?.[5] || ""
//         };
//     if (value.protocol.length == 2) {
//         value.protocol = "file:///" + value.protocol.toUpperCase();
//         value.origin = value.protocol + "//" + value.host;
//     }
//     value.href = value.origin + value.pathname + value.search + value.hash;
//     return value;
// }
