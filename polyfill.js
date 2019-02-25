/// <reference path="./global.d.ts" />
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
    let directionMismatchPolicy = 'ignore'
    /**
     * @type{1 | 2}
     * This flag will choose which implementation will be used.
     * Implementation 1 and 2 may act differently due to IEEE 754 floating point number (but really?)
     * Discuss welcome!
     */
    const implementationVersion = 1
    /**
     * @type{boolean}
     * Open this flag will remove BigInt support and move it to `BigInt.range()`
     */
    const bigIntSupportMoveToBigIntConstructor = false
    if (typeof Number.range !== 'function') {
        function* range(from, to, step) {
            const paramsTypeError = new TypeError('All parameters must be number or BigInt')
            // 1.If Type(from) is not number or BigInt, throw a TypeError exception.
            if (typeof from !== 'number' && typeof from !== 'bigint') throw paramsTypeError
            if (isAcceptAlias) {
                // 2. If Type(to) is undefined, let to = from, from = 0 or 0n
                if (typeof to === 'undefined') {
                    to = from
                    from = typeof to === 'number' ? 0 : 0n
                }
            } else {
                // 2. Do nothing
            }
            // 3. If Type(to) is not number or BigInt, throw a TypeError exception.
            // 4. If Type(step) is not number, undefined or BigInt, throw a TypeError exception.
            // 5. If Type(from) is not equal to Type(to), throw a TypeError exception.
            // 6. If Type(step) is not undefined, and Type(from) is not equal to Type(step), throw a TypeError exception.
            if (typeof to !== 'number' && typeof to !== 'bigint') throw paramsTypeError
            if (typeof step !== 'number' && typeof step !== 'undefined' && typeof step !== 'undefined')
                throw paramsTypeError
            if (typeof from !== typeof to) throw paramsTypeError
            if (typeof step !== 'undefined' && typeof from !== typeof step) throw paramsTypeError
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
            if (typeof step === 'undefined')
                // 12. If Type(step) is undefined, let step = 1 or 1n
                step = typeof from === 'number' ? 1 : 1n
            // 13. If step is 0 or 0n, throws an exception.
            if (step === 0 || step === 0n) throw new RangeError('Step cannot be 0')
            // 14. let ifIncrease = to > from
            const ifIncrease = to > from
            switch (directionMismatchPolicy) {
                case 'ignore':
                    // 15. let ifStepIncrease = step > 0
                    // 16. if ifIncrease is not equal to ifStepIncrease, throws a RangeError exception.
                    const ifStepIncrease = step > 0
                    if (ifIncrease !== ifStepIncrease)
                        throw new RangeError('from, to and step does not follow the same direction')
                    break
                case 'throw':
                    // 15. If ifIncrease is true, let step = abs(step)
                    // 16. If ifIncrease is false, let step = -abs(step)

                    // Math.abs does not support BigInt currently.
                    const abs = x => (x >= (typeof x === 'bigint' ? 0n : 0) ? x : -x)
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
                // 17. Run the code below.
                while (ifIncrease ? !(from >= to) : !(to >= from)) {
                    yield from
                    from = from + step
                }
            } else if (implementationVersion === 2) {
                // 17. Run the code below.
                let count = typeof from === 'bigint' ? 1n : 1
                let now = from
                while (ifIncrease ? !(now >= to) : !(to >= now)) {
                    yield now
                    now = from + step * count
                    count++
                }
            } else {
                throw new Error('Bad implementation')
            }
            // 18. return undefined
            return undefined
        }
        Object.defineProperty(Number, 'range', {
            configurable: true,
            value: (from, to, step) => {
                if (bigIntSupportMoveToBigIntConstructor) {
                    if (typeof from === 'bigint') {
                        throw new TypeError('Number.range does not support BigInt. Use BigInt.range instead.')
                    }
                }
                return range(from, to, step)
            },
            writable: true
        })
        if ('BigInt' in this) {
            Object.defineProperty(BigInt, 'range', {
                configurable: true,
                value: (from, to, step) => {
                    if (typeof from === 'number') {
                        throw new TypeError('BigInt.range does not support number. Use Number.range instead.')
                    }
                    return range(from, to, step)
                },
                writable: true
            })
        }
    }
})()
