type Infinity = number
interface NumericRange<T extends number | bigint> extends Iterable<T> {
    [Symbol.iterator](): Iterator<T>
    values(): Iterator<T>
    readonly [Symbol.toStringTag]: "NumericRange"
    readonly start: T
    readonly end: T | Infinity
    readonly step: T
    readonly isInclusiveEnd: boolean
    readonly type: "number" | "bigint"
}
type RangeFunction<T extends number | bigint> = {
    range(start: T, end: T | Infinity, option?: T | { step?: T; inclusive?: boolean }): NumericRange<T>
    range(start: T, end: T | Infinity, step?: T): NumericRange<T>
}
interface NumberConstructor extends RangeFunction<number> {}
interface BigIntConstructor extends RangeFunction<bigint> {}
