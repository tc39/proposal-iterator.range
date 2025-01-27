// @ts-check
/// <reference path="./global.d.ts" />
console.warn(`This is an experimental implementation of the range proposal (https://github.com/tc39/proposal-Number.range) of ECMAScript.
It _will_ be changed if the specification has changed.
It should only be used to collect developers feedback about the APIs.`)
// This polyfill requires: globalThis, BigInt, private fields
;(() => {
    /**
     * @param {*} condition
     * @returns {asserts condition}
     */
    function assert(condition) {
        if (!condition) throw new SpecAssertError()
    }
    class SpecAssertError extends Error {}
    const SpecValue = {
        BigIntRange: Symbol(),
        NumberRange: Symbol(),
    }
    const generatorPrototype = Object.getPrototypeOf(Object.getPrototypeOf((function* () {})()))
    const origNext = generatorPrototype.next
    /** @type {(o: any) => boolean} */
    let isRangeIterator
    if (Object.getOwnPropertyDescriptor(generatorPrototype, "next").writable) {
        generatorPrototype.next = new Proxy(origNext, {
            apply(target, thisArg, args) {
                if (isRangeIterator(thisArg)) throw new TypeError()
                return Reflect.apply(target, thisArg, args)
            },
        })
    }

    /**
     * @template {number | bigint} T
     * @param {T} start
     * @param {T | number | undefined} end
     * @param {T} step
     * @param {boolean} inclusiveEnd
     * @param {T} zero
     * @param {T} one
     */
    function* NumericRangeIteratorObject(start, end, step, inclusiveEnd, zero, one) {
        let ifIncrease
        if (end === Infinity) ifIncrease = true
        else if (end === -Infinity) ifIncrease = false
        else {
            assert(typeof start === typeof end)
            if (end > start) ifIncrease = true
            else ifIncrease = false
        }
        let ifStepIncrease = step > zero
        if (ifIncrease !== ifStepIncrease) return
        let hitsEnd = false
        let currentCount = zero
        while (hitsEnd === false) {
            // @ts-ignore
            let currentYieldingValue = start + step * currentCount
            if (currentYieldingValue === end) hitsEnd = true // @ts-ignore
            currentCount = currentCount + one
            // ifIncrease && inclusiveEnd && currentYieldingValue > end
            if (ifIncrease) {
                assert(
                    ((end === Infinity || typeof end === "bigint") && typeof currentYieldingValue === "bigint") ||
                        (typeof end === "number" && typeof currentYieldingValue === "number"),
                )
                if (end !== Infinity) {
                    if (inclusiveEnd) {
                        if (currentYieldingValue > end) return
                    } else {
                        if (currentYieldingValue >= end) return
                    }
                }
            } else {
                assert(
                    ((end === -Infinity || typeof end === "bigint") && typeof currentYieldingValue === "bigint") ||
                        (typeof end === "number" && typeof currentYieldingValue === "number"),
                )
                if (end !== -Infinity) {
                    if (inclusiveEnd) {
                        if (end > currentYieldingValue) return
                    } else {
                        if (end >= currentYieldingValue) return
                    }
                }
            }
            yield currentYieldingValue
        }
        return undefined
    }
    /**
     * @param {Parameters<typeof NumericRangeIteratorObject>} args
     */
    function CreateNumericRangeIteratorWithInternalSlot(...args) {
        const g = NumericRangeIteratorObject(...args)
        Reflect.setPrototypeOf(g, new.target.prototype)
        return g
    }
    /**
     * @template {number | bigint} T
     */ // @ts-ignore
    class NumericRangeIterator extends CreateNumericRangeIteratorWithInternalSlot {
        /**
         * @param {T} start
         * @param {T | number | undefined} end
         * @param {T | undefined | null | { step?: T, inclusive?: boolean }} optionOrStep
         * @param {(typeof SpecValue)[keyof typeof SpecValue]} type
         */ // @ts-ignore
        constructor(start, end, optionOrStep, type) {
            if (isNaN(start) || isNaN(end)) throw new RangeError()
            /** @type {T} */ let zero
            /** @type {T} */ let one
            if (type === SpecValue.NumberRange) {
                assert(typeof start === "number")
                if (typeof end !== "number") throw new TypeError() // @ts-ignore
                zero = 0 // @ts-ignore
                one = 1
            } else {
                assert(typeof start === "bigint")
                // Allowing all kinds of number (number, bigint, decimals, ...) to range from a finite number to infinity.
                if (!isInfinity(end) && typeof end !== "bigint") throw new TypeError() // @ts-expect-error
                zero = 0n // @ts-expect-error
                one = 1n
            }
            if (isInfinity(start)) throw RangeError()
            let inclusiveEnd = false

            /** @type {T} */ let step
            if (optionOrStep === undefined || optionOrStep === null) step = undefined
            else if (typeof optionOrStep === "object") {
                step = optionOrStep.step
                inclusiveEnd = Boolean(optionOrStep.inclusive)
            } //
            else if (type === SpecValue.NumberRange && typeof optionOrStep === "number") step = optionOrStep
            else if (type === SpecValue.BigIntRange && typeof optionOrStep === "bigint") step = optionOrStep
            else throw new TypeError()
            if (isNaN(step)) throw new RangeError()
            if (step === undefined || step === null) {
                if (end === Infinity)
                    step = one // @ts-ignore
                else if (end === -Infinity) step = -one
                else {
                    assert(typeof end === typeof start)
                    if (end > start)
                        step = one // @ts-ignore
                    else step = -one
                }
            }

            if (type === SpecValue.NumberRange && typeof step !== "number") throw new TypeError()
            if (type === SpecValue.BigIntRange && typeof step !== "bigint") throw new TypeError()

            if (isInfinity(step)) throw RangeError()
            if (step === zero && start !== end) throw new RangeError()
            const obj = super(start, end, step, inclusiveEnd, zero, one) // @ts-ignore
            return obj
        }
        #brandCheck
        next() {
            this.#brandCheck
            return origNext.call(this)
        }
        static {
            isRangeIterator = (o) => #brandCheck in o
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
    Object.defineProperty(Iterator, "range", {
        configurable: true,
        writable: true,
        value: (start, end, optionOrStep) => {
            if (typeof start === "number")
                return new NumericRangeIterator(start, end, optionOrStep, SpecValue.NumberRange)
            if (typeof start === "bigint")
                return new NumericRangeIterator(start, end, optionOrStep, SpecValue.BigIntRange)
            throw new TypeError("Iterator.range only supports number and bigint.")
        },
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
