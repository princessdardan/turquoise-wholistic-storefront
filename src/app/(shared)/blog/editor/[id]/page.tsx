"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  getAdminToken,
  adminLogin,
  removeAdminToken,
  validateAdminToken,
  adminFetch,
} from "@lib/data/admin-auth"
import RichTextEditor from "@modules/blog/components/rich-text-editor"
import InteractiveLink from "@modules/common/components/interactive-link"

// ─── Types ────────────────────────────────────────────────────────

type BlogCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  post_count: number
}

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
  categories?: BlogCategory[]
}

// ─── Slug Helper ──────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── Not Found Page ───────────────────────────────────────────────

function NotFoundPage({
  onShowLogin,
}: {
  onShowLogin: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-turquoise-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>

      <h1 className="font-serif text-3xl font-bold text-brand-text mb-3">
        Page Not Found
      </h1>
      <p className="text-brand-text-secondary max-w-md mb-8">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may
        have been moved or no longer exists.
      </p>

      <div className="flex flex-col xsmall:flex-row gap-3 items-center">
        <InteractiveLink href="/">Go Home</InteractiveLink>
        <span className="text-brand-text-secondary">or</span>
        <InteractiveLink href="/store">Browse Store</InteractiveLink>
      </div>

      <button
        onClick={onShowLogin}
        className="mt-16 text-[10px] text-gray-300 hover:text-gray-400 transition-colors cursor-pointer"
      >
        Admin
      </button>
    </div>
  )
}

// ─── Login Form ───────────────────────────────────────────────────

function LoginForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await adminLogin(email, password)
      onSuccess()
    } catch {
      setError("Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-sm">
        <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6 text-center">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-turquoise-500 text-white font-medium rounded-lg hover:bg-turquoise-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Blog Editor Edit Form ───────────────────────────────────────

function BlogEditorEditForm({ postId }: { postId: string }) {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [excerpt, setExcerpt] = useState("")
  const [body, setBody] = useState("")
  const [featuredImageUrl, setFeaturedImageUrl] = useState("")
  const [author, setAuthor] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [status, setStatus] = useState<"draft" | "published">("draft")
  const [publishDate, setPublishDate] = useState("")

  // UI state
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")
  const [loadingPost, setLoadingPost] = useState(true)
  const [loadError, setLoadError] = useState("")

  // Fetch post data and categories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [postRes, catRes] = await Promise.all([
          adminFetch<{ blog_post: BlogPostData }>(`/admin/blog/${postId}`),
          adminFetch<{ blog_categories: BlogCategory[] }>(
            "/admin/blog/categories?limit=100&offset=0"
          ),
        ])

        const post = postRes.blog_post
        setTitle(post.title)
        setSlug(post.slug)
        setSlugManuallyEdited(true) // Don't auto-generate for existing posts
        setExcerpt(post.excerpt || "")
        setBody(post.body)
        setFeaturedImageUrl(post.featured_image_url || "")
        setAuthor(post.author || "")
        setTagsInput(post.tags ? post.tags.join(", ") : "")
        setStatus(post.status === "published" ? "published" : "draft")
        if (post.published_at) {
          // Convert to datetime-local format
          const date = new Date(post.published_at)
          const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          setPublishDate(local.toISOString().slice(0, 16))
        }
        if (post.categories) {
          setSelectedCategoryIds(post.categories.map((c) => c.id))
        }

        setCategories(catRes.blog_categories)
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load post"
        )
      } finally {
        setLoadingPost(false)
      }
    }

    loadData()
  }, [postId])

  // Auto-generate slug from title (only if not manually edited)
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(toSlug(title))
    }
  }, [title, slugManuallyEdited])

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setSlug(value)
  }

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const parseTags = (): string[] => {
    return tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  }

  const handleSave = useCallback(
    async (saveStatus: "draft" | "published") => {
      setSaving(true)
      setSaveError("")
      setSaveSuccess("")

      try {
        const postData: Record<string, unknown> = {
          title,
          slug: slug || undefined,
          excerpt: excerpt || null,
          body,
          featured_image_url: featuredImageUrl || null,
          author: author || null,
          tags: parseTags().length > 0 ? parseTags() : null,
          status: saveStatus,
          published_at:
            saveStatus === "published"
              ? publishDate
                ? new Date(publishDate).toISOString()
                : new Date().toISOString()
              : publishDate
                ? new Date(publishDate).toISOString()
                : null,
        }

        const { blog_post } = await adminFetch<{
          blog_post: { id: string; slug: string }
        }>(`/admin/blog/${postId}`, {
          method: "POST",
          body: JSON.stringify(postData),
        })

        // Update category associations
        await adminFetch(`/admin/blog/${postId}/categories`, {
          method: "POST",
          body: JSON.stringify({ category_ids: selectedCategoryIds }),
        })

        if (saveStatus === "published") {
          router.push(`/blog/${blog_post.slug}`)
        } else {
          setSaveSuccess("Draft saved successfully!")
          // Update slug in state in case it changed
          setSlug(blog_post.slug)
        }
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : "Failed to save post"
        )
      } finally {
        setSaving(false)
      }
    },
    [
      title,
      slug,
      excerpt,
      body,
      featuredImageUrl,
      author,
      tagsInput,
      selectedCategoryIds,
      publishDate,
      router,
      postId,
    ]
  )

  const handlePreview = useCallback(async () => {
    setSaving(true)
    setSaveError("")
    setSaveSuccess("")

    try {
      const postData: Record<string, unknown> = {
        title,
        slug: slug || undefined,
        excerpt: excerpt || null,
        body,
        featured_image_url: featuredImageUrl || null,
        author: author || null,
        tags: parseTags().length > 0 ? parseTags() : null,
        status: "draft",
        published_at: publishDate
          ? new Date(publishDate).toISOString()
          : null,
      }

      const { blog_post } = await adminFetch<{
        blog_post: { id: string; slug: string }
      }>(`/admin/blog/${postId}`, {
        method: "POST",
        body: JSON.stringify(postData),
      })

      // Update category associations
      await adminFetch(`/admin/blog/${postId}/categories`, {
        method: "POST",
        body: JSON.stringify({ category_ids: selectedCategoryIds }),
      })

      setSaveSuccess("Draft saved. Opening preview...")
      setSlug(blog_post.slug)

      // Open preview in new tab
      window.open(
        `/blog/${blog_post.slug}?preview=true`,
        "_blank"
      )
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save for preview"
      )
    } finally {
      setSaving(false)
    }
  }, [
    title,
    slug,
    excerpt,
    body,
    featuredImageUrl,
    author,
    tagsInput,
    selectedCategoryIds,
    publishDate,
    postId,
  ])

  const handleLogout = () => {
    removeAdminToken()
    window.location.reload()
  }

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-turquoise-200 border-t-turquoise-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading post...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium bg-turquoise-500 text-white rounded-lg hover:bg-turquoise-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="content-container flex items-center justify-between py-4">
          <h1 className="font-playfair text-xl font-bold text-gray-900">
            Edit Blog Post
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={handlePreview}
              disabled={saving || !title}
              className="px-4 py-2 text-sm font-medium border border-turquoise-300 rounded-lg text-turquoise-700 hover:bg-turquoise-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Preview"}
            </button>
            <button
              onClick={() => handleSave("draft")}
              disabled={saving || !title}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save as Draft"}
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={saving || !title}
              className="px-4 py-2 text-sm font-medium bg-turquoise-500 text-white rounded-lg hover:bg-turquoise-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Status messages */}
      {(saveError || saveSuccess) && (
        <div className="content-container pt-4">
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {saveSuccess}
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div className="content-container py-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent text-lg"
              placeholder="Enter your article title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent text-sm font-mono"
                placeholder="auto-generated-from-title"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Auto-generated from title. Edit to customize.
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent"
              placeholder="Brief description of the article (shown in listings)"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {excerpt.length}/500
            </p>
          </div>

          {/* Body (WYSIWYG) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body
            </label>
            <RichTextEditor value={body} onChange={setBody} />
          </div>

          {/* Two-column layout for meta fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Featured Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image URL
              </label>
              <input
                type="url"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent text-sm"
                placeholder="https://example.com/image.jpg"
              />
              {featuredImageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImageUrl}
                    alt="Featured preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent text-sm"
                placeholder="Author name"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent text-sm"
                placeholder="wellness, nutrition, holistic (comma-separated)"
              />
              {parseTags().length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parseTags().map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-turquoise-50 text-turquoise-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Publish Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publish Date
              </label>
              <input
                type="datetime-local"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to use current time on publish.
              </p>
            </div>
          </div>

          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  status === "draft"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus("published")}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  status === "published"
                    ? "bg-turquoise-500 text-white border-turquoise-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Published
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">
                No categories available. Create categories in the admin
                dashboard.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="w-4 h-4 text-turquoise-500 border-gray-300 rounded focus:ring-turquoise-400"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900">
                        {cat.name}
                      </span>
                      {cat.description && (
                        <span className="text-xs text-gray-400 ml-2">
                          {cat.description}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {cat.post_count} posts
                    </span>
                  </label>
                ))}
              </div>
            )}
            {selectedCategoryIds.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedCategoryIds.length} categor
                {selectedCategoryIds.length === 1 ? "y" : "ies"} selected
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page Component ───────────────────────────────────────────────

type AuthState = "loading" | "authenticated" | "unauthenticated" | "login"

export default function BlogEditorEditPage() {
  const params = useParams()
  const postId = params.id as string
  const [authState, setAuthState] = useState<AuthState>("loading")

  useEffect(() => {
    const token = getAdminToken()
    if (!token) {
      setAuthState("unauthenticated")
      return
    }

    validateAdminToken().then((valid) => {
      setAuthState(valid ? "authenticated" : "unauthenticated")
      if (!valid) removeAdminToken()
    })
  }, [])

  if (authState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-2 border-turquoise-200 border-t-turquoise-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (authState === "login") {
    return (
      <LoginForm
        onSuccess={() => setAuthState("authenticated")}
        onCancel={() => setAuthState("unauthenticated")}
      />
    )
  }

  if (authState === "unauthenticated") {
    return <NotFoundPage onShowLogin={() => setAuthState("login")} />
  }

  return <BlogEditorEditForm postId={postId} />
}
