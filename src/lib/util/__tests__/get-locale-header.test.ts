jest.mock("@lib/data/locale-actions", () => ({
  getLocale: jest.fn().mockResolvedValue("en-CA"),
}))

import { getLocaleHeader } from "../get-locale-header"

describe("getLocaleHeader", () => {
  it("returns x-medusa-locale header from getLocale()", async () => {
    const header = await getLocaleHeader()
    expect(header).toEqual({ "x-medusa-locale": "en-CA" })
  })
})
