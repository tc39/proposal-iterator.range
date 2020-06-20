// @ts-check
/// <reference path="./global.d.ts" />
// syntax target = es2020
// This polyfill requires: globalThis, BigInt & private fields
;(() => {
    /** @template {number | bigint} T */
    class RangeIterator {
        /**
         * @param {T} start
         * @param {T | number | undefined} end
         * @param {T | undefined | null | { step?: T, inclusive?: boolean }} option
         * @param {"number" | "bigint"} type
         */
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
            if (typeof option === "undefined" || option === null) step = undefined
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
            this.#start = start
            this.#end = end
            this.#step = step
            this.#type = type
            this.#inclusiveEnd = inclusiveEnd
            this.#currentCount = zero
            return this
        }
        //#region internal slots
        /** @type {T} */ #start
        /** @type {number | bigint} */ #end
        /** @type {T} */ #step
        /** @type {"number" | "bigint"} */ #type
        /** @type {T} */ #currentCount
        /** @type {boolean} */ #inclusiveEnd
        /** @type {boolean} */ #hitsEnd
        //#endregion
        /**
         * @returns {IteratorResult<T>}
         */
        next() {
            if (this.#hitsEnd) return CreateIterResultObject(undefined, true)
            const start = this.#start
            const end = this.#end
            const step = this.#step
            const type = this.#type
            const inclusiveEnd = this.#inclusiveEnd
            if (start === end) return CreateIterResultObject(undefined, true) // @ts-ignore
            /** @type {T} */ const zero = type === "bigint" ? 0n : 0 // @ts-ignore
            /** @type {T} */ const one = type === "bigint" ? 1n : 1
            if (Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(step))
                return CreateIterResultObject(undefined, true)
            const ifIncrease = end > start
            const ifStepIncrease = step > zero
            if (ifIncrease !== ifStepIncrease) return CreateIterResultObject(undefined, true)
            const currentCount = this.#currentCount // @ts-ignore
            const currentYieldingValue = start + step * currentCount
            if (currentYieldingValue === end) this.#hitsEnd = true // @ts-ignore
            const nextCount = currentCount + one
            let endCondition = false
            if (ifIncrease) {
                if (inclusiveEnd) endCondition = currentYieldingValue > end
                else endCondition = currentYieldingValue >= end
            } else {
                if (inclusiveEnd) endCondition = end > currentYieldingValue
                else endCondition = end >= currentYieldingValue
            }
            if (endCondition) return CreateIterResultObject(undefined, true)
            this.#currentCount = nextCount
            return CreateIterResultObject(currentYieldingValue, false)
        }
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
            return this.#inclusiveEnd
        }
    }
    const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()))
    Object.setPrototypeOf(RangeIterator.prototype, IteratorPrototype)
    Object.defineProperty(RangeIterator.prototype, Symbol.toStringTag, {
        writable: false,
        enumerable: false,
        configurable: true,
        value: "RangeIterator",
    })
    Object.defineProperty(Number, "range", {
        configurable: true,
        writable: true,
        value: (start, end, option) => new RangeIterator(start, end, option, "number"),
    })
    Object.defineProperty(BigInt, "range", {
        configurable: true,
        writable: true,
        value: (start, end, option) => new RangeIterator(start, end, option, "bigint"),
    })
    function isInfinity(x) {
        if (typeof x !== "number") return false
        if (Number.isNaN(x)) return false
        if (Number.isFinite(x)) return false
        return true
    }
    /**
     * @returns {IteratorResult<any>}
     * @param {any} value
     * @param {boolean} done
     */
    function CreateIterResultObject(value, done) {
        return { value, done }
    }
})()
