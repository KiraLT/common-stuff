import assert from 'node:assert/strict'
import test from 'node:test'

import {
    formatBytes,
    getExtension,
    getFileParts,
    getMimeType,
    parseSize,
} from '../src/index.ts'

test('formatBytes', async (t) => {
    await t.test('handles zero', () => {
        assert.equal(formatBytes(0), '0 Bytes')
    })
    await t.test('handles negative number', () => {
        assert.equal(formatBytes(-158), '0 Bytes')
    })
    await t.test('support decimals', () => {
        assert.equal(formatBytes(1688, 1), '1.6 KB')
    })
    await t.test('clamps negative decimals to 0', () => {
        assert.equal(formatBytes(1688, -1), '2 KB')
    })
    await t.test('just works', () => {
        assert.equal(formatBytes(1648 * 9884), '15.53 MB')
    })
})

test('parseSize', async (t) => {
    await t.test('parses bytes', () => {
        assert.equal(parseSize('10 Bytes'), 10)
    })
    await t.test('returns -1 on error', () => {
        assert.equal(parseSize('zero bytes'), 0)
    })
    await t.test('support decimals', () => {
        assert.equal(parseSize('1.6 KB'), 1638.4)
    })
    await t.test('just works', () => {
        assert.equal(parseSize('15.53 MB'), 16284385.28)
    })
})

test('getFileParts', async (t) => {
    await t.test('parses file name', () => {
        assert.deepEqual(getFileParts('myfile.txt'), ['myfile', '.txt'])
    })
    await t.test('parses file name without extension', () => {
        assert.deepEqual(getFileParts('myfile'), ['myfile', ''])
    })
    await t.test('parses hidden file name', () => {
        assert.deepEqual(getFileParts('.data'), ['.data', ''])
    })
    await t.test('parses file path', () => {
        assert.deepEqual(getFileParts('/my.home/myfile.txt'), [
            '/my.home/myfile',
            '.txt',
        ])
    })
    await t.test('parses file path without extension', () => {
        assert.deepEqual(getFileParts('/my.home/myfile'), [
            '/my.home/myfile',
            '',
        ])
    })
    await t.test('parses hidden file path', () => {
        assert.deepEqual(getFileParts('/my.home/.data'), ['/my.home/.data', ''])
    })
})

test('getMimeType', async (t) => {
    await t.test('returns undefined for unknown extension', () => {
        assert.equal(getMimeType('myfile.unknown'), undefined)
    })
    await t.test('returns undefined for empty extension', () => {
        assert.equal(getMimeType('myfile'), undefined)
    })
    await t.test('returns undefined for empty file name', () => {
        assert.equal(getMimeType(''), undefined)
    })
    await t.test(
        'returns undefined for empty file name and empty extension',
        () => {
            assert.equal(getMimeType('.'), undefined)
        },
    )
    await t.test('returns undefined for dot file', () => {
        assert.equal(getMimeType('.data'), undefined)
    })
    await t.test('returns mime type for text file with extension', () => {
        assert.equal(getMimeType('data.txt'), 'text/plain')
    })
    await t.test('returns mime type for json', () => {
        assert.equal(getMimeType('json'), 'application/json')
    })
})

test('getExtension', async (t) => {
    await t.test('returns undefined for unknown mime type', () => {
        assert.equal(getExtension('application/unknown'), undefined)
    })
    await t.test('returns undefined for empty mime type', () => {
        assert.equal(getExtension(''), undefined)
    })
    await t.test(
        'returns undefined for empty mime type and empty extension',
        () => {
            assert.equal(getExtension('.'), undefined)
        },
    )
    await t.test('returns extension for text file with mime type', () => {
        assert.equal(getExtension('text/plain'), 'txt')
    })
    await t.test('returns extension for json', () => {
        assert.equal(getExtension('application/json'), 'json')
    })
})
