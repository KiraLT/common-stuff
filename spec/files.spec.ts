import { formatBytes, getFileParts, parseSize, getMimeType, getExtension } from '../src'

describe('formatBytes', () => {
    it('handles zero', () => {
        expect(formatBytes(0)).toEqual('0 Bytes')
    })

    it('handles negative number', () => {
        expect(formatBytes(-158)).toEqual('0 Bytes')
    })

    it('support decimals', () => {
        expect(formatBytes(1688, 1)).toEqual('1.6 KB')
    })

    it('just works', () => {
        expect(formatBytes(1648 * 9884)).toEqual('15.53 MB')
    })
})

describe('parseSize', () => {
    it('parses bytes', () => {
        expect(parseSize('10 Bytes')).toEqual(10)
    })

    it('returns -1 on error', () => {
        expect(parseSize('zero bytes')).toEqual(0)
    })

    it('support decimals', () => {
        expect(parseSize('1.6 KB')).toEqual(1638.4)
    })

    it('just works', () => {
        expect(parseSize('15.53 MB')).toEqual(16284385.28)
    })
})

describe('getFileParts', () => {
    it('parses file name', () => {
        expect(getFileParts('myfile.txt')).toEqual(['myfile', '.txt'])
    })

    it('parses file name without extension', () => {
        expect(getFileParts('myfile')).toEqual(['myfile', ''])
    })

    it('parses hidden file name', () => {
        expect(getFileParts('.data')).toEqual(['.data', ''])
    })

    it('parses file path', () => {
        expect(getFileParts('/my.home/myfile.txt')).toEqual([
            '/my.home/myfile',
            '.txt',
        ])
    })

    it('parses file path without extension', () => {
        expect(getFileParts('/my.home/myfile')).toEqual(['/my.home/myfile', ''])
    })

    it('parses hidden file path', () => {
        expect(getFileParts('/my.home/.data')).toEqual(['/my.home/.data', ''])
    })
})

describe('getMimeType', () => {
    it('returns undefined for unknown extension', () => {
        expect(getMimeType('myfile.unknown')).toBeUndefined()
    })

    it('returns undefined for empty extension', () => {
        expect(getMimeType('myfile')).toBeUndefined()
    })

    it('returns undefined for empty file name', () => {
        expect(getMimeType('')).toBeUndefined()
    })

    it('returns undefined for empty file name and empty extension', () => {
        expect(getMimeType('.')).toBeUndefined()
    })

    it('returns undefined for dot file', () => {
        expect(getMimeType('.data')).toBeUndefined()
    })

    it('returns mime type for text file with extension', () => {
        expect(getMimeType('data.txt')).toEqual('text/plain')
    })

    it('returns mime type for json', () => {
        expect(getMimeType('json')).toEqual('application/json')
    })
})

describe('getExtension', () => {
    it('returns undefined for unknown mime type', () => {
        expect(getExtension('application/unknown')).toBeUndefined()
    })

    it('returns undefined for empty mime type', () => {
        expect(getExtension('')).toBeUndefined()
    })

    it('returns undefined for empty mime type and empty extension', () => {
        expect(getExtension('.')).toBeUndefined()
    })

    it('returns extension for text file with mime type', () => {
        expect(getExtension('text/plain')).toEqual('txt')
    })

    it('returns extension for json', () => {
        expect(getExtension('application/json')).toEqual('json')
    })
})