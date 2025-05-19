import {
    HttpError,
    HttpStatusCodes,
    HttpStatusReasons,
    generateCookie,
    parseCookies,
    decodeHtml,
    encodeHtml,
    urlToRelative,
    parseQueryString,
    generateQueryString,
} from '../src'

describe('httpStatusCodes', () => {
    it('just works', () => {
        expect(HttpStatusReasons.NOT_FOUND).toBe('Not Found')
    })
})

describe('httpStatusMessages', () => {
    it('just works', () => {
        expect(HttpStatusCodes.NOT_FOUND).toBe(404)
    })
})

describe('HttpError', () => {
    // Typescript bug: https://github.com/microsoft/TypeScript/issues/22585
    it('supports instanceof', () => {
        expect(new HttpError(404) instanceof HttpError).toBeTruthy()
    })

    it('has status', () => {
        expect(new HttpError(404).status).toBe(404)
    })

    it('has message', () => {
        expect(new HttpError(404).message).toBe('Not Found')
        expect(new HttpError(404, '404').message).toBe('404')
    })

    it('auto expose', () => {
        expect(new HttpError(404).expose).toBeTruthy()
        expect(new HttpError(500).expose).toBeFalsy()
    })

    it('has expose', () => {
        expect(
            new HttpError(404, undefined, { expose: false }).expose,
        ).toBeFalsy()
        expect(
            new HttpError(500, undefined, { expose: true }).expose,
        ).toBeTruthy()
    })

    it('has public message', () => {
        expect(new HttpError(404).publicMessage).toBe('Not Found')
        expect(new HttpError(404, '404').publicMessage).toBe('404')
        expect(new HttpError(404, '404', { expose: false }).publicMessage).toBe(
            'Not Found',
        )
        expect(new HttpError(500, '500').publicMessage).toBe(
            'Internal Server Error',
        )
    })

    it('supports status text input', () => {
        expect(new HttpError(HttpStatusCodes.NOT_FOUND).status).toBe(404)
    })

    it('validates status input', () => {
        expect(() => new HttpError(951)).toThrow('Incorrect status code')
    })
})

describe('generateCookie', () => {
    it('generates cookie', () => {
        expect(generateCookie('a', 'b')).toBe('a=b')
    })

    it('escapes value', () => {
        expect(generateCookie('=', '=')).toBe('%3D=%3D')
    })

    it('supports expiration', () => {
        expect(generateCookie('a', 'b', { expires: 1 })).toMatch(
            /^a=b;expires=.*GMT$/,
        )
    })

    it('supports path', () => {
        expect(generateCookie('a', 'b', { path: '/' })).toBe('a=b;path=/')
    })

    it('supports domain', () => {
        expect(generateCookie('a', 'b', { domain: 'domain.com' })).toBe(
            'a=b;domain=domain.com',
        )
    })

    it('supports secure', () => {
        expect(generateCookie('a', 'b', { secure: true })).toBe('a=b;secure')
    })

    it('supports samesite', () => {
        expect(generateCookie('a', 'b', { sameSite: 'strict' })).toBe(
            'a=b;samesite=strict',
        )
    })

    it('supports multiple options', () => {
        expect(
            generateCookie('a', 'b', {
                expires: 1,
                path: '/',
                domain: 'domain.com',
                secure: true,
                sameSite: 'strict',
            }),
        ).toMatch(
            /^a=b;expires=.*GMT;path=\/;domain=domain.com;secure;samesite=strict$/,
        )
    })
})

describe('parseCookies', () => {
    it('parses cookie string', () => {
        expect(parseCookies('%3D=%3D')).toEqual({ '=': '=' })
    })
})

describe('encodeHtml', () => {
    it('encodes HTML', () => {
        expect(encodeHtml('< > " \' &')).toBe('&lt; &gt; &quot; &apos; &amp;')
    })
})

describe('decodeHtml', () => {
    it('decodes HTML', () => {
        expect(decodeHtml('&lt; &gt; &quot; &apos; &amp; &arm;')).toBe(
            '< > " \' & &arm;',
        )
    })

    it('decodes dec HTML', () => {
        expect(decodeHtml('&#60; &#62; &#34; &#39; &#38; &#10;')).toBe(
            '< > " \' & &#10;',
        )
    })
})

describe('urlToRelative', () => {
    it('converts absolute URL to relative', () => {
        expect(urlToRelative('https://domain.com/index.html')).toBe(
            '/index.html',
        )
    })

    it('supports subdomains', () => {
        expect(urlToRelative('https://my-sub.domain.com/index.html')).toBe(
            '/index.html',
        )
    })
})

// describe('urlJoin', () => {
//     it('joins absolute ant relative urls', () => {
//         expect(urlJoin('https://domain.com', 'index.html')).toBe('https://domain.com/index.html')
//         expect(urlJoin('https://domain.com/test/index.html', 'index.html')).toBe('https://domain.com/test/index.html')
//     })
// })

describe('parseQueryString', () => {
    it('parses string with ?', () => {
        expect(parseQueryString('?page=1&limit=20')).toEqual({
            page: ['1'],
            limit: ['20'],
        })
    })

    it('parses string without ?', () => {
        expect(parseQueryString('page=1&limit=20')).toEqual({
            page: ['1'],
            limit: ['20'],
        })
    })

    it('supports separator', () => {
        expect(
            parseQueryString('page=1;limit=20', {
                separator: ';',
            }),
        ).toEqual({ page: ['1'], limit: ['20'] })
    })

    it('removes values without keys', () => {
        expect(parseQueryString('?=1&limit=20')).toEqual({
            limit: ['20'],
        })
    })
})

describe('generateQueryString', () => {
    it('parses string', () => {
        expect(generateQueryString({ page: [1], limit: 20 })).toBe(
            'page=1&limit=20',
        )
    })

    it('supports separator', () => {
        expect(
            generateQueryString(
                { page: [1], limit: 20 },
                {
                    separator: ';',
                },
            ),
        ).toBe('page=1;limit=20')
    })
})
