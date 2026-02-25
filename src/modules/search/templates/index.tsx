import { Suspense } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import SearchSort, {
  SearchSortOption,
} from "@modules/search/components/search-sort"
import SearchResults from "./search-results"

export default function SearchTemplate({
  query,
  sortBy,
  page,
  countryCode,
}: {
  query: string
  sortBy?: string
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort: SearchSortOption =
    sortBy && ["relevance", "price_asc", "price_desc", "created_at"].includes(sortBy)
      ? (sortBy as SearchSortOption)
      : "relevance"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="search-container"
    >
      <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
        <SearchSort sortBy={sort} />
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
              countryCode={countryCode}
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
