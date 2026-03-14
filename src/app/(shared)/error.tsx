"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  if (process.env.NODE_ENV === "development") {
    console.error("Checkout error boundary caught:", error)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-turquoise-50 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-turquoise-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
      </div>

      <h1 className="font-serif text-2xl font-bold text-brand-text mb-3">
        Checkout Issue
      </h1>
      <p className="text-brand-text-secondary max-w-md mb-8">
        Something went wrong during checkout. Your cart is still saved — please
        try again or return to your cart.
      </p>

      <div className="flex flex-col xsmall:flex-row gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-turquoise-500 text-white font-medium rounded-rounded hover:bg-turquoise-600 transition-colors"
        >
          Try Again
        </button>
        <LocalizedClientLink
          href="/cart"
          className="px-6 py-3 border border-sand-300 text-brand-text font-medium rounded-rounded hover:bg-sand-50 transition-colors"
        >
          Return to Cart
        </LocalizedClientLink>
      </div>
    </div>
  )
}
