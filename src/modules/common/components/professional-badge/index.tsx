"use client"

type ProfessionalBadgeProps = {
  /** Compact mode for product cards (smaller text) */
  compact?: boolean
  /** Explicitly show the badge (based on product metadata) */
  show?: boolean
}

export default function ProfessionalBadge({
  compact = false,
  show = false,
}: ProfessionalBadgeProps) {
  if (!show) {
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
