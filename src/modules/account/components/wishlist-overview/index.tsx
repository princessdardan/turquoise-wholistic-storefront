"use client"

import { useState, useTransition } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { WishlistItemWithProduct, removeFromWishlist } from "@lib/data/wishlist"
import { addToCart } from "@lib/data/cart"
import { getProductPrice } from "@lib/util/get-product-price"

type WishlistOverviewProps = {
  items: WishlistItemWithProduct[]
  countryCode: string
}

const WishlistOverview = ({ items, countryCode }: WishlistOverviewProps) => {
  const [wishlistItems, setWishlistItems] = useState(items)

  if (wishlistItems.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-y-4 py-16 text-center"
        data-testid="wishlist-empty-state"
      >
        <p className="text-large-semi">Your wishlist is empty</p>
        <p className="text-base-regular text-ui-fg-subtle max-w-md">
          Browse our products to find something you love!
        </p>
        <LocalizedClientLink href="/store">
          <Button variant="secondary" data-testid="browse-products-button">
            Browse Products
          </Button>
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-y-4"
      data-testid="wishlist-items-container"
    >
      {wishlistItems.map((item) => (
        <WishlistItemCard
          key={item.id}
          item={item}
          countryCode={countryCode}
          onRemove={(id) =>
            setWishlistItems((prev) => prev.filter((i) => i.id !== id))
          }
        />
      ))}
    </div>
  )
}

type WishlistItemCardProps = {
  item: WishlistItemWithProduct
  countryCode: string
  onRemove: (id: string) => void
}

const WishlistItemCard = ({
  item,
  countryCode,
  onRemove,
}: WishlistItemCardProps) => {
  const [isRemoving, startRemoveTransition] = useTransition()
  const [isAddingToCart, startCartTransition] = useTransition()
  const [cartSuccess, setCartSuccess] = useState(false)

  const product = item.product

  if (!product) {
    return null
  }

  const { cheapestPrice } = getProductPrice({ product })
  const firstVariant = product.variants?.[0]
  const variantTitle =
    firstVariant?.title && firstVariant.title !== "Default"
      ? firstVariant.title
      : null

  const handleRemove = () => {
    onRemove(item.id)
    startRemoveTransition(async () => {
      const result = await removeFromWishlist(item.id)
      if (!result.success) {
        // Revert would require re-adding, but the page will refresh on next visit
      }
    })
  }

  const handleAddToCart = () => {
    if (!firstVariant?.id) return
    setCartSuccess(false)
    startCartTransition(async () => {
      await addToCart({
        variantId: firstVariant.id,
        quantity: 1,
        countryCode,
      })
      setCartSuccess(true)
      setTimeout(() => setCartSuccess(false), 2000)
    })
  }

  return (
    <div
      className="flex gap-x-4 border-b border-gray-200 pb-4"
      data-testid="wishlist-item"
    >
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="shrink-0"
      >
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="square"
          className="w-[100px] h-[100px]"
        />
      </LocalizedClientLink>

      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="hover:underline"
          >
            <p className="text-base-semi truncate">{product.title}</p>
          </LocalizedClientLink>
          {variantTitle && (
            <p className="text-small-regular text-ui-fg-subtle mt-0.5">
              {variantTitle}
            </p>
          )}
          {cheapestPrice && (
            <p className="text-base-regular mt-1">
              {cheapestPrice.calculated_price}
            </p>
          )}
        </div>

        <div className="flex items-center gap-x-2 mt-2">
          <Button
            variant="secondary"
            size="small"
            onClick={handleAddToCart}
            disabled={!firstVariant?.id || isAddingToCart}
            data-testid="wishlist-add-to-cart"
          >
            {isAddingToCart
              ? "Adding..."
              : cartSuccess
                ? "Added!"
                : "Add to Cart"}
          </Button>
          <Button
            variant="transparent"
            size="small"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-ui-fg-subtle hover:text-ui-fg-base"
            data-testid="wishlist-remove-item"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}

export default WishlistOverview
