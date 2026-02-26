import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type PairsWellWithProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function PairsWellWith({
  product,
  countryCode,
}: PairsWellWithProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const categoryIds = product.categories
    ?.map((c) => c.id)
    .filter(Boolean) as string[]

  let products: HttpTypes.StoreProduct[] = []

  // Try category-based suggestions first
  if (categoryIds?.length) {
    const { response } = await listProducts({
      queryParams: {
        region_id: region.id,
        category_id: categoryIds,
        limit: 5,
        is_giftcard: false,
      },
      countryCode,
    })
    products = response.products.filter((p) => p.id !== product.id).slice(0, 4)
  }

  // Fallback to popular/featured products if no category matches
  if (!products.length) {
    const { response } = await listProducts({
      queryParams: {
        region_id: region.id,
        limit: 5,
        is_giftcard: false,
        order: "-created_at",
      },
      countryCode,
    })
    products = response.products.filter((p) => p.id !== product.id).slice(0, 4)
  }

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="text-sm font-medium uppercase tracking-wider text-turquoise-600 mb-3">
          Pairs Well With
        </span>
        <p className="text-2xl font-serif text-brand-text max-w-lg">
          Complement your wellness routine
        </p>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <ul className="flex gap-x-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar small:grid small:grid-cols-3 medium:grid-cols-4 small:gap-x-6 small:gap-y-8 small:overflow-x-visible small:pb-0">
        {products.map((p) => (
          <li
            key={p.id}
            className="min-w-[220px] snap-start small:min-w-0"
          >
            <Product region={region} product={p} />
          </li>
        ))}
      </ul>
    </div>
  )
}
