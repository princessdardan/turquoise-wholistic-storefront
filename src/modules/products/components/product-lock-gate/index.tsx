"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { redeemCode } from "@lib/data/product-access"
import { useProductAccess } from "@lib/context/product-access-context"
import Thumbnail from "@modules/products/components/thumbnail"

type ProductLockGateProps = {
  productTitle: string
  thumbnail: string | null
  images?: { id: string; url: string }[] | null
}

export default function ProductLockGate({
  productTitle,
  thumbnail,
  images,
}: ProductLockGateProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { refreshAccess } = useProductAccess()
  const router = useRouter()

  const handleRedeem = () => {
    if (!code.trim()) return

    setError(null)
    startTransition(async () => {
      const result = await redeemCode(code.trim())

      if (!result.success) {
        if (result.error === "login_required") {
          setError("Please log in to redeem a practitioner code.")
        } else {
          setError(result.error || "Invalid code. Please try again.")
        }
        return
      }

      setSuccess(true)
      await refreshAccess()
      // Reload to show the full product
      router.refresh()
    })
  }

  return (
    <div className="content-container py-6">
      <div className="max-w-2xl mx-auto">
        {/* Blurred product image */}
        <div className="relative rounded-lg overflow-hidden mb-8">
          <div className="blur-lg opacity-50 pointer-events-none">
            <Thumbnail
              thumbnail={thumbnail}
              images={images}
              size="full"
              productName={productTitle}
            />
          </div>
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-ui-fg-muted mb-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <p className="text-ui-fg-muted text-sm font-medium">
                Professional Product
              </p>
            </div>
          </div>
        </div>

        {/* Lock gate info */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-bold text-ui-fg-base mb-3">
            {productTitle}
          </h1>
          <p className="text-ui-fg-subtle text-base max-w-md mx-auto">
            This is a professional product. Enter a practitioner code to unlock
            access and view full details.
          </p>
        </div>

        {/* Code entry form */}
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-green-700 font-medium">
              Product unlocked! Loading details...
            </p>
          </div>
        ) : (
          <div className="bg-sand-50 border border-sand-200 rounded-lg p-6">
            <label
              htmlFor="practitioner-code"
              className="block text-sm font-medium text-ui-fg-base mb-2"
            >
              Practitioner Code
            </label>
            <div className="flex gap-3">
              <input
                id="practitioner-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 rounded-md border border-ui-border-base px-4 py-2.5 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent"
                disabled={isPending}
                onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
              />
              <button
                onClick={handleRedeem}
                disabled={isPending || !code.trim()}
                className="px-6 py-2.5 bg-turquoise-600 text-white text-sm font-medium rounded-md hover:bg-turquoise-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? "Redeeming..." : "Unlock"}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-3 text-xs text-ui-fg-muted">
              Don&apos;t have a code? Ask your healthcare practitioner for
              access.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
