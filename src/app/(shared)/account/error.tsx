"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  if (process.env.NODE_ENV === "development") {
    console.error("Account error boundary caught:", error)
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
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      </div>

      <h1 className="font-serif text-2xl font-bold text-brand-text mb-3">
        Account Error
      </h1>
      <p className="text-brand-text-secondary max-w-md mb-8">
        We had trouble loading your account information. Please try again or
        return to the home page.
      </p>

      <div className="flex flex-col xsmall:flex-row gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-turquoise-500 text-white font-medium rounded-rounded hover:bg-turquoise-600 transition-colors"
        >
          Try Again
        </button>
        <LocalizedClientLink
          href="/"
          className="px-6 py-3 border border-sand-300 text-brand-text font-medium rounded-rounded hover:bg-sand-50 transition-colors"
        >
          Go Home
        </LocalizedClientLink>
      </div>
    </div>
  )
}
