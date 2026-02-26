import { Heading, Text } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

import { listGiftCardsByOrder } from "@lib/data/gift-cards"
import { PurchaseTracker } from "@modules/common/components/analytics-tracker"
import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import OrderGiftCards from "@modules/order/components/order-gift-cards"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import GuestAccountCreation from "@modules/order/components/guest-account-creation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
  isGuest: boolean
}

function getEstimatedDelivery(order: HttpTypes.StoreOrder): string {
  const shippingMethod = order.shipping_methods?.[0]
  const methodName = (shippingMethod as any)?.name?.toLowerCase() ?? ""

  const now = new Date()
  let minDays = 5
  let maxDays = 8

  if (methodName.includes("express")) {
    minDays = 2
    maxDays = 4
  } else if (methodName.includes("ground")) {
    minDays = 5
    maxDays = 8
  }

  const minDate = new Date(now)
  minDate.setDate(minDate.getDate() + minDays)
  const maxDate = new Date(now)
  maxDate.setDate(maxDate.getDate() + maxDays)

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-CA", { month: "short", day: "numeric" })

  return `${fmt(minDate)} – ${fmt(maxDate)}`
}

export default async function OrderCompletedTemplate({
  order,
  isGuest,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"
  const estimatedDelivery = getEstimatedDelivery(order)
  const orderGiftCards = await listGiftCardsByOrder(order.id).catch(() => [])

  const purchaseData = {
    id: order.id,
    total: order.total,
    tax_total: order.tax_total,
    shipping_total: order.shipping_total,
    currency_code: order.currency_code,
    items: order.items?.map((item) => ({
      product_id: item.product_id,
      product_title: item.product_title,
      variant_id: item.variant_id,
      variant_title: item.variant_title,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  }

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <PurchaseTracker order={purchaseData} />
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          {/* Branded thank you header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-turquoise-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-turquoise-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <Heading
              level="h1"
              className="font-serif text-3xl text-ui-fg-base mb-2"
            >
              Thank you for your order!
            </Heading>
            <Text className="text-ui-fg-subtle text-base max-w-md">
              Your order has been placed successfully with Turquoise Wholistic.
              We&apos;ll send you updates as it ships.
            </Text>
          </div>

          {/* Estimated delivery */}
          <div className="bg-sand-50 border border-sand-200 rounded-lg p-4 flex items-center gap-4 mb-2">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-turquoise-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
            </div>
            <div>
              <Text className="txt-medium-plus text-ui-fg-base">
                Estimated delivery
              </Text>
              <Text className="txt-medium text-ui-fg-subtle">
                {estimatedDelivery}
              </Text>
            </div>
          </div>

          <OrderDetails order={order} />
          <OrderGiftCards giftCards={orderGiftCards} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            Summary
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />

          {isGuest && order.email && (
            <GuestAccountCreation
              email={order.email}
              firstName={order.shipping_address?.first_name || ""}
              lastName={order.shipping_address?.last_name || ""}
            />
          )}

          {/* Continue Shopping CTA */}
          <div className="flex justify-center mt-4">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center justify-center px-8 py-3 bg-turquoise-600 hover:bg-turquoise-700 text-white font-medium rounded-md transition-colors"
            >
              Continue Shopping
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
