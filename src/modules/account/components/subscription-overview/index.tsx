"use client"

import { useState, useTransition, useRef } from "react"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Subscription,
  SubscriptionFrequency,
  updateSubscription,
} from "@lib/data/subscriptions"

type SubscriptionOverviewProps = {
  subscriptions: Subscription[]
}

const FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  bimonthly: "Bi-monthly",
}

const STATUS_STYLES: Record<
  Subscription["status"],
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800",
  },
  paused: {
    label: "Paused",
    className: "bg-yellow-100 text-yellow-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-500",
  },
}

const SubscriptionOverview = ({
  subscriptions: initialSubscriptions,
}: SubscriptionOverviewProps) => {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)

  if (subscriptions.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-y-4 py-16 text-center"
        data-testid="subscriptions-empty-state"
      >
        <p className="text-large-semi">No subscriptions yet</p>
        <p className="text-base-regular text-ui-fg-subtle max-w-md">
          Subscribe &amp; Save on your favorite products!
        </p>
        <LocalizedClientLink href="/store">
          <Button variant="secondary" data-testid="browse-products-button">
            Browse Products
          </Button>
        </LocalizedClientLink>
      </div>
    )
  }

  const handleUpdate = (updated: Subscription) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    )
  }

  return (
    <div
      className="flex flex-col gap-y-6"
      data-testid="subscriptions-container"
    >
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  )
}

type SubscriptionCardProps = {
  subscription: Subscription
  onUpdate: (updated: Subscription) => void
}

const SubscriptionCard = ({
  subscription,
  onUpdate,
}: SubscriptionCardProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showFrequencySelect, setShowFrequencySelect] = useState(false)
  const pauseDialogRef = useRef<HTMLDialogElement>(null)
  const cancelDialogRef = useRef<HTMLDialogElement>(null)

  const status = STATUS_STYLES[subscription.status]
  const nextDate = new Date(subscription.next_order_date).toLocaleDateString(
    "en-CA",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )

  const itemCount = subscription.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const handleAction = (
    action: Parameters<typeof updateSubscription>[1]
  ) => {
    setError(null)
    startTransition(async () => {
      const result = await updateSubscription(subscription.id, action)
      if (result.success && result.subscription) {
        onUpdate(result.subscription)
      } else {
        setError(result.error || "Something went wrong")
      }
    })
  }

  const handlePause = () => {
    pauseDialogRef.current?.close()
    handleAction({ status: "paused" })
  }

  const handleResume = () => {
    handleAction({ status: "active" })
  }

  const handleCancel = () => {
    cancelDialogRef.current?.close()
    handleAction({ status: "cancelled" })
  }

  const handleSkipNext = () => {
    handleAction({ skip_next: true })
  }

  const handleFrequencyChange = (frequency: SubscriptionFrequency) => {
    setShowFrequencySelect(false)
    handleAction({ frequency })
  }

  const isCancelled = subscription.status === "cancelled"
  const isPaused = subscription.status === "paused"
  const isActive = subscription.status === "active"

  return (
    <div
      className="border border-gray-200 rounded-lg p-6"
      data-testid="subscription-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-x-3">
            <h3 className="text-base-semi">
              {FREQUENCY_LABELS[subscription.frequency]} Subscription
            </h3>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${status.className}`}
              data-testid="subscription-status-badge"
            >
              {status.label}
            </span>
          </div>
          <p className="text-small-regular text-ui-fg-subtle mt-1">
            Created{" "}
            {new Date(subscription.created_at).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-small-regular text-ui-fg-subtle">
            {subscription.discount_percentage}% discount applied
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        <p className="text-small-semi mb-2">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
        <div className="flex flex-col gap-y-2">
          {subscription.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-small-regular text-ui-fg-subtle"
            >
              <span>
                Product {item.product_id.slice(-6)} &middot; Variant{" "}
                {item.variant_id.slice(-6)}
              </span>
              <span>Qty: {item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next order info */}
      {!isCancelled && (
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex justify-between text-small-regular">
            <span className="text-ui-fg-subtle">Next order date</span>
            <span className="text-ui-fg-base font-medium">{nextDate}</span>
          </div>
          <div className="flex justify-between text-small-regular mt-1">
            <span className="text-ui-fg-subtle">Frequency</span>
            <span className="text-ui-fg-base">
              {FREQUENCY_LABELS[subscription.frequency]}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-small-regular text-red-600 mb-4">{error}</div>
      )}

      {/* Actions */}
      {!isCancelled && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {isActive && (
              <Button
                variant="secondary"
                size="small"
                disabled={isPending}
                onClick={() => pauseDialogRef.current?.showModal()}
                data-testid="pause-subscription"
              >
                Pause
              </Button>
            )}
            {isPaused && (
              <Button
                variant="secondary"
                size="small"
                disabled={isPending}
                onClick={handleResume}
                data-testid="resume-subscription"
              >
                Resume
              </Button>
            )}
            <Button
              variant="secondary"
              size="small"
              disabled={isPending}
              onClick={handleSkipNext}
              data-testid="skip-next-delivery"
            >
              Skip Next Delivery
            </Button>

            {/* Frequency change */}
            <div className="relative">
              <Button
                variant="secondary"
                size="small"
                disabled={isPending}
                onClick={() => setShowFrequencySelect((v) => !v)}
                data-testid="change-frequency"
              >
                Change Frequency
              </Button>
              {showFrequencySelect && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
                  {(
                    Object.entries(FREQUENCY_LABELS) as [
                      SubscriptionFrequency,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`w-full text-left px-4 py-2 text-small-regular hover:bg-gray-50 ${
                        value === subscription.frequency
                          ? "font-semibold text-ui-fg-base"
                          : "text-ui-fg-subtle"
                      }`}
                      onClick={() => handleFrequencyChange(value)}
                      disabled={value === subscription.frequency}
                    >
                      {label}
                      {value === subscription.frequency && " (current)"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="transparent"
              size="small"
              disabled={isPending}
              className="text-red-600 hover:text-red-700"
              onClick={() => cancelDialogRef.current?.showModal()}
              data-testid="cancel-subscription"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Pause confirmation dialog */}
      <dialog
        ref={pauseDialogRef}
        className="rounded-lg p-6 backdrop:bg-black/50 max-w-sm"
      >
        <h4 className="text-base-semi mb-2">Pause subscription?</h4>
        <p className="text-small-regular text-ui-fg-subtle mb-6">
          Your subscription will be paused and no further orders will be created
          until you resume it.
        </p>
        <div className="flex justify-end gap-x-2">
          <Button
            variant="secondary"
            size="small"
            onClick={() => pauseDialogRef.current?.close()}
          >
            Keep Active
          </Button>
          <Button size="small" onClick={handlePause}>
            Pause Subscription
          </Button>
        </div>
      </dialog>

      {/* Cancel confirmation dialog */}
      <dialog
        ref={cancelDialogRef}
        className="rounded-lg p-6 backdrop:bg-black/50 max-w-sm"
      >
        <h4 className="text-base-semi mb-2">Cancel subscription?</h4>
        <p className="text-small-regular text-ui-fg-subtle mb-6">
          Are you sure? This action cannot be undone. You will no longer receive
          recurring orders or the subscription discount.
        </p>
        <div className="flex justify-end gap-x-2">
          <Button
            variant="secondary"
            size="small"
            onClick={() => cancelDialogRef.current?.close()}
          >
            Keep Subscription
          </Button>
          <Button
            size="small"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleCancel}
          >
            Cancel Subscription
          </Button>
        </div>
      </dialog>
    </div>
  )
}

export default SubscriptionOverview
