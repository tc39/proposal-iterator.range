type Infinity = number
interface RangeIterator<T extends number | bigint> extends Iterator<T, void, void> {
    // This property is not in the spec yet.
    [Symbol.iterator](): RangeIterator<T>
    readonly [Symbol.toStringTag]: "RangeIterator"
    readonly start: T
    readonly end: T | Infinity
    readonly step: T
    readonly inclusive: boolean
}
type RangeFunction<T extends number | bigint> = {
    range(option: { start: T; end: T | Infinity; step?: T; inclusive?: boolean }): RangeIterator<T>
    range(start: T, end: T | Infinity, option?: T | { step?: T; inclusive?: boolean }): RangeIterator<T>
    range(start: T, end: T | Infinity, step?: T): RangeIterator<T>
}
interface NumberConstructor extends RangeFunction<number> {}
interface BigIntConstructor extends RangeFunction<bigint> {}
