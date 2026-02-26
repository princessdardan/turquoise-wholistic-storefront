import { sortProducts } from "../sort-products"
import { HttpTypes } from "@medusajs/types"

type SortOptions = "price_asc" | "price_desc" | "created_at"

const makeProduct = (
  id: string,
  price: number,
  createdAt?: string
): HttpTypes.StoreProduct =>
  ({
    id,
    created_at: createdAt || "2025-01-01T00:00:00Z",
    variants: [
      {
        id: `var_${id}`,
        calculated_price: { calculated_amount: price },
      },
    ],
  }) as unknown as HttpTypes.StoreProduct

describe("sortProducts", () => {
  const products = [
    makeProduct("p1", 30, "2025-01-01T00:00:00Z"),
    makeProduct("p2", 10, "2025-03-01T00:00:00Z"),
    makeProduct("p3", 50, "2025-02-01T00:00:00Z"),
  ]

  it("sorts by price ascending", () => {
    const sorted = sortProducts([...products], "price_asc" as SortOptions)
    expect(sorted.map((p) => p.id)).toEqual(["p2", "p1", "p3"])
  })

  it("sorts by price descending", () => {
    const sorted = sortProducts([...products], "price_desc" as SortOptions)
    expect(sorted.map((p) => p.id)).toEqual(["p3", "p1", "p2"])
  })

  it("sorts by created_at (newest first)", () => {
    const sorted = sortProducts([...products], "created_at" as SortOptions)
    expect(sorted.map((p) => p.id)).toEqual(["p2", "p3", "p1"])
  })

  it("handles products with no variants (sorts to end for price_asc)", () => {
    const noVariant = {
      id: "p4",
      variants: [],
      created_at: "2025-01-15T00:00:00Z",
    } as unknown as HttpTypes.StoreProduct
    const sorted = sortProducts(
      [...products, noVariant],
      "price_asc" as SortOptions
    )
    // Products without variants get Infinity price, should be last
    expect(sorted[sorted.length - 1].id).toBe("p4")
  })

  it("handles empty product array", () => {
    const sorted = sortProducts([], "price_asc" as SortOptions)
    expect(sorted).toEqual([])
  })
})
