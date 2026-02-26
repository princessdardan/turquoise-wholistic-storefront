import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import SaleBadge from "../sale-badge"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  return (
    <div className="flex flex-col text-ui-fg-base">
      <div className="flex items-center gap-x-2">
        <span
          className={clx("text-2xl font-semibold", {
            "text-turquoise-500": selectedPrice.is_on_sale,
          })}
        >
          {!variant && "From "}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
          >
            {selectedPrice.calculated_price}
          </span>
        </span>
        {selectedPrice.is_on_sale && (
          <SaleBadge percentageOff={selectedPrice.percentage_diff} />
        )}
      </div>
      {selectedPrice.is_on_sale && (
        <p>
          <span className="text-ui-fg-subtle">Original: </span>
          <span
            className="line-through text-ui-fg-muted"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
        </p>
      )}
    </div>
  )
}
