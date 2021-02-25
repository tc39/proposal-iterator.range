// @ts-check
/// <reference path="./global.d.ts" />
console.warn(`This is an experimental implementation of the range proposal (https://github.com/tc39/proposal-Number.range) of ECMAScript.
It _will_ be changed if the specification has changed.
It should only be used to collect developers feedback about the APIs.`)
// This polyfill requires: globalThis, BigInt, private fields
;(() => {
    const generatorPrototype = Object.getPrototypeOf(Object.getPrototypeOf((function* () {})()))
    const origNext = generatorPrototype.next
    generatorPrototype.next = new Proxy(origNext, {
        apply(target, thisArg, args) {
            let isRange = false
            try {
                Object.getOwnPropertyDescriptor(NumericRangeIterator.prototype, "start").get.call(thisArg)
                isRange = true
            } catch {}
            if (isRange) throw new TypeError()
            return Reflect.apply(target, thisArg, args)
        },
    })

    /**
     * @template {number | bigint} T
     * @param {T} start
     * @param {T | number | undefined} end
     * @param {T} step
     * @param {boolean} inclusiveEnd
     * @param {T} zero
     * @param {T} one
     */
    function* closure(start, end, step, inclusiveEnd, zero, one) {
        if (isNaN(start)) return
        if (isNaN(end)) return
        if (isNaN(step)) return
        let ifIncrease = end > start
        let ifStepIncrease = step > zero
        if (ifIncrease !== ifStepIncrease) return
        let hitsEnd = false
        let currentCount = zero
        while (hitsEnd === false) {
            // @ts-ignore
            let currentYieldingValue = start + step * currentCount
            if (currentYieldingValue === end) hitsEnd = true
            // @ts-ignore
            currentCount = currentCount + one
            let endCondition = false
            if (ifIncrease) {
                if (inclusiveEnd) endCondition = currentYieldingValue > end
                else endCondition = currentYieldingValue >= end
            } else {
                if (inclusiveEnd) endCondition = end > currentYieldingValue
                else endCondition = end >= currentYieldingValue
            }
            if (endCondition) return
            yield currentYieldingValue
        }
        return undefined
    }
    /**
     * @param {Parameters<typeof closure>} args
     */
    function CreateNumericRangeIteratorWithInternalSlot(...args) {
        const g = closure(...args)
        Reflect.setPrototypeOf(g, new.target.prototype)
        return g
    }
    /**
     * @template {number | bigint} T
     */
    // @ts-ignore
    class NumericRangeIterator extends CreateNumericRangeIteratorWithInternalSlot {
        /**
         * @param {T} start
         * @param {T | number | undefined} end
         * @param {T | undefined | null | { step?: T, inclusive?: boolean }} option
         * @param {"number" | "bigint"} type
         */
        // @ts-ignore
        constructor(start, end, option, type) {
            if (typeof start !== type) throw new TypeError() // @ts-ignore
            /** @type {T} */ const zero = type === "bigint" ? 0n : 0 // @ts-ignore
            /** @type {T} */ const one = type === "bigint" ? 1n : 1
            // Allowing all kinds of number (number, bigint, decimals, ...) to range from a finite number to infinity.
            if (!isInfinity(end) && typeof end !== type) throw new TypeError()
            if (isInfinity(start)) throw RangeError()
            const ifIncrease = end > start
            let inclusiveEnd = false
            /** @type {T} */ let step
            if (option === undefined || option === null) step = undefined
            else if (typeof option === "object") {
                step = option.step
                inclusiveEnd = Boolean(option.inclusive)
            } else if (typeof option === type) step = option
            else throw new TypeError()
            if (step === undefined || step === null) {
                if (ifIncrease) step = one
                // @ts-ignore
                else step = -one
            }
            if (typeof step !== type) throw new TypeError()
            if (isInfinity(step)) throw RangeError()
            if (step === zero && start !== end) throw new RangeError()
            const obj = super(start, end, step, inclusiveEnd, zero, one)
            this.#start = start
            this.#end = end
            this.#step = step
            this.#inclusive = inclusiveEnd
            // @ts-ignore
            return obj
        }
        next() {
            this.#start // brand check
            return origNext.call(this)
        }
        #start
        #end
        #step
        #inclusive
        get start() {
            return this.#start
        }
        get end() {
            return this.#end
        }
        get step() {
            return this.#step
        }
        get isInclusiveEnd() {
            return this.#inclusive
        }
    }
    const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()))
    Object.setPrototypeOf(NumericRangeIterator.prototype, IteratorPrototype)
    Object.defineProperty(NumericRangeIterator.prototype, Symbol.toStringTag, {
        writable: false,
        enumerable: false,
        configurable: true,
        value: "NumericRangeIterator",
    })
    Object.defineProperty(Number, "range", {
        configurable: true,
        writable: true,
        value: (start, end, option) => new NumericRangeIterator(start, end, option, "number"),
    })
    Object.defineProperty(BigInt, "range", {
        configurable: true,
        writable: true,
        value: (start, end, option) => new NumericRangeIterator(start, end, option, "bigint"),
    })
    function isInfinity(x) {
        if (typeof x !== "number") return false
        if (Number.isNaN(x)) return false
        if (Number.isFinite(x)) return false
        return true
    }
    function isNaN(x) {
        if (typeof x !== "number") return false
        return Number.isNaN(x)
    }
})()
