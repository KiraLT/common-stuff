import assert from 'node:assert/strict'
import test from 'node:test'

import {
    decodeHtml,
    encodeHtml,
    generateCookie,
    generateQueryString,
    HttpError,
    HttpStatusCodes,
    HttpStatusReasons,
    parseCookies,
    parseQueryString,
    urlToRelative,
} from '../src/index.ts'
import { assertType } from './_types.ts'

test('httpStatusCodes', async (t) => {
    await t.test('types', () => {
        // Status reason and code lookups
        assertType<string>()(HttpStatusReasons.NOT_FOUND)
    })

    await t.test('just works', () => {
        assert.equal(HttpStatusReasons.NOT_FOUND, 'Not Found')
    })
})

test('httpStatusMessages', async (t) => {
    await t.test('types', () => {
        assertType<number>()(HttpStatusCodes.NOT_FOUND)
    })

    await t.test('just works', () => {
        assert.equal(HttpStatusCodes.NOT_FOUND, 404)
    })
})

test('HttpError', async (t) => {
    await t.test('types', () => {
        const err = new HttpError(404)
        assertType<HttpError>()(err)
        // HttpError extends Error (subtype check via assignment)
        const _e: Error = err
        void _e
        assertType<number>()(err.status)
        assertType<string>()(err.message)
        assertType<boolean>()(err.expose)
        assertType<string>()(err.publicMessage)
    })

    await t.test('supports instanceof', () => {
        assert.ok(new HttpError(404) instanceof HttpError)
    })
    await t.test('has status', () => {
        assert.equal(new HttpError(404).status, 404)
    })
    await t.test('has message', () => {
        assert.equal(new HttpError(404).message, 'Not Found')
        assert.equal(new HttpError(404, '404').message, '404')
    })
    await t.test('auto expose', () => {
        assert.equal(new HttpError(404).expose, true)
        assert.equal(new HttpError(500).expose, false)
    })
    await t.test('has expose', () => {
        assert.equal(
            new HttpError(404, undefined, { expose: false }).expose,
            false,
        )
        assert.equal(
            new HttpError(500, undefined, { expose: true }).expose,
            true,
        )
    })
    await t.test('has public message', () => {
        assert.equal(new HttpError(404).publicMessage, 'Not Found')
        assert.equal(new HttpError(404, '404').publicMessage, '404')
        assert.equal(
            new HttpError(404, '404', { expose: false }).publicMessage,
            'Not Found',
        )
        assert.equal(
            new HttpError(500, '500').publicMessage,
            'Internal Server Error',
        )
    })
    await t.test('supports status text input', () => {
        assert.equal(new HttpError(HttpStatusCodes.NOT_FOUND).status, 404)
    })
    await t.test('validates status input', () => {
        assert.throws(() => new HttpError(951), /Incorrect status code/)
    })
})

test('generateCookie', async (t) => {
    await t.test('types', () => {
        assertType<string>()(generateCookie('a', 'b'))
        assertType<string>()(generateCookie('a', 'b', { expires: 1 }))
    })

    await t.test('generates cookie', () => {
        assert.equal(generateCookie('a', 'b'), 'a=b')
    })
    await t.test('escapes value', () => {
        assert.equal(generateCookie('=', '='), '%3D=%3D')
    })
    await t.test('supports expiration', () => {
        assert.match(
            generateCookie('a', 'b', { expires: 1 }),
            /^a=b;expires=.*GMT$/,
        )
    })
    await t.test('expires=0 deletes the cookie (epoch in the past)', () => {
        const cookie = generateCookie('a', 'b', { expires: 0 })
        assert.match(cookie, /^a=b;expires=.*1970.*GMT$/)
    })
    await t.test('supports path', () => {
        assert.equal(generateCookie('a', 'b', { path: '/' }), 'a=b;path=/')
    })
    await t.test('supports domain', () => {
        assert.equal(
            generateCookie('a', 'b', { domain: 'domain.com' }),
            'a=b;domain=domain.com',
        )
    })
    await t.test('supports secure', () => {
        assert.equal(generateCookie('a', 'b', { secure: true }), 'a=b;secure')
    })
    await t.test('supports samesite', () => {
        assert.equal(
            generateCookie('a', 'b', { sameSite: 'strict' }),
            'a=b;samesite=strict',
        )
    })
    await t.test('supports multiple options', () => {
        assert.match(
            generateCookie('a', 'b', {
                expires: 1,
                path: '/',
                domain: 'domain.com',
                secure: true,
                sameSite: 'strict',
            }),
            /^a=b;expires=.*GMT;path=\/;domain=domain.com;secure;samesite=strict$/,
        )
    })
})

