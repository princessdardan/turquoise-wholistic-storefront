import { isObject, isArray, isEmpty } from "../isEmpty"

describe("isObject", () => {
  it("returns true for plain objects", () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ key: "value" })).toBe(true)
  })

  it("returns true for arrays (arrays are objects)", () => {
    expect(isObject([])).toBe(true)
  })

  it("returns false for primitives", () => {
    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
    expect(isObject(42)).toBe(false)
    expect(isObject("string")).toBe(false)
    expect(isObject(true)).toBe(false)
  })
})

describe("isArray", () => {
  it("returns true for arrays", () => {
    expect(isArray([])).toBe(true)
    expect(isArray([1, 2, 3])).toBe(true)
  })

  it("returns false for non-arrays", () => {
    expect(isArray({})).toBe(false)
    expect(isArray("string")).toBe(false)
    expect(isArray(null)).toBe(false)
  })
})

describe("isEmpty", () => {
  it("returns true for null and undefined", () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
  })

  it("returns true for empty objects", () => {
    expect(isEmpty({})).toBe(true)
  })

  it("returns true for empty arrays", () => {
    expect(isEmpty([])).toBe(true)
  })

  it("returns true for empty/whitespace strings", () => {
    expect(isEmpty("")).toBe(true)
    expect(isEmpty("   ")).toBe(true)
    expect(isEmpty("\t\n")).toBe(true)
  })

  it("returns false for non-empty objects", () => {
    expect(isEmpty({ key: "value" })).toBe(false)
  })

  it("returns false for non-empty arrays", () => {
    expect(isEmpty([1])).toBe(false)
  })

  it("returns false for non-empty strings", () => {
    expect(isEmpty("hello")).toBe(false)
  })

  it("returns false for numbers", () => {
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(42)).toBe(false)
  })
})
