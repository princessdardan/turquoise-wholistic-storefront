"use client"

import { useChannel } from "@lib/context/channel-context"

type ProfessionalBadgeProps = {
  /** Compact mode for product cards (smaller text) */
  compact?: boolean
}

export default function ProfessionalBadge({
  compact = false,
}: ProfessionalBadgeProps) {
  const { channel, hydrated } = useChannel()

  if (!hydrated || channel !== "professional") {
    return null
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-blue-600 font-semibold text-white ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      Professional
    </span>
  )
}
