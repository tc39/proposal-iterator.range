// @ts-check
/// <reference path="./global.d.ts" />
// This polyfill requires: globalThis, BigInt
;(() => {
    /**
     * @template {number | bigint} T
     * @param {T} start
     * @param {T | number | undefined} end
     * @param {T | undefined | null | { step?: T, inclusive?: boolean }} option
     * @param {"number" | "bigint"} type
     */
    function CreateRangeIterator(start, end, option, type) {
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
        function* closure() {
            if (start === end) return
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
                currentCount++
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
        const iterator = closure()
        Object.setPrototypeOf(iterator, RangeIterator.prototype)
        internalSlots.set(iterator, { start, end, step, inclusiveEnd })
        return iterator
    }
    const generatorPrototype = Object.getPrototypeOf(Object.getPrototypeOf((function* () {})()))
    const origNext = generatorPrototype.next
    generatorPrototype.next = new Proxy(origNext, {
        apply(target, thisArg, args) {
            if (internalSlots.has(thisArg)) {
                throw new TypeError()
            }
            return Reflect.apply(target, thisArg, args)
        },
    })
    class RangeIterator {
        next() {
            getInternalSlots(this)
            return origNext.call(this)
        }
        get start() {
            return getInternalSlots(this).start
        }
        get end() {
            return getInternalSlots(this).end
        }
        get step() {
            return getInternalSlots(this).step
        }
        get inclusive() {
            return getInternalSlots(this).inclusiveEnd
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
        value: (start, end, option) => CreateRangeIterator(start, end, option, "number"),
    })
    Object.defineProperty(BigInt, "range", {
        configurable: true,
        writable: true,
        value: (start, end, option) => CreateRangeIterator(start, end, option, "bigint"),
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
    /**
     * @type WeakMap<Generator, {start: any, end: any, inclusiveEnd: boolean, step: any}>
     */
    const internalSlots = new WeakMap()
    function getInternalSlots(obj) {
        if (internalSlots.has(obj)) return internalSlots.get(obj)
        throw new TypeError()
    }
})()
