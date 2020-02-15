interface NumberConstructor {
    range(from: number, to: number, step?: number): Iterator<number>
    // If accept Number.range(to)
    range(to: number): Iterator<number>
}
interface BigIntConstructor {
    range(from: bigint, to: bigint, step?: bigint): Iterator<bigint>
    // If accept BigInt.range(to)
    range(to: bigint): Iterator<bigint>
}
