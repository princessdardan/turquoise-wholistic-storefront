import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (process.env.MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL
}

// Channel-specific publishable keys (fall back to the original single key)
export const RETAIL_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_RETAIL_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
export const PROFESSIONAL_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PROFESSIONAL_PUBLISHABLE_KEY

// Client-side active key — updated by MedusaClientProvider when the channel changes
let activePublishableKey: string | undefined = RETAIL_PUBLISHABLE_KEY

export function setActivePublishableKey(key: string | undefined) {
  activePublishableKey = key
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: RETAIL_PUBLISHABLE_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? ({} as Record<string, string | null>)

  // Determine the correct publishable key for this request
  let publishableKey: string | undefined
  try {
    // Server-side: read channel from cookie
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const channel = cookieStore.get("tw-channel")?.value
    publishableKey =
      channel === "professional"
        ? PROFESSIONAL_PUBLISHABLE_KEY
        : RETAIL_PUBLISHABLE_KEY
  } catch {
    // Client-side: use the global set by MedusaClientProvider
    publishableKey = activePublishableKey
  }

  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey
  }

  // Inject locale header
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
