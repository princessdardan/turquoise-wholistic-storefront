"use client"

import { GiftCardInfo } from "@lib/data/gift-cards"
import { convertToLocale } from "@lib/util/money"
import { Badge, Text } from "@medusajs/ui"

type GiftCardsOverviewProps = {
  giftCards: GiftCardInfo[]
}

function getStatusColor(status: string): "green" | "grey" | "red" | "orange" {
  switch (status) {
    case "active":
      return "green"
    case "redeemed":
      return "grey"
    case "disabled":
      return "red"
    default:
      return "grey"
  }
}

const GiftCardsOverview: React.FC<GiftCardsOverviewProps> = ({ giftCards }) => {
  if (giftCards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-ui-fg-muted"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
            />
          </svg>
        </div>
        <Text className="text-ui-fg-subtle">
          You don&apos;t have any gift cards yet.
        </Text>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {giftCards.map((gc) => (
        <div
          key={gc.id || gc.code}
          className="border border-ui-border-base rounded-lg p-4 flex flex-col xsmall:flex-row xsmall:items-center justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Text className="font-mono text-base font-semibold tracking-wider">
                {gc.code}
              </Text>
              <Badge color={getStatusColor(gc.status)} size="small">
                {gc.status}
              </Badge>
            </div>
            {gc.expires_at && (
              <Text className="text-ui-fg-muted text-xs">
                Expires:{" "}
                {new Date(gc.expires_at).toLocaleDateString("en-CA", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            )}
            {gc.created_at && (
              <Text className="text-ui-fg-muted text-xs">
                Purchased:{" "}
                {new Date(gc.created_at).toLocaleDateString("en-CA", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            )}
          </div>

          <div className="text-right">
            <Text className="text-lg font-semibold text-turquoise-700">
              {convertToLocale({
                amount: gc.balance,
                currency_code: gc.currency_code,
              })}
            </Text>
            {gc.balance < gc.original_value && (
              <Text className="text-ui-fg-muted text-xs">
                of{" "}
                {convertToLocale({
                  amount: gc.original_value,
                  currency_code: gc.currency_code,
                })}
              </Text>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default GiftCardsOverview
