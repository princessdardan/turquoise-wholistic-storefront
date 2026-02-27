"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getAdminToken, adminFetch } from "@lib/data/admin-auth"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BlogPostData = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  featured_image_url: string | null
  author: string | null
  tags: string[] | null
  status: string
  published_at: string | null
  created_at: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export default function BlogPostPreview({ slug }: { slug: string }) {
  const params = useParams()
  const countryCode = params.countryCode as string
  const [post, setPost] = useState<BlogPostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const token = getAdminToken()
    if (!token) {
      setNotFound(true)
      setLoading(false)
      return
    }

    adminFetch<{ blog_posts: BlogPostData[]; count: number }>(
      `/admin/blog?slug=${encodeURIComponent(slug)}&limit=1&offset=0`
    )
      .then((data) => {
        if (data.blog_posts.length > 0) {
          setPost(data.blog_posts[0])
        } else {
          setNotFound(true)
        }
      })
      .catch(() => {
        setNotFound(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-2 border-turquoise-200 border-t-turquoise-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !post) {
    return null // Let the server 404 handle it
  }

  const readingTime = getReadingTime(post.body)
  const publishedDate = post.published_at || post.created_at
  const isHtml = post.body.includes("<") && post.body.includes(">")

  return (
    <div className="bg-white">
      {/* Preview banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="content-container flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">Preview Mode</span>
            <span className="text-amber-600">
              — This post is{" "}
              <span className="font-semibold">{post.status}</span>
            </span>
          </div>
          <LocalizedClientLink
            href={`/blog/editor/${post.id}`}
            className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Edit Post
          </LocalizedClientLink>
        </div>
      </div>

      {/* Back to blog */}
      <div className="content-container pt-8">
        <LocalizedClientLink
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-turquoise-600 hover:text-turquoise-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Blog
        </LocalizedClientLink>
      </div>

      {/* Article header */}
      <header className="content-container pt-6 pb-8 max-w-3xl mx-auto">
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          {post.author && <span>By {post.author}</span>}
          <span>{formatDate(publishedDate)}</span>
          <span>{readingTime} min read</span>
        </div>
      </header>

      {/* Article content */}
      <article className="content-container max-w-3xl mx-auto pb-12">
        <div className="prose prose-gray prose-lg max-w-none prose-headings:font-playfair prose-headings:text-gray-900 prose-a:text-turquoise-600 hover:prose-a:text-turquoise-700 prose-strong:text-gray-900 prose-img:rounded-lg">
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: post.body }} />
          ) : (
            <div style={{ whiteSpace: "pre-wrap" }}>{post.body}</div>
          )}
        </div>
      </article>
    </div>
  )
}
