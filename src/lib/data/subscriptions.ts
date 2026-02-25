"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type SubscriptionFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"

export type SubscriptionItem = {
  id: string
  subscription_id: string
  product_id: string
  variant_id: string
  quantity: number
}

export type Subscription = {
  id: string
  customer_id: string
  status: "active" | "paused" | "cancelled"
  frequency: SubscriptionFrequency
  next_order_date: string
  payment_method_id: string | null
  discount_percentage: number
  items: SubscriptionItem[]
  created_at: string
  updated_at: string
}

export type CreateSubscriptionInput = {
  items: { product_id: string; variant_id: string; quantity: number }[]
  frequency: SubscriptionFrequency
  payment_method_id?: string | null
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const data = await sdk.client.fetch<{ subscription: Subscription }>(
      `/store/subscriptions`,
      {
        method: "POST",
        body: input,
        headers,
      }
    )

    return { success: true, subscription: data.subscription }
  } catch (error: any) {
    if (error?.status === 401) {
      return { success: false, error: "login_required" }
    }
    return {
      success: false,
      error: error?.message || "Failed to create subscription",
    }
  }
}
