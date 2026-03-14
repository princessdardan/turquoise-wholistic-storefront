import { Suspense } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import SearchSort, {
  SearchSortOption,
} from "@modules/search/components/search-sort"
import SearchFilters from "@modules/search/components/search-filters"
import SearchResults from "./search-results"
import { listCategories } from "@lib/data/categories"

export default async function SearchTemplate({
  query,
  sortBy,
  page,
  categoryIds,
  minPrice,
  maxPrice,
  inStock,
}: {
  query: string
  sortBy?: string
  page?: string
  categoryIds: string
  minPrice: string
  maxPrice: string
  inStock: boolean
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort: SearchSortOption =
    sortBy &&
    ["relevance", "price_asc", "price_desc", "created_at"].includes(sortBy)
      ? (sortBy as SearchSortOption)
      : "relevance"

  const selectedCategories = categoryIds
    ? categoryIds.split(",").filter(Boolean)
    : []

  const allCategories = await listCategories()
  const rootCategories = allCategories
    .filter((c) => !c.parent_category)
    .map((c) => ({ id: c.id, name: c.name, handle: c.handle }))

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="search-container"
    >
      <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
        <SearchSort sortBy={sort} />
        <SearchFilters
          categories={rootCategories}
          selectedCategories={selectedCategories}
          minPrice={minPrice}
          maxPrice={maxPrice}
          inStock={inStock}
        />
      </div>
      <div className="w-full">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-sm text-ui-fg-subtle">
            <li>
              <LocalizedClientLink
                href="/"
                className="hover:text-ui-fg-base transition-colors"
              >
                Home
              </LocalizedClientLink>
            </li>
            <li aria-hidden="true" className="text-ui-fg-muted">
              /
            </li>
            <li className="text-ui-fg-base font-medium">Search</li>
          </ol>
        </nav>
        <div className="mb-8">
          <h1 className="text-2xl-semi font-serif">
            {query ? (
              <>Search results for &ldquo;{query}&rdquo;</>
            ) : (
              "Search"
            )}
          </h1>
        </div>
        {query ? (
          <Suspense fallback={<SkeletonProductGrid />}>
            <SearchResults
              query={query}
              sortBy={sort}
              page={pageNumber}
              categoryIds={selectedCategories}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStock={inStock}
            />
          </Suspense>
        ) : (
          <p className="text-ui-fg-subtle">
            Enter a search term to find products.
          </p>
        )}
      </div>
    </div>
  )
}
