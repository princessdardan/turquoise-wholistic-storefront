import { TruckFast, LockClosedSolid, ArrowPath } from "@medusajs/icons"

const badges = [
  { icon: TruckFast, label: "Free Shipping" },
  { icon: LockClosedSolid, label: "Secure Checkout" },
  { icon: ArrowPath, label: "Easy Returns" },
] as const

export default function TrustBadges() {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-x-1.5">
          <Icon className="w-4 h-4 text-turquoise-500" />
          <span className="text-xs text-ui-fg-muted">{label}</span>
        </div>
      ))}
    </div>
  )
}
