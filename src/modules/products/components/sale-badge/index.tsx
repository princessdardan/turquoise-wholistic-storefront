import { clx } from "@medusajs/ui"

type SaleBadgeProps = {
  percentageOff: string
  compact?: boolean
  className?: string
}

export default function SaleBadge({
  percentageOff,
  compact = false,
  className,
}: SaleBadgeProps) {
  const diff = parseInt(percentageOff, 10)

  if (!diff || diff <= 0) {
    return null
  }

  return (
    <span
      className={clx(
        "inline-flex items-center rounded-full bg-red-500 font-semibold text-white",
        compact ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className
      )}
    >
      -{diff}%
    </span>
  )
}
