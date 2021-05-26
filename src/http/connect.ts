type ReqLike = {
    body: any
}
type RespLike = {
    status(status: unknown): unknown
    json(value: unknown): unknown
}
type NextLike = (err?: any) => void

/**
 * Creates [connect](https://www.npmjs.com/package/connect) style error handle compatible with ExpressJS and other similar frameworks.
 *
 * @example
 * ```
 * app.use(httpErrorHandler())
 * @experimental
```
 */
export function httpErrorHandler<
    Req extends ReqLike,
    Resp extends RespLike,
    Next extends NextLike
>(
    {
        serializer,
    }: {
        serializer: (
            err: { message: string; status: number; error: Error },
            req: Req,
            resp: Resp,
            next: Next
        ) => void
    } = {
        serializer: ({ message, status }, _req, resp) => {
            resp.status(status)
            resp.json({
                error: message,
            })
        },
    }
): (err: unknown, req: Req, resp: Resp, next: Next) => void {
    return (err, req, resp, next) => {
        if (err) {
            if (err instanceof Error) {
                serializer(
                    {
                        status:
                            'status' in err &&
                            typeof (err as any).status === 'number'
                                ? ((err as any).status as number)
                                : 500,
                        message: err.message,
                        error: err,
                    },
                    req,
                    resp,
                    next
                )
            } else {
                serializer(
                    {
                        status: 500,
                        message: String(err),
                        error: new Error(String(err)),
                    },
                    req,
                    resp,
                    next
                )
            }
        }
        next()
    }
}
