import { listProductsWithSort } from "@lib/data/products"
import { getFilteredProductIds } from "@lib/data/product-access"
import { productToGA4Item } from "@lib/analytics"
import { getDefaultRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { ViewItemListTracker } from "@modules/common/components/analytics-tracker"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  channel,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  channel?: "retail" | "professional"
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  // When channel filtering is active, fetch accessible product IDs first
  let professionalProductIds: string[] = []
  if (channel) {
    const filtered = await getFilteredProductIds(channel)
    professionalProductIds = filtered.professionalProductIds

    if (productsIds) {
      queryParams["id"] = productsIds.filter((id) =>
        filtered.productIds.includes(id)
      )
    } else {
      queryParams["id"] = filtered.productIds
    }
  } else if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getDefaultRegion()

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  const ga4Items = products.map((p, i) => productToGA4Item(p, { index: i }))

  return (
    <>
      <ViewItemListTracker
        items={ga4Items}
        listName={categoryId ? "Category" : collectionId ? "Collection" : "Store"}
        listId={categoryId ?? collectionId ?? "store"}
      />
      <ul
        className="grid grid-cols-1 xsmall:grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview
                product={p}
                region={region}
                isProfessional={professionalProductIds.includes(p.id)}
              />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
