/// <reference path="./global.d.ts" />
if (typeof Number.range !== 'function') {
    /*
     * Behaviour flags
     * This proposal is in early stages.
     * Use which in the end depends on community discussion.
     */
    /**
     * @type{boolean}
     * This flag treat `range(to)` as `range(0, to)`
     */
    const isAcceptAlias = false
    /** @type{"throw" | "ignore" | "noop"}
     * This flag will affect how function treat direction mismatch
     * Like: Number.range(0, 999, -1)
     *
     * throw: Throws an exception
     * ignore: Ignore the symbol of step, infer from from and to
     * noop: Respect direction mismatch (and cause a dead loop)
     */
    let directionMismatchPolicy = 'ignore'
    /** @type{1 | 2}
     * This flag will choose which implementation will be used.
     * Implementation 1 and 2 may act differently due to IEEE 754 floating point number (but really?)
     * Discuss welcome!
     */
    const implementationVersion = 1

    Object.defineProperty(Number, 'range', {
        configurable: true,
        value: function* range(from, to, step) {
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
            // 10. If Type(step) is undefined, let step = 1 or 1n
            if (typeof step === 'undefined') step = typeof from === 'number' ? 1 : 1n
            // 11. If step is 0 or 0n, throws an exception.
            if (step === 0 || step === 0n) throw new RangeError('Step cannot be 0')
            // 12. let ifIncrease = to > from
            const ifIncrease = to > from
            switch (directionMismatchPolicy) {
                case 'ignore':
                    // 13. let ifStepIncrease = step > 0
                    // 14. if ifIncrease is not equal to ifStepIncrease, throws a RangeError exception.
                    const ifStepIncrease = step > 0
                    if (ifIncrease !== ifStepIncrease)
                        throw new RangeError('from, to and step does not follow the same direction')
                    break
                case 'throw':
                    // 13. If ifIncrease is true, let step = abs(step)
                    // 14. If ifIncrease is false, let step = -abs(step)

                    // Math.abs does not support BigInt currently.
                    const abs = x => (x >= (typeof x === 'bigint' ? 0n : 0) ? x : -x)
                    if (ifIncrease) step = abs(step)
                    else step = -abs(step)
                    break
                case 'noop':
                    // 13. Do nothing
                    // 14. Do nothing
                    break
                default:
                    throw new Error('Bad implementation')
            }
            // Yield numbers!
            if (implementationVersion === 1) {
                // 15. Run the code below.
                while (ifIncrease ? !(from >= to) : !(to >= from)) {
                    yield from
                    from = from + step
                }
            } else if (implementationVersion === 2) {
                // 15. Run the code below.
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
            // 16. return undefined
            return undefined
        },
        writable: true
    })
}
