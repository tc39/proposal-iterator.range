# Comparison

> Work in progress

Based on the document and REPL of other languages, might have error in it.

## Semantics

### Syntax

| Language           | Syntax                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| This proposal      | `Number.range(start, to, step?)` <br /> `Bigint.range(start, to, step?)` |
| Python             | `range(start, to, step?)` <br /> `range(to)`                             |
| Java               | `IntStream.range(start, to)` <br /> `LongStream.range(start, to)`        |
| Swift (`Range`)    | `start...to` <br /> `start..<to`                                         |
| Swift (`StrideTo`) | `stride(from: var_start, to: var_to, by: var_step)`                      |
| Rust               | `(start..to)` <br /> `(start..=to)`                                      |
| Haskell            | `[start,next_element_to_infer_step..to]`                                 |
| F#                 | `seq { start .. step .. to }`                                            |

Haskell: The `[start..to]` syntax produce a list. Due to the lazy evaluation of Haskell, it range semantics is different than most of languages.

### Support decimal steps (0.1, 0.2, 0.3, ...)

| Language           | Support? |
| ------------------ | -------- |
| This proposal      | Yes      |
| Python             | No       |
| Java               | No       |
| Swift (`Range`)    | No       |
| Swift (`StrideTo`) | Yes      |
| Rust               | No       |
| Haskell            | Yes      |
| F#                 | Yes      |

### Return type

Define:

-   Iterator: Close to ES iterator protocol
-   Iterable: Close to ES object with `[Symbol.iterator]` (e.g. has a `__iter__()` method)
-   Non-Lazy: The range generate value in a non-lazy way
-   Own: The range have it's own class / struct / ...
-   Instantiation: The range don't have it's own class, instead, it is implementing a more generic type like `StrideTo<int>`

| Language           | Return type               | Iterator 1️⃣ / Iterable 🔢 | Lazy |
| ------------------ | ------------------------- | ------------------------- | ---- |
| This proposal      | Instantiation(`Iterator`) | 1️⃣ Iterator               | ✅   |
| Python             | Own                       | 🔢 Iterable               | ✅   |
| Java               | Instantiation(`Stream`)   | ❌                        | ✅   |
| Swift (`Range`)    | Own                       | 🔢 Iterable               | ✅   |
| Swift (`StrideTo`) | Instantiation(`StrideTo`) | 🔢 Iterable               | ❌   |
| Rust               | Own                       | 1️⃣ Iterator               | ✅   |
| Haskell            | Instantiation(`[Num]`)    | N/A                       | ✅   |
| F#                 | Instantiation(`seq<'T>`)  | 🔢 Iterable               | ✅   |

