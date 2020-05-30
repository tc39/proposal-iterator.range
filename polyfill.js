/// <reference path="./global.d.ts" />
// syntax target = es2020
// This polyfill requires: globalThis, BigInt & private fields
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
    class RangeIterator {
        /**
         *
         * @param {number | bigint} from
         * @param {number | bigint | undefined} to
         * @param {number | bigint | undefined | null | object} option
         * @param {"number" | "bigint"} type
         */
        constructor(from, to, option, type) {
            // Step 1 to 6
            if (typeof from !== type) throw new TypeError()
            if (type !== "number" && type !== "bigint") throw new TypeError()
            const zero = type === "bigint" ? 0n : 0
            const one = type === "bigint" ? 1n : 1
            if (isAcceptAlias === false) {
            } else if (typeof to === "undefined") {
                // range(to) equals to range(zero, to)
                to = from
                from = zero
            }
            /** @type {number | bigint} */
            let step
            if (typeof option === "undefined" || option === null) step = one
            else if (typeof option === "object") step = option.step
            else if (typeof option === type) step = option
            else throw new TypeError()
            if (typeof step === "undefined") step = one
            if (typeof from !== type) throw new TypeError()
            // Step 7 to 11
            // Allowing all kinds of number (number, bigint, decimals, ...) to range from a finite number to infinity.
            if (!isInfinity(to) && typeof to !== type) throw new TypeError()
            if (isInfinity(from) || isInfinity(step)) throw RangeError()
            if (step === zero) throw new RangeError()
            // Step 13 - 18
            this.#from = from
            this.#to = to
            this.#step = step
            this.#type = type
            this.#currentCount = zero
            return this
        }
        //#region internal slots
        /** @type {number | bigint} */
        #from
        /** @type {number | bigint} */
        #to
        /** @type {number | bigint} */
        #step
        /** @type {"number" | "bigint"} */
        #type
        /** @type {number | bigint} */
        #currentCount
        //#endregion
        /**
         * @returns {IteratorResult<number | bigint>}
         */
        next() {
            // Step 1 to 3 omitted. Private field will do the brand check
            const from = this.#from
            const to = this.#to
            const step = this.#step
            const type = this.#type
            if (type !== "bigint" && type !== "number") throw new TypeError()
            if (from === to) return CreateIterResultObject(undefined, true)
            const zero = type === "bigint" ? 0n : 0
            const one = type === "bigint" ? 1n : 1
            if (Number.isNaN(from) || Number.isNaN(to) || Number.isNaN(step))
                return CreateIterResultObject(undefined, true)
            const ifIncrease = to > from
            const ifStepIncrease = step > zero
            if (ifIncrease !== ifStepIncrease)
                return CreateIterResultObject(undefined, true)
            // Step 19
            const currentCount = this.#currentCount
            const currentYieldingValue = from + step * currentCount
            const nextCount = currentCount + one
            if (ifIncrease && currentYieldingValue >= to)
                return CreateIterResultObject(undefined, true)
            if (!ifIncrease && to >= currentYieldingValue)
                return CreateIterResultObject(undefined, true)
            this.#currentCount = nextCount
            return CreateIterResultObject(currentYieldingValue, false)
        }
        get from() {
            return this.#from
        }
        get to() {
            return this.#to
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
        value: (from, to, option) =>
            new RangeIterator(from, to, option, "number"),
        writable: true,
    })
    Object.defineProperty(BigInt, "range", {
        configurable: true,
        value: (from, to, option) =>
            new RangeIterator(from, to, option, "bigint"),
        writable: true,
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
})()
