import { truncate, getWords } from '../src'

describe('truncate', () => {
    it('truncates string', () => {
        expect(truncate('Hello world', 8)).toEqual('Hello...')
        expect(truncate('Hello', 8)).toEqual('Hello')
    })
})

describe('getWords', () => {
    it('extract words from text', () => {
        expect(getWords('Hell_o "WĄRLD", [with-unicode]!')).toEqual([
            'Hell_o',
            'WĄRLD',
            'with',
            'unicode',
        ])
    })
})
