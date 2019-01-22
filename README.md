# Number.range

**Champions**: Finding one...

**Author**: Jack Works

**Stage**: N/A

This proposal describes adding a Number.range to JavaScript.

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

-   Do we need customizable behavior? Something like `Number.range(0, 1000, (previous, index) => next)`
-   Should we add a new syntax like `2...3` instead of a `Number.range()`?
-   Should we support `Number.range(x)` as an alias of `Number.range(0, x)`?
-   How to deal with bad inputs?
-   -   Type mismatch `Number.range(0, 5n)`
-   -   Direction mismatch `Number.range(0, 10, -5)`
-   -   NaN
-   -   How do we calculate numbers? (The 0.30000000000000004 problem)

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

### Feature assumptions of content below (Wait for discussing)

-   `Number.range(to)` equals `Number.range(0, to)`
-   -   [a] No
-   -   [b] Yes
-   Handle with direction mismatch
-   -   [c] throws an Error
-   -   [d] Ignore the symbol of `step`, infer from `from` and `to`
-   -   [e] Respect direction mismatch (and cause a dead loop)

### Signature

```typescript
interface NumberConstructor {
    range(from: number, to: number, step?: number): Iterator<number>
    range(from: BigInt, to: BigInt, step?: BigInt): Iterator<BigInt>
    // If accept Number.range(to)
    range(to: number): Iterator<number>
    range(to: BigInt): Iterator<BigInt>
}
```

### Context

Number.range is a generator.

### Input check

Check the input type.

> 1. If `Type(from)` is not **number** or **BigInt**, throw a **TypeError** exception.

#### a. Does not accept `Number.range(to)`

> 2. Do nothing

#### b. Accept `Number.range(to)`

> 2. If `Type(to)` is undefined, let `to` = `from`, `from` = `0` or `0n`

Goes on...

> 3. If `Type(to)` is not **number** or **BigInt**, throw a **TypeError** exception.
> 4. If `Type(step)` is not **number**, **undefined** or **BigInt**, throw a **TypeError** exception.

Check if input shares the same type.

> 5. If `Type(from)` is not equal to `Type(to)`, throw a **TypeError** exception.
> 6. If `Type(step)` is not **undefined**, and `Type(from)` is not equal to `Type(step)`, throw a **TypeError** exception.

Quit early with NaN.

> 7. If `from` is `NaN`, return undefined.
> 8. If `to` is `NaN`, return undefined.
> 9. If `step` is `NaN`, return undefined.

Set undefined `step` to 1 or 1n

> 10. If `Type(step)` is undefined, let `step` = `1` or `1n`

### Handle with direction mismatch

> 11. If `step` is `0` or `0n`, throws an exception.
> 12. let `ifIncrease` = `to > from`

#### c. Throws an exception

> 13. let `ifStepIncrease` = `step > 0`
> 14. if `ifIncrease` is not equal to `ifStepIncrease`, throws a `RangeError` exception.

#### d. Ignore the symbol of `step`, infer from `from` and `to`

> 13. If `ifIncrease` is `true`, let `step` = `abs(step)`
> 14. If `ifIncrease` is `false`, let `step` = `-abs(step)`

#### e. Respect direction mismatch (and cause a dead loop)

> 13. Do nothing
> 14. Do nothing

### Yield Numbers! (Not written in spec language yet)

These two implementations may act differently due to IEEE 754 floating point number

#### Implementation 1

> 15. Run the code below.

```js
while (ifIncrease ? !(from >= to) : !(to >= from)) {
    yield from
    from = from + step
}
```

#### Implementation 2

> 15. Run the code below.

```js
let count = typeof from === 'bigint' ? 1n : 1
let now = from
while (ifIncrease ? !(now >= to) : !(to >= now)) {
    yield now
    now = from + step * count
    count++
}
```

### Over

> 16. return undefined

# Polyfill

Here is a [polyfill](./polyfill.js).
