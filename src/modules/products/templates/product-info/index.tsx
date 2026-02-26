import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WishlistButton from "@modules/products/components/wishlist-button"
import HealthConcernTags from "@modules/products/components/health-concern-tags"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <div className="flex items-start justify-between gap-x-4">
          <Heading
            level="h2"
            className="text-3xl leading-10 text-brand-text font-serif"
            data-testid="product-title"
          >
            {product.title}
          </Heading>
          {product.id && (
            <WishlistButton productId={product.id} variant="button" />
          )}
        </div>

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>

        <HealthConcernTags categories={product.categories} />
      </div>
    </div>
  )
}

export default ProductInfo
