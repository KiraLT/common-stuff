/**
 * HTTP status codes
 *
 * _Example:_
 * ```
 * HttpStatusCodes.ACCEPTED
 * >> 202
 * ```
 *
 * @category Http
 */
export enum HttpStatusCodes {
    /**
     * The request has been received but not yet acted upon. It is non-committal, meaning that there is no way in HTTP to later send an asynchronous response indicating the outcome of processing the request. It is intended for cases where another process or server handles the request, or for batch processing.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.3
     */
    ACCEPTED = 202,
    /**     *
     * This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.3
     */
    BAD_GATEWAY = 502,
    /**
     * This response means that server could not understand the request due to invalid syntax.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.1
     */
    BAD_REQUEST = 400,
    /**
     * This response is sent when a request conflicts with the current state of the server.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.8
     */
    CONFLICT = 409,
    /**
     * This interim response indicates that everything so far is OK and that the client should continue with the request or ignore it if it is already finished.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.2.1
     */
    CONTINUE = 100,
    /**
     * The request has succeeded and a new resource has been created as a result of it. This is typically the response sent after a PUT request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.2
     */
    CREATED = 201,
    /**
     * This response code means the expectation indicated by the Expect request header field can't be met by the server.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.14
     */
    EXPECTATION_FAILED = 417,
    /**
     * The request failed due to failure of a previous request.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.5
     */
    FAILED_DEPENDENCY = 424,
    /**
     * The client does not have access rights to the content, i.e. they are unauthorized, so server is rejecting to give proper response. Unlike 401, the client's identity is known to the server.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.3
     */
    FORBIDDEN = 403,
    /**
     * This error response is given when the server is acting as a gateway and cannot get a response in time.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.5
     */
    GATEWAY_TIMEOUT = 504,
    /**
     * This response would be sent when the requested content has been permanently deleted from server, with no forwarding address. Clients are expected to remove their caches and links to the resource. The HTTP specification intends this status code to be used for "limited-time, promotional services". APIs should not feel compelled to indicate resources that have been deleted with this status code.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.9
     */
    GONE = 410,
    /**
     * The HTTP version used in the request is not supported by the server.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.6
     */
    HTTP_VERSION_NOT_SUPPORTED = 505,
    /**
     * Any attempt to brew coffee with a teapot should result in the error code "418 I'm a teapot". The resulting entity body MAY be short and stout.
     *
     * @tutorial https://tools.ietf.org/html/rfc2324#section-2.3.2
     */
    IM_A_TEAPOT = 418,
    /**
     * The 507 (Insufficient Storage) status code means the method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request. This condition is considered to be temporary. If the request which received this status code was the result of a user action, the request MUST NOT be repeated until it is requested by a separate user action.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.6
     */
    INSUFFICIENT_SPACE_ON_RESOURCE = 419,
    /**
     * The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.6
     */
    INSUFFICIENT_STORAGE = 507,
    /**
     * The server encountered an unexpected condition that prevented it from fulfilling the request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.1
     */
    INTERNAL_SERVER_ERROR = 500,
    /**
     * The server rejected the request because the Content-Length header field is not defined and the server requires it.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.10
     */
    LENGTH_REQUIRED = 411,
    /**
     * The resource that is being accessed is locked.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.4
     */
    LOCKED = 423,
    /**
     * A deprecated response used by the Spring Framework when a method has failed.
     *
     * @deprecated
     * @tutorial https://tools.ietf.org/rfcdiff?difftype=--hwdiff&url2=draft-ietf-webdav-protocol-06.txt
     */
    METHOD_FAILURE = 420,
    /**
     * The request method is known by the server but has been disabled and cannot be used. For example, an API may forbid DELETE-ing a resource. The two mandatory methods, GET and HEAD, must never be disabled and should not return this error code.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.5
     */
    METHOD_NOT_ALLOWED = 405,
    /**
     * This response code means that URI of requested resource has been changed. Probably, new URI would be given in the response.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.2
     */
    MOVED_PERMANENTLY = 301,
    /**
     * This response code means that URI of requested resource has been changed temporarily. New changes in the URI might be made in the future. Therefore, this same URI should be used by the client in future requests.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.3
     */
    MOVED_TEMPORARILY = 302,
    /**
     * A Multi-Status response conveys information about multiple resources in situations where multiple status codes might be appropriate.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.2
     */
    MULTI_STATUS = 207,
    /**
     * The request has more than one possible responses. User-agent or user should choose one of them. There is no standardized way to choose one of the responses.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.1
     */
    MULTIPLE_CHOICES = 300,
    /**
     * The 511 status code indicates that the client needs to authenticate to gain network access.
     *
     * @tutorial https://tools.ietf.org/html/rfc6585#section-6
     */
    NETWORK_AUTHENTICATION_REQUIRED = 511,
    /**
     * There is no content to send for this request, but the headers may be useful. The user-agent may update its cached headers for this resource with the new ones.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.5
     */
    NO_CONTENT = 204,
    /**
     * This response code means returned meta-information set is not exact set as available from the origin server, but collected from a local or a third party copy. Except this condition, 200 OK response should be preferred instead of this response.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.4
     */
    NON_AUTHORITATIVE_INFORMATION = 203,
    /**
     * This response is sent when the web server, after performing server-driven content negotiation, doesn't find any content following the criteria given by the user agent.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.6
     */
    NOT_ACCEPTABLE = 406,
    /**
     * The server can not find requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 to hide the existence of a resource from an unauthorized client. This response code is probably the most famous one due to its frequent occurence on the web.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.4
     */
    NOT_FOUND = 404,
    /**
     * The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are GET and HEAD.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.2
     */
    NOT_IMPLEMENTED = 501,
    /**
     * This is used for caching purposes. It is telling to client that response has not been modified. So, client can continue to use same cached version of response.
     *
     * @tutorial https://tools.ietf.org/html/rfc7232#section-4.1
     */
    NOT_MODIFIED = 304,
    /**
     * The request has succeeded. The meaning of a success varies depending on the HTTP method:
     * GET: The resource has been fetched and is transmitted in the message body.
     * HEAD: The entity headers are in the message body.
     * POST: The resource describing the result of the action is transmitted in the message body.
     * TRACE: The message body contains the request message as received by the server
     *
     *  @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.1
     */
    OK = 200,
    /**
     * This response code is used because of range header sent by the client to separate download into multiple streams.
     *
     * @tutorial https://tools.ietf.org/html/rfc7233#section-4.1
     */
    PARTIAL_CONTENT = 206,
    /**
     * This response code is reserved for future use. Initial aim for creating this code was using it for digital payment systems however this is not used currently.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.2
     */
    PAYMENT_REQUIRED = 402,
    /**
     * This means that the resource is now permanently located at another URI, specified by the Location: HTTP Response header. This has the same semantics as the 301 Moved Permanently HTTP response code, with the exception that the user agent must not change the HTTP method used: if a POST was used in the first request, a POST must be used in the second request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7538#section-3
     */
    PERMANENT_REDIRECT = 308,
    /**
     * The client has indicated preconditions in its headers which the server does not meet.
     *
     * @tutorial https://tools.ietf.org/html/rfc7232#section-4.2
     */
    PRECONDITION_FAILED = 412,
    /**
     * The origin server requires the request to be conditional. Intended to prevent the 'lost update' problem, where a client GETs a resource's state, modifies it, and PUTs it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.
     *
     * @tutorial https://tools.ietf.org/html/rfc6585#section-3
     */
    PRECONDITION_REQUIRED = 428,
    /**
     * This code indicates that the server has received and is processing the request, but no response is available yet.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.1
     */
    PROCESSING = 102,
    /**
     * This is similar to 401 but authentication is needed to be done by a proxy.
     *
     * @tutorial https://tools.ietf.org/html/rfc7235#section-3.2
     */
    PROXY_AUTHENTICATION_REQUIRED = 407,
    /**
     * The server is unwilling to process the request because its header fields are too large. The request MAY be resubmitted after reducing the size of the request header fields.
     *
     * @tutorial https://tools.ietf.org/html/rfc6585#section-5
     */
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    /**
     * This response is sent on an idle connection by some servers, even without any previous request by the client. It means that the server would like to shut down this unused connection. This response is used much more since some browsers, like Chrome, Firefox 27+, or IE9, use HTTP pre-connection mechanisms to speed up surfing. Also note that some servers merely shut down the connection without sending this message.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.7
     */
    REQUEST_TIMEOUT = 408,
    /**
     * Request entity is larger than limits defined by server; the server might close the connection or return an Retry-After header field.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.11
     */
    REQUEST_TOO_LONG = 413,
    /**
     * The URI requested by the client is longer than the server is willing to interpret.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.12
     */
    REQUEST_URI_TOO_LONG = 414,
    /**
     * The range specified by the Range header field in the request can't be fulfilled; it's possible that the range is outside the size of the target URI's data.
     *
     * @tutorial https://tools.ietf.org/html/rfc7233#section-4.4
     */
    REQUESTED_RANGE_NOT_SATISFIABLE = 416,
    /**
     * This response code is sent after accomplishing request to tell user agent reset document view which sent this request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.6
     */
    RESET_CONTENT = 205,
    /**
     * Server sent this response to directing client to get requested resource to another URI with an GET request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.4
     */
    SEE_OTHER = 303,
    /**
     * The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded. Note that together with this response, a user-friendly page explaining the problem should be sent. This responses should be used for temporary conditions and the Retry-After: HTTP header should, if possible, contain the estimated time before the recovery of the service. The webmaster must also take care about the caching-related headers that are sent along with this response, as these temporary condition responses should usually not be cached.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.4
     */
    SERVICE_UNAVAILABLE = 503,
    /**
     * This code is sent in response to an Upgrade request header by the client, and indicates the protocol the server is switching too.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.2.2
     */
    SWITCHING_PROTOCOLS = 101,
    /**
     * Server sent this response to directing client to get requested resource to another URI with same method that used prior request. This has the same semantic than the 302 Found HTTP response code, with the exception that the user agent must not change the HTTP method used: if a POST was used in the first request, a POST must be used in the second request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.7
     */
    TEMPORARY_REDIRECT = 307,
    /**
     * The user has sent too many requests in a given amount of time ("rate limiting").
     *
     * @tutorial https://tools.ietf.org/html/rfc6585#section-4
     */
    TOO_MANY_REQUESTS = 429,
    /**
     * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
     *
     * @tutorial https://tools.ietf.org/html/rfc7235#section-3.1
     */
    UNAUTHORIZED = 401,
    /**
     * The user-agent requested a resource that cannot legally be provided, such as a web page censored by a government.
     *
     * @tutorial https://tools.ietf.org/html/rfc7725
     */
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,
    /**
     * The request was well-formed but was unable to be followed due to semantic errors.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.3
     */
    UNPROCESSABLE_ENTITY = 422,
    /**
     * The media format of the requested data is not supported by the server, so the server is rejecting the request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.13
     */
    UNSUPPORTED_MEDIA_TYPE = 415,
    /**
     * Was defined in a previous version of the HTTP specification to indicate that a requested response must be accessed by a proxy. It has been deprecated due to security concerns regarding in-band configuration of a proxy.
     *
     * @deprecated
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.6
     */
    USE_PROXY = 305,
}

