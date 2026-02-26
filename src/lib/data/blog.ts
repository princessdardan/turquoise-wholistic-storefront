"use server"

import { sdk } from "@lib/config"

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  featured_image_url: string | null
  author: string | null
  category: string | null
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

export async function getBlogPosts(options?: {
  limit?: number
  offset?: number
  category?: string
}): Promise<BlogListResponse> {
  const { limit = 12, offset = 0, category } = options ?? {}

  const query: Record<string, string | number> = { limit, offset }
  if (category) {
    query.category = category
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
