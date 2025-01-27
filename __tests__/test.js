/// <reference path="../global.d.ts" />
require("../polyfill.js")

test("Iterator.range<number>", () => {
    expect(that(Iterator.range(-1, 5))).toMatchInlineSnapshot(`"-1f, 0f, 1f, 2f, 3f, 4f"`)
    expect(that(Iterator.range(-5, 1))).toMatchInlineSnapshot(`"-5f, -4f, -3f, -2f, -1f, 0f"`)
    expect(that(Iterator.range(0, 1, 0.1))).toMatchInlineSnapshot(
        `"0f, 0.1f, 0.2f, 0.30000000000000004f, 0.4f, 0.5f, 0.6000000000000001f, 0.7000000000000001f, 0.8f, 0.9f"`,
    )
    expect(that(Iterator.range(2 ** 53 - 1, 2 ** 53, { inclusive: true }))).toMatchInlineSnapshot(
        `"9007199254740991f, 9007199254740992f"`,
    )
    expect(that(Iterator.range(0, 0))).toMatchInlineSnapshot(`""`)
    expect(that(Iterator.range(0, -5, 1))).toMatchInlineSnapshot(`""`)
})

test("Iterator.range<bigint>", () => {
    expect(that(Iterator.range(-1n, 5n))).toMatchInlineSnapshot(`"-1n, 0n, 1n, 2n, 3n, 4n"`)
    expect(that(Iterator.range(-5n, 1n))).toMatchInlineSnapshot(`"-5n, -4n, -3n, -2n, -1n, 0n"`)
})

test("Range to infinity", () => {
    {
        let q = 0
        for (const i of Iterator.range(0, Infinity)) {
            q += i
            if (i >= 100) break
        }
        expect(q).toMatchInlineSnapshot(`5050`)
    }
    {
        let q = 0n
        for (const i of Iterator.range(0n, Infinity, { inclusive: true, step: 2n })) {
            q += i
            if (i >= 100) break
        }
        expect(q).toMatchInlineSnapshot(`2550n`)
    }
})

test("Use with Iterator helpers", () => {
    expect(that(Iterator.range(0, 10).take(5))).toMatchInlineSnapshot(`"0f, 1f, 2f, 3f, 4f"`)
    expect(that(Iterator.range(0, 10).map((x) => x * 2))).toMatchInlineSnapshot(
        `"0f, 2f, 4f, 6f, 8f, 10f, 12f, 14f, 16f, 18f"`,
    )
    expect(Iterator.range(0n, 10n).reduce((prev, curr) => prev + curr, 0n)).toMatchInlineSnapshot(`45n`)
})

test("Be an iterator", () => {
    const x = Iterator.range(0, 10)
    const iteratorPrototype = (function* () {})().__proto__.__proto__.__proto__
    expect(x.__proto__.__proto__ === iteratorPrototype).toBeTruthy()
})

test("NaN", () => {
    expect(() => Iterator.range(NaN, 0)).toThrowError()
    expect(() => Iterator.range(0, NaN)).toThrowError()
    expect(() => Iterator.range(NaN, NaN)).toThrowError()

    expect(() => Iterator.range(0, 0, { step: NaN })).toThrowError()
    expect(() => Iterator.range(0, 5, NaN)).toThrowError()
})

test("Step infer", () => {
    expect(that(Iterator.range(0, -2))).toMatchInlineSnapshot(`"0f, -1f"`)
    expect(that(Iterator.range(0n, -2n))).toMatchInlineSnapshot(`"0n, -1n"`)
    expect(that(Iterator.range(0, -2, { inclusive: true }))).toMatchInlineSnapshot(`"0f, -1f, -2f"`)
    expect(that(Iterator.range(0n, -2n, { inclusive: true }))).toMatchInlineSnapshot(`"0n, -1n, -2n"`)
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
        expect(() => Iterator.range(...each)).toThrowError()
        expect(() => Iterator.range(...each)).toThrowError()
    }
    expect(() => Iterator.range(0n, NaN)).toThrowError()
})

test("Error: Zero as step", () => {
    expect(() => Iterator.range(0, 10, 0)).toThrowError()
    expect(() => Iterator.range(0, 10, { step: 0 })).toThrowError()
    expect(() => Iterator.range(0n, 10n, 0n)).toThrowError()
    expect(() => Iterator.range(0n, 10n, { step: 0n })).toThrowError()
})

test("Error: Infinity as start / step", () => {
    expect(() => Iterator.range(Infinity, 10, 0)).toThrowError()
    expect(() => Iterator.range(-Infinity, 10, 0)).toThrowError()
    expect(() => Iterator.range(0, 10, Infinity)).toThrowError()
    expect(() => Iterator.range(0, 10, { step: Infinity })).toThrowError()
})

test("Incompatible receiver", () => {
    function* x() {}
    const y = x()
    const z = Iterator.range(0, 8)
    expect(() => z.next.call(y)).toThrow()
    expect(() => y.next.call(z)).toThrow()
    y.next()
})

test("Inclusive on same start-end (issue #38)", () => {
    expect(that(Iterator.range(0, 0, { inclusive: true }))).toMatchInlineSnapshot(`"0f"`)
})

function that(x) {
    return [...x].map((x) => x + (typeof x === "number" ? "f" : "n")).join(", ")
}
