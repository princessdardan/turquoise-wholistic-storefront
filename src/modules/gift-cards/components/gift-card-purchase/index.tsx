"use client"

import { addToCart } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type GiftCardPurchaseProps = {
  product: HttpTypes.StoreProduct
}

export default function GiftCardPurchase({ product }: GiftCardPurchaseProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const variants = useMemo(() => {
    if (!product.variants) return []
    return product.variants
      .map((v) => {
        const calc = (v as any).calculated_price
        return {
          id: v.id,
          title: v.title,
          amount: calc?.calculated_amount as number | undefined,
          currency_code: calc?.currency_code as string | undefined,
        }
      })
      .filter((v) => v.amount != null)
      .sort((a, b) => (a.amount ?? 0) - (b.amount ?? 0))
  }, [product.variants])

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)

  const handleAddToCart = async () => {
    if (!selectedVariantId) return

    setIsAdding(true)
    try {
      await addToCart({
        variantId: selectedVariantId,
        quantity: 1,
      })
      router.push("/cart")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div>
      {/* Denomination Selector */}
      <div className="grid grid-cols-2 small:grid-cols-4 gap-4 mb-8">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id
          return (
            <button
              key={variant.id}
              onClick={() => setSelectedVariantId(variant.id)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-turquoise-500 bg-turquoise-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-turquoise-300 hover:shadow-sm"
              }`}
            >
              {/* Gift icon */}
              <svg
                className={`w-8 h-8 mb-3 ${isSelected ? "text-turquoise-500" : "text-turquoise-300"}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
              <span
                className={`text-xl font-bold ${isSelected ? "text-turquoise-700" : "text-brand-text"}`}
              >
                {variant.amount != null && variant.currency_code
                  ? convertToLocale({
                      amount: variant.amount,
                      currency_code: variant.currency_code,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  : variant.title}
              </span>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="w-5 h-5 text-turquoise-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={!selectedVariantId || isAdding}
        className="w-full h-12 bg-turquoise-500 hover:bg-turquoise-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
      >
        {isAdding ? (
          <span className="flex items-center justify-center gap-x-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Adding...
          </span>
        ) : selectedVariant ? (
          `Add ${convertToLocale({ amount: selectedVariant.amount!, currency_code: selectedVariant.currency_code!, minimumFractionDigits: 0, maximumFractionDigits: 0 })} Gift Card to Cart`
        ) : (
          "Select a denomination"
        )}
      </button>
    </div>
  )
}
