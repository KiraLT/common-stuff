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
    it('changes string', () => {
        expect(camelCase('--foo bar')).toEqual('fooBar')
    })

    it('uppercases string after the number', () => {
        expect(camelCase('--foo1bar')).toEqual('foo1Bar')
    })
})

describe('pascalCase', () => {
    it('changes string', () => {
        expect(pascalCase('--foo bar')).toEqual('FooBar')
    })

    it('uppercases string after the number', () => {
        expect(pascalCase('--foo1bar')).toEqual('Foo1Bar')
    })
})
