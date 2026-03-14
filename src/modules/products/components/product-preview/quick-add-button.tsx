"use client"

import { addToCart } from "@lib/data/cart"
import { trackAddToCart, productToGA4Item } from "@lib/analytics"
import { useToast } from "@lib/context/toast-context"
import { HttpTypes } from "@medusajs/types"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

type QuickAddButtonProps = {
  product: HttpTypes.StoreProduct
}

export default function QuickAddButton({ product }: QuickAddButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const params = useParams()
  const channel = params.channel as string | undefined
  const router = useRouter()
  const { addToast } = useToast()

  const isSingleVariant = product.variants?.length === 1
  const variant = isSingleVariant ? product.variants![0] : null

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!isSingleVariant) {
      const prefix = channel ? `/${channel}` : ""
      router.push(`${prefix}/products/${product.handle}`)
      return
    }

    if (!variant?.id) return

    setIsAdding(true)

    try {
      await addToCart({
        variantId: variant.id,
        quantity: 1,
      })

      trackAddToCart(
        productToGA4Item(product, {
          variantId: variant.id,
          quantity: 1,
        })
      )

      setShowSuccess(true)
      addToast(`${product.title} added to cart`, "success", { duration: 3000 })
      setTimeout(() => setShowSuccess(false), 2000)
    } catch {
      addToast("Failed to add to cart", "error")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isAdding}
      className="absolute bottom-[52px] left-1 right-1 z-10 flex items-center justify-center gap-x-2 h-9 bg-turquoise-500 hover:bg-turquoise-600 disabled:bg-turquoise-400 text-white text-sm font-medium rounded-lg transition-all duration-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 max-sm:opacity-100 max-sm:translate-y-0 shadow-sm"
      aria-label={isSingleVariant ? "Add to cart" : "View product options"}
    >
      {isAdding ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
      ) : showSuccess ? (
        <>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Added!
        </>
      ) : isSingleVariant ? (
        <>
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h1.5l1.3 6.5a1.5 1.5 0 001.5 1.25h7.4a1.5 1.5 0 001.5-1.25L17.5 5H5.5"
            />
            <circle cx="8" cy="15" r="1" fill="currentColor" />
            <circle cx="15" cy="15" r="1" fill="currentColor" />
          </svg>
          Add to Cart
        </>
      ) : (
        "View Options"
      )}
    </button>
  )
}
