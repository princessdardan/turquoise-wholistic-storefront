import fs from "fs"
import path from "path"
import matter from "gray-matter"

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  author: string
  category: string
  featuredImage: string | null
  content: string
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return []
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))

  const posts = files
    .map((filename) => {
      const filePath = path.join(BLOG_DIR, filename)
      const fileContent = fs.readFileSync(filePath, "utf-8")
      const { data, content } = matter(fileContent)

      return {
        slug: data.slug || filename.replace(/\.md$/, ""),
        title: data.title || "Untitled",
        excerpt: data.excerpt || "",
        date: data.date || "",
        author: data.author || "",
        category: data.category || "",
        featuredImage: data.featuredImage || null,
        content,
      } as BlogPost
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getAllBlogPosts()
  return posts.find((p) => p.slug === slug) || null
}

export function getBlogCategories(): string[] {
  const posts = getAllBlogPosts()
  const categories = new Set(posts.map((p) => p.category).filter(Boolean))
  return Array.from(categories).sort()
}

function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export function getReadingTimeForPost(post: BlogPost): number {
  return getReadingTime(post.content)
}
