"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"

export type ProductReview = {
  id: string
  product_id: string
  customer_id: string
  rating: number
  title: string
  body: string
  is_verified_purchase: boolean
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export type ProductReviewsResponse = {
  reviews: ProductReview[]
  count: number
  offset: number
  limit: number
  average_rating: number
  total_count: number
}

export const getProductReviews = async (
  productId: string,
  offset = 0,
  limit = 10
): Promise<ProductReviewsResponse> => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("products")),
    }

    const data = await sdk.client.fetch<ProductReviewsResponse>(
      `/store/products/${productId}/reviews`,
      {
        method: "GET",
        query: { offset, limit },
        headers,
        next,
        cache: "force-cache",
      }
    )

    return data
  } catch {
    return {
      reviews: [],
      count: 0,
      offset: 0,
      limit: 10,
      average_rating: 0,
      total_count: 0,
    }
  }
}

export const submitReview = async (
  productId: string,
  data: { rating: number; title: string; body: string }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.client.fetch<{ review: ProductReview }>(
      `/store/products/${productId}/reviews`,
      {
        method: "POST",
        body: data,
        headers,
      }
    )

    const cacheTag = await getCacheTag("products")
    if (cacheTag) {
      revalidateTag(cacheTag)
    }

    return { success: true }
  } catch (error: any) {
    const message =
      error?.message || "Failed to submit review. Please try again."
    return { success: false, error: message }
  }
}
