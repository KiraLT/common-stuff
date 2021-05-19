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
$ npm install common-stuff
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

### Using Http helpers

```typescript
import { HttpError, HttpStatusCodes } from 'common-stuff'

app.get('/', function (req, res) {
    throw new HttpError(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Some secret error message')
})

// Handlle unknown errors
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
