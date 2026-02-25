import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  const productCount = category.products?.length ?? 0

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} data-testid="sort-by-container" />
      <div className="w-full">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-sm text-ui-fg-subtle">
            <li>
              <LocalizedClientLink href="/" className="hover:text-ui-fg-base transition-colors">
                Home
              </LocalizedClientLink>
            </li>
            <li aria-hidden="true" className="text-ui-fg-muted">/</li>
            <li>
              <LocalizedClientLink href="/store" className="hover:text-ui-fg-base transition-colors">
                Shop
              </LocalizedClientLink>
            </li>
            {parents.reverse().map((parent) => (
              <li key={parent.id} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-ui-fg-muted">/</span>
                <LocalizedClientLink
                  href={`/categories/${parent.handle}`}
                  className="hover:text-ui-fg-base transition-colors"
                >
                  {parent.name}
                </LocalizedClientLink>
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-ui-fg-muted">/</span>
              <span className="text-ui-fg-base font-medium">{category.name}</span>
            </li>
          </ol>
        </nav>
        <div className="mb-8">
          <h1 className="text-2xl-semi" data-testid="category-page-title">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-ui-fg-subtle mt-2 text-base-regular">
              {category.description}
            </p>
          )}
          <p className="text-ui-fg-muted text-sm mt-2">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        </div>
        {category.category_children && (
          <div className="mb-8 text-base-large">
            <ul className="grid grid-cols-1 gap-2">
              {category.category_children?.map((c) => (
                <li key={c.id}>
                  <InteractiveLink href={`/categories/${c.handle}`}>
                    {c.name}
                  </InteractiveLink>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
