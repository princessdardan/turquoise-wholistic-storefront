import { LOW_STOCK_THRESHOLD } from "@lib/constants"
import { HttpTypes } from "@medusajs/types"

type StockBadgeProps = {
  variant?: HttpTypes.StoreProductVariant | null
  /** For product cards: pass all variants to show the most urgent stock status */
  variants?: HttpTypes.StoreProductVariant[]
  /** Compact mode for product cards (smaller text) */
  compact?: boolean
}

type StockStatus = "out-of-stock" | "low-stock" | "in-stock"

function getVariantStockStatus(
  variant: HttpTypes.StoreProductVariant
): { status: StockStatus; quantity: number | null } {
  if (!variant.manage_inventory) return { status: "in-stock", quantity: null }
  if (variant.allow_backorder) return { status: "in-stock", quantity: null }

  const qty = variant.inventory_quantity ?? 0
  if (qty === 0) return { status: "out-of-stock", quantity: 0 }
  if (qty <= LOW_STOCK_THRESHOLD) return { status: "low-stock", quantity: qty }
  return { status: "in-stock", quantity: qty }
}

/**
 * For product cards: aggregates stock across all variants.
 * Shows "Out of Stock" if ALL managed variants are 0.
 * Shows "Only X left" based on the minimum stock variant.
 */
function getProductStockStatus(
  variants: HttpTypes.StoreProductVariant[]
): { status: StockStatus; quantity: number | null } {
  if (variants.length === 0) return { status: "in-stock", quantity: null }

  const managedVariants = variants.filter((v) => v.manage_inventory && !v.allow_backorder)

  // If no variants manage inventory, product is always in stock
  if (managedVariants.length === 0) return { status: "in-stock", quantity: null }

  const quantities = managedVariants.map((v) => v.inventory_quantity ?? 0)
  const totalStock = quantities.reduce((sum, q) => sum + q, 0)

  if (totalStock === 0) return { status: "out-of-stock", quantity: 0 }

  // Show the minimum variant stock to give most urgent signal
  const minStock = Math.min(...quantities)
  if (minStock <= LOW_STOCK_THRESHOLD) {
    return { status: "low-stock", quantity: minStock }
  }

  return { status: "in-stock", quantity: totalStock }
}

export default function StockBadge({
  variant,
  variants,
  compact = false,
}: StockBadgeProps) {
  const { status, quantity } = variant
    ? getVariantStockStatus(variant)
    : variants
      ? getProductStockStatus(variants)
      : { status: "in-stock" as StockStatus, quantity: null }

  if (status === "in-stock") return null

  if (status === "out-of-stock") {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-gray-100 font-medium text-gray-600 ${
          compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
        }`}
        data-testid="out-of-stock-badge"
      >
        Out of Stock
      </span>
    )
  }

  // low-stock
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gold-400/15 font-medium text-gold-400 ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
      data-testid="low-stock-badge"
    >
      Only {quantity} left in stock
    </span>
  )
}
