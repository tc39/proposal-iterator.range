# Iterator.range

**Champions**: Jack Works

**Author**: Jack Works

**Stage**: 2

This proposal describes adding `Iterator.range` to the JavaScript.

See the rendered spec at [here](https://tc39.es/proposal-iterator.range/).

[Compare with other languages](./compare.md) (Work in progress)

[Playground](https://tc39.es/proposal-iterator.range/playground.html)

## Polyfill

-   A polyfill is available in the [core-js](https://github.com/zloirock/core-js) library. You can find it in the [ECMAScript proposals section](https://github.com/zloirock/core-js/#numberrange).

-   In the proposal repo is available [a step-by-step implementation of the proposal](./polyfill.js) [![codecov](https://codecov.io/gh/tc39/proposal-iterator.range/branch/main/graph/badge.svg)](https://codecov.io/gh/tc39/proposal-iterator.range) so you can verify if there is a bug in the specification using the debugger.

## Motivation

-   because we don't have it yet™

> Without these functions, the language feels incomplete, and is a paper cut to what could be a very polished experience. Bringing this into the platform will improve performance of the web, and developer productivity as they no longer have to implement these common functions.

—— `String.prototype.{padStart,padEnd}`

`range` is a very useful function. For example in Python:

```python
for i in range(5):
    # ...
```

At least 20 different implementations in [a single stackoverflow question](https://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-a-range-within-the-supp).

Tons of libraries providing a range: math.js, lodash, underscore.js, ramda, d3, range, fill-range, multi-integer-range, ……

### Goals

-   Arithmetic Sequence
-   -   Incremental (0, 1, 2, 3, ...)
-   -   Decremental (0, -1, -2, -3, ...)
-   -   Step (0, 2, 4, 6, ...)
-   -   -   Decimal step (0, 0.2, 0.4, ...)
-   BigInt Support
-   -   Same as Arithmetic Sequence
-   Infinite Sequence `Iterator.range(0, Infinity)` -> (0, 1, 2, 3, ...)

### Non-goals

-   New Syntax
-   String Sequence (a, b, c, d, ...)
-   Magic
-   -   E.g. `if (x in Iterator.range(0, 10))` (Kotlin has this feature)

# Examples

See [tests](./__tests__/test.js) to learn about more usages.

```js
for (const i of Iterator.range(0n, 43n)) console.log(i) // 0n to 42n

Iterator.range(0, Infinity)
    .take(1000)
    .filter((x) => !(x % 3))
    .toArray()

function* even() {
    for (const i of Iterator.range(0, Infinity)) if (i % 2 === 0) yield i
}
;[...Iterator.range(1, 100, 2)] // odd number from 1 to 99
```

# Presentations

-   [Apr 2020 Notes](https://github.com/tc39/notes/blob/main/meetings/2020-03/april-1.md#numberrange-and-bigintrange-for-stage-1) / [Slides](https://docs.google.com/presentation/d/1JD9SrOEtGEviPYJ3LQGKRqDHYeF-EIt7RHB92hKPWzo/)
-   [Jul 2020 Notes](https://github.com/tc39/notes/blob/65a82252aa14c273082e7687c6712bb561bc087a/meetings/2020-07/july-22.md#numberrange-for-stage-2) / [Slides](https://docs.google.com/presentation/d/116FDDK2klJoEL8s2Q7UXiDApC681N-Q9SwpC0toAzTU/)

### Signature

See [global.d.ts](./global.d.ts)
