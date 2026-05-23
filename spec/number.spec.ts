import assert from 'node:assert/strict'
import test from 'node:test'

import { toFloat, toInt } from '../src/index.ts'
import { assertType } from './_types.ts'

test('toFloat', async (t) => {
    await t.test('types', () => {
        assertType<number | undefined>()(toFloat('1.5'))
        assertType<number | undefined>()(toFloat(5))
    })

    await t.test('parses numeric strings', () => {
        assert.equal(toFloat('1.5'), 1.5)
        assert.equal(toFloat('-3.2'), -3.2)
        assert.equal(toFloat('0'), 0)
        assert.equal(toFloat('1e3'), 1000)
    })

    await t.test('trims whitespace', () => {
        assert.equal(toFloat('  42  '), 42)
    })

    await t.test('passes through finite numbers', () => {
        assert.equal(toFloat(2), 2)
        assert.equal(toFloat(-0.5), -0.5)
        assert.equal(toFloat(0), 0)
    })

    await t.test('returns undefined on partial match', () => {
        assert.equal(toFloat('1.5abc'), undefined)
        assert.equal(toFloat('42px'), undefined)
    })

    await t.test('returns undefined on non-numeric strings', () => {
        assert.equal(toFloat('abc'), undefined)
        assert.equal(toFloat(''), undefined)
        assert.equal(toFloat('   '), undefined)
    })

    await t.test('returns undefined for non-finite numbers', () => {
        assert.equal(toFloat(Number.NaN), undefined)
        assert.equal(toFloat(Number.POSITIVE_INFINITY), undefined)
        assert.equal(toFloat(Number.NEGATIVE_INFINITY), undefined)
    })

    await t.test('returns undefined for unexpected runtime types', () => {
        // TS forbids these, but JS callers might pass them — function should
        // not throw and should return `undefined`.
        assert.equal(toFloat(null as unknown as number), undefined)
        assert.equal(toFloat(undefined as unknown as number), undefined)
        assert.equal(toFloat({} as unknown as number), undefined)
        assert.equal(toFloat([] as unknown as number), undefined)
        assert.equal(toFloat(true as unknown as number), undefined)
    })
})

test('toInt', async (t) => {
    await t.test('types', () => {
        assertType<number | undefined>()(toInt('42'))
        assertType<number | undefined>()(toInt(1.9))
    })

    await t.test('parses integer strings', () => {
        assert.equal(toInt('42'), 42)
        assert.equal(toInt('-7'), -7)
        assert.equal(toInt('0'), 0)
    })

    await t.test('truncates floats toward zero', () => {
        assert.equal(toInt('1.9'), 1)
        assert.equal(toInt('-1.9'), -1)
        assert.equal(toInt(3.7), 3)
        assert.equal(toInt(-3.7), -3)
    })

    await t.test('trims whitespace', () => {
        assert.equal(toInt('  -7  '), -7)
    })

    await t.test('returns undefined on partial match', () => {
        assert.equal(toInt('42abc'), undefined)
        assert.equal(toInt('1.5px'), undefined)
    })

    await t.test('returns undefined on non-numeric strings', () => {
        assert.equal(toInt('abc'), undefined)
        assert.equal(toInt(''), undefined)
    })

    await t.test('returns undefined for non-finite numbers', () => {
        assert.equal(toInt(Number.NaN), undefined)
        assert.equal(toInt(Number.POSITIVE_INFINITY), undefined)
    })
})
