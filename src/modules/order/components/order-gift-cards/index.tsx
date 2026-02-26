"use client"

import { GiftCardInfo } from "@lib/data/gift-cards"
import { convertToLocale } from "@lib/util/money"
import { Heading, Text } from "@medusajs/ui"

type OrderGiftCardsProps = {
  giftCards: GiftCardInfo[]
}

const OrderGiftCards: React.FC<OrderGiftCardsProps> = ({ giftCards }) => {
  if (giftCards.length === 0) {
    return null
  }

  return (
    <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-turquoise-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-turquoise-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
            />
          </svg>
        </div>
        <Heading level="h3" className="text-lg font-semibold text-ui-fg-base">
          Your Gift Card{giftCards.length > 1 ? "s" : ""}
        </Heading>
      </div>

      <Text className="text-ui-fg-subtle text-sm mb-4">
        Save these codes — they can be used to make purchases at Turquoise
        Wholistic.
      </Text>

      <div className="space-y-3">
        {giftCards.map((gc) => (
          <div
            key={gc.code}
            className="flex items-center justify-between bg-white rounded-md px-4 py-3 border border-turquoise-100"
          >
            <div>
              <Text className="font-mono text-base font-semibold text-ui-fg-base tracking-wider">
                {gc.code}
              </Text>
            </div>
            <Text className="text-turquoise-700 font-semibold">
              {convertToLocale({
                amount: gc.balance,
                currency_code: gc.currency_code,
              })}
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderGiftCards
