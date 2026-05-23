import assert from 'node:assert/strict'
import test from 'node:test'

import {
    camelCase,
    escapeRegex,
    extractWords,
    isLetter,
    kebabCase,
    outdent,
    pascalCase,
    slugify,
    snakeCase,
    stripAccents,
    titleCase,
    truncate,
} from '../src/index.ts'
import { assertType } from './_types.ts'

test('truncate', async (t) => {
    await t.test('types', () => {
        assertType<string>()(truncate('hello world', 5))
        assertType<string>()(truncate('hello world', 5, '...'))
    })

    await t.test('truncates string', () => {
        assert.equal(truncate('Hello world', 8), 'Hello...')
        assert.equal(truncate('Hello', 8), 'Hello')
    })
    await t.test('supports custom ending', () => {
        assert.equal(truncate('Hello world', 8, '…'), 'Hello w…')
    })
    await t.test('exact-length input is unchanged', () => {
        assert.equal(truncate('Hello', 5), 'Hello')
    })
})

test('extractWords', async (t) => {
    await t.test('types', () => {
        assertType<string[]>()(extractWords('hello world'))
    })

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
    await t.test('types', () => {
        assertType<string>()(camelCase('foo bar'))
    })

    await t.test('changes string', () => {
        assert.equal(camelCase('--foo bar'), 'fooBar')
    })
    await t.test('uppercases string after the number', () => {
        assert.equal(camelCase('--foo1bar'), 'foo1Bar')
    })
})

test('pascalCase', async (t) => {
    await t.test('types', () => {
        assertType<string>()(pascalCase('foo bar'))
    })

    await t.test('changes string', () => {
        assert.equal(pascalCase('--foo bar'), 'FooBar')
    })
    await t.test('uppercases string after the number', () => {
        assert.equal(pascalCase('--foo1bar'), 'Foo1Bar')
    })
})

test('isLetter', async (t) => {
    await t.test('types', () => {
        assertType<boolean>()(isLetter('a'))
    })

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
    await t.test('types', () => {
        assertType<string>()(titleCase('hello world'))
    })

    await t.test('changes string', () => {
        assert.equal(
            titleCase('hello-world FTW,abc999t t'),
            'Hello-World Ftw,Abc999T T',
        )
    })
})

test('kebabCase', async (t) => {
    await t.test('types', () => {
        assertType<string>()(kebabCase('fooBar'))
    })

    await t.test('camelCase input', () => {
        assert.equal(kebabCase('fooBar'), 'foo-bar')
    })
    await t.test('mixed separators', () => {
        assert.equal(kebabCase('Foo Bar_baz-qux'), 'foo-bar-baz-qux')
    })
    await t.test('preserves consecutive uppercase before lowercase', () => {
        assert.equal(kebabCase('XMLHttpRequest'), 'xml-http-request')
    })
    await t.test('numbers stay attached', () => {
        assert.equal(kebabCase('foo123Bar'), 'foo123-bar')
    })
    await t.test('empty string', () => {
        assert.equal(kebabCase(''), '')
    })
})

test('snakeCase', async (t) => {
    await t.test('types', () => {
        assertType<string>()(snakeCase('fooBar'))
    })

    await t.test('camelCase input', () => {
        assert.equal(snakeCase('fooBar'), 'foo_bar')
    })
    await t.test('mixed separators', () => {
        assert.equal(snakeCase('Foo Bar-baz'), 'foo_bar_baz')
    })
    await t.test('preserves consecutive uppercase', () => {
        assert.equal(snakeCase('XMLHttpRequest'), 'xml_http_request')
    })
})

test('stripAccents', async (t) => {
    await t.test('types', () => {
        assertType<string>()(stripAccents('café'))
    })

    await t.test('removes diacritics', () => {
        assert.equal(stripAccents('árvíztűrő'), 'arvizturo')
        assert.equal(stripAccents('café naïve'), 'cafe naive')
        assert.equal(stripAccents('Žibutė'), 'Zibute')
    })
    await t.test('passes ASCII through unchanged', () => {
        assert.equal(stripAccents('hello world'), 'hello world')
    })
})

test('slugify', async (t) => {
    await t.test('types', () => {
        assertType<string>()(slugify('Hello World!'))
    })

    await t.test('strips accents and punctuation', () => {
        assert.equal(slugify('Hello, World!'), 'hello-world')
        assert.equal(slugify('Árvíztűrő tükörfúrógép'), 'arvizturo-tukorfurogep')
    })
    await t.test('camelCase becomes dashed', () => {
        assert.equal(slugify('fooBar'), 'foo-bar')
    })
    await t.test('trims leading/trailing dashes', () => {
        assert.equal(slugify('  -- Hello -- '), 'hello')
    })
    await t.test('collapses repeated separators', () => {
        assert.equal(slugify('hello   world!!!'), 'hello-world')
    })
})

test('escapeRegex', async (t) => {
    await t.test('types', () => {
        assertType<string>()(escapeRegex('a.b'))
    })

    await t.test('escapes special characters', () => {
        assert.equal(escapeRegex('a.b+c'), 'a\\.b\\+c')
        assert.equal(escapeRegex('(hi)'), '\\(hi\\)')
    })
    await t.test('escaped value matches literally', () => {
        const input = 'a.b+c?'
        const re = new RegExp(escapeRegex(input))
        assert.ok(re.test(input))
        assert.ok(!re.test('aXb+c?'))
    })
    await t.test('plain text unchanged', () => {
        assert.equal(escapeRegex('hello'), 'hello')
    })
})

test('outdent', async (t) => {
    await t.test('types', () => {
        // Template tag returns string
        assertType<string>()(outdent`hello`)
        assertType<string>()(outdent`hello ${42}`)
    })

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
