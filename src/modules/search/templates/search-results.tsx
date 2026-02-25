import { listProducts } from "@lib/data/products"
import { sortProducts } from "@lib/util/sort-products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { SearchSortOption } from "@modules/search/components/search-sort"

const PRODUCT_LIMIT = 12

export default async function SearchResults({
  query,
  sortBy,
  page,
  countryCode,
}: {
  query: string
  sortBy: SearchSortOption
  page: number
  countryCode: string
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products: allProducts, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      q: query,
      limit: 100,
    },
    countryCode,
  })

  // "relevance" preserves API order; others use client-side sort
  const sortedProducts =
    sortBy === "relevance"
      ? allProducts
      : sortProducts(allProducts, sortBy as SortOptions)

  const offset = (page - 1) * PRODUCT_LIMIT
  const paginatedProducts = sortedProducts.slice(offset, offset + PRODUCT_LIMIT)
  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (count === 0) {
    return (
      <p className="text-ui-fg-subtle">
        No products found matching &ldquo;{query}&rdquo;. Try a different search
        term.
      </p>
    )
  }

  return (
    <>
      <p className="text-ui-fg-muted text-sm mb-6">
        {count} {count === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
      </p>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
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
