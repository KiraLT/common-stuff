import {
    randomInt,
    randomChoice,
    shuffle,
    randomChoices,
    randomString,
} from '../src'

describe('randomInt', () => {
    it('generates random int', () => {
        const value = randomInt(5, 10)
        expect(value).toBeGreaterThanOrEqual(5)
        expect(value).toBeLessThanOrEqual(10)
    })
})

describe('randomChoice', () => {
    it('gets random element from the array', () => {
        expect([1, 2, 3]).toContain(randomChoice([1, 2, 3]))
    })
})

describe('randomChoices', () => {
    it('gets random element from the array', () => {
        expect(randomChoices([1, 2, 3], 4).length).toBe(4)
    })
})

describe('shuffle', () => {
    it('shuffles array', () => {
        const value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        expect(shuffle(value)).not.toEqual(value)
        expect([...shuffle(value)].sort()).toEqual(value.slice().sort())
    })
})

describe('randomString', () => {
    it('generates random string', () => {
        expect(randomString(5).length).toBe(5)
    })

    it('supports custom chars', () => {
        expect(
            randomString(5, {
                chars: 'abc',
            })
        ).toMatch(/[abc]{5}/)
    })
})
