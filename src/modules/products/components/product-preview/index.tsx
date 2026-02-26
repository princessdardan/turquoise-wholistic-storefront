import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import StockBadge from "../stock-badge"
import WishlistButton from "../wishlist-button"
import SaleBadge from "../sale-badge"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <div className="relative group">
      <LocalizedClientLink href={`/products/${product.handle}`}>
        <div data-testid="product-wrapper" className="rounded-lg overflow-hidden transition-shadow duration-300 group-hover:shadow-md">
          <div className="relative">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
            />
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {cheapestPrice?.is_on_sale && (
                <SaleBadge
                  percentageOff={cheapestPrice.percentage_diff}
                  compact
                />
              )}
              {product.variants && product.variants.length > 0 && (
                <StockBadge variants={product.variants} compact />
              )}
            </div>
          </div>
          <div className="flex txt-compact-medium mt-4 justify-between px-1 pb-2">
            <Text className="text-ui-fg-subtle group-hover:text-brand-text transition-colors" data-testid="product-title">
              {product.title}
            </Text>
            <div className="flex items-center gap-x-2">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>
      </LocalizedClientLink>
      {product.id && <WishlistButton productId={product.id} />}
    </div>
  )
}
