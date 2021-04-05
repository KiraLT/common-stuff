# Common stuff 🔨

[![CodeQL](https://github.com/KiraLT/common-stuff/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/KiraLT/common-stuff/actions/workflows/codeql-analysis.yml)
[![Dependencies](https://david-dm.org/KiraLT/common-stuff.svg)](https://david-dm.org/KiraLT/common-stuff)
[![npm version](https://badge.fury.io/js/common-stuff.svg)](https://www.npmjs.com/package/common-stuff)

> Collection of common helpers and utils for both JavaScript and NodeJS with **TypeScript** support and **zero dependencies**.

<p align="center">
    <a href="https://kiralt.github.io/common-stuff/" target="_blank">Documentation 📘</a>
</p>

## Installation

To use with node:

```bash
$ npm install common-stuff
```

## Usage

```typescript
import { isEqual } from 'common-stuff'

if (isEqual({'a': 1}, {'a': 1})) {
    console.log('Hello')
}
```

> In a browser always import only what is necessary to take full advantage of [tree shaking](https://developers.google.com/web/fundamentals/performance/optimizing-javascript/tree-shaking).
