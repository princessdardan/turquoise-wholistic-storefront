import { Metadata } from "next"
import {
  BlogPost,
  getBlogCategories,
  getBlogPosts,
  getReadingTime,
} from "@lib/data/blog"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CategoryCarousel from "@modules/blog/components/category-carousel"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Health and wellness articles from Turquoise Wholistic. Explore natural remedies, holistic health tips, and expert insights for your wellness journey.",
}

export const revalidate = 60

const POSTS_PER_PAGE = 12

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

type Props = {
  searchParams: Promise<{ page?: string; category?: string }>
}

function PostCard({ post }: { post: BlogPost }) {
  const readingTime = getReadingTime(post.body)

  return (
    <LocalizedClientLink
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image or placeholder */}
      {post.featured_image_url ? (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-sand-50 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-turquoise-200"
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
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Category badges */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {post.categories.map((cat) => (
              <span
                key={cat.id}
                className="inline-block px-2 py-0.5 text-xs font-medium bg-turquoise-50 text-turquoise-700 rounded"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="font-playfair text-lg font-semibold text-gray-900 group-hover:text-turquoise-700 transition-colors mb-2">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2">
            {post.author && (
              <>
                <span className="text-gray-500">{post.author}</span>
                <span aria-hidden="true">&middot;</span>
              </>
            )}
            <span>
              {post.published_at
                ? formatDate(post.published_at)
                : formatDate(post.created_at)}
            </span>
          </div>
          <span>{readingTime} min read</span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  const readingTime = getReadingTime(post.body)

  return (
    <LocalizedClientLink
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-1 lg:grid-cols-2 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow mb-10"
    >
      {/* Large image */}
      {post.featured_image_url ? (
        <div className="aspect-[16/9] lg:aspect-auto lg:min-h-[360px] overflow-hidden">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] lg:aspect-auto lg:min-h-[360px] bg-sand-50 flex items-center justify-center">
          <svg
            className="w-20 h-20 text-turquoise-200"
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
      )}

      {/* Content */}
      <div className="p-6 lg:p-8 flex flex-col justify-center">
        {/* Category badges */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.categories.map((cat) => (
              <span
                key={cat.id}
                className="inline-block px-2.5 py-0.5 text-xs font-medium bg-turquoise-50 text-turquoise-700 rounded"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        <h2 className="font-playfair text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-turquoise-700 transition-colors mb-3">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-base text-gray-600 leading-relaxed mb-5 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {post.author && (
            <>
              <span className="text-gray-500 font-medium">{post.author}</span>
              <span aria-hidden="true">&middot;</span>
            </>
          )}
          <span>
            {post.published_at
              ? formatDate(post.published_at)
              : formatDate(post.created_at)}
          </span>
          <span aria-hidden="true">&middot;</span>
          <span>{readingTime} min read</span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}

export default async function BlogPage({ searchParams }: Props) {
  const { page, category } = await searchParams
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1)
  const offset = (currentPage - 1) * POSTS_PER_PAGE

  // Fetch categories for carousel
  const categories = await getBlogCategories()

  // Resolve category slug to ID for API filtering
  const activeCategory = category
    ? categories.find((c) => c.slug === category)
    : null

  const { blog_posts: posts, count } = await getBlogPosts({
    limit: POSTS_PER_PAGE,
    offset,
    category_id: activeCategory?.id,
  })

  const totalPages = Math.ceil(count / POSTS_PER_PAGE)

  // Featured post: only on "All" (no category filter) and first page
  const showFeatured = !activeCategory && currentPage === 1 && posts.length > 0
  const featuredPost = showFeatured ? posts[0] : null
  const gridPosts = showFeatured ? posts.slice(1) : posts

  // Build pagination href preserving category filter
  function paginationHref(pageNum: number): string {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (pageNum > 1) params.set("page", String(pageNum))
    const qs = params.toString()
    return `/blog${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-16">
          <h1 className="font-playfair text-4xl font-bold text-turquoise-800 mb-4">
            Wellness Journal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Expert insights, natural health tips, and holistic wellness guides
            to support your journey to well-being.
          </p>
        </div>
      </div>

      <div className="content-container py-12">
        {/* Category carousel */}
        {categories.length > 0 && (
          <div className="mb-8">
            <CategoryCarousel
              categories={categories}
              activeSlug={category || null}
            />
          </div>
        )}

        {posts.length === 0 ? (
          activeCategory ? (
            <div className="text-center py-20">
              <div className="mx-auto max-w-md">
                <svg
                  className="mx-auto w-16 h-16 text-turquoise-200 mb-6"
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
                <h2 className="font-playfair text-2xl font-semibold text-gray-900 mb-3">
                  No articles in {activeCategory.name} yet
                </h2>
                <p className="text-gray-500 text-base mb-6">
                  Check back soon! New content is added regularly.
                </p>
                <LocalizedClientLink
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-turquoise-500 text-white text-sm font-medium rounded-lg hover:bg-turquoise-600 transition-colors"
                >
                  View All Articles
                </LocalizedClientLink>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No articles yet. Check back soon!
              </p>
            </div>
          )
        ) : (
          <>
            {/* Featured post (only on unfiltered "All" view, first page) */}
            {featuredPost && <FeaturedPostCard post={featuredPost} />}

            {/* Standard post grid */}
            {gridPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2 mt-12">
                {currentPage > 1 && (
                  <LocalizedClientLink
                    href={paginationHref(currentPage - 1)}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-turquoise-50 hover:border-turquoise-200 transition-colors"
                  >
                    Previous
                  </LocalizedClientLink>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <LocalizedClientLink
                      key={pageNum}
                      href={paginationHref(pageNum)}
                      className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                        pageNum === currentPage
                          ? "bg-turquoise-500 text-white border-turquoise-500"
                          : "border-gray-200 text-gray-600 hover:bg-turquoise-50 hover:border-turquoise-200"
                      }`}
                    >
                      {pageNum}
                    </LocalizedClientLink>
                  )
                )}

                {currentPage < totalPages && (
                  <LocalizedClientLink
                    href={paginationHref(currentPage + 1)}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-turquoise-50 hover:border-turquoise-200 transition-colors"
                  >
                    Next
                  </LocalizedClientLink>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
