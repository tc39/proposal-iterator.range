# Number.range & BigInt.range

**Champions**: Finding one...

**Author**: Jack Works

**Stage**: N/A

This proposal describes adding a `Number.range` and a `BigInt.range` to JavaScript.

## Scope

The goal of this proposal is to add a built-in range function for iterating or other use cases.

`range` is a very useful function. For example in Python, we can just write

```python
for i in range(5):
    // ....
```

but we can't do this in JavaScript. There are tons of npm packages implements a range function, tons of threads talking about ranges even in the es-discuss mail list.

So there is no reason we shouldn't have a built-in implementation.

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

-   String Sequence (a, b, c, d, ...)
-   Magic
-   -   E.g. `if (x in Number.range(0, 10))`

### Discussions

#### Discussions in Issue

-   How to deal with bad inputs?
-   -   Direction mismatch `Number.range(0, 10, -5)` (See: #5, and [here](#feature-assumptions-of-content-below-wait-for-discussing))
-   -   Infinity in `from` and `to` (See: #6)
-   Should we throw on `Number.range(42, 100, 1e-323)`? (See: #7)
-   Should we support `BigInt.range(0n, Infinity)`? (See: #8)

#### Others

If you interested in these topic, just open an issue!

-   Do we need customizable behavior? Something like `Number.range(0, 1000, (previous, index) => next)`
-   Should we add a new syntax like `2...3` instead of a `Number.range()`?
-   Should we support `Number.range(x)` as an alias of `Number.range(0, x)`?
-   How do we calculate numbers? (The 0.30000000000000004 problem) (There're 2 version of implementation that may behave different in this case)

# Examples

```js
for (const i of Number.range(0, 43)) {
    console.log(i) // 0 to 42
}

const fakeData = [...Number.range(0, 21)].map(x => x ** 2)

function* odd() {
    for (const i of Number.range(0, Infinity)) if (i % 2 === 0) yield i
}
```

# Proposal

Number.range( `from` , `to`, `step` )

BigInt.range( `from` , `to`, `step` )

### About BigInt

Behavior should be the same of `Number.range`,
replace all `typeof x === 'number'` with `typeof x === 'bigint'`, and
replace all `0` with `0n`, `1` with `1n`

### Feature flags (Wait for discussing)

-   `Number.range(to)` equals `Number.range(0, to)` (`isAcceptAlias` in polyfill)
-   -   \[false](default) No
-   -   \[true] Yes
-   Handle with direction mismatch (`directionMismatchPolicy` in polyfill)
-   -   \[throw] throws an Error
-   -   \[ignore](default) Ignore the symbol of `step`, infer from `from` and `to`
-   -   \[noop] Respect direction mismatch (and cause a dead loop)
-   -   \[yield-no-value] yield nothing (See: #5)
-   How to generate new numbers (`implementationVersion` in polyfill)
-   -   \[1] By add (`next = last + step`)
-   -   \[2](default) By multiply (`next = from + count * step`)

### Signature

```typescript
interface NumberConstructor {
    range(from: number, to: number, step?: number): Iterator<number>
    // If accept Number.range(to)
    range(to: number): Iterator<number>
}
interface BigIntConstructor {
    range(from: BigInt, to: BigInt, step?: BigInt): Iterator<BigInt>
    // If accept BigInt.range(to)
    range(to: BigInt): Iterator<BigInt>
}
```

### Context

Number.range is a generator.
BigInt.range is a generator.

### Constants

> 0.a If this is `Number.range`, let `type` = `number`, `zero` = `0`, `one` = `1`
> 0.b If this is `BigInt.range`, let `type` = `bigint`, `zero` = `0n`, `one` = `1n`

### Input check

Check the input type.

> 1. If `Type(from)` is not `type`, throw a **TypeError** exception.

#### isAcceptAlias === false: Not accept `Number.range(to)`

> 2. Do nothing

#### isAcceptAlias === true: Accept `Number.range(to)`

> 2. If `Type(to)` is undefined, let `to` = `from`, `from` = `zero`

Goes on...

> 3. If `Type(step)` is `undefined`, let `step` = `one`
> 4. If `Type(from)` is not `type`, throw a `TypeError` exception.
> 5. If `Type(to)` is not `type`, throw a `TypeError` exception.
> 6. If `Type(step)` is not `type`, throw a `TypeError` exception.

Quit early with NaN.

> 7. If `from` is `NaN`, return undefined.
> 8. If `to` is `NaN`, return undefined.
> 9. If `step` is `NaN`, return undefined.

Throws with Infinity

> 10. If `from` is `Infinity`, throws a `RangeError` exception.
> 11. If `step` is `Infinity`, throws a `RangeError` exception.

### Handle with direction mismatch

> 12. If `step` is `zero`, throws an `RangeError` exception.
> 13. let `ifIncrease` = `to > from`

#### directionMismatchPolicy === throw: Throws an exception

> 14. let `ifStepIncrease` = `step > zero`
> 15. if `ifIncrease` is not equal to `ifStepIncrease`, throws a `RangeError` exception.

#### directionMismatchPolicy === ignore: Ignore the symbol of `step`, infer from `from` and `to`

> 14. If `ifIncrease` is `true`, let `step` = `abs(step)`
> 15. If `ifIncrease` is `false`, let `step` = `-abs(step)`

#### directionMismatchPolicy === noop: Respect direction mismatch (and cause a dead loop)

> 14. Do nothing
> 15. Do nothing

#### directionMismatchPolicy === yield-no-value: Yield nothing

> 14. return undefined

### Yield Numbers! (Not written in spec language yet)

These two implementations may act differently due to IEEE 754 floating point number

#### Implementation 1

> 16. Run the code below.

```js
while (ifIncrease ? !(from >= to) : !(to >= from)) {
    yield from
    from = from + step
}
```

#### Implementation 2

> 16. Run the code below.

```js
let count = one
let now = from
while (ifIncrease ? !(now >= to) : !(to >= now)) {
    yield now
    now = from + step * count
    count++
}
```

### Over

> 17. return undefined

# Polyfill

Here is a [polyfill](https://github.com/Jack-Works/proposal-Number.range/blob/master/polyfill.js).
