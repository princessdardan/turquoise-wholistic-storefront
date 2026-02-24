"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const STORAGE_KEY = "tw-cookie-consent"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY)
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const accept = (level: "all" | "essential") => {
    localStorage.setItem(STORAGE_KEY, level)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg sm:p-6">
      <div className="content-container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          <p>
            We use cookies to ensure our website works properly and to improve
            your experience.{" "}
            <LocalizedClientLink
              href="/privacy-policy"
              className="text-turquoise-600 underline hover:text-turquoise-700"
            >
              Learn more
            </LocalizedClientLink>
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => accept("essential")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Essential Only
          </button>
          <button
            onClick={() => accept("all")}
            className="rounded-lg bg-turquoise-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-turquoise-600"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
