/// <reference path="../global.d.ts" />
require("../polyfill.js")
require("core-js/proposals/iterator-helpers")

test("Number.range", () => {
    expect(that(Number.range(-1, 5))).toMatchInlineSnapshot(`"-1f, 0f, 1f, 2f, 3f, 4f"`)
    expect(that(Number.range(-5, 1))).toMatchInlineSnapshot(`"-5f, -4f, -3f, -2f, -1f, 0f"`)
    expect(that(Number.range(0, 1, 0.1))).toMatchInlineSnapshot(
        `"0f, 0.1f, 0.2f, 0.30000000000000004f, 0.4f, 0.5f, 0.6000000000000001f, 0.7000000000000001f, 0.8f, 0.9f"`
    )
    expect(that(Number.range(2 ** 53 - 1, 2 ** 53, { inclusive: true }))).toMatchInlineSnapshot(
        `"9007199254740991f, 9007199254740992f"`
    )
    expect(that(Number.range(0, 0))).toMatchInlineSnapshot(`""`)
    expect(that(Number.range(0, -5, 1))).toMatchInlineSnapshot(`""`)
})

test("BigInt.range", () => {
    expect(that(BigInt.range(-1n, 5n))).toMatchInlineSnapshot(`"-1n, 0n, 1n, 2n, 3n, 4n"`)
    expect(that(BigInt.range(-5n, 1n))).toMatchInlineSnapshot(`"-5n, -4n, -3n, -2n, -1n, 0n"`)
})

test("Range to infinity", () => {
    {
        let q = 0
        for (const i of Number.range(0, Infinity)) {
            q += i
            if (i >= 100) break
        }
        expect(q).toMatchInlineSnapshot(`5050`)
    }
    {
        let q = 0n
        for (const i of BigInt.range(0n, Infinity, { inclusive: true, step: 2n })) {
            q += i
            if (i >= 100) break
        }
        expect(q).toMatchInlineSnapshot(`2550n`)
    }
})

test("Use with Iterator helpers", () => {
    expect(that(Number.range(0, 10).take(5))).toMatchInlineSnapshot(`"0f, 1f, 2f, 3f, 4f"`)
    expect(that(Number.range(0, 10).map((x) => x * 2))).toMatchInlineSnapshot(
        `"0f, 2f, 4f, 6f, 8f, 10f, 12f, 14f, 16f, 18f"`
    )
    expect(BigInt.range(0n, 10n).reduce((prev, curr) => prev + curr, 0n)).toMatchInlineSnapshot(`45n`)
})

test("Be an iterator", () => {
    const x = Number.range(0, 10)
    const iteratorPrototype = (function* () {})().__proto__.__proto__.__proto__
    expect(x.__proto__.__proto__ === iteratorPrototype).toBeTruthy()
})

test("NaN", () => {
    expect(that(Number.range(NaN, 0))).toMatchInlineSnapshot(`""`)
    expect(that(Number.range(0, NaN))).toMatchInlineSnapshot(`""`)
    expect(that(Number.range(NaN, NaN))).toMatchInlineSnapshot(`""`)

    expect(that(Number.range(0, 0, { step: NaN }))).toMatchInlineSnapshot(`""`)
    expect(that(Number.range(0, 5, NaN))).toMatchInlineSnapshot(`""`)
})

