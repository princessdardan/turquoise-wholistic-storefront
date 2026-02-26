"use server"

import { verifyTurnstileToken } from "@lib/util/turnstile"

/**
 * Server action to verify a Turnstile CAPTCHA token.
 * Used by client-side forms (like contact) that can't verify inline.
 */
export async function verifyTurnstile(
  token: string | null
): Promise<boolean> {
  return verifyTurnstileToken(token)
}
