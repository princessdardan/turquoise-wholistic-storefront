import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

/**
 * A node in the category tree with typed children and product count.
 */
export type CategoryTree = {
  id: string
  name: string
  handle: string
  description: string | null
  /** Direct child categories (e.g., product type subcategories under a health concern) */
  children: CategoryTree[]
  /** Number of products in this category (0 if not loaded) */
  productCount: number
  /** Optional color metadata for gradient cards */
  metadata?: Record<string, unknown> | null
}

/**
 * Separated category trees for use by mega menu, side menu, footer, and homepage.
 */
export type CategoryTrees = {
  healthConcerns: CategoryTree[]
  productTypes: CategoryTree[]
}

/**
 * Converts a Medusa StoreProductCategory into a CategoryTree node.
 */
function toCategoryTree(
  cat: HttpTypes.StoreProductCategory
): CategoryTree {
  return {
    id: cat.id,
    name: cat.name,
    handle: cat.handle,
    description: cat.description ?? null,
    children: (cat.category_children || []).map(toCategoryTree),
    productCount: cat.products?.length ?? 0,
    metadata: cat.metadata ?? null,
  }
}

/**
 * Fetches the full category tree from Medusa and separates it into
 * Health Concerns and Product Types trees.
 *
 * Uses `include_descendants_tree=true` to get all levels in one request.
 * Categories with no products are still included (they may have subcategories
 * with products).
 *
 * Results are cached via Next.js ISR with the "categories" cache tag.
 *
 * Reusable by: mega menu, side menu, footer, homepage category array.
 */
export const getCategoryTrees = async (): Promise<CategoryTrees> => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const { product_categories } = await sdk.client.fetch<{
    product_categories: HttpTypes.StoreProductCategory[]
  }>("/store/product-categories", {
    query: {
      fields:
        "*category_children, *category_children.category_children, *products",
      include_descendants_tree: true,
      parent_category_id: "null",
      limit: 100,
    },
    next,
    cache: "force-cache",
  })

  const healthConcernsRoot = product_categories.find(
    (c) => c.name === "Health Concerns"
  )
  const productTypesRoot = product_categories.find(
    (c) => c.name === "Product Types"
  )

  return {
    healthConcerns: (healthConcernsRoot?.category_children || []).map(
      toCategoryTree
    ),
    productTypes: (productTypesRoot?.category_children || []).map(
      toCategoryTree
    ),
  }
}

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products, *parent_category, *parent_category.parent_category",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