/**
 * HTTP status reason text
 *
 * _Example:_
 * ```
 * HttpStatusCodes.ACCEPTED
 * >> 'Accepted'
 * ```
 *
 * @category Http
 */
export enum HttpStatusReasons {
    /**
     * The request has been received but not yet acted upon. It is non-committal, meaning that there is no way in HTTP to later send an asynchronous response indicating the outcome of processing the request. It is intended for cases where another process or server handles the request, or for batch processing.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.3
     */
    ACCEPTED = 'Accepted',
    /**
     * This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.3
     */
    BAD_GATEWAY = 'Bad Gateway',
    /**
     * This response means that server could not understand the request due to invalid syntax.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.1
     */
    BAD_REQUEST = 'Bad Request',
    /**
     * This response is sent when a request conflicts with the current state of the server.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.8
     */
    CONFLICT = 'Conflict',
    /**
     * This interim response indicates that everything so far is OK and that the client should continue with the request or ignore it if it is already finished.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.2.1
     */
    CONTINUE = 'Continue',
    /**
     * The request has succeeded and a new resource has been created as a result of it. This is typically the response sent after a PUT request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.2
     */
    CREATED = 'Created',
    /**
     * This response code means the expectation indicated by the Expect request header field can't be met by the server.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.14
     */
    EXPECTATION_FAILED = 'Expectation Failed',
    /**
     * The request failed due to failure of a previous request.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.5
     */
    FAILED_DEPENDENCY = 'Failed Dependency',
    /**
     * The client does not have access rights to the content, i.e. they are unauthorized, so server is rejecting to give proper response. Unlike 401, the client's identity is known to the server.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.3
     */
    FORBIDDEN = 'Forbidden',
    /**
     * This error response is given when the server is acting as a gateway and cannot get a response in time.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.5
     */
    GATEWAY_TIMEOUT = 'Gateway Timeout',
    /**
     * This response would be sent when the requested content has been permanently deleted from server, with no forwarding address. Clients are expected to remove their caches and links to the resource. The HTTP specification intends this status code to be used for "limited-time, promotional services". APIs should not feel compelled to indicate resources that have been deleted with this status code.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.9
     */
    GONE = 'Gone',
    /**
     * The HTTP version used in the request is not supported by the server.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.6
     */
    HTTP_VERSION_NOT_SUPPORTED = 'HTTP Version Not Supported',
    /**
     * Any attempt to brew coffee with a teapot should result in the error code "418 I'm a teapot". The resulting entity body MAY be short and stout.
     *
     * @tutorial https://tools.ietf.org/html/rfc2324#section-2.3.2
     */
    IM_A_TEAPOT = "I'm a teapot",
    /**
     * The 507 (Insufficient Storage) status code means the method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request. This condition is considered to be temporary. If the request which received this status code was the result of a user action, the request MUST NOT be repeated until it is requested by a separate user action.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.6
     */
    INSUFFICIENT_SPACE_ON_RESOURCE = 'Insufficient Space on Resource',
    /**
     * The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.6
     */
    INSUFFICIENT_STORAGE = 'Insufficient Storage',
    /**
     * The server encountered an unexpected condition that prevented it from fulfilling the request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.1
     */
    INTERNAL_SERVER_ERROR = 'Internal Server Error',
    /**
     * The server rejected the request because the Content-Length header field is not defined and the server requires it.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.10
     */
    LENGTH_REQUIRED = 'Length Required',
    /**
     * The resource that is being accessed is locked.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.4
     */
    LOCKED = 'Locked',
    /**
     * A deprecated response used by the Spring Framework when a method has failed.
     *
     * @deprecated
     * @tutorial https://tools.ietf.org/rfcdiff?difftype=--hwdiff&url2=draft-ietf-webdav-protocol-06.txt
     */
    METHOD_FAILURE = 'Method Failure',
    /**
     * The request method is known by the server but has been disabled and cannot be used. For example, an API may forbid DELETE-ing a resource. The two mandatory methods, GET and HEAD, must never be disabled and should not return this error code.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.5
     */
    METHOD_NOT_ALLOWED = 'Method Not Allowed',
    /**
     * This response code means that URI of requested resource has been changed. Probably, new URI would be given in the response.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.2
     */
    MOVED_PERMANENTLY = 'Moved Permanently',
    /**
     * This response code means that URI of requested resource has been changed temporarily. New changes in the URI might be made in the future. Therefore, this same URI should be used by the client in future requests.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.3
     */
    MOVED_TEMPORARILY = 'Moved Temporarily',
    /**
     * A Multi-Status response conveys information about multiple resources in situations where multiple status codes might be appropriate.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.2
     */
    MULTI_STATUS = 'Multi-Status',
    /**
     * The request has more than one possible responses. User-agent or user should choose one of them. There is no standardized way to choose one of the responses.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.1
     */
    MULTIPLE_CHOICES = 'Multiple Choices',
    /**
     * The 511 status code indicates that the client needs to authenticate to gain network access.
     *
     * @tutorial https://tools.ietf.org/html/rfc6585#section-6
     */
    NETWORK_AUTHENTICATION_REQUIRED = 'Network Authentication Required',
    /**
     * There is no content to send for this request, but the headers may be useful. The user-agent may update its cached headers for this resource with the new ones.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.5
     */
    NO_CONTENT = 'No Content',
    /**
     * This response code means returned meta-information set is not exact set as available from the origin server, but collected from a local or a third party copy. Except this condition, 200 OK response should be preferred instead of this response.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.4
     */
    NON_AUTHORITATIVE_INFORMATION = 'Non Authoritative Information',
    /**
     * This response is sent when the web server, after performing server-driven content negotiation, doesn't find any content following the criteria given by the user agent.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.6
     */
    NOT_ACCEPTABLE = 'Not Acceptable',
    /**
     * The server can not find requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 to hide the existence of a resource from an unauthorized client. This response code is probably the most famous one due to its frequent occurence on the web.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.4
     */
    NOT_FOUND = 'Not Found',
    /**
     * The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are GET and HEAD.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.2
     */
    NOT_IMPLEMENTED = 'Not Implemented',
    /**
     * This is used for caching purposes. It is telling to client that response has not been modified. So, client can continue to use same cached version of response.
     *
     * @tutorial https://tools.ietf.org/html/rfc7232#section-4.1
     */
    NOT_MODIFIED = 'Not Modified',
    /**
     * The request has succeeded. The meaning of a success varies depending on the HTTP method:
     *
     * GET: The resource has been fetched and is transmitted in the message body.
     * HEAD: The entity headers are in the message body.
     * POST: The resource describing the result of the action is transmitted in the message body.
     * TRACE: The message body contains the request message as received by the server
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.1
     */
    OK = 'OK',
    /**
     * This response code is used because of range header sent by the client to separate download into multiple streams.
     *
     * @tutorial https://tools.ietf.org/html/rfc7233#section-4.1
     */
    PARTIAL_CONTENT = 'Partial Content',
    /**
     * This response code is reserved for future use. Initial aim for creating this code was using it for digital payment systems however this is not used currently.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.2
     */
    PAYMENT_REQUIRED = 'Payment Required',
    /**
     * This means that the resource is now permanently located at another URI, specified by the Location: HTTP Response header. This has the same semantics as the 301 Moved Permanently HTTP response code, with the exception that the user agent must not change the HTTP method used: if a POST was used in the first request, a POST must be used in the second request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7538#section-3
     */
    PERMANENT_REDIRECT = 'Permanent Redirect',
    /**
     * The client has indicated preconditions in its headers which the server does not meet.
     *
     * @tutorial https://tools.ietf.org/html/rfc7232#section-4.2
     */
    PRECONDITION_FAILED = 'Precondition Failed',
    /**
     * The origin server requires the request to be conditional. Intended to prevent the 'lost update' problem, where a client GETs a resource's state, modifies it, and PUTs it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.
     *
     * @tutorial https://tools.ietf.org/html/rfc6585#section-3
     */
    PRECONDITION_REQUIRED = 'Precondition Required',
    /**
     * This code indicates that the server has received and is processing the request, but no response is available yet.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.1
     */
    PROCESSING = 'Processing',
    /**
     * This is similar to 401 but authentication is needed to be done by a proxy.
     *
     * @tutorial https://tools.ietf.org/html/rfc7235#section-3.2
     */
    PROXY_AUTHENTICATION_REQUIRED = 'Proxy Authentication Required',
    /**
     * The server is unwilling to process the request because its header fields are too large. The request MAY be resubmitted after reducing the size of the request header fields.
     *
     * @tutorial https://tools.ietf.org/html/rfc6585#section-5
     */
    REQUEST_HEADER_FIELDS_TOO_LARGE = 'Request Header Fields Too Large',
    /**
     * This response is sent on an idle connection by some servers, even without any previous request by the client. It means that the server would like to shut down this unused connection. This response is used much more since some browsers, like Chrome, Firefox 27+, or IE9, use HTTP pre-connection mechanisms to speed up surfing. Also note that some servers merely shut down the connection without sending this message.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.7
     */
    REQUEST_TIMEOUT = 'Request Timeout',
    /**
     * Request entity is larger than limits defined by server; the server might close the connection or return an Retry-After header field.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.11
     */
    REQUEST_TOO_LONG = 'Request Entity Too Large',
    /**
     * The URI requested by the client is longer than the server is willing to interpret.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.12
     */
    REQUEST_URI_TOO_LONG = 'Request-URI Too Long',
    /**
     * The range specified by the Range header field in the request can't be fulfilled; it's possible that the range is outside the size of the target URI's data.
     *
     * @tutorial https://tools.ietf.org/html/rfc7233#section-4.4
     */
    REQUESTED_RANGE_NOT_SATISFIABLE = 'Requested Range Not Satisfiable',
    /**
     * This response code is sent after accomplishing request to tell user agent reset document view which sent this request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.3.6
     */
    RESET_CONTENT = 'Reset Content',
    /**
     * Server sent this response to directing client to get requested resource to another URI with an GET request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.4
     */
    SEE_OTHER = 'See Other',
    /**
     * The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded. Note that together with this response, a user-friendly page explaining the problem should be sent. This responses should be used for temporary conditions and the Retry-After: HTTP header should, if possible, contain the estimated time before the recovery of the service. The webmaster must also take care about the caching-related headers that are sent along with this response, as these temporary condition responses should usually not be cached.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.6.4
     */
    SERVICE_UNAVAILABLE = 'Service Unavailable',
    /**
     * This code is sent in response to an Upgrade request header by the client, and indicates the protocol the server is switching too.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.2.2
     */
    SWITCHING_PROTOCOLS = 'Switching Protocols',
    /**
     * Server sent this response to directing client to get requested resource to another URI with same method that used prior request. This has the same semantic than the 302 Found HTTP response code, with the exception that the user agent must not change the HTTP method used: if a POST was used in the first request, a POST must be used in the second request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.7
     */
    TEMPORARY_REDIRECT = 'Temporary Redirect',
    /**
     * The user has sent too many requests in a given amount of time ("rate limiting").
     *
     * @tutorial https://tools.ietf.org/html/rfc6585#section-4
     */
    TOO_MANY_REQUESTS = 'Too Many Requests',
    /**
     * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
     *
     * @tutorial https://tools.ietf.org/html/rfc7235#section-3.1
     */
    UNAUTHORIZED = 'Unauthorized',
    /**
     * The user-agent requested a resource that cannot legally be provided, such as a web page censored by a government.
     *
     * @tutorial https://tools.ietf.org/html/rfc7725
     */
    UNAVAILABLE_FOR_LEGAL_REASONS = 'Unavailable For Legal Reasons',
    /**
     * The request was well-formed but was unable to be followed due to semantic errors.
     *
     * @tutorial https://tools.ietf.org/html/rfc2518#section-10.3
     */
    UNPROCESSABLE_ENTITY = 'Unprocessable Entity',
    /**
     * The media format of the requested data is not supported by the server, so the server is rejecting the request.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.5.13
     */
    UNSUPPORTED_MEDIA_TYPE = 'Unsupported Media Type',
    /**
     * Was defined in a previous version of the HTTP specification to indicate that a requested response must be accessed by a proxy. It has been deprecated due to security concerns regarding in-band configuration of a proxy.
     *
     * @tutorial https://tools.ietf.org/html/rfc7231#section-6.4.6
     * @deprecated
     */
    USE_PROXY = 'Use Proxy',
}
