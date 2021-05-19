import { HttpStatusCodes, HttpStatusReasons } from './codes'

const codeToReason = Object.entries(HttpStatusCodes).reduce(
    (prev, [key, value]) => {
        prev[value as number] =
            HttpStatusReasons[key as keyof typeof HttpStatusReasons]
        return prev
    },
    {} as Record<number, string>
)

/**
 * HTTP error class with status code
 *
 * Examples:
 * ```
 * // Throw 404 error with default message
 * throw new HttpError(404)
 * throw new HttpError(HttpStatusCodes.NOT_FOUND)
 *
 * // Throw 404 error with custom message
 * throw new HttpError(404, 'X not found')
 * throw new HttpError(HttpStatusCodes.NOT_FOUND, 'X not found')
 *
 * // Throw 500 error and expose custom message to user
 * throw new HttpError(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Missing configuration', {expose: true})
 *
 * // Handle HttpError
 * if (err instanceof HttpError) {
 *     console.log(err.message)
 *     return err.publicMessage
 * }
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
    public status: number

    /**
     * `this.message` if `this.status` is `true` else message from [[HttpStatusReasons]] is used
     */
    public publicMessage: string

    /**
     * @throws `Error` if status is not supported
     * @param status HTTP [status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
     * @param message error message, if not provided message from [[HttpStatusReasons]] is used
     * @param properties additional configuration
     */
    constructor(
        status: number,
        message?: string,
        properties?: {
            /**
             * Should error message be exposed to the user
             */
            expose: boolean
        }
    ) {
        if (!(status in codeToReason)) {
            throw new Error('Incorrect status code')
        }
        const defaultMessage = codeToReason[status] ?? ''
        const privateMessage = message ?? defaultMessage

        super(privateMessage)
        this.status = status
        this.expose = properties?.expose ?? status < 500
        this.publicMessage = this.expose ? privateMessage : defaultMessage
    }
}
