import { MetadataRoute } from "next"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAllBlogPosts } from "@lib/data/blog"
import { getBaseURL } from "@lib/util/env"

const STATIC_PAGES = [
  { path: "", changeFrequency: "daily" as const, priority: 1 },
  { path: "/store", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/visit-us", changeFrequency: "monthly" as const, priority: 0.6 },
  {
    path: "/privacy-policy",
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    path: "/terms-of-service",
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
]

async function getCountryCodes(): Promise<string[]> {
  try {
    const { regions } = await sdk.client.fetch<{
      regions: HttpTypes.StoreRegion[]
    }>("/store/regions", { cache: "force-cache" })

    return regions
      .flatMap((region) => region.countries?.map((c) => c.iso_2) ?? [])
      .filter(Boolean) as string[]
  } catch {
    return ["ca"]
  }
}

async function getProducts(): Promise<
  Pick<HttpTypes.StoreProduct, "handle" | "updated_at">[]
> {
  try {
    const { products } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
    }>("/store/products", {
      query: { limit: 1000, fields: "handle,updated_at" },
      cache: "force-cache",
    })
    return products
  } catch {
    return []
  }
}

async function getCategories(): Promise<
  Pick<HttpTypes.StoreProductCategory, "handle" | "updated_at">[]
> {
  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: { limit: 100, fields: "handle,updated_at" },
      cache: "force-cache",
    })
    return product_categories
  } catch {
    return []
  }
}

async function getCollections(): Promise<
  Pick<HttpTypes.StoreCollection, "handle" | "updated_at">[]
> {
  try {
    const { collections } = await sdk.client.fetch<{
      collections: HttpTypes.StoreCollection[]
    }>("/store/collections", {
      query: { limit: 100, fields: "handle,updated_at" },
      cache: "force-cache",
    })
    return collections
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()

  const [countryCodes, products, categories, collections] = await Promise.all([
    getCountryCodes(),
    getProducts(),
    getCategories(),
    getCollections(),
  ])

  const blogPosts = getAllBlogPosts()
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const countryCode of countryCodes) {
    const prefix = `${baseUrl}/${countryCode}`

    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${prefix}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    }

    for (const product of products) {
      entries.push({
        url: `${prefix}/products/${product.handle}`,
        lastModified: product.updated_at
          ? new Date(product.updated_at)
          : now,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }

    for (const category of categories) {
      entries.push({
        url: `${prefix}/categories/${category.handle}`,
        lastModified: category.updated_at
          ? new Date(category.updated_at)
          : now,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }

    for (const collection of collections) {
      entries.push({
        url: `${prefix}/collections/${collection.handle}`,
        lastModified: collection.updated_at
          ? new Date(collection.updated_at)
          : now,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }

    for (const post of blogPosts) {
      entries.push({
        url: `${prefix}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }

  return entries
}
