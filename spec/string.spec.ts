import { truncate, extractWords, camelCase, pascalCase } from '../src'

describe('truncate', () => {
    it('truncates string', () => {
        expect(truncate('Hello world', 8)).toEqual('Hello...')
        expect(truncate('Hello', 8)).toEqual('Hello')
    })
})

describe('extractWords', () => {
    it('extract words from text', () => {
        expect(extractWords('Hell_o "WĄRLD", [with-unicode]!')).toEqual([
            'Hell_o',
            'WĄRLD',
            'with',
            'unicode',
        ])
    })
})

describe('camelCase', () => {
    it('truncates string', () => {
        expect(camelCase('--foo bar')).toEqual('fooBar')
    })
})

describe('pascalCase', () => {
    it('truncates string', () => {
        expect(pascalCase('--foo bar')).toEqual('FooBar')
    })
})
