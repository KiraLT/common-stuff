import { findIndex } from '.'

/**
 * Converts bytes number to string representation (e.g. `15.25 GB`).
 *
 * @example
 * ```
 * formatBytes(1648 * 9884)
 * // '15.53 MB'
 * ```
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes <= 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Parses size string to bytes.
 *
 * @example
 * ```
 * parseSize('15.53 MB')
 * // 16288832
 * ```
 * @returns parsed bytes or `-1` on fail
 */
export function parseSize(value: string): number {
    const [_, rawSize, rawUnit] =
        value.match(/^(\d+(?:[.]\d+|))\s*([a-z]+)$/i) ?? []

    const k = 1024
    const units = [
        ['bytes', 'byte', 'b'],
        ['kb'],
        ['mb'],
        ['gb'],
        ['tb'],
        ['pb'],
        ['eb'],
        ['zb'],
        ['yb'],
    ]

    if (rawSize && rawUnit) {
        const size = parseFloat(rawSize)
        const unit = rawUnit.toLowerCase()

        let index = findIndex(units, (v) => v.indexOf(unit) !== -1)

        let bytes = size
        while (index > 0) {
            bytes = bytes * k
            index--
        }

        return bytes
    }

    return 0
}

/**
 * Split the pathname path into a pair (root, ext) such that root + ext == path,
 * and ext is empty or begins with a period and contains at most one period.
 * Leading periods on the basename are ignored.
 *
 * @example
 * ```
 * getFileParts('file.txt')
 * // ['file', '.txt']
 *
 * getFileParts('.cshrc')
 * // ['.cshrc', '']
 * ```
 */
export function getFileParts(pathname: string): [string, string] {
    const lastDirectory = pathname.split('/').pop() ?? ''
    const parts = lastDirectory.split('.')
    const hasLeadingDot = lastDirectory[0] === '.'
    const minDotCount = hasLeadingDot ? 2 : 1
    const extension = parts.length > minDotCount ? parts.pop() : undefined

    return [
        extension ? pathname.slice(0, -1 * (extension.length + 1)) : pathname,
        extension ? `.${extension}` : '',
    ]
}

