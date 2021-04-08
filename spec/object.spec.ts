import { isEqual } from '../src'

describe('truncate', () => {
    it('compares strings', () => {
        expect(isEqual('aa', 'aa')).toBeTruthy()
        expect(isEqual('aa', 'a')).toBeFalsy()
    })

    it('compares numbers', () => {
        expect(isEqual(1, 1)).toBeTruthy()
        expect(isEqual(1, -1)).toBeFalsy()
    })

    it('compares booleans', () => {
        expect(isEqual(true, true)).toBeTruthy()
        expect(isEqual(true, false)).toBeFalsy()
    })

    it('compares dates', () => {
        expect(isEqual(new Date('2019'), new Date('2019'))).toBeTruthy()
        expect(isEqual(new Date('2019'), new Date('2018'))).toBeFalsy()
    })

    it('compares arrays', () => {
        expect(isEqual(['a', 9], ['a', 9])).toBeTruthy()
        expect(isEqual([9, 'a'], [9, 'c'])).toBeFalsy()
        expect(isEqual([9, 'a'], [9])).toBeFalsy()
        expect(isEqual([9], [9, 'a'])).toBeFalsy()
    })

    it('compares objects', () => {
        expect(isEqual({ a: 9, b: 'b' }, { a: 9, b: 'b' })).toBeTruthy()
        expect(isEqual({ a: 9, b: 'b' }, { a: 9, b: 'd' })).toBeFalsy()
        expect(isEqual({ a: 9, b: 'b' }, { a: 9 })).toBeFalsy()
        expect(isEqual({ a: 9, b: 'b' }, { b: 'b' })).toBeFalsy()
    })

    it('compares nested', () => {
        expect(
            isEqual(
                { a: [{ b: [9, 1] }, 3, { a: false }] },
                { a: [{ b: [9, 1] }, 3, { a: false }] }
            )
        ).toBeTruthy()
        expect(
            isEqual(
                { a: [{ b: [9] }, 3, { a: false }] },
                { a: [{ b: [9, 1] }, 3, { a: false }] }
            )
        ).toBeFalsy()
    })
})

describe('truncate', () => {
    it('compares strings', () => {
        expect(isEqual('aa', 'aa')).toBeTruthy()
        expect(isEqual('aa', 'a')).toBeFalsy()
    })
})
