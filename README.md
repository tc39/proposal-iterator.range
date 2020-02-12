# Number.range & BigInt.range

**Champions**: Jack Works

**Author**: Jack Works

**Stage**: 0

This proposal describes adding a `Number.range` and a `BigInt.range` to JavaScript.

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
-   -   -   Decimal step (Should we?) (0, 0.2, 0.4, ...)
-   BigInt Support
-   -   Same as Arithmetic Sequence
-   Infinite Sequence `Number.range(0, Infinity)` -> (0, 1, 2, 3, ...)

### Non-goals

-   String Sequence (a, b, c, d, ...)
-   Magic
-   -   E.g. `if (x in Number.range(0, 10))` (Kotlin have this feature)

### Discussions

#### Discussions in Issue

-   How to deal with bad inputs?
-   -   Direction mismatch `Number.range(0, 10, -5)` (See: [#5](https://github.com/Jack-Works/proposal-Number.range/issues/5), and [here](#feature-assumptions-of-content-below-wait-for-discussing))
-   Should we throw on `Number.range(42, 100, 1e-323)`? (See: [#7](https://github.com/Jack-Works/proposal-Number.range/issues/7))
-   Should we support `BigInt.range(0n, Infinity)`? (See: [#8](https://github.com/Jack-Works/proposal-Number.range/issues/8))

#### Others

If you interested in these topics, please open an issue!

-   Customizable behavior? Like `Number.range(0, 1000, (previous, index) => next)`
-   Add a new syntax like `2...3` instead of a `Number.range()`?
-   Support `Number.range(x)` as an alias of `Number.range(0, x)`?
-   Drop support for decimal step to avoid the 0.30000000000000004 problem?

# Examples

```js
for (const i of Number.range(0, 43)) console.log(i) // 0 to 42

const mockData = [...Number.range(0, 21)].map(x => ({ age: x, name }))

function* odd() {
    for (const i of Number.range(0, Infinity)) {
        if (i % 2 === 0) yield i
    }
}
```

# Proposal

Number.range( `from` , `to`, `step` )

BigInt.range( `from` , `to`, `step` )

### Feature flags (Wait for discussing)

-   `Number.range(to)` equals `Number.range(0, to)` (`isAcceptAlias` in polyfill)
-   -   \[false](default) No
-   -   \[true] Yes
-   Handle with direction mismatch (`directionMismatch` in polyfill)
-   -   \[throw] throws an Error
-   -   \[ignore](default) Ignore the symbol of `step`, infer from `from` and `to`
-   -   \[noop] Respect direction mismatch (and cause a dead loop)
-   -   \[yield-no-value] yield nothing (See: #5)

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

# Polyfill

Here is a [polyfill](https://github.com/Jack-Works/proposal-Number.range/blob/master/polyfill.js).

### Spec

#### Variants: there are still some behavior not decided yet and waiting for discussion. Leave as variable in the spec.

-   isAcceptAlias: `range(to)` treated as `range(0, to)`
-   directionMismatch: What to do if the direction mismatch

#### CreateRangeIterator(`from`, `to`, `step`, `type`)

1. If `Type(from)` is not `type`, throw a **TypeError** exception.
1. **Assert**: `type` is `"number"` or `"bigint"`
1. If `type` is `"bigint"`, let `zero` be `0n`, else let `zero` be `0`.
1. If `type` is `"bigint"`, let `one` be `1n`, else let `one` be `1`.
1. a. If variant `isAcceptAlias` is _false_, do nothing.

    b. Else, if `Type(to)` is undefined, let `to` be `from`, then `from` be `zero`

1. If `Type(step)` is `undefined`, let `step` = `one`
    <!-- Type Check -->
1. If `Type(from)` is not `type`, throw a `TypeError` exception.
1. If `Type(to)` is not `type`, throw a `TypeError` exception.
1. If `Type(step)` is not `type`, throw a `TypeError` exception.
    <!-- Value range check -->
1. If `from` is `Infinity`, throws a `RangeError` exception.
1. If `step` is `Infinity`, throws a `RangeError` exception.
1. If `step` is `zero`, throws an `RangeError` exception.

1. Let `iterator` be `ObjectCreate(%RangeIteratorPrototype%, « [[from]], [[to]], [[step]], [[type]], [[currentCount]], [[lastValue]] »)`.
1. Set `iterator`.[[from]] to from.
1. Set `iterator`.[[to]] to to.
1. Set `iterator`.[[step]] to step.
1. Set `iterator`.[[type]] to type.
1. Set `iterator`.[[currentCount]] to one.
1. Set `iterator`.[[lastValue]] to from.
1. Return `iterator`.

#### The %RangeIteratorPrototype% Object

The %RangeIteratorPrototype% object:

has properties that are inherited by all Range Iterator Objects.

is an ordinary object.

has a [[Prototype]] internal slot whose value is the intrinsic object `%IteratorPrototype%`.

has the following properties:

##### %RangeIteratorPrototype%.next()

<!-- brand checks -->

1.  Let `iterator` be the **this** value.
1.  If `Type(iterator)` is not Object, throw a **TypeError** exception.
1.  If `iterator` does not have all of the internal slots of a Range Iterator Instance, throw a **TypeError** exception.
    <!-- Deconstruct variables -->
1.  Let `from` be `iterator`.[[from]].
1.  Let `to` be `iterator`.[[to]].
1.  Let `step` be `iterator`.[[step]].
1.  Let `type` be `iterator`.[[type]].
1.  **Assert**: `type` is `"number"` or `"bigint"`
1.  If `type` is `"bigint"`, let `zero` be `0n`, else let `zero` be `0`
1.  If `type` is `"bigint"`, let `one` be `1n`, else let `one` be `1`
    <!-- Early return -->
1.  If `from` is `NaN`, return `CreateIterResultObject(undeﬁned, true)`.
1.  If `to` is `NaN`, return `CreateIterResultObject(undeﬁned, true)`.
1.  If `step` is `NaN`, return `CreateIterResultObject(undeﬁned, true)`.
    <!-- Direction mismatch -->
1.  Let `ifIncrease` be `to > from`
1.  Let `ifStepIncrease` = `step > zero`

###### If variant `directionMismatch` is `throw`

1. If `ifIncrease` is not equal to `ifStepIncrease`, throw a **RangeError** exception.

###### If variant `directionMismatch` is `yield-no-value`

1. If `ifIncrease` is not equal to `ifStepIncrease`, return `CreateIterResultObject(undeﬁned, true)`.

###### If variant `directionMismatch` is `ignore`

1. If `ifIncrease` is `true`, let `step` = `abs(step)`
1. Else let `step` = `-abs(step)`

###### If variant `directionMismatch` is `noop`

1. Do nothing

##### Variant block ended.

<!-- Yield numbers -->

```js
let currentCount = one
let lastValue = from
if (ifIncrease) {
    while (!(lastValue >= to)) {
        let yielding = lastValue
        lastValue = from + step * currentCount
        currentCount++
        yield yielding
    }
} else {
    while (!(to >= lastValue)) {
        let yielding = lastValue
        lastValue = from + step * currentCount
        currentCount++
        yield yielding
    }
}
```

1. Let `currentCount` be `iterator`.[[currentCount]]
1. Let `lastValue` be `iterator`.[[lastValue]]
1. Let `now` be `from`
1. If `ifIncrease` is true, let `condition` be `!(lastValue >= to)`, else let `condition` be `!(to >= lastValue)`
1. Repeat, while `condition` evaluates to `true`,
    a. Let `yielding` be `lastValue`
   
    b. Set `lastValue` be `from` + (`step` \* `currentCount`)
    
    c. Set `currentCount` to `currentCount` + `one`
    
    d. Set `iterator`.[[currentCount]] to currentCount
    
    e. Return `CreateIterResultObject(yielding, false).`
      <!-- Finish -->
1. return `CreateIterResultObject(undeﬁned, true)`.

#### %MapIteratorPrototype%[@@toStringTag]

The initial value of the @@toStringTag property is the String value "Range Iterator".

This property has the attributes { [[Writable]]: false, [[Enumerable]]: false, [[Conﬁgurable]]: true }.

### Properties of Range Iterator Instances

Range Iterator instances are ordinary objects that inherit properties from the `%MapIteratorPrototype%` intrinsic object.

Range Iterator instances are initially created with the internal slots described in Table.

<table>
<thead>
<tr>
<td>Internal slot</td>
<td>Description</td>
<tr>
</thead>
<tbody>
<tr><td>[[from]]</td><td>The range starts from.</td><tr>
<tr><td>[[to]]</td><td>The range ends to.</td><tr>
<tr><td>[[step]]</td><td>The range step size.</td><tr>
<tr><td>[[type]]</td><td>Must be "number" or "bigint".</td><tr>
<tr>
<td>[[currentCount]]</td>
<td>The `integer index` of the last yielded value this iterator. Must be type of number or bigint.</td>
<tr>
<tr><td>[[lastValue]]</td><td>The last iterated value. Must be type of number or bigint.</td><tr>
</tbody>
</table>

1. Let `iterator` be `ObjectCreate(%RangeIteratorPrototype%, « [[from]], [[to]], [[step]], [[type]], [[currentCount]], [[lastValue]] »)`.

### Number.range(from, to, step)

1. Return ? `CreateRangeIterator(from, to, step, "number")`.

### BigInt.range(from, to, step)

1. Return ? `CreateRangeIterator(from, to, step, "bigint")`.
