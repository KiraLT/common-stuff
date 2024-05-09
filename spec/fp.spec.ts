import { pipe, compose, curry, __, tryCatch } from '../src'

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
                (v) => v,
            ).map((v) => v.toFixed()),
        ).toEqual(['2', '6', '6'])
    })
})

describe('compose', () => {
    it('applies pipe', () => {
        const func = compose(
            (value) => ({ value }),
            (value: string) => parseInt(value),
        )
        expect(func('1')).toEqual({ value: 1 })
    })
})

describe('curry', () => {
    it('accepts one argument at the time', () => {
        const myFunc = (a: number, b: string, c: boolean) => a + b + c
        expect(curry(myFunc)(5)('5')(true)).toBe('55true')
    })

    it('accepts multiple arguments', () => {
        const myFunc = (a: number, b: string, c: boolean) => a + b + c
        expect(curry(myFunc)(5, '5')(true)).toBe('55true')
    })

    it('accepts all arguments', () => {
        const myFunc = (a: number, b: string, c: boolean) => a + b + c
        expect(curry(myFunc)(5, '5', true)).toBe('55true')
    })

    it('supports placeholder', () => {
        const myFunc = (a: number, b: string, c: boolean) => a + b + c
        expect(curry(myFunc)(__, '5', __)(5, true)).toBe('55true')
        expect(curry(myFunc)(__, '5', __)(5)(true)).toBe('55true')
    })
})

describe('tryCatch', () => {
    it('returns value and error union', () => {
        const value = tryCatch(() => 'abc')

        expect<string | Error>(value).toBe('abc')
    })

    it('catches error', () => {
        const value = tryCatch(() => {
            if (1 < 10) {
                throw new Error('abc')
            }
            return 'abc'
        })

        expect<string | Error>(value).toBeInstanceOf(Error)
    })

    it('supports promise', async () => {
        const value = tryCatch(async () => {
            if (1 < 10) {
                throw new Error('abc')
            }
            return 'abc'
        })

        expect<Promise<string | Error>>(value).resolves.toBeInstanceOf(Error)
    })

    it('supports default value', () => {
        const value = tryCatch(() => {
            if (1 < 10) {
                throw new Error('abc')
            }
            return 'abc'
        }, 'bc')

        expect<string>(value.toLocaleLowerCase()).toBe('bc')
    })

    it('supports promise with default value', async () => {
        const value = tryCatch(async () => {
            if (1 < 10) {
                throw new Error('abc')
            }
            return 'abc'
        }, 'bc')

        expect<Promise<string>>(value).resolves.toBe('bc')
    })
})
