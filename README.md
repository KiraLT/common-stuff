# Common stuff 🔨

[![CodeQL](https://github.com/KiraLT/common-stuff/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/KiraLT/common-stuff/actions/workflows/codeql-analysis.yml)
[![codecov](https://codecov.io/gh/KiraLT/common-stuff/branch/main/graph/badge.svg?token=E599EPAOPM)](https://codecov.io/gh/KiraLT/common-stuff)
![npm](https://img.shields.io/npm/dt/common-stuff)
[![npm version](https://badge.fury.io/js/common-stuff.svg)](https://www.npmjs.com/package/common-stuff)

JavaScript and NodeJS are missing a lot of core functionalities. The goal of this library is to bring a variety of useful helpers on both NodeJS & Browser with strong **TypeScript** typing and **zero dependencies**.

Missing something? Create [feature request](https://github.com/KiraLT/common-stuff/issues/new)!

Read [Documentation 📘](https://kiralt.github.io/common-stuff/)

## Installation

Install with NPM/Yarn:

```bash
npm install common-stuff
```

Import what you need:

```typescript
import { isEqual } from 'common-stuff'

if (isEqual({'a': 1}, {'a': 1})) {
    console.log('Hello')
}
```

> In a browser always import only what is necessary to take full advantage of [tree shaking](https://developers.google.com/web/fundamentals/performance/optimizing-javascript/tree-shaking).

## Examples

### Using FP patterns

```typescript
import { sortBy, deduplicateBy, chunk, ensureArray, groupBy } from '.'

const result = pipe(
    [{ value: 4 }, { value: 6 }, { value: 8 }],
    (v) => sortBy(v, (o) => o.value),
    (v) => deduplicateBy(v, (o) => o.value),
    (v) => v.map((o) => ensureArray(o.value)),
    (v) => chunk(v, 2),
    (v) => groupBy(v, (o) => o.length)
)
// [ [1, [[[ 8 ]]]],[ 2, [[[ 4 ], [ 6 ]]]] ]
```

> With arrow functions you can easily use `pipe` with any function

### Parsing env variables

For example we have following ENV variables:

```bash
CONFIG__PRIVATE_KEY="my key"
CONFIG__PUBLIC_KEY="my key"
CONFIG__ALLOWED_IPS='["127.0.0.1", "localhost"]'
```

```typescript
import { convertToNested, camelCase } from 'common-stuff'

const config = convertToNested(process.env, {
    separator: '__',
    transformKey: camelCase
}).config
// { privateKey: 'my key', publicKey: 'my key', allowedIps: ['127.0.0.1', 'localhost'] }
```

### Using Http errors

```typescript
import { HttpError, HttpStatusCodes } from 'common-stuff'

app.get('/', function (req, res) {
    throw new HttpError(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Some secret error message')
})

// Handle unknown errors
app.use(function (err, req, res, next) {
    if (err instanceof HttpError) {
        // Log full error message
        console.error(err.message)

        // Return safe error message without private details
        return res.status(err.status).send(err.publicMessage)
    }
    next()
})
```

> This example returns 500 error message with text `Internal Server Error` and logs private message to console
> Check [express-async-errors](https://www.npmjs.com/package/express-async-errors) for async support.
