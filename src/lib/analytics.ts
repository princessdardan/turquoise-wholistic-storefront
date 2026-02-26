/**
 * GA4 Client-Side Ecommerce Analytics
 *
 * Utility functions for Google Analytics 4 ecommerce event tracking.
 * All functions are no-ops when GA4 is not configured (no measurement ID).
 */

// Extend window with gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? ""

/** Whether GA4 tracking is enabled */
export function isGA4Enabled(): boolean {
  return (
    typeof window !== "undefined" &&
    GA4_MEASUREMENT_ID !== "" &&
    typeof window.gtag === "function"
  )
}

function gtag(...args: unknown[]) {
  if (!isGA4Enabled()) return
  window.gtag!(...args)
}

// ---------------------------------------------------------------------------
// Item helpers
// ---------------------------------------------------------------------------

export type GA4Item = {
  item_id: string
  item_name: string
  price: number
  currency: string
  quantity?: number
  item_category?: string
  item_variant?: string
  index?: number
}

/** Convert a Medusa product (with variant pricing) to a GA4 item. */
export function productToGA4Item(
  product: {
    id: string
    title: string
    categories?: { name?: string; title?: string }[] | null
    variants?: {
      id?: string
      title?: string | null
      calculated_price?: {
        calculated_amount?: number | null
        currency_code?: string | null
      } | null
    }[] | null
  },
  opts?: { variantId?: string; quantity?: number; index?: number }
): GA4Item {
  const variant =
    product.variants?.find((v) => v.id === opts?.variantId) ??
    product.variants?.[0]

  const amount = variant?.calculated_price?.calculated_amount ?? 0
  const currency = (
    variant?.calculated_price?.currency_code ?? "CAD"
  ).toUpperCase()

  const category =
    product.categories?.[0]?.name ?? product.categories?.[0]?.title

  return {
    item_id: product.id,
    item_name: product.title,
    price: amount / 100,
    currency,
    ...(opts?.quantity != null && { quantity: opts.quantity }),
    ...(variant?.title && { item_variant: variant.title }),
    ...(category && { item_category: category }),
    ...(opts?.index != null && { index: opts.index }),
  }
}

/** Convert a Medusa cart line item to a GA4 item. */
export function lineItemToGA4Item(
  item: {
    product_id?: string | null
    product_title?: string | null
    variant_id?: string | null
    variant_title?: string | null
    quantity: number
    unit_price?: number
  },
  currencyCode: string
): GA4Item {
  return {
    item_id: item.product_id ?? "",
    item_name: item.product_title ?? "",
    price: (item.unit_price ?? 0) / 100,
    currency: currencyCode.toUpperCase(),
    quantity: item.quantity,
    ...(item.variant_title && { item_variant: item.variant_title }),
  }
}

// ---------------------------------------------------------------------------
// Ecommerce events
// ---------------------------------------------------------------------------

/** Fired when a user views a product detail page. */
export function trackViewItem(item: GA4Item) {
  gtag("event", "view_item", {
    currency: item.currency,
    value: item.price * (item.quantity ?? 1),
    items: [item],
  })
}

/** Fired when a user views a product listing / category page. */
export function trackViewItemList(
  items: GA4Item[],
  listName?: string,
  listId?: string
) {
  if (items.length === 0) return
  gtag("event", "view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items,
  })
}

/** Fired when a user adds an item to the cart. */
export function trackAddToCart(item: GA4Item) {
  gtag("event", "add_to_cart", {
    currency: item.currency,
    value: item.price * (item.quantity ?? 1),
    items: [item],
  })
}

/** Fired when a user removes an item from the cart. */
export function trackRemoveFromCart(item: GA4Item) {
  gtag("event", "remove_from_cart", {
    currency: item.currency,
    value: item.price * (item.quantity ?? 1),
    items: [item],
  })
}

/** Fired when a user begins the checkout process. */
export function trackBeginCheckout(
  items: GA4Item[],
  value: number,
  currency: string
) {
  gtag("event", "begin_checkout", {
    currency: currency.toUpperCase(),
    value: value / 100,
    items,
  })
}

/** Fired when the user submits shipping info during checkout. */
export function trackAddShippingInfo(
  items: GA4Item[],
  value: number,
  currency: string,
  shippingTier?: string
) {
  gtag("event", "add_shipping_info", {
    currency: currency.toUpperCase(),
    value: value / 100,
    ...(shippingTier && { shipping_tier: shippingTier }),
    items,
  })
}

/** Fired when the user submits payment info during checkout. */
export function trackAddPaymentInfo(
  items: GA4Item[],
  value: number,
  currency: string,
  paymentType?: string
) {
  gtag("event", "add_payment_info", {
    currency: currency.toUpperCase(),
    value: value / 100,
    ...(paymentType && { payment_type: paymentType }),
    items,
  })
}

/** Fired when a purchase is completed (order confirmation page). */
export function trackPurchase(order: {
  id: string
  total?: number
  tax_total?: number
  shipping_total?: number
  currency_code: string
  items?: {
    product_id?: string | null
    product_title?: string | null
    variant_id?: string | null
    variant_title?: string | null
    quantity: number
    unit_price?: number
  }[]
}) {
  const currency = order.currency_code.toUpperCase()
  const items =
    order.items?.map((item) => lineItemToGA4Item(item, currency)) ?? []

  gtag("event", "purchase", {
    transaction_id: order.id,
    value: (order.total ?? 0) / 100,
    tax: (order.tax_total ?? 0) / 100,
    shipping: (order.shipping_total ?? 0) / 100,
    currency,
    items,
  })
}
