import {
    truncate,
    extractWords,
    camelCase,
    pascalCase,
    titleCase,
    isLetter,
} from '../src'

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

describe('isLetter', () => {
    it('checks if `a` is letter', () => {
        expect(isLetter('a')).toBeTruthy()
    })

    it('checks if `-` is letter', () => {
        expect(isLetter('-')).toBeFalsy()
    })

    it('checks if `Ž` is letter', () => {
        expect(isLetter('Ž')).toBeTruthy()
    })

    it('checks if `9` is letter', () => {
        expect(isLetter('9')).toBeFalsy()
    })
})

describe('titleCase', () => {
    it('changes string', () => {
        expect(titleCase('hello-world FTW,abc999t t')).toEqual(
            'Hello-World Ftw,Abc999T T',
        )
    })
})
