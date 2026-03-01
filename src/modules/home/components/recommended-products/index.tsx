import { listProducts } from "@lib/data/products"
import { getCollectionByHandle } from "@lib/data/collections"
import { HttpTypes } from "@medusajs/types"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"
import Carousel from "./carousel"

export default async function RecommendedProducts({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  let products: HttpTypes.StoreProduct[] = []
  let collectionHandle: string | null = null

  // Try to fetch from a "Recommended" collection
  try {
    const collection = await getCollectionByHandle("recommended")
    if (collection?.id) {
      collectionHandle = collection.handle
      const {
        response: { products: collectionProducts },
      } = await listProducts({
        regionId: region.id,
        queryParams: {
          collection_id: [collection.id],
          limit: 8,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity",
        },
      })
      products = collectionProducts
    }
  } catch {
    // Collection doesn't exist — fall through to fallback
  }

  // Fallback: newest 8 products
  if (products.length === 0) {
    const {
      response: { products: newestProducts },
    } = await listProducts({
      regionId: region.id,
      queryParams: {
        limit: 8,
        order: "-created_at",
        fields:
          "*variants.calculated_price,+variants.inventory_quantity",
      },
    })
    products = newestProducts
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="w-full py-12 small:py-16 bg-sand-50">
      <div className="content-container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-2xl small:text-3xl font-medium text-brand-text">
            Recommended for You
          </h2>
          {collectionHandle && (
            <InteractiveLink href={`/collections/${collectionHandle}`}>
              View all
            </InteractiveLink>
          )}
        </div>

        <Carousel>
          {products.map((product) => (
            <div
              key={product.id}
              className="snap-start flex-shrink-0 w-[272px] xsmall:w-[280px]"
            >
              <ProductPreview product={product} region={region} isFeatured />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  )
}
