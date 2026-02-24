"use client"

import { clx } from "@medusajs/ui"

type QuantitySelectorProps = {
  quantity: number
  onChange: (quantity: number) => void
  max?: number
  disabled?: boolean
}

export default function QuantitySelector({
  quantity,
  onChange,
  max,
  disabled,
}: QuantitySelectorProps) {
  const decrement = () => {
    if (quantity > 1) onChange(quantity - 1)
  }

  const increment = () => {
    if (!max || quantity < max) onChange(quantity + 1)
  }

  return (
    <div className="flex items-center border border-gray-200 rounded-full h-10 w-fit">
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || quantity <= 1}
        className={clx(
          "w-10 h-full flex items-center justify-center text-lg transition-colors rounded-l-full",
          "hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        )}
        aria-label="Decrease quantity"
      >
        &minus;
      </button>
      <span
        className="w-10 text-center text-sm font-medium tabular-nums select-none"
        data-testid="quantity-value"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={disabled || (max !== undefined && quantity >= max)}
        className={clx(
          "w-10 h-full flex items-center justify-center text-lg transition-colors rounded-r-full",
          "hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        )}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
