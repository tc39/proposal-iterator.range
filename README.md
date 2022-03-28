# Number.range & BigInt.range

**Champions**: Jack Works

**Author**: Jack Works

**Stage**: 1

This proposal describes adding a `Number.range` and a `BigInt.range` to JavaScript.

See the rendered spec at [here](https://tc39.es/proposal-Number.range/).

[Compare with other languages](./compare.md) (Work in progress)

[Playground](https://tc39.es/proposal-Number.range/playground.html)

## Polyfill

- A polyfill is available in the [core-js](https://github.com/zloirock/core-js) library. You can find it in the [ECMAScript proposals section](https://github.com/zloirock/core-js/#numberrange).

- In the proposal repo is available a [a step-to-step implementation of the proposal](./polyfill.js) [![codecov](https://codecov.io/gh/tc39/proposal-Number.range/branch/main/graph/badge.svg)](https://codecov.io/gh/tc39/proposal-Number.range) so you can verify if there is a bug in the specification by the debugger.

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
-   Infinite Sequence `Number.range(0, Infinity)` -> (0, 1, 2, 3, ...)

### Non-goals

-   New Syntax
-   String Sequence (a, b, c, d, ...)
-   Magic
-   -   E.g. `if (x in Number.range(0, 10))` (Kotlin have this feature)

### Discussions

#### Discussions in Issue

##### Important semantics discussion

-   [#22: Class or plain object](https://github.com/tc39/proposal-Number.range/issues/22)

##### Others

-   [#13: Integration with Slice notation proposal](https://github.com/tc39/proposal-Number.range/issues/13)
-   [#18: Alias Number.range(end) for Number.range(0, end)](https://github.com/tc39/proposal-Number.range/issues/18)
-   [#19: API design (move to NumberRangeIterator, BigIntRangeIterator or Iterator.range)](https://github.com/tc39/proposal-Number.range/issues/19)
-   [#25: Possible options](https://github.com/tc39/proposal-Number.range/issues/25)

# Examples

See [tests](./__tests__/test.js) to learn about more usages.

```js
for (const i of BigInt.range(0n, 43n)) console.log(i) // 0n to 42n

// With iterator helper proposal
Number.range(0, Infinity)
    .take(1000)
    .filter((x) => !(x % 3))
    .toArray()

function* even() {
    for (const i of Number.range(0, Infinity)) if (i % 2 === 0) yield i
}
;[...Number.range(1, 100, 2)] // odd number from 1 to 99
```

# Presentations

- 2020 Apr [Notes](https://github.com/tc39/notes/blob/main/meetings/2020-03/april-1.md#numberrange-and-bigintrange-for-stage-1) [Slides](https://docs.google.com/presentation/d/1JD9SrOEtGEviPYJ3LQGKRqDHYeF-EIt7RHB92hKPWzo/)

### Signature

See [global.d.ts](./global.d.ts)
