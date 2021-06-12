import { pipe, compose } from '../src'

describe('pipe', () => {
    it('applies pipe', () => {
        expect(pipe([1.5, 5.6, 6.1], (v) => v.map(Math.round))).toEqual([
            2, 6, 6,
        ])
    })

    it('supports up to 7 functions', () => {
        expect(
            pipe(
                [1.5, 5.6, 6.1],
                (v) => v.map(Math.round),
                (v) => v,
                (v) => v,
                (v) => v,
                (v) => v,
                (v) => v,
                (v) => v
            ).map((v) => v.toFixed())
        ).toEqual(['2', '6', '6'])
    })
})

describe('compose', () => {
    it('applies pipe', () => {
        const func = compose(
            value => ({value}),
            (value: string) => parseInt(value),
        )
        expect(func('1')).toEqual({value: 1})
    })
})
