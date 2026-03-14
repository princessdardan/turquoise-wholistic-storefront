import { MetadataRoute } from "next"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getBlogPosts } from "@lib/data/blog"
import { getBaseURL } from "@lib/util/env"

const CHANNELS = ["retail", "professional"] as const

// Pages that exist under each channel route
const CHANNEL_PAGES = [
  { path: "", changeFrequency: "daily" as const, priority: 1 },
  { path: "/store", changeFrequency: "daily" as const, priority: 0.9 },
]

// Shared pages at root level
const SHARED_PAGES = [
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

  const [products, categories, collections, blogData] = await Promise.all([
    getProducts(),
    getCategories(),
    getCollections(),
    getBlogPosts({ limit: 100 }).catch(() => ({ blog_posts: [] })),
  ])

  const blogPosts = blogData.blog_posts
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  // Root landing page
  entries.push({
    url: baseUrl,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1,
  })

  // Channel-specific pages
  for (const channel of CHANNELS) {
    const prefix = `${baseUrl}/${channel}`

    for (const page of CHANNEL_PAGES) {
      entries.push({
        url: `${prefix}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    }

    // Products under each channel
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

    // Categories under each channel
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

    // Collections under each channel
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
  }

  // Shared pages (root level)
  for (const page of SHARED_PAGES) {
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  }

  // Blog posts (shared, root level)
  for (const post of blogPosts) {
    entries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }

  return entries
}
