import assert from 'node:assert/strict'
import test from 'node:test'

import {
    base64Decode,
    base64Encode,
    generateUUID,
    hashCode,
} from '../src/index.ts'
import { assertType } from './_types.ts'

test('generateHash', async (t) => {
    await t.test('types', () => {
        assertType<number>()(hashCode({ a: 1 }))
        // Accepts any value (typed as unknown)
        assertType<number>()(hashCode('string'))
    })

    await t.test('is deterministic', () => {
        assert.equal(hashCode({ a: ['b', '1'] }), hashCode({ a: ['b', '1'] }))
        assert.equal(hashCode(42), hashCode(42))
        assert.equal(hashCode(null), hashCode(null))
    })

    await t.test('distinguishes falsy primitives', () => {
        const hashes = [
            hashCode(0),
            hashCode(false),
            hashCode(null),
            hashCode(undefined),
            hashCode(''),
            hashCode(Number.NaN),
        ]
        assert.equal(
            new Set(hashes).size,
            hashes.length,
            'falsy values should not collide',
        )
    })

    await t.test('distinguishes type from string content', () => {
        // Previously, `0` and `false` collided; now they don't.
        assert.notEqual(hashCode(0), hashCode(false))
        assert.notEqual(hashCode(0), hashCode('0'))
        assert.notEqual(hashCode(null), hashCode('null'))
    })

    await t.test('returns a 32-bit integer', () => {
        const h = hashCode({ a: 1, b: 'x' })
        assert.ok(Number.isInteger(h))
        assert.ok(h >= -(2 ** 31) && h < 2 ** 31)
    })
})

test('base64Encode', async (t) => {
    await t.test('types', () => {
        assertType<string>()(base64Encode('hi'))
    })

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
    await t.test('types', () => {
        assertType<string>()(base64Decode('aGk='))
    })

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
    await t.test('types', () => {
        assertType<string>()(generateUUID())
    })

    await t.test('generates UUID', () => {
        assert.match(generateUUID(), /........-....-4...-....-.........../)
    })
    await t.test('UUID to be unique', () => {
        assert.notEqual(generateUUID(), generateUUID())
    })
})
