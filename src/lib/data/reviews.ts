"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"

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
