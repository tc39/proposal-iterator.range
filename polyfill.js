// @ts-check
/// <reference path="./global.d.ts" />
// This polyfill requires: globalThis, BigInt, private fields
;(() => {
    const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()))
    const generatorPrototype = Object.getPrototypeOf(Object.getPrototypeOf((function* () {})()))
    const originalGeneratorPrototypeNext = generatorPrototype.next
    const numericRangeIteratorInstances = new WeakSet()
    generatorPrototype.next = new Proxy(originalGeneratorPrototypeNext, {
        apply(target, thisArg, args) {
            if (numericRangeIteratorInstances.has(thisArg)) throw new TypeError("Incompatible receiver")
            return Reflect.apply(target, thisArg, args)
        },
    })

    /**
     * @template {number | bigint} T
     * @param {T} start
     * @param {T | number | undefined} end
     * @param {T} step
     * @param {boolean} isInclusiveEnd
     * @param {T} zero
     * @param {T} one
     */
    function* NumericRangeIterator(start, end, step, isInclusiveEnd, zero, one) {
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
                if (isInclusiveEnd) endCondition = currentYieldingValue > end
                else endCondition = currentYieldingValue >= end
            } else {
                if (isInclusiveEnd) endCondition = end > currentYieldingValue
                else endCondition = end >= currentYieldingValue
            }
            if (endCondition) return
            yield currentYieldingValue
        }
        return undefined
    }
    /**
     * @template {number | bigint} T
     */
    class NumericRange {
        /**
         * @param {"number" | "bigint"} type
         * @param {T} start
         * @param {T | number} end
         * @param {T | undefined | null | { step?: T, inclusive?: boolean }} option
         */
        constructor(type, start, end, option) {
            if (type !== "bigint" && type !== "number") throw new TypeError('type must be one of "number" or "bigint"')
            if (typeof start !== type) throw new TypeError(`start must be type of ${type}, but found ${typeof start}`) // @ts-ignore
            /** @type {T} */ const zero = type === "bigint" ? 0n : 0 // @ts-ignore
            /** @type {T} */ const one = type === "bigint" ? 1n : 1
            // Allowing all kinds of number (number, bigint, decimals, ...) to range from a finite number to infinity.
            if (!isInfinity(end) && typeof end !== type)
                throw new TypeError(`end must be type of ${type}, but found ${typeof end}`)
            if (isInfinity(start)) throw RangeError("start cannot be infinity")
            const ifIncrease = end > start
            let isInclusiveEnd = false
            /** @type {T} */ let step
            if (option === undefined || option === null) step = undefined
            else if (typeof option === "object") {
                step = option.step
                isInclusiveEnd = Boolean(option.inclusive)
            } else if (typeof option === type) step = option
            else throw new TypeError("invalid options")
            if (step === undefined || step === null) {
                if (ifIncrease) step = one
                // @ts-ignore
                else step = -one
            }
            if (typeof step !== type) throw new TypeError(`step must be type of ${type}, but found ${typeof step}`)
            if (isInfinity(step)) throw RangeError("step can not be infinity")
            if (step === zero && start !== end) throw new RangeError("step can not be zero")
            this.#start = start
            this.#end = end
            this.#step = step
            this.#isInclusiveEnd = isInclusiveEnd
            this.#isNumericRange = true
            this.#type = type
        }
        /** @type {"number" | "bigint"} */ #type
        /** @type {T} */ #start
        /** @type {T | number} */ #end
        /** @type {T} */ #step
        /** @type {boolean} */ #isInclusiveEnd
        /** @type {boolean} */ #isNumericRange
        get start() {
            return this.#start
        }
        get end() {
            return this.#end
        }
        get step() {
            return this.#step
        }
        get type() {
            return this.#type
        }
        get isInclusiveEnd() {
            return this.#isInclusiveEnd
        }
        values() {
            this.#isNumericRange
            const start = this.#start
            const end = this.#end
            const step = this.#step
            const type = this.#type
            const isInclusiveEnd = this.#isInclusiveEnd // @ts-ignore
            /** @type {T} */ const zero = type === "bigint" ? 0n : 0 // @ts-ignore
            /** @type {T} */ const one = type === "bigint" ? 1n : 1
            const iterator = NumericRangeIterator(start, end, step, isInclusiveEnd, zero, one)
            Object.setPrototypeOf(iterator, NumericRangeIteratorPrototype)
            numericRangeIteratorInstances.add(iterator)
            return iterator
        }
    }
    NumericRange.prototype[Symbol.iterator] = NumericRange.prototype.values
    const NumericRangeIteratorPrototype = Object.create(IteratorPrototype, {
        next: {
            configurable: true,
            writable: true,
            value: function () {
                if (!numericRangeIteratorInstances.has(this)) throw new TypeError("Incompatible receiver")
                return originalGeneratorPrototypeNext.call(this)
            },
        },
        [Symbol.toStringTag]: {
            configurable: true,
            value: "NumericRange Iterator",
        },
    })
    Object.defineProperty(NumericRange.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "NumericRange",
    })
    Object.defineProperty(Number, "range", {
        configurable: true,
        writable: true,
        value: (start, end, option) => new NumericRange("number", start, end, option),
    })
    Object.defineProperty(BigInt, "range", {
        configurable: true,
        writable: true,
        value: (start, end, option) => new NumericRange("bigint", start, end, option),
    })
    /** @param {unknown} x */
    function isInfinity(x) {
        if (typeof x !== "number") return false
        if (Number.isNaN(x)) return false
        if (Number.isFinite(x)) return false
        return true
    }
    /** @param {unknown} x */
    function isNaN(x) {
        if (typeof x !== "number") return false
        return Number.isNaN(x)
    }
})()
