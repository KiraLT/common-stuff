# Common stuff 🔨

[![CodeQL](https://github.com/KiraLT/common-stuff/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/KiraLT/common-stuff/actions/workflows/codeql-analysis.yml)
[![codecov](https://codecov.io/gh/KiraLT/common-stuff/branch/main/graph/badge.svg?token=E599EPAOPM)](https://codecov.io/gh/KiraLT/common-stuff)
[![Dependencies](https://david-dm.org/KiraLT/common-stuff.svg)](https://david-dm.org/KiraLT/common-stuff)
[![npm version](https://badge.fury.io/js/common-stuff.svg)](https://www.npmjs.com/package/common-stuff)

JavaScript and NodeJS are missing a lot of core functionalities. The goal of this library to bring a variety of useful helpers on both NodeJS & Browser with strong **TypeScript** typing and **zero dependencies**.

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
    throw new HttpError(HttpStatusCodes.NOT_FOUND)
})

app.use(function (err, req, res, next) {
    if (err instanceof HttpError) {
        console.error(err.message)

        return res.status(err.status).send(err.message)
    }
    next()
})
```
