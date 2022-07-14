# Exploratory tests while reading [Tackling Typescript](https://exploringjs.com/tackling-ts/index.html)

## Set up
Jest allows us to use Typescript via Babel - Jest uses Babel to first transpile and then run the tests. This isn't ideal since there isn't any compile time type checking, only the LSP static analysis checking shown in the editor.

Will look into switching to ts-jest rather.

## To run tests

```
> npm install
> npm test
```