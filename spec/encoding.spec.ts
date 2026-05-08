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
    await t.test('handles falsy input', () => {
        assert.equal(hashCode(null), 1088)
        assert.equal(hashCode(undefined), 1088)
        assert.equal(hashCode(0), 1088)
    })
})

test('base64Encode', async (t) => {
    await t.test('encodes string', () => {
        assert.equal(
            base64Encode('rtėęrfgt58įė9įėš+ė*-は个'),
            'cnTEl8SZcmZndDU4xK/ElznEr8SXxaErxJcqLeOBr+S4qg==',
        )
    })
    await t.test('encodes 1-byte tail (single =)', () => {
        // length 2: chr1='a', chr2='b', chr3=NaN → enc4=64
        assert.equal(base64Encode('ab'), 'YWI=')
    })
    await t.test('encodes 2-byte tail (double ==)', () => {
        // length 1: chr2=NaN → enc3=enc4=64
        assert.equal(base64Encode('a'), 'YQ==')
    })
})

test('base64Decode', async (t) => {
    await t.test('decodes string', () => {
        assert.equal(
            base64Decode('cnTEl8SZcmZndDU4xK/ElznEr8SXxaErxJcqLeOBr+S4qg=='),
            'rtėęrfgt58įė9įėš+ė*-は个',
        )
    })
    await t.test('round-trip: ASCII', () => {
        const s = 'hello world'
        assert.equal(base64Decode(base64Encode(s)), s)
    })
    await t.test('round-trip: empty', () => {
        assert.equal(base64Encode(''), '')
        assert.equal(base64Decode(''), '')
    })
    await t.test('round-trip: unicode', () => {
        const s = '日本語 🎉 emoji'
        assert.equal(base64Decode(base64Encode(s)), s)
    })
    await t.test('round-trip: every length mod 3', () => {
        for (const s of ['a', 'ab', 'abc', 'abcd']) {
            assert.equal(base64Decode(base64Encode(s)), s)
        }
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
