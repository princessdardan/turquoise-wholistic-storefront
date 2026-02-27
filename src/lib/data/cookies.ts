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
 * Resolves which channel's cart cookie to use based on the tw-channel cookie.
 * Falls back to "retail" if no channel is set.
 */
function cartCookieName(channel: string): string {
  return `tw-cart-${channel}`
}

async function getActiveChannelFromCookie(): Promise<string> {
  const cookies = await nextCookies()
  return cookies.get("tw-channel")?.value || "retail"
}

/**
 * Gets the cart ID for the currently active channel.
 * Migrates from the legacy _medusa_cart_id cookie if needed.
 */
export const getCartId = async () => {
  const cookies = await nextCookies()
  const channel = await getActiveChannelFromCookie()

  const channelCartId = cookies.get(cartCookieName(channel))?.value
  if (channelCartId) return channelCartId

  // Migration: move legacy cart to retail channel cookie
  const legacyCartId = cookies.get("_medusa_cart_id")?.value
  if (legacyCartId) {
    cookies.set(cartCookieName("retail"), legacyCartId, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    cookies.set("_medusa_cart_id", "", { maxAge: -1 })
    if (channel === "retail") return legacyCartId
  }

  return undefined
}

/**
 * Gets the cart ID for a specific channel (without relying on tw-channel cookie).
 */
export const getCartIdForChannel = async (channel: string) => {
  const cookies = await nextCookies()
  return cookies.get(cartCookieName(channel))?.value
}

/**
 * Sets the cart ID cookie for the currently active channel.
 * Non-HttpOnly so the client-side DualCartProvider can read it.
 */
export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  const channel = await getActiveChannelFromCookie()
  cookies.set(cartCookieName(channel), cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

/**
 * Removes the cart ID cookie for the currently active channel.
 */
export const removeCartId = async () => {
  const cookies = await nextCookies()
  const channel = await getActiveChannelFromCookie()
  cookies.set(cartCookieName(channel), "", { maxAge: -1 })
}

/**
 * Removes cart ID cookies for all channels. Used on logout/account deletion.
 */
export const removeAllCartIds = async () => {
  const cookies = await nextCookies()
  cookies.set(cartCookieName("retail"), "", { maxAge: -1 })
  cookies.set(cartCookieName("professional"), "", { maxAge: -1 })
}
