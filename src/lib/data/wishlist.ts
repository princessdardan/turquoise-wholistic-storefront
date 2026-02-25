"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"

export type WishlistItem = {
  id: string
  customer_id: string
  product_id: string
  variant_id: string | null
  created_at: string
}

export type WishlistResponse = {
  wishlist_items: WishlistItem[]
}

export const getWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const data = await sdk.client.fetch<WishlistResponse>(`/store/wishlist`, {
      method: "GET",
      headers,
    })

    return data.wishlist_items
  } catch {
    return []
  }
}

export const addToWishlist = async (
  productId: string,
  variantId?: string | null
): Promise<{ success: boolean; itemId?: string; error?: string }> => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const data = await sdk.client.fetch<{ wishlist_item: WishlistItem }>(
      `/store/wishlist`,
      {
        method: "POST",
        body: { product_id: productId, variant_id: variantId ?? null },
        headers,
      }
    )

    const cacheTag = await getCacheTag("products")
    if (cacheTag) {
      revalidateTag(cacheTag)
    }

    return { success: true, itemId: data.wishlist_item.id }
  } catch (error: any) {
    // 409 means already in wishlist — treat as success
    if (error?.status === 409) {
      return { success: true, itemId: error?.wishlist_item?.id }
    }
    return {
      success: false,
      error: error?.message || "Failed to add to wishlist",
    }
  }
}

export const removeFromWishlist = async (
  itemId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.client.fetch(`/store/wishlist/${itemId}`, {
      method: "DELETE",
      headers,
    })

    const cacheTag = await getCacheTag("products")
    if (cacheTag) {
      revalidateTag(cacheTag)
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to remove from wishlist",
    }
  }
}

export type WishlistItemWithProduct = WishlistItem & {
  product: HttpTypes.StoreProduct | null
}

export const getWishlistWithProducts = async (
  regionId: string
): Promise<WishlistItemWithProduct[]> => {
  const items = await getWishlist()

  if (items.length === 0) return []

  const productIds = items.map((item) => item.product_id)

  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("products")),
    }

    const { products } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
    }>(`/store/products`, {
      method: "GET",
      query: {
        id: productIds,
        region_id: regionId,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity",
        limit: productIds.length,
      },
      headers,
      next,
      cache: "force-cache",
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    return items.map((item) => ({
      ...item,
      product: productMap.get(item.product_id) ?? null,
    }))
  } catch {
    return items.map((item) => ({ ...item, product: null }))
  }
}
