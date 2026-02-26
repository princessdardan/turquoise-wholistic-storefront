"use client"

import { Turnstile as TurnstileWidget } from "@marsidev/react-turnstile"

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/**
 * Cloudflare Turnstile CAPTCHA widget.
 * Renders nothing if NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set,
 * allowing forms to degrade gracefully in development.
 */
const TurnstileField = ({ className }: { className?: string }) => {
  if (!siteKey) return null

  return (
    <div className={className}>
      <TurnstileWidget
        siteKey={siteKey}
        options={{ theme: "light", size: "flexible" }}
      />
    </div>
  )
}

export default TurnstileField
