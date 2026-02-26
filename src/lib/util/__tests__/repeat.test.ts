import repeat from "../repeat"

describe("repeat", () => {
  it("generates array of correct length", () => {
    expect(repeat(5)).toHaveLength(5)
  })

  it("generates sequential keys starting from 0", () => {
    expect(repeat(4)).toEqual([0, 1, 2, 3])
  })

  it("returns empty array for 0", () => {
    expect(repeat(0)).toEqual([])
  })

  it("returns single-element array for 1", () => {
    expect(repeat(1)).toEqual([0])
  })
})
