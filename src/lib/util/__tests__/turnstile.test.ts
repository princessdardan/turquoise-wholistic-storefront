import { verifyTurnstileToken, isHoneypotFilled } from "../turnstile"

describe("verifyTurnstileToken", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    jest.restoreAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it("returns true (graceful degradation) when secret key is not configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    const result = await verifyTurnstileToken("some-token")
    expect(result).toBe(true)
  })

  it("returns false when secret key is set but no token provided", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret"
    const result = await verifyTurnstileToken(null)
    expect(result).toBe(false)
  })

  it("returns true when Cloudflare verification succeeds", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret"
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    })

    const result = await verifyTurnstileToken("valid-token")
    expect(result).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" })
    )
  })

  it("returns false when Cloudflare verification fails", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret"
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    })

    const result = await verifyTurnstileToken("invalid-token")
    expect(result).toBe(false)
  })
})

describe("isHoneypotFilled", () => {
  it("returns true when honeypot field has content (bot detected)", () => {
    const formData = new FormData()
    formData.set("website_url", "http://spam.com")
    expect(isHoneypotFilled(formData)).toBe(true)
  })

  it("returns false when honeypot field is empty", () => {
    const formData = new FormData()
    formData.set("website_url", "")
    expect(isHoneypotFilled(formData)).toBe(false)
  })

  it("returns false when honeypot field is not present", () => {
    const formData = new FormData()
    expect(isHoneypotFilled(formData)).toBe(false)
  })
})
