type Infinity = number
interface RangeIterator<T extends number | bigint>
    extends Iterator<T, void, void> {
    // This property is not in the spec yet.
    [Symbol.iterator](): RangeIterator<T>
    readonly [Symbol.toStringTag]: "RangeIterator"
    readonly from: T
    readonly to: T | Infinity
    readonly step: T
}
type RangeFunction<T extends number | bigint> = {
    range(from: T, to: T | Infinity, option?: { step?: T }): RangeIterator<T>
    range(from: T, to: T | Infinity, step?: T): RangeIterator<T>
}
interface NumberConstructor extends RangeFunction<number> {}
interface BigIntConstructor extends RangeFunction<bigint> {}
