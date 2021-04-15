import { HttpError, HttpStatusCodes, HttpStatusReasons, generateCookie, parseCookies } from '../src'

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
    it('has status', () => {
        expect(new HttpError(404).status).toBe(404)
    })

    it('has message', () => {
        expect(new HttpError(404).message).toBe('Not Found')
        expect(new HttpError(404, '404').message).toBe('404')
    })

    it('has expose', () => {
        expect(new HttpError(404).expose).toBeTruthy()
        expect(new HttpError(500).expose).toBeFalsy()
    })

    it('has expose', () => {
        expect(
            new HttpError(404, undefined, { expose: false }).expose
        ).toBeFalsy()
        expect(
            new HttpError(500, undefined, { expose: true }).expose
        ).toBeTruthy()
    })

    it('supports status text input', () => {
        expect(new HttpError(HttpStatusCodes.NOT_FOUND).status).toBe(404)
    })

    it('validates status input', () => {
        expect(() => new HttpError(951 as any)).toThrow('Incorrect status code')
    })
})

describe('generateCookie', () => {
    it('generates cookie', () => {
        expect(generateCookie('a', 'b')).toBe('a=b')
    })

    it('escapes value', () => {
        expect(generateCookie('=', '=')).toBe(`${encodeURIComponent('=')}=${encodeURIComponent('=')}`)
    })

    it('supports expiration', () => {
        expect(generateCookie('a', 'b', {expires: 1})).toMatch(/^a=b;expires=.*GMT$/)
    })
})

describe('parseCookies', () => {
    it('just works', () => {
        expect(HttpStatusReasons.NOT_FOUND).toBe('Not Found')
    })
})