const mimeTypes: Record<string, { extensions: string[] }> = {
    'application/atom+xml': {
        extensions: ['atom'],
    },
    'application/java-archive': {
        extensions: ['jar', 'war', 'ear'],
    },
    'application/javascript': {
        extensions: ['js'],
    },
    'application/json': {
        extensions: ['json'],
    },
    'application/mac-binhex40': {
        extensions: ['hqx'],
    },
    'application/msword': {
        extensions: ['doc'],
    },
    'application/octet-stream': {
        extensions: [
            'bin',
            'exe',
            'dll',
            'deb',
            'dmg',
            'iso',
            'img',
            'msi',
            'msp',
            'msm',
        ],
    },
    'application/pdf': {
        extensions: ['pdf'],
    },
    'application/postscript': {
        extensions: ['ps', 'eps', 'ai'],
    },
    'application/rss+xml': {
        extensions: ['rss'],
    },
    'application/rtf': {
        extensions: ['rtf'],
    },
    'application/vnd.apple.mpegurl': {
        extensions: ['m3u8'],
    },
    'application/vnd.google-earth.kml+xml': {
        extensions: ['kml'],
    },
    'application/vnd.google-earth.kmz': {
        extensions: ['kmz'],
    },
    'application/vnd.ms-excel': {
        extensions: ['xls'],
    },
    'application/vnd.ms-fontobject': {
        extensions: ['eot'],
    },
    'application/vnd.ms-powerpoint': {
        extensions: ['ppt'],
    },
    'application/vnd.oasis.opendocument.graphics': {
        extensions: ['odg'],
    },
    'application/vnd.oasis.opendocument.presentation': {
        extensions: ['odp'],
    },
    'application/vnd.oasis.opendocument.spreadsheet': {
        extensions: ['ods'],
    },
    'application/vnd.oasis.opendocument.text': {
        extensions: ['odt'],
    },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        {
            extensions: ['pptx'],
        },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        extensions: ['xlsx'],
    },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        extensions: ['docx'],
    },
    'application/vnd.wap.wmlc': {
        extensions: ['wmlc'],
    },
    'application/wasm': {
        extensions: ['wasm'],
    },
    'application/x-7z-compressed': {
        extensions: ['7z'],
    },
    'application/x-cocoa': {
        extensions: ['cco'],
    },
    'application/x-java-archive-diff': {
        extensions: ['jardiff'],
    },
    'application/x-java-jnlp-file': {
        extensions: ['jnlp'],
    },
    'application/x-makeself': {
        extensions: ['run'],
    },
    'application/x-perl': {
        extensions: ['pl', 'pm'],
    },
    'application/x-pilot': {
        extensions: ['prc', 'pdb'],
    },
    'application/x-rar-compressed': {
        extensions: ['rar'],
    },
    'application/x-redhat-package-manager': {
        extensions: ['rpm'],
    },
    'application/x-sea': {
        extensions: ['sea'],
    },
    'application/x-shockwave-flash': {
        extensions: ['swf'],
    },
    'application/x-stuffit': {
        extensions: ['sit'],
    },
    'application/x-tcl': {
        extensions: ['tcl', 'tk'],
    },
    'application/x-x509-ca-cert': {
        extensions: ['der', 'pem', 'crt'],
    },
    'application/x-xpinstall': {
        extensions: ['xpi'],
    },
    'application/xhtml+xml': {
        extensions: ['xhtml'],
    },
    'application/xspf+xml': {
        extensions: ['xspf'],
    },
    'application/zip': {
        extensions: ['zip'],
    },
    'audio/midi': {
        extensions: ['mid', 'midi', 'kar'],
    },
    'audio/mpeg': {
        extensions: ['mp3'],
    },
    'audio/ogg': {
        extensions: ['ogg'],
    },
    'audio/x-m4a': {
        extensions: ['m4a'],
    },
    'audio/x-realaudio': {
        extensions: ['ra'],
    },
    'font/woff': {
        extensions: ['woff'],
    },
    'font/woff2': {
        extensions: ['woff2'],
    },
    'image/avif': {
        extensions: ['avif'],
    },
    'image/gif': {
        extensions: ['gif'],
    },
    'image/jpeg': {
        extensions: ['jpeg', 'jpg'],
    },
    'image/png': {
        extensions: ['png'],
    },
    'image/svg+xml': {
        extensions: ['svg', 'svgz'],
    },
    'image/tiff': {
        extensions: ['tif', 'tiff'],
    },
    'image/vnd.wap.wbmp': {
        extensions: ['wbmp'],
    },
    'image/webp': {
        extensions: ['webp'],
    },
    'image/x-icon': {
        extensions: ['ico'],
    },
    'image/x-jng': {
        extensions: ['jng'],
    },
    'image/x-ms-bmp': {
        extensions: ['bmp'],
    },
    'text/css': {
        extensions: ['css'],
    },
    'text/html': {
        extensions: ['html', 'htm', 'shtml'],
    },
    'text/mathml': {
        extensions: ['mml'],
    },
    'text/plain': {
        extensions: ['txt'],
    },
    'text/vnd.sun.j2me.app-descriptor': {
        extensions: ['jad'],
    },
    'text/vnd.wap.wml': {
        extensions: ['wml'],
    },
    'text/x-component': {
        extensions: ['htc'],
    },
    'text/xml': {
        extensions: ['xml'],
    },
    'video/3gpp': {
        extensions: ['3gpp', '3gp'],
    },
    'video/mp2t': {
        extensions: ['ts'],
    },
    'video/mp4': {
        extensions: ['mp4'],
    },
    'video/mpeg': {
        extensions: ['mpeg', 'mpg'],
    },
    'video/quicktime': {
        extensions: ['mov'],
    },
    'video/webm': {
        extensions: ['webm'],
    },
    'video/x-flv': {
        extensions: ['flv'],
    },
    'video/x-m4v': {
        extensions: ['m4v'],
    },
    'video/x-mng': {
        extensions: ['mng'],
    },
    'video/x-ms-asf': {
        extensions: ['asx', 'asf'],
    },
    'video/x-ms-wmv': {
        extensions: ['wmv'],
    },
    'video/x-msvideo': {
        extensions: ['avi'],
    },
}

/**
 * Returns mime type from file name
 *
 * @example
 * ```
 * getMimeType('file.txt') // text/plain
 * getMimeType('file.unknown') // undefined
 * getMimeType('json') // application/json
 * ```
 */
export function getMimeType(name: string): string | undefined {
    if (name.includes('.')) {
        const [_, extension] = getFileParts(name)
        const extensionWithoutDot = extension.slice(1)

        return Object.entries(mimeTypes).find(([_, value]) =>
            value.extensions.includes(extensionWithoutDot),
        )?.[0]
    }

    return Object.entries(mimeTypes).find(([_, value]) =>
        value.extensions.includes(name),
    )?.[0]
}

/**
 * Returns file extension from mime type
 *
 * @example
 * ```
 * getExtension('text/plain') // txt
 * getExtension('application/json') // json
 * getExtension('application/unknown') // undefined
 * ```
 */
export function getExtension(mimeType: string): string | undefined {
    return mimeTypes[mimeType]?.extensions[0]
}