test("{from, to, step} getter", () => {
    {
        const a = Number.range(1, 3)
        expect(a.start).toMatchInlineSnapshot(`1`)
        expect(a.end).toMatchInlineSnapshot(`3`)
        expect(a.step).toMatchInlineSnapshot(`1`)
        expect(a.isInclusiveEnd).toMatchInlineSnapshot(`false`)
    }
    {
        const a = Number.range(-1, -3, { inclusive: true })
        expect(a.start).toMatchInlineSnapshot(`-1`)
        expect(a.end).toMatchInlineSnapshot(`-3`)
        expect(a.step).toMatchInlineSnapshot(`-1`)
        expect(a.isInclusiveEnd).toMatchInlineSnapshot(`true`)
    }
    {
        const a = Number.range(-1, -3, { step: 4, inclusive: function () {} })
        expect(a.start).toMatchInlineSnapshot(`-1`)
        expect(a.end).toMatchInlineSnapshot(`-3`)
        expect(a.step).toMatchInlineSnapshot(`4`)
        expect(a.isInclusiveEnd).toMatchInlineSnapshot(`true`)
    }
    {
        const a = Number.range(0, 5)
        expect(() => Object.getOwnPropertyDescriptor(a, "start").call({})).toThrow()
    }
})

test("Step infer", () => {
    expect(that(Number.range(0, -2))).toMatchInlineSnapshot(`"0f, -1f"`)
    expect(that(BigInt.range(0n, -2n))).toMatchInlineSnapshot(`"0n, -1n"`)
    expect(that(Number.range(0, -2, { inclusive: true }))).toMatchInlineSnapshot(`"0f, -1f, -2f"`)
    expect(that(BigInt.range(0n, -2n, { inclusive: true }))).toMatchInlineSnapshot(`"0n, -1n, -2n"`)
})

test("Error handling: Type Mismatch", () => {
    const sharedMatrix = [
        [],
        [0],
        [0n],
        [0, 1, function () {}],
        [0n, 1n, function () {}],
        [0, function () {}, 2],
        [function () {}, 2, 2],
        [0n, 1],
        [0n, 1, 1],
        [0n, 1, { step: 1 }],
        [0, 1n],
        [0, 1n, 1],
        [0, 1n, { step: 1 }],
        [0, 1, 1n],
        [0, 1, { step: 1n }],
        //
        [0, 1n, 1n],
        [0, 1n, { step: 1n }],
        [0n, 1, 1n],
        [0n, 1, { step: 1n }],
        [0n, 1n, 1],
        [0n, 1n, { step: 1 }],
    ]
    for (const each of sharedMatrix) {
        expect(() => Number.range(...each)).toThrowError()
        expect(() => BigInt.range(...each)).toThrowError()
    }
    expect(() => Number.range(0n, 1n)).toThrowError()
    expect(() => Number.range(0n, 1n, 1n)).toThrowError()
    expect(() => Number.range(0n, 1n, { step: 1n })).toThrowError()
    expect(() => BigInt.range(0, 1)).toThrowError()
    expect(() => BigInt.range(0n, NaN)).toThrowError()
    expect(() => BigInt.range(0, 1, 1)).toThrowError()
    expect(() => BigInt.range(0, 1, { step: 1 })).toThrowError()
})

test("Error: Zero as step", () => {
    expect(() => Number.range(0, 10, 0)).toThrowError()
    expect(() => Number.range(0, 10, { step: 0 })).toThrowError()
    expect(() => BigInt.range(0n, 10n, 0n)).toThrowError()
    expect(() => BigInt.range(0n, 10n, { step: 0n })).toThrowError()
})

test("Error: Infinity as start / step", () => {
    expect(() => Number.range(Infinity, 10, 0)).toThrowError()
    expect(() => Number.range(-Infinity, 10, 0)).toThrowError()
    expect(() => Number.range(0, 10, Infinity)).toThrowError()
    expect(() => Number.range(0, 10, { step: Infinity })).toThrowError()
})

test("Incompatible receiver", () => {
    function* x() {}
    const y = x()
    const z = Number.range(0, 8)
    expect(() => z.next.call(y)).toThrow()
    expect(() => y.next.call(z)).toThrow()
    y.next()
})

test("Inclusive on same start-end (issue #38)", () => {
    expect(that(Number.range(0, 0, { inclusive: true }))).toMatchInlineSnapshot(`"0f"`)
})

function that(x) {
    return [...x].map((x) => x + (typeof x === "number" ? "f" : "n")).join(", ")
}
