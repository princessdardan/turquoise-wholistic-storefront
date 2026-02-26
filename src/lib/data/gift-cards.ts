"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export type GiftCardInfo = {
  id?: string
  code: string
  balance: number
  original_value: number
  currency_code: string
  status: string
  expires_at: string | null
  created_at?: string
}

export async function validateGiftCard(
  code: string
): Promise<{ gift_card: GiftCardInfo }> {
  const normalizedCode = code.trim().toUpperCase()

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch<{ gift_card: GiftCardInfo }>(
    `/store/gift-cards/${encodeURIComponent(normalizedCode)}`,
    {
      method: "GET",
      headers,
    }
  )
}

export async function listGiftCardsByOrder(
  orderId: string
): Promise<GiftCardInfo[]> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  const res = await sdk.client.fetch<{
    gift_cards: GiftCardInfo[]
    count: number
  }>("/store/gift-cards", {
    method: "GET",
    query: { order_id: orderId },
    headers,
    next,
    cache: "force-cache",
  })

  return res.gift_cards
}

export async function listCustomerGiftCards(
  customerId: string
): Promise<GiftCardInfo[]> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  const res = await sdk.client.fetch<{
    gift_cards: GiftCardInfo[]
    count: number
  }>("/store/gift-cards", {
    method: "GET",
    query: { customer_id: customerId },
    headers,
    next,
    cache: "force-cache",
  })

  return res.gift_cards
}
