import assert from 'node:assert/strict'
import test from 'node:test'

import {
    randomChoice,
    randomChoices,
    randomInt,
    randomString,
    shuffle,
} from '../src/index.ts'

test('randomInt', async (t) => {
    await t.test('generates random int', () => {
        const value = randomInt(5, 10)
        assert.ok(value >= 5)
        assert.ok(value <= 10)
    })
})

test('randomChoice', async (t) => {
    await t.test('gets random element from the array', () => {
        const val = randomChoice([1, 2, 3])
        assert.notEqual(val, undefined)
        assert.ok([1, 2, 3].includes(val as number))
    })
})

test('randomChoices', async (t) => {
    await t.test('gets random element from the array', () => {
        assert.equal(randomChoices([1, 2, 3], 4).length, 4)
    })
    await t.test('works with empty array', () => {
        assert.equal(randomChoices([], 4).length, 0)
    })
})

test('shuffle', async (t) => {
    await t.test('shuffles array', () => {
        const value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        const shuffled = shuffle(value)
        assert.notDeepEqual(shuffled, value)
        assert.deepEqual([...shuffle(value)].sort(), value.slice().sort())
    })
    await t.test('does not modify original', () => {
        const value = [1, 2, 3, 4, 5]
        const snapshot = value.slice()
        shuffle(value)
        assert.deepEqual(value, snapshot)
    })
    await t.test('empty array returns empty', () => {
        assert.deepEqual(shuffle([]), [])
    })
})

test('randomChoice edge cases', async (t) => {
    await t.test('returns undefined for empty array', () => {
        assert.equal(randomChoice([]), undefined)
    })
    await t.test('single-element array always returns that element', () => {
        assert.equal(randomChoice([42]), 42)
    })
})

test('randomString', async (t) => {
    await t.test('generates random string', () => {
        assert.equal(randomString(5).length, 5)
    })
    await t.test('supports custom chars', () => {
        const str = randomString(5, { chars: 'abc' })
        assert.match(str, /[abc]{5}/)
    })
})
