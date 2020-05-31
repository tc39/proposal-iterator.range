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
     * This flag treat `range(to)` as `range(0, to)`
     */
    const isAcceptAlias = false
    /** @template {number | bigint} T */
    class RangeIterator {
        /**
         * @param {T} from
         * @param {T | number | undefined} to
         * @param {T | undefined | null | { step?: T }} option
         * @param {"number" | "bigint"} type
         */
        constructor(from, to, option, type) {
            if (typeof from !== type) throw new TypeError()
            if (type !== "number" && type !== "bigint") throw new TypeError() // @ts-ignore
            /** @type {T} */ const zero = type === "bigint" ? 0n : 0 // @ts-ignore
            /** @type {T} */ const one = type === "bigint" ? 1n : 1
            if (isAcceptAlias === false) {
            } else if (typeof to === "undefined") {
                // range(to) equals to range(zero, to)
                to = from
                from = zero
            }
            if (typeof from !== type) throw new TypeError()
            // Allowing all kinds of number (number, bigint, decimals, ...) to range from a finite number to infinity.
            if (!isInfinity(to) && typeof to !== type) throw new TypeError()
            if (isInfinity(from)) throw RangeError()
            const ifIncrease = to > from
            /** @type {T} */ let step
            if (typeof option === "undefined" || option === null) {
                if (ifIncrease) step = one
                // @ts-ignore
                else step = -one
            } else if (typeof option === "object") step = option.step
            else if (typeof option === type) step = option
            else throw new TypeError()
            if (isInfinity(step)) throw RangeError()
            if (step === zero && from !== to) throw new RangeError()
            this.#from = from
            this.#to = to
            this.#step = step
            this.#type = type
            this.#currentCount = zero
            return this
        }
        //#region internal slots
        /** @type {T} */ #from
        /** @type {number | bigint} */ #to
        /** @type {T} */ #step
        /** @type {"number" | "bigint"} */ #type
        /** @type {T} */ #currentCount
        //#endregion
        /**
         * @returns {IteratorResult<T>}
         */
        next() {
            const from = this.#from
            const to = this.#to
            const step = this.#step
            const type = this.#type
            if (type !== "bigint" && type !== "number") throw new TypeError()
            if (from === to) return CreateIterResultObject(undefined, true) // @ts-ignore
            /** @type {T} */ const zero = type === "bigint" ? 0n : 0 // @ts-ignore
            /** @type {T} */ const one = type === "bigint" ? 1n : 1
            if (Number.isNaN(from) || Number.isNaN(to) || Number.isNaN(step))
                return CreateIterResultObject(undefined, true)
            const ifIncrease = to > from
            const ifStepIncrease = step > zero
            if (ifIncrease !== ifStepIncrease)
                return CreateIterResultObject(undefined, true)
            const currentCount = this.#currentCount // @ts-ignore
            const currentYieldingValue = from + step * currentCount // @ts-ignore
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
        writable: true,
        value: (from, to, option) =>
            new RangeIterator(from, to, option, "number"),
    })
    Object.defineProperty(BigInt, "range", {
        configurable: true,
        writable: true,
        value: (from, to, option) =>
            new RangeIterator(from, to, option, "bigint"),
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
