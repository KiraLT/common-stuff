import { hashCode, base64Decode, base64Encode, generateUUID } from '../src'

describe('generateHash', () => {
    it('generates object hash', () => {
        expect(hashCode({ a: ['b', '1'] })).toBe(-336400960)
    })
})

describe('base64Decode', () => {
    it('encodes string', () => {
        expect(base64Encode('rtėęrfgt58įė9įėš+ė*-は个')).toBe(
            'cnTEl8SZcmZndDU4xK/ElznEr8SXxaErxJcqLeOBr+S4qg=='
        )
    })
})

describe('base64Decode', () => {
    it('decodes string', () => {
        expect(base64Decode('cnTEl8SZcmZndDU4xK/ElznEr8SXxaErxJcqLeOBr+S4qg==')).toBe(
            'rtėęrfgt58įė9įėš+ė*-は个'
        )
    })
})

describe('generateUUID', () => {
    it('generates UUID', () => {
        expect(generateUUID()).toMatch(/........-....-4...-....-.........../)
    })

    it('UUID to be unique', () => {
        expect(generateUUID()).not.toBe(generateUUID())
    })
})
