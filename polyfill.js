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
    const directionMismatchPolicy = 'ignore'
    /**
     * @type{1 | 2}
     * This flag will choose which implementation will be used.
     * Implementation 1 and 2 may act differently due to IEEE 754 floating point number (but really?)
     *
     * Implementation 1 based on +
     * Implementation 2 based on *
     * Discuss welcome!
     */
    const implementationVersion = 2
    /** Polyfill start */
    const FakeBigIntConstructor = x => x
    /** @type {BigIntConstructor} */
    const BigInt = globalThis.BigInt || FakeBigIntConstructor
    function rangeFactory(/** @type{'number' | 'bigint'} */ type, /** @type{0 | 0n} */ zero, /** @type{1 | 1n} */ one) {
        return function* range(from, to, step) {
            // 1.If Type(from) is not type, throw a TypeError exception.
            if (typeof from !== type) throw new TypeError()
            if (isAcceptAlias) {
                // 2. If Type(to) is undefined, let to = from, from = zero
                if (typeof to === 'undefined') {
                    to = from
                    from = zero
                }
            } else {
                // 2. Do nothing
            }
            // 3. If Type(step) is undefined, let step = one
            if (typeof step === 'undefined') step = one
            // 4. If Type(from) is not type, throw a TypeError exception.
            // 5. If Type(to)   is not type, throw a TypeError exception.
            // 6. If Type(step) is not type, throw a TypeError exception.
            if (typeof from !== type || typeof to !== type || typeof step !== type) throw new TypeError()
            // 7. If from is NaN, return undefined.
            // 8. If to is NaN, return undefined.
            // 9. If step is NaN, return undefined.
            if (Number.isNaN(from) || Number.isNaN(to) || Number.isNaN(step)) return undefined
            // 10. If `from` is `Infinity`, throws a `RangeError` exception.
            // 11. If `step` is `Infinity`, throws a `RangeError` exception.
            if (
                (typeof from === 'number' && !Number.isFinite(from)) ||
                (typeof step === 'number' && !Number.isFinite(step))
            )
                throw new RangeError()
            // 12. If step is 0 or 0n, throws an exception.
            if (step === zero) throw new RangeError()
            // 13. let ifIncrease = to > from
            const ifIncrease = to > from
            switch (directionMismatchPolicy) {
                case 'throw':
                    // 15. let ifStepIncrease = step > zero
                    // 16. if ifIncrease is not equal to ifStepIncrease, throws a RangeError exception.
                    const ifStepIncrease = step > zero
                    if (ifIncrease !== ifStepIncrease) throw new RangeError()
                    break
                case 'ignore':
                    // 15. If ifIncrease is true, let step = abs(step)
                    // 16. If ifIncrease is false, let step = -abs(step)

                    // Math.abs does not support BigInt currently.
                    const abs = x => (x >= (typeof x === 'bigint' ? BigInt(0) : 0) ? x : -x)
                    if (ifIncrease) step = abs(step)
                    else step = -abs(step)
                    break
                case 'noop':
                    // 15. Do nothing
                    // 16. Do nothing
                    break
                case 'yield-no-value':
                    // 15. return undefined
                    return undefined
                default:
                    throw new Error('Bad implementation')
            }
            // Yield numbers!
            if (implementationVersion === 1) {
                // 16. Run the code below.
                while (ifIncrease ? !(from >= to) : !(to >= from)) {
                    yield from
                    from = from + step
                }
            } else if (implementationVersion === 2) {
                // 16. Run the code below.
                let count = one
                let now = from
                while (ifIncrease ? !(now >= to) : !(to >= now)) {
                    yield now
                    now = from + step * count
                    count++
                }
            } else {
                throw new Error('Bad implementation')
            }
            // 17. return undefined
            return undefined
        }
    }
    if (typeof Number.range !== 'function') {
        // 0.a If this is `Number.range`, let `type` = `number`, `zero` = `0`, `one` = `1`
        const type = 'number',
            zero = 0,
            one = 1
        Object.defineProperty(Number, 'range', {
            configurable: true,
            value: rangeFactory(type, zero, one),
            writable: true
        })
    }
    // If BigInt does not exist in globalThis, this will apply to FakeBigIntConstructor and then ignored.
    if (typeof BigInt.range !== 'function') {
        // 0.b If this is `BigInt.range`, let `type` = `bigint`, `zero` = `0n`, `one` = `1n`
        const type = 'bigint',
            zero = BigInt(0),
            one = BigInt(1)
        Object.defineProperty(BigInt, 'range', {
            configurable: true,
            value: rangeFactory(type, zero, one),
            writable: true
        })
    }
})()
