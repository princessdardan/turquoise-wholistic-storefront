"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type RedeemCodeResult = {
  products_unlocked: string[]
  already_had_access: string[]
}

export async function redeemCode(
  code: string
): Promise<{ success: boolean; result?: RedeemCodeResult; error?: string }> {
  try {
    const headers = { ...(await getAuthHeaders()) }

    const data = await sdk.client.fetch<RedeemCodeResult>(
      `/store/redeem-code`,
      {
        method: "POST",
        body: { code },
        headers,
      }
    )

    return { success: true, result: data }
  } catch (error: any) {
    if (error?.status === 401) {
      return { success: false, error: "login_required" }
    }
    return {
      success: false,
      error: error?.message || "Failed to redeem code",
    }
  }
}

export async function getMyAccess(): Promise<string[]> {
  try {
    const headers = { ...(await getAuthHeaders()) }

    const data = await sdk.client.fetch<{ product_ids: string[] }>(
      `/store/my-access`,
      {
        method: "GET",
        headers,
      }
    )

    return data.product_ids
  } catch {
    return []
  }
}

export type FilteredProduct = {
  id: string
  title: string
  handle: string
  description: string | null
  status: string
  thumbnail: string | null
  images: any[]
  variants: any[]
  product_metadata: any
}

export async function getFilteredProducts(
  channel: "retail" | "professional" | "both" | "all" = "all",
  limit = 20,
  offset = 0
): Promise<{ products: FilteredProduct[]; count: number }> {
  try {
    const headers = { ...(await getAuthHeaders()) }

    const data = await sdk.client.fetch<{
      products: FilteredProduct[]
      count: number
    }>(
      `/store/products-filtered?channel=${channel}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers,
      }
    )

    return { products: data.products, count: data.count }
  } catch {
    return { products: [], count: 0 }
  }
}

/**
 * Fetches accessible product IDs from the filtered endpoint.
 * Returns which products are accessible and which are professional-channel.
 */
export async function getFilteredProductIds(
  channel: "retail" | "professional" | "all" = "all"
): Promise<{ productIds: string[]; professionalProductIds: string[] }> {
  try {
    const headers = { ...(await getAuthHeaders()) }

    const data = await sdk.client.fetch<{
      products: Array<{
        id: string
        product_metadata?: { channel?: string } | null
      }>
      count: number
    }>(`/store/products-filtered?channel=${channel}&limit=200&offset=0`, {
      method: "GET",
      headers,
    })

    const productIds = data.products.map((p) => p.id)
    const professionalProductIds = data.products
      .filter((p) => p.product_metadata?.channel === "professional")
      .map((p) => p.id)

    return { productIds, professionalProductIds }
  } catch {
    return { productIds: [], professionalProductIds: [] }
  }
}
