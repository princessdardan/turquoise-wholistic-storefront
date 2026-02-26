import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mb-6">
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
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>

      <h1 className="font-serif text-3xl font-bold text-brand-text mb-3">
        Page Not Found
      </h1>
      <p className="text-brand-text-secondary max-w-md mb-8">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may
        have been moved or no longer exists.
      </p>

      <div className="flex flex-col xsmall:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-turquoise-500 text-white font-medium rounded-rounded hover:bg-turquoise-600 transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/store"
          className="px-6 py-3 border border-sand-300 text-brand-text font-medium rounded-rounded hover:bg-sand-50 transition-colors"
        >
          Browse Store
        </Link>
      </div>
    </div>
  )
}
