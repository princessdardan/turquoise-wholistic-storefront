import { convertToLocale } from "../money"

describe("convertToLocale", () => {
  it("formats USD amounts with default locale (en-US)", () => {
    const result = convertToLocale({ amount: 19.99, currency_code: "usd" })
    expect(result).toBe("$19.99")
  })

  it("formats CAD amounts", () => {
    const result = convertToLocale({
      amount: 25.5,
      currency_code: "cad",
      locale: "en-CA",
    })
    expect(result).toContain("25.50")
  })

  it("formats EUR amounts with locale", () => {
    const result = convertToLocale({
      amount: 100,
      currency_code: "eur",
      locale: "de-DE",
    })
    // German locale uses comma for decimals
    expect(result).toContain("100")
  })

  it("respects minimumFractionDigits", () => {
    const result = convertToLocale({
      amount: 10,
      currency_code: "usd",
      minimumFractionDigits: 0,
    })
    expect(result).toBe("$10")
  })

  it("respects maximumFractionDigits", () => {
    const result = convertToLocale({
      amount: 9.999,
      currency_code: "usd",
      maximumFractionDigits: 2,
    })
    expect(result).toBe("$10.00")
  })

  it("returns plain string when currency_code is empty", () => {
    const result = convertToLocale({ amount: 42, currency_code: "" })
    expect(result).toBe("42")
  })

  it("handles zero amount", () => {
    const result = convertToLocale({ amount: 0, currency_code: "usd" })
    expect(result).toBe("$0.00")
  })

  it("handles large amounts", () => {
    const result = convertToLocale({ amount: 1234567.89, currency_code: "usd" })
    expect(result).toBe("$1,234,567.89")
  })
})
