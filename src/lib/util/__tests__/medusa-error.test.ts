import medusaError from "../medusa-error"

describe("medusaError", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("throws formatted message from response data", () => {
    const error = {
      response: {
        data: { message: "product not found" },
        status: 404,
        headers: {},
      },
      config: { url: "/products/123", baseURL: "http://localhost:9000" },
    }

    expect(() => medusaError(error)).toThrow("Product not found.")
  })

  it("capitalizes first letter and adds period", () => {
    const error = {
      response: {
        data: { message: "invalid request body" },
        status: 400,
        headers: {},
      },
      config: { url: "/cart", baseURL: "http://localhost:9000" },
    }

    expect(() => medusaError(error)).toThrow("Invalid request body.")
  })

  it("handles string response data (no message field)", () => {
    const error = {
      response: {
        data: "something went wrong",
        status: 500,
        headers: {},
      },
      config: { url: "/store", baseURL: "http://localhost:9000" },
    }

    expect(() => medusaError(error)).toThrow("Something went wrong.")
  })

  it("throws for request errors (no response)", () => {
    const error = {
      request: "XMLHttpRequest",
    }

    expect(() => medusaError(error)).toThrow(
      "No response received: XMLHttpRequest"
    )
  })

  it("throws for setup errors (no request, no response)", () => {
    const error = {
      message: "Network Error",
    }

    expect(() => medusaError(error)).toThrow(
      "Error setting up the request: Network Error"
    )
  })
})
