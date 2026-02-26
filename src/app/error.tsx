"use client"

import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  if (process.env.NODE_ENV === "development") {
    console.error("Global error boundary caught:", error)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
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
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <h1 className="font-serif text-3xl font-bold text-brand-text mb-3">
        Something Went Wrong
      </h1>
      <p className="text-brand-text-secondary max-w-md mb-8">
        We&apos;re sorry, but something unexpected happened. Please try again or
        return to the home page.
      </p>

      <div className="flex flex-col xsmall:flex-row gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-turquoise-500 text-white font-medium rounded-rounded hover:bg-turquoise-600 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-sand-300 text-brand-text font-medium rounded-rounded hover:bg-sand-50 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
