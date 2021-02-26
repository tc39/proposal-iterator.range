// @ts-check
/// <reference path="./global.d.ts" />
console.warn(`This is a step-to-step implementation of the range proposal (https://github.com/tc39/proposal-Number.range) of ECMAScript.
It _will_ change with the proposal has changed.
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
         * @param {T | { step?: T, inclusive?: boolean, start: T, end: T | number }} arg0
         * @param {T | number | undefined} arg1
         * @param {T | undefined | null | { step?: T, inclusive?: boolean }} arg2
         * @param {"number" | "bigint"} type
         */
        // @ts-ignore
        constructor(arg0, arg1, arg2, type) {
            // @ts-ignore
            /** @type {T} */ const zero = type === "bigint" ? 0n : 0 // @ts-ignore
            /** @type {T} */ const one = type === "bigint" ? 1n : 1
            /** @type {T | { step?: T, inclusive?: boolean }} */ let option
            /** @type {T} */ let start
            /** @type {T | number} */ let end
            /** @type {T | undefined | null} */ let step
            /** @type {boolean} */ let inclusiveEnd = false
            if (typeof arg0 === "object" && arg0 !== null) {
                start = arg0.start
                end = arg0.end
                option = arg0
            } else if (typeof arg0 === type) {
                // @ts-ignore
                start = arg0
                end = arg1
                option = arg2
            } else throw new TypeError()

            if (option === undefined || option === null) {
            } else if (typeof option === "object") {
                step = option.step
                const rawInclusiveEnd = option.inclusive
                if (rawInclusiveEnd === null || rawInclusiveEnd === undefined) {
                } else inclusiveEnd = Boolean(rawInclusiveEnd)
            } else if (typeof option === type) {
                // @ts-ignore
                step = option
            } else {
                if (option !== undefined && option !== null) throw new TypeError()
            }
            // Normalize ends
            if (typeof start !== type) throw new TypeError()
            if (isInfinity(start)) throw RangeError()
            // Allowing all kinds of number (number, bigint, decimals, ...) to range from a finite number to infinity.
            if (!isInfinity(end) && typeof end !== type) throw new TypeError()
            if (isInfinity(step)) throw RangeError()
            const ifIncrease = end > start
            if (step === undefined || step === null) {
                // @ts-ignore
                step = ifIncrease ? one : -one
            }
            if (typeof step !== type) throw new TypeError()
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
        get inclusive() {
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
