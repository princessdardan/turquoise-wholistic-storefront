import { getPricesForVariant, getProductPrice } from "../get-product-price"
import { HttpTypes } from "@medusajs/types"

describe("getPricesForVariant", () => {
  it("returns null when variant has no calculated_price", () => {
    expect(getPricesForVariant({})).toBeNull()
    expect(getPricesForVariant(null)).toBeNull()
    expect(getPricesForVariant(undefined)).toBeNull()
  })

  it("returns null when calculated_amount is 0", () => {
    const variant = {
      calculated_price: { calculated_amount: 0, currency_code: "usd" },
    }
    expect(getPricesForVariant(variant)).toBeNull()
  })

  it("returns formatted prices for a non-sale variant", () => {
    const variant = {
      calculated_price: {
        calculated_amount: 29.99,
        original_amount: 29.99,
        currency_code: "usd",
        calculated_price: { price_list_type: null },
      },
    }

    const result = getPricesForVariant(variant)!
    expect(result.calculated_price_number).toBe(29.99)
    expect(result.original_price_number).toBe(29.99)
    expect(result.currency_code).toBe("usd")
    expect(result.calculated_price).toBe("$29.99")
    expect(result.original_price).toBe("$29.99")
    expect(result.is_on_sale).toBe(false)
  })

  it("detects sale from price_list_type", () => {
    const variant = {
      calculated_price: {
        calculated_amount: 19.99,
        original_amount: 29.99,
        currency_code: "usd",
        calculated_price: { price_list_type: "sale" },
      },
    }

    const result = getPricesForVariant(variant)!
    expect(result.is_on_sale).toBe(true)
    expect(result.price_type).toBe("sale")
  })

  it("detects sale from compare-at pricing (original > calculated)", () => {
    const variant = {
      calculated_price: {
        calculated_amount: 15,
        original_amount: 25,
        currency_code: "cad",
        calculated_price: { price_list_type: null },
      },
    }

    const result = getPricesForVariant(variant)!
    expect(result.is_on_sale).toBe(true)
    expect(result.percentage_diff).toBe("40")
  })
})

describe("getProductPrice", () => {
  const makeProduct = (
    variants: any[],
    id = "prod_1"
  ): HttpTypes.StoreProduct =>
    ({ id, variants }) as unknown as HttpTypes.StoreProduct

  it("throws when no product is provided", () => {
    expect(() =>
      getProductPrice({ product: null as any })
    ).toThrow("No product provided")
  })

  it("throws when product has no id", () => {
    expect(() =>
      getProductPrice({ product: {} as any })
    ).toThrow("No product provided")
  })

  it("returns cheapestPrice as null when no variants", () => {
    const product = makeProduct([])
    const result = getProductPrice({ product })
    expect(result.cheapestPrice).toBeNull()
  })

  it("returns the cheapest variant price", () => {
    const product = makeProduct([
      {
        id: "var_1",
        calculated_price: {
          calculated_amount: 50,
          original_amount: 50,
          currency_code: "usd",
          calculated_price: {},
        },
      },
      {
        id: "var_2",
        calculated_price: {
          calculated_amount: 25,
          original_amount: 25,
          currency_code: "usd",
          calculated_price: {},
        },
      },
    ])

    const result = getProductPrice({ product })
    expect(result.cheapestPrice?.calculated_price_number).toBe(25)
  })

  it("returns variantPrice when variantId matches id", () => {
    const product = makeProduct([
      {
        id: "var_1",
        sku: "SKU-1",
        calculated_price: {
          calculated_amount: 50,
          original_amount: 50,
          currency_code: "usd",
          calculated_price: {},
        },
      },
    ])

    const result = getProductPrice({ product, variantId: "var_1" })
    expect(result.variantPrice?.calculated_price_number).toBe(50)
  })

  it("returns variantPrice when variantId matches sku", () => {
    const product = makeProduct([
      {
        id: "var_1",
        sku: "SKU-ABC",
        calculated_price: {
          calculated_amount: 35,
          original_amount: 35,
          currency_code: "usd",
          calculated_price: {},
        },
      },
    ])

    const result = getProductPrice({ product, variantId: "SKU-ABC" })
    expect(result.variantPrice?.calculated_price_number).toBe(35)
  })

  it("returns null variantPrice when variantId not found", () => {
    const product = makeProduct([
      {
        id: "var_1",
        calculated_price: {
          calculated_amount: 50,
          original_amount: 50,
          currency_code: "usd",
          calculated_price: {},
        },
      },
    ])

    const result = getProductPrice({ product, variantId: "var_999" })
    expect(result.variantPrice).toBeNull()
  })

  it("returns null variantPrice when no variantId provided", () => {
    const product = makeProduct([
      {
        id: "var_1",
        calculated_price: {
          calculated_amount: 50,
          original_amount: 50,
          currency_code: "usd",
          calculated_price: {},
        },
      },
    ])

    const result = getProductPrice({ product })
    expect(result.variantPrice).toBeNull()
  })
})
