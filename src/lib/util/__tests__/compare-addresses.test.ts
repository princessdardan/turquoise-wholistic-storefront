import compareAddresses from "../compare-addresses"

const baseAddress = {
  first_name: "Jane",
  last_name: "Doe",
  address_1: "123 Main St",
  company: "Acme",
  postal_code: "K1A 0B1",
  city: "Ottawa",
  country_code: "ca",
  province: "Ontario",
  phone: "+16135551234",
}

describe("compareAddresses", () => {
  it("returns true for identical addresses", () => {
    expect(compareAddresses(baseAddress, { ...baseAddress })).toBe(true)
  })

  it("returns false when first_name differs", () => {
    expect(
      compareAddresses(baseAddress, { ...baseAddress, first_name: "John" })
    ).toBe(false)
  })

  it("returns false when city differs", () => {
    expect(
      compareAddresses(baseAddress, { ...baseAddress, city: "Toronto" })
    ).toBe(false)
  })

  it("ignores extra fields not in the comparison set", () => {
    const addr1 = { ...baseAddress, extra_field: "foo" }
    const addr2 = { ...baseAddress, extra_field: "bar" }
    expect(compareAddresses(addr1, addr2)).toBe(true)
  })

  it("returns true when both are undefined", () => {
    expect(compareAddresses(undefined, undefined)).toBe(true)
  })

  it("returns true when both are null", () => {
    expect(compareAddresses(null, null)).toBe(true)
  })
})
