/**
 * HTTP codes with status text.
 *
 * _Example:_
 * ```
 * httpCodes[301]
 * 'Moved Permanently'
 * ```
 *
 * @category Http
 * @tutorial https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export const httpCodes = {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',
    208: 'Already Reported',
    226: 'IM Used',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a Teapot",
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    509: 'Bandwidth Limit Exceeded',
    510: 'Not Extended',
    511: 'Network Authentication Required',
} as const

/**
 * HTTP status code union type
 *
 * @category Http
 * @tutorial https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export type HttpStatusCode = keyof typeof httpCodes

/**
 * HTTP status messages union type
 *
 * @category Http
 * @tutorial https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export type HttpStatusMessage = typeof httpCodes[keyof typeof httpCodes]

/**
 * HTTP messages mappings with corresponding status codes.
 *
 * _Example:_
 * ```
 * httpMessages['Moved Permanently']
 * 301
 * ```
 *
 * @category Http
 */
export const httpMessages: Record<HttpStatusMessage, HttpStatusCode> = Object.entries(httpCodes).reduce((prev, [key, value]) => {
    prev[value] = parseInt(key) as HttpStatusCode
    return prev
}, {} as Record<HttpStatusMessage, HttpStatusCode>)

/**
 * HTTP error class with status code
 *
 * Examples:
 * ```
 * // Throw 404 error with default message
 * throw new HttpError(404)
 * throw new HttpError('Not Found')
 *
 * // Throw 404 error with custom message
 * throw new HttpError(404, 'X not found')
 * throw new HttpError('Not Found', 'X not found')
 *
 * // Throw 500 error and expose custom message to user
 * throw new HttpError('Internal Server Error', 'Missing configuration', {expose: true})
 * ```
 *
 * @category Http
 */
export class HttpError extends Error {
    /**
     * Should error message be exposed to the user
     */
    public expose: boolean
    /**
     * HTTP status code
     */
    public status: HttpStatusCode

    /**
     * @param status HTTP [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) or HTTP [status message](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
     * @param message error message, if not provided message from [[httpCodes]] is used
     * @param properties additional configuration
     */
    constructor(
        status: HttpStatusMessage | HttpStatusCode,
        message?: string,
        properties?: {
            /**
             * Should error message be exposed to the user
             */
            expose: boolean
        }
    ) {
        const statusCode = typeof status === 'number' ? status : httpMessages[status]

        if (statusCode == null) {
            throw new Error('Incorrec status message')
        }

        super(message ?? (httpCodes as Record<number, string>)[statusCode] ?? '')
        this.status = statusCode
        this.expose = properties?.expose ?? status < 500
    }
}
