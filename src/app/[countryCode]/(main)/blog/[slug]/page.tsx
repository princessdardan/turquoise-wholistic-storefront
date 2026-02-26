import { Metadata } from "next"
import { notFound } from "next/navigation"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  getBlogPostBySlug,
  getBlogPosts,
  getReadingTime,
} from "@lib/data/blog"
import { getBaseURL } from "@lib/util/env"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  params: Promise<{ slug: string; countryCode: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, countryCode } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return { title: "Article Not Found" }
  }

  const publishedDate = post.published_at || post.created_at

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      publishedTime: new Date(publishedDate).toISOString(),
      authors: post.author ? [post.author] : undefined,
      tags: post.category ? [post.category] : undefined,
      url: `${getBaseURL()}/${countryCode}/blog/${slug}`,
    },
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug, countryCode } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const readingTime = getReadingTime(post.body)
  const publishedDate = post.published_at || post.created_at

  // Related articles: same category, exclude current, max 3
  let relatedPosts: typeof post[] = []
  if (post.category) {
    const { blog_posts } = await getBlogPosts({
      category: post.category,
      limit: 4,
    })
    relatedPosts = blog_posts
      .filter((p) => p.slug !== post.slug)
      .slice(0, 3)
  }

  const baseUrl = getBaseURL()
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: new Date(publishedDate).toISOString(),
    url: `${baseUrl}/${countryCode}/blog/${slug}`,
    ...(post.author && {
      author: {
        "@type": "Person",
        name: post.author,
      },
    }),
    publisher: {
      "@type": "Organization",
      name: "Turquoise Wholistic",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.svg`,
      },
    },
    ...(post.category && {
      articleSection: post.category,
    }),
    wordCount: post.body.split(/\s+/).length,
    isPartOf: {
      "@type": "Blog",
      name: "Turquoise Wholistic Blog",
      url: `${baseUrl}/${countryCode}/blog`,
    },
  }

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
        {post.category && (
          <span className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-3 block">
            {post.category}
          </span>
        )}

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
          <Markdown remarkPlugins={[remarkGfm]}>{post.body}</Markdown>
        </div>
      </article>

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-gray-100 bg-sand-50">
          <div className="content-container py-12 max-w-3xl mx-auto">
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
              Related Articles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((related) => {
                const relatedDate =
                  related.published_at || related.created_at

                return (
                  <LocalizedClientLink
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Image placeholder */}
                    <div className="aspect-[16/9] bg-turquoise-50 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-turquoise-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>

                    <div className="p-4">
                      <h3 className="font-playfair text-sm font-semibold text-gray-900 group-hover:text-turquoise-700 transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(relatedDate)}
                      </p>
                    </div>
                  </LocalizedClientLink>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
