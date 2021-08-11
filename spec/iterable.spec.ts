import { map, flatMap } from '../src'

describe('flatMap', () => {
    it('maps array', () => {
        expect<number[]>(map([1, 2, 3, 4], (x) => x * 2)).toEqual([2, 4, 6, 8])
    })

    it('maps read-only array', () => {
        expect<ReadonlyArray<number>>(map([1, 2, 3, 4] as const, (x) => x * 2)).toEqual([2, 4, 6, 8])
    })

    it('maps object', () => {
        expect<Record<string, string>>(map({a: 'b'}, ([k, v]) => [v, k])).toEqual({b: 'a'})
    })

    it('maps set', () => {
        expect<Set<number>>(map(new Set([1, 2, 3, 4]), (x) => x * 2)).toEqual(new Set([2, 4, 6, 8]))
    })

    it('maps map', () => {
        expect<Map<string, string>>(map(new Map([['a', 'b']]), ([k, v]) => [v, k])).toEqual(new Map([['b', 'a']]))
    })
})

describe('flatMap', () => {
    it('flattens array', () => {
        expect<number[]>(flatMap([1, 2, 3, 4], (x) => [x * 2])).toEqual([2, 4, 6, 8])
    })

    it('flattens readonly-array', () => {
        expect<ReadonlyArray<number>>(flatMap([1, 2, 3, 4] as const, (x) => [x * 2])).toEqual([2, 4, 6, 8])
    })

    it('only one level is flattened', () => {
        expect(flatMap([1, 2, 3, 4], (x) => [[x * 2]])).toEqual([
            [2],
            [4],
            [6],
            [8],
        ])
    })

    it('create multiple items from object', () => {
        expect<Record<string, string>>(
            flatMap({ a: 'b' }, ([k, v]) => [
                [k, v],
                [`${k}2`, v],
            ])
        ).toEqual({ a: 'b', a2: 'b' })
    })

    it('filters object items', () => {
        expect<Record<string, string>>(
            flatMap({ a: 'b', b: 'c' }, ([k, v]) =>
                k === 'a' ? [[k, v]] : []
            )
        ).toEqual({ a: 'b' })
    })

    it('flattens Set', () => {
        expect<Set<number>>(flatMap(new Set([1, 2, 3, 4]), (x) => [x * 2])).toEqual(new Set([2, 4, 6, 8]))
    })

    it('flattens Map', () => {
        expect<Map<string, string>>(
            flatMap(new Map([['a', 'b']]), ([k, v]) => [
                [k, v],
                [`${k}2`, v],
            ])
        ).toEqual(new Map([['a', 'b'], ['a2', 'b']]))
    })
})
