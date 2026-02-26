const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify"

/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Returns true if verification passes or if Turnstile is not configured
 * (graceful degradation when env vars are missing).
 */
export async function verifyTurnstileToken(
  token: string | null
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  // If Turnstile is not configured, skip verification (graceful degradation)
  if (!secretKey) return true

  // If configured but no token provided, reject
  if (!token) return false

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  })

  const data = await response.json()
  return data.success === true
}

/**
 * Checks if the honeypot field was filled (indicating a bot).
 * Returns true if the submission is from a bot.
 */
export function isHoneypotFilled(formData: FormData): boolean {
  const honeypot = formData.get("website_url")
  return typeof honeypot === "string" && honeypot.length > 0
}
