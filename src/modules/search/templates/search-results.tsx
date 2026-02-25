import { listProducts } from "@lib/data/products"
import { sortProducts } from "@lib/util/sort-products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { SearchSortOption } from "@modules/search/components/search-sort"
import { HttpTypes } from "@medusajs/types"

const PRODUCT_LIMIT = 12

function getLowestPrice(product: HttpTypes.StoreProduct): number | null {
  const prices = product.variants
    ?.flatMap((v) => {
      const calc = v.calculated_price as any
      return calc?.calculated_amount != null ? [calc.calculated_amount] : []
    })
  if (!prices || prices.length === 0) return null
  return Math.min(...prices)
}

function isInStock(product: HttpTypes.StoreProduct): boolean {
  return (
    product.variants?.some(
      (v) => (v as any).inventory_quantity == null || (v as any).inventory_quantity > 0
    ) ?? false
  )
}

export default async function SearchResults({
  query,
  sortBy,
  page,
  countryCode,
  categoryIds,
  minPrice,
  maxPrice,
  inStock,
}: {
  query: string
  sortBy: SearchSortOption
  page: number
  countryCode: string
  categoryIds: string[]
  minPrice: string
  maxPrice: string
  inStock: boolean
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams: Record<string, any> = {
    q: query,
    limit: 100,
  }

  // Server-side category filter via Medusa API
  if (categoryIds.length > 0) {
    queryParams.category_id = categoryIds
  }

  const {
    response: { products: allProducts },
  } = await listProducts({
    pageParam: 0,
    queryParams,
    countryCode,
  })

  // Client-side price range filtering
  let filteredProducts = allProducts

  const minPriceCents = minPrice ? parseFloat(minPrice) * 100 : null
  const maxPriceCents = maxPrice ? parseFloat(maxPrice) * 100 : null

  if (minPriceCents != null || maxPriceCents != null) {
    filteredProducts = filteredProducts.filter((p) => {
      const price = getLowestPrice(p)
      if (price == null) return false
      if (minPriceCents != null && price < minPriceCents) return false
      if (maxPriceCents != null && price > maxPriceCents) return false
      return true
    })
  }

  // Client-side in-stock filtering
  if (inStock) {
    filteredProducts = filteredProducts.filter(isInStock)
  }

  const count = filteredProducts.length

  // "relevance" preserves API order; others use client-side sort
  const sortedProducts =
    sortBy === "relevance"
      ? filteredProducts
      : sortProducts(filteredProducts, sortBy as SortOptions)

  const offset = (page - 1) * PRODUCT_LIMIT
  const paginatedProducts = sortedProducts.slice(offset, offset + PRODUCT_LIMIT)
  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (count === 0) {
    return (
      <p className="text-ui-fg-subtle">
        No products found matching &ldquo;{query}&rdquo;. Try a different search
        term or adjust your filters.
      </p>
    )
  }

  return (
    <>
      <p className="text-ui-fg-muted text-sm mb-6">
        {count} {count === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
      </p>
      <ul
        className="grid grid-cols-1 xsmall:grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {paginatedProducts.map((p) => (
          <li key={p.id}>
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} />
      )}
    </>
  )
}
