import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import ChannelFilterSync from "@modules/store/components/channel-filter-sync"

import PaginatedProducts from "./paginated-products"

export type ChannelFilter = "retail" | "professional" | "all"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  channel,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  channel?: ChannelFilter
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const activeChannel = channel || "all"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title" className="font-serif">All Products</h1>
        </div>
        <ChannelFilterSync />
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            channel={activeChannel}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
