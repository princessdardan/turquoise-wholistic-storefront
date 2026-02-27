import { sdk } from "@lib/config"

export type BlogCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  handle: string
  product_category_id: string | null
  post_count: number
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  featured_image_url: string | null
  author: string | null
  categories?: BlogCategory[]
  tags: string[] | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

type BlogListResponse = {
  blog_posts: BlogPost[]
  count: number
  limit: number
  offset: number
}

type BlogSingleResponse = {
  blog_post: BlogPost
}

type BlogCategoryListResponse = {
  blog_categories: BlogCategory[]
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  "use server"
  const { blog_categories } =
    await sdk.client.fetch<BlogCategoryListResponse>(
      `/store/blog/categories`,
      {
        method: "GET",
        next: { revalidate: 60 },
        cache: "force-cache",
      }
    )
  return blog_categories
}

export async function getBlogPosts(options?: {
  limit?: number
  offset?: number
  category_id?: string
}): Promise<BlogListResponse> {
  "use server"
  const { limit = 12, offset = 0, category_id } = options ?? {}

  const query: Record<string, string | number> = { limit, offset }
  if (category_id) {
    query.category_id = category_id
  }

  return sdk.client.fetch<BlogListResponse>(`/store/blog`, {
    method: "GET",
    query,
    next: { revalidate: 60 },
    cache: "force-cache",
  })
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  "use server"
  try {
    const { blog_post } = await sdk.client.fetch<BlogSingleResponse>(
      `/store/blog/${slug}`,
      {
        method: "GET",
        next: { revalidate: 60 },
        cache: "force-cache",
      }
    )
    return blog_post
  } catch {
    return null
  }
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}
