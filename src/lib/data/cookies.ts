import "server-only"
import { cookies as nextCookies } from "next/headers"

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

/**
 * Migrates legacy dual-cart cookies (tw-cart-retail / tw-cart-professional) to
 * the standard _medusa_cart_id cookie. Picks the first non-empty value found.
 * MUST only be called from a Server Action or Route Handler context.
 */
export const migrateLegacyCartCookies = async () => {
  const cookies = await nextCookies()
  const existing = cookies.get("_medusa_cart_id")?.value

  // Already has a standard cart cookie — nothing to migrate
  if (existing) return

  const retailCartId = cookies.get("tw-cart-retail")?.value
  const professionalCartId = cookies.get("tw-cart-professional")?.value
  const cartId = retailCartId || professionalCartId

  if (cartId) {
    cookies.set("_medusa_cart_id", cartId, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
  }

  // Clean up legacy cookies regardless
  if (retailCartId) cookies.set("tw-cart-retail", "", { maxAge: -1 })
  if (professionalCartId) cookies.set("tw-cart-professional", "", { maxAge: -1 })
}

/**
 * Gets the cart ID from the standard _medusa_cart_id cookie.
 */
export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

/**
 * Sets the cart ID cookie.
 */
export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

/**
 * Removes the cart ID cookie.
 */
export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", { maxAge: -1 })
}