-   This proposal: It doesn't have it own class currently but it have it's own prototype `%RangeIteratorPrototype%` and have unique getters on it.
-   Java: The base interface of `IntStream` (`Stream`) doesn't implements `Iterator<T>` protocol but have a `iterator()` methods that returns an Iterator. Must use with `for(int i: range.iterator())`
-   Swift (`StrideTo`): According to the [document of `StrideTo`](https://developer.apple.com/documentation/swift/strideto/1689269-lazy), laziness is opt-in.
-   Rust: See https://github.com/tc39/proposal-Number.range/issues/17#issuecomment-642064127
-   Haskell: No Iterator / Iterable. The laziness is in the language. `The idea of a side-effecting iterator is antithetical to the Haskell Way.` (start StackOverflow)

### Immutable (`start`, `to` and `step` cannot be changed)

-   Yes: immutable
-   No: Mutable
-   🙈 means this value is not exposed to developers

| Language           | `start` | `to` | `step` |
| ------------------ | ------- | ---- | ------ |
| This proposal      | Yes     | Yes  | Yes    |
| Python             | Yes     | Yes  | Yes    |
| Java               | N/A     | N/A  | N/A    |
| Swift (`Range`)    | Yes     | Yes  | 🙈?    |
| Swift (`StrideTo`) | N/A     | N/A  | N/A    |
| Rust               | No      | No   | N/A    |
| Haskell            | N/A     | N/A  | N/A    |
| F#                 | ?       | ?    | ?      |

### Algorithm (for floating point number)

> Generally test with range 0 to 1 with step 0.1

-   ➕: `thisValue = last + step`
-   ✖: `thisValue = start + step * i`
-   ?: Unknown

| Language           | Algorithm |
| ------------------ | --------- |
| This proposal      | ✖         |
| Python             | ✖         |
| Java               | ➕        |
| Swift (`StrideTo`) | ➕        |
| Haskell            | ➕        |
| F#                 | ✖         |

### Inclusive or exclusive?

| Language      | `[start,to)`          | `(start,to)` | `(start,to]` | `[start,to]`                |
| ------------- | --------------------- | ------------ | ------------ | --------------------------- |
| This proposal | Yes                   | No           | No           | Yes                         |
| Python        | Yes                   | No           | No           | No                          |
| Java          | Yes <br />(`range()`) | No           | No           | Yes <br />(`rangeClosed()`) |
| Swift         | Yes <br />(`1..<3`)   | No           | No           | Yes <br />(`1...3`)         |
| Rust          | Yes <br /> (`(1..3)`) | No           | No           | Yes <br />(`(1..=3)`)       |
| Haskell       | No                    | No           | No           | Yes                         |
| F#            | No                    | No           | No           | Yes                         |

### (Too big) Overflow behavior for Int type (BigInt-like range not included)

| Language           | Behavior                                                |
| ------------------ | ------------------------------------------------------- |
| This proposal      | ❔ Not decided yet                                      |
| Python             | ❎ Allowed, but fails `len()` etc. with `OverflowError` |
| Java               | ⚫ Emit nothing                                         |
| Swift (`Range`)    | N/A, can't set `to` bigger than 9223372036854775807     |
| Swift (`StrideTo`) | ⚫ Emit nothing                                         |
| Rust               | ♾ Endless loop (Production) / ❌ Panic (Debug)          |
| Haskell            | ❌ Exception                                            |
| F#                 | ?                                                       |

-   Java: Test with code

```java
IntStream
    .rangeClosed(Integer.MAX_VALUE, Integer.MAX_VALUE+100)
    .forEach(s -> System.out.print(s + " "));
```

-   Swift: Test with code

```swift
for i in stride(from: 1.7E+308, to: (1.7E+308)+3, by: 1) {
    print(i)
}
```

-   Rust: From the Rust document: `if you use an integer range and the integer overflows, it might panic in debug mode or create an endless loop in release mode.` (https://doc.rust-lang.org/std/ops/struct.RangeFrom.html)
-   Haskell: Test with code

```haskell
x = 9223372036854775806 :: Int
[x..] !! 2
```

### (Too small) Floating point error behavior

-   N/A: Doesn't support non integer step

| Language           | Behavior        |
| ------------------ | --------------- |
| This proposal      | Not decided yet |
| Python             | N/A             |
| Java               | N/A             |
| Swift (`Range`)    | N/A             |
| Swift (`StrideTo`) | Emit nothing    |
| Rust               | N/A             |
| haskell            | ?               |
| F#                 | ?               |

-   Swift: Test with code `for i in stride(from: 1e323, to: (1e323 + 1e-323 * 2), by: 1e-323) { print(i) }`
-   Haskell: Test with code `[1.7976931348623157e308..1.7976931348623158e308] !! 1500 == [1.7976931348623157e308..1.7976931348623158e308] !! 15`

## Protocols/methods that range implements

_Will try to use ECMAScript equivalent names_

### range.includes(x)

Semantics: Is given `x` in the `range`

e.g. `range(0, 1).includes(0.5)` should be false

| Language      | Syntax                           |
| ------------- | -------------------------------- |
| This proposal | Not yet                          |
| Python        | `x in range`                     |
| Java          | Maybe `range.anyMatch(testFn)`?  |
| Swift         | `range.contains(x)`              |
| Rust          | `range.contains(&item)`          |
| Haskell       | `elem x [y..z]`                  |
| F#            | `Seq.contains x seq {start..to}` |

### `[[Get]]` (`range[index]`)

| Language           | Syntax           |
| ------------------ | ---------------- |
| This proposal      | No               |
| Python             | `r[x]`           |
| Java               | No               |
| Swift (`Range`)    | `r.subscript(x)` |
| Swift (`StrideTo`) | No               |
| Rust               | No               |
| Haskell            | `[x..y] !! i`    |
| F#                 | No?              |

### `[Symbol.slice]` (slice notation proposal)

| Language           | Syntax               | With step         |
| ------------------ | -------------------- | ----------------- |
| This proposal      | Not yet              | Not yet           |
| Python             | `range[i:j]`         | `range[i:j:step]` |
| Java               | No                   | No                |
| Swift (`Range`)    | `range.clamped(to)`  | No                |
| Swift (`StrideTo`) | No                   | No                |
| Rust               | `range[start .. to]` | No                |
| Haskell            | No?                  | No?               |
| F#                 | No?                  | No?               |

### Omitted protocol / methods:

Here are the common features in other languages omitted in the previous comparison because

-   It represents an abstract operation on any sequence-like object but in ECMAScript we don't have a `Symbol.operation` for that.
-   In ECMAScript, compose with existing language features is enough (e.g. Python `min()` with ES `Math.min(...range)`)
-   It make no sense for a range object
-   It get covered by the Iterator helper proposal

#### Python

> Ranges implement all of the common sequence operations except concatenation and repetition (due to the fact that range objects can only represent sequences that follow a strict pattern and repetition and concatenation will usually violate that pattern).

-   `x not in range`: Looks like a simple inversion of `x in range`
-   `max()`: In ES we do `Math.max(...range)`
-   `min()`: In ES we do `Math.min(...range)`
-   `len()`: In ES we do `[...range].length`
-   `r.index(x)`: In ES we do `[...range].indexOf(x)`
-   `r.count(x)`: Lack of `[Symbol.count]` in ES.
-   `r1 == r2`: Lack of `[Symbol.equal]` in ES.

#### Java

`IntStream` and `LongStream`. Most of methods listed in the document seems like can be handled by the Iterator helper proposal.

#### Swift

-   `isEmpty`: Not included yet, wait for community feedback
-   `randomElement()`: Not included yet, wait for community feedback
-   `overlaps`: Not included yet, wait for community feedback
-   `description`: Intl.NumberFormat?

Many methods can be handled by the Iterator helper proposal.
Many methods require a non-lazy semantics.

#### Rust

-   `isEmpty`: Not included yet, wait for community feedback
-   `impl Index<Range<usize>> for String`: Related to the slice notation proposal, also see https://github.com/tc39/proposal-Number.range/issues/22#issuecomment-641864077

#### Haskell

-   Most of functions are common operation to lists therefore not included.

#### F

-   Sequences are represented by the `seq<'T>` type, which is an alias for `IEnumerable<T>`(similar to `Iteratable<T>` in TS).

## Notes

1. Python means Python 3 in this document.

## Reference

-   Python: https://docs.python.org/3/library/stdtypes.html?#range
-   Java: https://docs.oracle.com/javase/8/docs/api/java/util/stream/IntStream.html#range-int-int-
-   Swift `Range`: https://developer.apple.com/documentation/swift/Range
-   Swift `StrideTo`: https://developer.apple.com/documentation/swift/strideto
-   Rust `Range{From,To,Inclusive,ToInclusive}`: https://doc.rust-lang.org/std/ops/struct.Range.html
-   Haskell: https://hackage.haskell.org/package/base-4.14.0.0/docs/Data-List.html
-   F#: https://docs.microsoft.com/en-US/dotnet/fsharp/language-reference/sequences and https://msdn.microsoft.com/visualfsharpdocs/conceptual/collections.seq-module-%5bfsharp%5d
