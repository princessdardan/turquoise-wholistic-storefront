import { isSimpleProduct } from "../product"
import { HttpTypes } from "@medusajs/types"

const makeProduct = (
  options: { values: { value: string }[] }[]
): HttpTypes.StoreProduct =>
  ({
    id: "prod_1",
    options: options.map((o, i) => ({
      id: `opt_${i}`,
      title: `Option ${i}`,
      values: o.values.map((v, j) => ({ id: `val_${j}`, ...v })),
    })),
  }) as unknown as HttpTypes.StoreProduct

describe("isSimpleProduct", () => {
  it("returns true for product with one option and one value", () => {
    const product = makeProduct([{ values: [{ value: "Default" }] }])
    expect(isSimpleProduct(product)).toBe(true)
  })

  it("returns false for product with multiple options", () => {
    const product = makeProduct([
      { values: [{ value: "S" }] },
      { values: [{ value: "Red" }] },
    ])
    expect(isSimpleProduct(product)).toBe(false)
  })

  it("returns false for product with one option but multiple values", () => {
    const product = makeProduct([
      { values: [{ value: "S" }, { value: "M" }, { value: "L" }] },
    ])
    expect(isSimpleProduct(product)).toBe(false)
  })

  it("returns false for product with no options", () => {
    const product = { id: "prod_1", options: [] } as unknown as HttpTypes.StoreProduct
    expect(isSimpleProduct(product)).toBe(false)
  })
})
