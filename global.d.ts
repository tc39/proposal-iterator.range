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
