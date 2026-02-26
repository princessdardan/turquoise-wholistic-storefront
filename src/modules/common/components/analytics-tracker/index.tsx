"use client"

import { useEffect, useRef } from "react"
import {
  GA4Item,
  trackViewItem,
  trackViewItemList,
  trackBeginCheckout,
  trackPurchase,
} from "@lib/analytics"

/**
 * Fires a view_item event on mount. Use in product detail pages.
 */
export function ViewItemTracker({ item }: { item: GA4Item }) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    setTimeout(() => trackViewItem(item), 100)
  }, [item])
  return null
}

/**
 * Fires a view_item_list event on mount. Use in product listing pages.
 */
export function ViewItemListTracker({
  items,
  listName,
  listId,
}: {
  items: GA4Item[]
  listName?: string
  listId?: string
}) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    setTimeout(() => trackViewItemList(items, listName, listId), 100)
  }, [items, listName, listId])
  return null
}

/**
 * Fires a begin_checkout event on mount. Use on checkout page.
 */
export function BeginCheckoutTracker({
  items,
  value,
  currency,
}: {
  items: GA4Item[]
  value: number
  currency: string
}) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    setTimeout(() => trackBeginCheckout(items, value, currency), 100)
  }, [items, value, currency])
  return null
}

/**
 * Fires a purchase event on mount. Use on order confirmation page.
 */
export function PurchaseTracker({
  order,
}: {
  order: Parameters<typeof trackPurchase>[0]
}) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    setTimeout(() => trackPurchase(order), 100)
  }, [order])
  return null
}
