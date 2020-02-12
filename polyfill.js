/// <reference path="./global.d.ts" />
// syntax target = es6
// This polyfill requires: globalThis
;(() => {
    /*
     * Behaviour flags
     * This proposal is in early stage.
     * Use which in the end depends on community discussion.
     */
    /**
     * @type{boolean}
     * This flag treat `range(to)` as `range(0, to)`
     */
    const isAcceptAlias = false
    /**
     * @type{"throw" | "ignore" | "noop" | "yield-no-value"}
     * This flag will affect how function treat direction mismatch
     * Like: Number.range(0, 999, -1)
     *
     * throw: Throws an exception
     * ignore: Ignore the symbol of step, infer from from and to
     * noop: Respect direction mismatch (and cause a dead loop)
     * yield-no-value: return undefined, yield nothing
     */
    const directionMismatch = 'ignore'
    /** Polyfill start */
    const FakeBigIntConstructor = x => x
    /** @type {BigIntConstructor} */
    const BigInt = globalThis.BigInt || FakeBigIntConstructor
    /**
     *
     * @param {number | bigint} from
     * @param {number | bigint} to
     * @param {number | bigint | undefined} step
     * @param {"number" | "bigint"} type
     */
    function* CreateRangeIterator(from, to, step, type) {
        if (typeof from !== type) throw new TypeError()
        if (type !== 'number' && type !== 'bigint') throw new TypeError()
        const zero = type === 'number' ? 0 : BigInt(0)
        const one = type === 'number' ? 1 : BigInt(1)
        if (isAcceptAlias) {
            if (typeof to === 'undefined') {
                to = from
                from = zero
            }
        } else {
        }
        if (typeof step === 'undefined') step = one
        if (typeof from !== type || typeof to !== type || typeof step !== type) throw new TypeError()
        if (
            (typeof from === 'number' && !Number.isFinite(from)) ||
            (typeof step === 'number' && !Number.isFinite(step))
        )
            throw new RangeError()
        if (step === zero) throw new RangeError()
        if (Number.isNaN(from) || Number.isNaN(to) || Number.isNaN(step)) return undefined
        // 13. let ifIncrease = to > from
        const ifIncrease = to > from
        const ifStepIncrease = step > zero
        switch (directionMismatch) {
            case 'throw':
                if (ifIncrease !== ifStepIncrease) throw new RangeError()
                break
            case 'yield-no-value':
                return undefined
            case 'ignore':
                // Math.abs does not support BigInt.
                const abs = x => (x >= (typeof x === 'bigint' ? BigInt(0) : 0) ? x : -x)
                if (ifIncrease) step = abs(step)
                else step = -abs(step)
                break
            case 'noop':
                break
            default:
                throw new Error('Bad variant directionMismatch')
        }
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
        return undefined
    }
    if (typeof Number.range !== 'function') {
        Object.defineProperty(Number, 'range', {
            configurable: true,
            value: (from, to, step) => CreateRangeIterator(from, to, step, 'number'),
            writable: true
        })
    }
    // If BigInt does not exist in globalThis, this will apply to FakeBigIntConstructor and then ignored.
    if (typeof BigInt.range !== 'function') {
        Object.defineProperty(BigInt, 'range', {
            configurable: true,
            value: (from, to, step) => CreateRangeIterator(from, to, step, 'bigint'),
            writable: true
        })
    }
})()
