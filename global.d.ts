type Infinity = number
declare var Iterator: {
    new (): Iterator<never, void, void>
    prototype: Iterator<never, void, void>
    range(start: number, end: number, option: number | NumericRangeOptions): IterableIterator<number>
    range(start: bigint, end: bigint | Infinity, option: bigint | NumericRangeOptions): IterableIterator<bigint>
}
interface NumericRangeOptions {
    step?: number
    inclusive?: boolean
}
