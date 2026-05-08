import assert from 'node:assert/strict'
import test from 'node:test'

import {
    camelCase,
    extractWords,
    isLetter,
    outdent,
    pascalCase,
    titleCase,
    truncate,
} from '../src/index.ts'

test('truncate', async (t) => {
    await t.test('truncates string', () => {
        assert.equal(truncate('Hello world', 8), 'Hello...')
        assert.equal(truncate('Hello', 8), 'Hello')
    })
})

test('extractWords', async (t) => {
    await t.test('extract words from text', () => {
        assert.deepEqual(extractWords('Hell_o "WĄRLD", [with-unicode]!'), [
            'Hell_o',
            'WĄRLD',
            'with',
            'unicode',
        ])
    })
})

test('camelCase', async (t) => {
    await t.test('changes string', () => {
        assert.equal(camelCase('--foo bar'), 'fooBar')
    })
    await t.test('uppercases string after the number', () => {
        assert.equal(camelCase('--foo1bar'), 'foo1Bar')
    })
})

test('pascalCase', async (t) => {
    await t.test('changes string', () => {
        assert.equal(pascalCase('--foo bar'), 'FooBar')
    })
    await t.test('uppercases string after the number', () => {
        assert.equal(pascalCase('--foo1bar'), 'Foo1Bar')
    })
})

test('isLetter', async (t) => {
    await t.test('checks if `a` is letter', () => {
        assert.equal(isLetter('a'), true)
    })
    await t.test('checks if `-` is letter', () => {
        assert.equal(isLetter('-'), false)
    })
    await t.test('checks if `Ž` is letter', () => {
        assert.equal(isLetter('Ž'), true)
    })
    await t.test('checks if `9` is letter', () => {
        assert.equal(isLetter('9'), false)
    })
})

test('titleCase', async (t) => {
    await t.test('changes string', () => {
        assert.equal(
            titleCase('hello-world FTW,abc999t t'),
            'Hello-World Ftw,Abc999T T',
        )
    })
})

test('outdent', async (t) => {
    await t.test('removes indentation from text', () => {
        const text = outdent`
            function test() {
                console.log('test')
            }
        `
        assert.equal(
            text,
            ['function test() {', "    console.log('test')", '}'].join('\n'),
        )
    })
    await t.test('returns empty string for blank-only template', () => {
        assert.equal(outdent`   `, '')
        assert.equal(outdent``, '')
    })
    await t.test('interpolates values', () => {
        const name = 'world'
        const n = 42
        const text = outdent`
            hello ${name}
            count ${n}
        `
        assert.equal(text, 'hello world\ncount 42')
    })
})
