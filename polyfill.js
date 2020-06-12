// @ts-check
/// <reference path="./global.d.ts" />
// syntax target = es2020
// This polyfill requires: globalThis, BigInt & private fields
{
    /*
     * Behaviour flags
     * This proposal is in early stage.
     * Use which in the end depends on community discussion.
     */
    /**
     * @type {boolean}
     * This flag treat `range(end)` as `range(0, end)`
     */
    const isAcceptAlias = false
    /** @template {number | bigint} T */
    class RangeIterator {
        /**
         * @param {T} start
         * @param {T | number | undefined} end
         * @param {T | undefined | null | { step?: T }} option
         * @param {"number" | "bigint"} type
         */
        constructor(start, end, option, type) {
            if (typeof start !== type) throw new TypeError()
            if (type !== "number" && type !== "bigint") throw new TypeError() // @ts-ignore
            /** @type {T} */ const zero = type === "bigint" ? 0n : 0 // @ts-ignore
            /** @type {T} */ const one = type === "bigint" ? 1n : 1
            if (isAcceptAlias === false) {
            } else if (typeof end === "undefined") {
                // range(end) equals to range(zero, end)
                end = start
                start = zero
            }
            if (typeof start !== type) throw new TypeError()
            // Allowing all kinds of number (number, bigint, decimals, ...) to range from a finite number to infinity.
            if (!isInfinity(end) && typeof end !== type) throw new TypeError()
            if (isInfinity(start)) throw RangeError()
            const ifIncrease = end > start
            /** @type {T} */ let step
            if (typeof option === "undefined" || option === null)
                step = undefined
            else if (typeof option === "object") step = option.step
            else if (typeof option === type) step = option
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
            this.#currentCount = zero
            return this
        }
        //#region internal slots
        /** @type {T} */ #start
        /** @type {number | bigint} */ #end
        /** @type {T} */ #step
        /** @type {"number" | "bigint"} */ #type
        /** @type {T} */ #currentCount
        //#endregion
        /**
         * @returns {IteratorResult<T>}
         */
        next() {
            const start = this.#start
            const end = this.#end
            const step = this.#step
            const type = this.#type
            if (type !== "bigint" && type !== "number") throw new TypeError()
            if (start === end) return CreateIterResultObject(undefined, true) // @ts-ignore
            /** @type {T} */ const zero = type === "bigint" ? 0n : 0 // @ts-ignore
            /** @type {T} */ const one = type === "bigint" ? 1n : 1
            if (Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(step))
                return CreateIterResultObject(undefined, true)
            const ifIncrease = end > start
            const ifStepIncrease = step > zero
            if (ifIncrease !== ifStepIncrease)
                return CreateIterResultObject(undefined, true)
            const currentCount = this.#currentCount // @ts-ignore
            const currentYieldingValue = start + step * currentCount // @ts-ignore
            const nextCount = currentCount + one
            if (ifIncrease && currentYieldingValue >= end)
                return CreateIterResultObject(undefined, true)
            if (!ifIncrease && end >= currentYieldingValue)
                return CreateIterResultObject(undefined, true)
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
    }
    const IteratorPrototype = Object.getPrototypeOf(
        Object.getPrototypeOf([][Symbol.iterator]())
    )
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
        value: (start, end, option) =>
            new RangeIterator(start, end, option, "number"),
    })
    Object.defineProperty(BigInt, "range", {
        configurable: true,
        writable: true,
        value: (start, end, option) =>
            new RangeIterator(start, end, option, "bigint"),
    })
    function isInfinity(x) {
        if (typeof x !== "number") return false
        if (Number.isFinite(x)) return false
        return true
    }
    /** @returns {IteratorResult<any>} */
    function CreateIterResultObject(value, done) {
        return { value, done }
    }
}