test('parseCookies', async (t) => {
    await t.test('types', () => {
        assertType<Record<string, string>>()(parseCookies('a=b'))
    })

    await t.test('parses cookie string', () => {
        assert.deepEqual(parseCookies('%3D=%3D'), { '=': '=' })
    })
    await t.test('strips wrapping quotes from value', () => {
        assert.deepEqual(parseCookies('a="b"'), { a: 'b' })
    })
    await t.test('handles separator without space', () => {
        assert.deepEqual(parseCookies('a=1;b=2'), { a: '1', b: '2' })
    })
})

test('encodeHtml', async (t) => {
    await t.test('types', () => {
        assertType<string>()(encodeHtml('<a>'))
    })

    await t.test('encodes HTML', () => {
        assert.equal(encodeHtml('< > " \' &'), '&lt; &gt; &quot; &apos; &amp;')
    })
})

test('decodeHtml', async (t) => {
    await t.test('types', () => {
        assertType<string>()(decodeHtml('&lt;a&gt;'))
    })

    await t.test('decodes HTML', () => {
        assert.equal(
            decodeHtml('&lt; &gt; &quot; &apos; &amp; &arm;'),
            '< > " \' & &arm;',
        )
    })
    await t.test('decodes dec HTML', () => {
        assert.equal(
            decodeHtml('&#60; &#62; &#34; &#39; &#38; &#10;'),
            '< > " \' & &#10;',
        )
    })
})

test('urlToRelative', async (t) => {
    await t.test('types', () => {
        assertType<string>()(urlToRelative('https://example.com/x'))
    })

    await t.test('converts absolute URL to relative', () => {
        assert.equal(
            urlToRelative('https://domain.com/index.html'),
            '/index.html',
        )
    })
    await t.test('supports subdomains', () => {
        assert.equal(
            urlToRelative('https://my-sub.domain.com/index.html'),
            '/index.html',
        )
    })
    await t.test('handles URL without trailing slash', () => {
        assert.equal(urlToRelative('https://domain.com'), '/')
    })
    await t.test('preserves already-relative paths', () => {
        assert.equal(urlToRelative('/path'), '/path')
    })
})

// describe('urlJoin', () => {
//     it('joins absolute ant relative urls', () => {
//         expect(urlJoin('https://domain.com', 'index.html')).toBe('https://domain.com/index.html')
//         expect(urlJoin('https://domain.com/test/index.html', 'index.html')).toBe('https://domain.com/test/index.html')
//     })
// })

test('parseQueryString', async (t) => {
    await t.test('types', () => {
        assertType<Record<string, string[]>>()(parseQueryString('?a=1'))
    })

    await t.test('parses string with ?', () => {
        assert.deepEqual(parseQueryString('?page=1&limit=20'), {
            page: ['1'],
            limit: ['20'],
        })
    })
    await t.test('parses string without ?', () => {
        assert.deepEqual(parseQueryString('page=1&limit=20'), {
            page: ['1'],
            limit: ['20'],
        })
    })
    await t.test('supports separator', () => {
        assert.deepEqual(
            parseQueryString('page=1;limit=20', { separator: ';' }),
            { page: ['1'], limit: ['20'] },
        )
    })
    await t.test('removes values without keys', () => {
        assert.deepEqual(parseQueryString('?=1&limit=20'), { limit: ['20'] })
    })
})

test('generateQueryString', async (t) => {
    await t.test('types', () => {
        assertType<string>()(generateQueryString({ a: 1 }))
        // Accepts Primitive | Primitive[] values
        assertType<string>()(generateQueryString({ a: [1, 2], b: 'x' }))
    })

    await t.test('parses string', () => {
        assert.equal(
            generateQueryString({ page: [1], limit: 20 }),
            'page=1&limit=20',
        )
    })
    await t.test('supports separator', () => {
        assert.equal(
            generateQueryString({ page: [1], limit: 20 }, { separator: ';' }),
            'page=1;limit=20',
        )
    })
})
