import { getBaseURL } from "../env"

describe("getBaseURL", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it("returns env variable when set", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com"
    expect(getBaseURL()).toBe("https://example.com")
  })

  it("returns default localhost URL when env is not set", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL
    expect(getBaseURL()).toBe("https://localhost:8000")
  })
})
