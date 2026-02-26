"use client"

import { SubscriptionFrequency } from "@lib/data/subscriptions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type PurchaseMode = "one-time" | "subscription"

const FREQUENCY_OPTIONS: { value: SubscriptionFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "bimonthly", label: "Bi-monthly" },
]

type SubscribeSaveProps = {
  purchaseMode: PurchaseMode
  onPurchaseModeChange: (mode: PurchaseMode) => void
  frequency: SubscriptionFrequency
  onFrequencyChange: (freq: SubscriptionFrequency) => void
  originalPrice: string | null
  discountedPrice: string | null
  discountPercentage: number
  isLoggedIn: boolean
  disabled?: boolean
}

export default function SubscribeSave({
  purchaseMode,
  onPurchaseModeChange,
  frequency,
  onFrequencyChange,
  originalPrice,
  discountedPrice,
  discountPercentage,
  isLoggedIn,
  disabled,
}: SubscribeSaveProps) {
  return (
    <div className="flex flex-col gap-y-3">
      {/* One-time Purchase Option */}
      <label
        className={`flex cursor-pointer items-center gap-x-3 rounded-lg border px-4 py-3 transition-colors ${
          purchaseMode === "one-time"
            ? "border-turquoise-500 bg-turquoise-50/50"
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          type="radio"
          name="purchase-mode"
          value="one-time"
          checked={purchaseMode === "one-time"}
          onChange={() => onPurchaseModeChange("one-time")}
          disabled={disabled}
          className="h-4 w-4 accent-turquoise-500"
        />
        <span className="text-sm font-medium text-brand-text">
          One-time Purchase
        </span>
      </label>

      {/* Subscribe & Save Option */}
      <label
        className={`flex cursor-pointer flex-col rounded-lg border px-4 py-3 transition-colors ${
          purchaseMode === "subscription"
            ? "border-turquoise-500 bg-turquoise-50/50"
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-x-3">
          <input
            type="radio"
            name="purchase-mode"
            value="subscription"
            checked={purchaseMode === "subscription"}
            onChange={() => onPurchaseModeChange("subscription")}
            disabled={disabled}
            className="h-4 w-4 accent-turquoise-500"
          />
          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm font-medium text-brand-text">
              Subscribe & Save
            </span>
            <span className="rounded-full bg-turquoise-100 px-2.5 py-0.5 text-xs font-semibold text-turquoise-700">
              Save {discountPercentage}%
            </span>
          </div>
        </div>

        {/* Subscription details when selected */}
        {purchaseMode === "subscription" && (
          <div className="mt-3 flex flex-col gap-y-3 pl-7">
            {/* Discounted price display */}
            {originalPrice && discountedPrice && (
              <div className="flex items-center gap-x-2">
                <span className="text-sm font-semibold text-turquoise-600">
                  {discountedPrice}
                </span>
                <span className="text-xs text-ui-fg-muted line-through">
                  {originalPrice}
                </span>
              </div>
            )}

            {/* Frequency selector */}
            <div>
              <label
                htmlFor="subscription-frequency"
                className="mb-1 block text-xs font-medium text-ui-fg-subtle"
              >
                Delivery frequency
              </label>
              <select
                id="subscription-frequency"
                value={frequency}
                onChange={(e) =>
                  onFrequencyChange(e.target.value as SubscriptionFrequency)
                }
                disabled={disabled}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-brand-text focus:border-turquoise-500 focus:outline-none focus:ring-1 focus:ring-turquoise-500"
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Login prompt */}
            {!isLoggedIn && (
              <p className="text-xs text-ui-fg-subtle">
                <LocalizedClientLink
                  href="/account"
                  className="font-medium text-turquoise-600 underline underline-offset-2 hover:text-turquoise-700"
                >
                  Sign in
                </LocalizedClientLink>{" "}
                to subscribe
              </p>
            )}
          </div>
        )}
      </label>
    </div>
  )
}
