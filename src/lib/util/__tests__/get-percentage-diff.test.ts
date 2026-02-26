import { getPercentageDiff } from "../get-percentage-diff"

describe("getPercentageDiff", () => {
  it("calculates correct percentage for a 50% discount", () => {
    expect(getPercentageDiff(100, 50)).toBe("50")
  })

  it("calculates correct percentage for a 25% discount", () => {
    expect(getPercentageDiff(200, 150)).toBe("25")
  })

  it("returns 0 when prices are equal", () => {
    expect(getPercentageDiff(100, 100)).toBe("0")
  })

  it("returns negative when calculated > original", () => {
    expect(getPercentageDiff(100, 120)).toBe("-20")
  })

  it("handles decimal results (rounds)", () => {
    // 33.33...% → rounds to "33"
    expect(getPercentageDiff(150, 100)).toBe("33")
  })

  it("handles small values", () => {
    expect(getPercentageDiff(1, 0.5)).toBe("50")
  })
})
