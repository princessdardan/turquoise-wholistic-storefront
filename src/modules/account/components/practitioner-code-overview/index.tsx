"use client"

import { useState, useTransition } from "react"
import { useProductAccess } from "@lib/context/product-access-context"
import { redeemCode, RedeemCodeResult } from "@lib/data/product-access"

type Props = {
  initialAccessibleProductIds: string[]
}

export default function PractitionerCodeOverview({
  initialAccessibleProductIds,
}: Props) {
  const { refreshAccess, accessibleProductIds } = useProductAccess()
  const displayIds =
    accessibleProductIds.length > 0
      ? accessibleProductIds
      : initialAccessibleProductIds

  const [code, setCode] = useState("")
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<RedeemCodeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRedeem = () => {
    if (!code.trim()) return

    setResult(null)
    setError(null)

    startTransition(async () => {
      const response = await redeemCode(code.trim())

      if (response.success && response.result) {
        setResult(response.result)
        setCode("")
        await refreshAccess()
      } else {
        setError(getErrorMessage(response.error || "Unknown error"))
      }
    })
  }

  return (
    <div className="flex flex-col gap-y-8">
      {/* Redeem Code Form */}
      <div className="border border-ui-border-base rounded-lg p-6">
        <h2 className="text-large-semi mb-4">Redeem a Code</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleRedeem()
          }}
          className="flex flex-col gap-y-4"
        >
          <div className="flex gap-x-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter practitioner code"
              className="flex-1 border border-ui-border-base rounded-md px-4 py-2.5 text-base-regular font-mono tracking-wider uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-sans"
              disabled={isPending}
              data-testid="practitioner-code-input"
            />
            <button
              type="submit"
              disabled={isPending || !code.trim()}
              className="bg-ui-button-neutral text-ui-fg-on-color px-6 py-2.5 rounded-md text-base-regular hover:bg-ui-button-neutral-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="redeem-code-button"
            >
              {isPending ? "Redeeming..." : "Redeem"}
            </button>
          </div>

          {/* Success State */}
          {result && (
            <div
              className="bg-ui-bg-subtle-positive border border-ui-border-positive rounded-md p-4"
              data-testid="redeem-success"
            >
              {result.products_unlocked.length > 0 && (
                <div>
                  <p className="text-ui-fg-positive text-base-semi mb-1">
                    Products unlocked ({result.products_unlocked.length})
                  </p>
                  <ul className="list-disc list-inside text-small-regular text-ui-fg-subtle">
                    {result.products_unlocked.map((id) => (
                      <li key={id}>{id}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.already_had_access.length > 0 && (
                <div className="mt-2">
                  <p className="text-ui-fg-muted text-small-semi">
                    Already had access ({result.already_had_access.length})
                  </p>
                  <ul className="list-disc list-inside text-small-regular text-ui-fg-muted">
                    {result.already_had_access.map((id) => (
                      <li key={id}>{id}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div
              className="bg-ui-bg-subtle-negative border border-ui-border-negative rounded-md p-4"
              data-testid="redeem-error"
            >
              <p className="text-ui-fg-negative text-base-regular">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Accessible Products */}
      <div className="border border-ui-border-base rounded-lg p-6">
        <h2 className="text-large-semi mb-4">Your Professional Products</h2>
        {displayIds.length > 0 ? (
          <div>
            <p className="text-base-regular text-ui-fg-subtle mb-3">
              You have access to {displayIds.length} professional{" "}
              {displayIds.length === 1 ? "product" : "products"}.
            </p>
            <ul className="divide-y divide-ui-border-base">
              {displayIds.map((id) => (
                <li
                  key={id}
                  className="py-2.5 text-small-regular text-ui-fg-subtle font-mono"
                >
                  {id}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-base-regular text-ui-fg-muted">
            You don&apos;t have access to any professional products yet. Enter a
            practitioner code above to unlock products.
          </p>
        )}
      </div>
    </div>
  )
}

function getErrorMessage(error: string): string {
  if (error === "login_required") {
    return "You must be logged in to redeem a code."
  }
  if (error.toLowerCase().includes("not found") || error.includes("404")) {
    return "Invalid code. Please check the code and try again."
  }
  if (error.toLowerCase().includes("expired")) {
    return "This code has expired."
  }
  if (error.toLowerCase().includes("inactive") || error.toLowerCase().includes("deactivated")) {
    return "This code is no longer active."
  }
  if (error.toLowerCase().includes("max") || error.toLowerCase().includes("redemption")) {
    return "This code has reached its maximum number of redemptions."
  }
  return error
}
