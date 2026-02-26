import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import StockBadge from "../stock-badge"
import WishlistButton from "../wishlist-button"
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
            {product.variants && product.variants.length > 0 && (
              <div className="absolute top-2 left-2">
                <StockBadge variants={product.variants} compact />
              </div>
            )}
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
