import assert from 'node:assert/strict'
import test from 'node:test'

import {
    base64Decode,
    base64Encode,
    generateUUID,
    hashCode,
} from '../src/index.ts'

test('generateHash', async (t) => {
    await t.test('generates object hash', () => {
        assert.equal(hashCode({ a: ['b', '1'] }), -336400960)
    })
})

test('base64Encode', async (t) => {
    await t.test('encodes string', () => {
        assert.equal(
            base64Encode('rtėęrfgt58įė9įėš+ė*-は个'),
            'cnTEl8SZcmZndDU4xK/ElznEr8SXxaErxJcqLeOBr+S4qg==',
        )
    })
})

test('base64Decode', async (t) => {
    await t.test('decodes string', () => {
        assert.equal(
            base64Decode('cnTEl8SZcmZndDU4xK/ElznEr8SXxaErxJcqLeOBr+S4qg=='),
            'rtėęrfgt58įė9įėš+ė*-は个',
        )
    })
})

test('generateUUID', async (t) => {
    await t.test('generates UUID', () => {
        assert.match(generateUUID(), /........-....-4...-....-.........../)
    })
    await t.test('UUID to be unique', () => {
        assert.notEqual(generateUUID(), generateUUID())
    })
})
