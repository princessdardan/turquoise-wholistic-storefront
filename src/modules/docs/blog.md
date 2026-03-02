# Blog Module

The `blog` module (`src/modules/blog/`) manages blog post listing, individual post display, and admin-gated post creation/editing with rich text support.

## Routes

- `/{countryCode}/blog` — Blog index with category filtering and pagination
- `/{countryCode}/blog/{slug}` — Individual blog post with related products and articles
- `/{countryCode}/blog/editor` — Create new post (admin-gated)
- `/{countryCode}/blog/editor/{id}` — Edit existing post (admin-gated)

## Components

### BlogIndex

Server component at `src/app/[countryCode]/(main)/blog/page.tsx`. Renders the main blog listing with:

- Hero section with "Wellness Journal" heading
- Category carousel filter tabs (fetches from backend via `getBlogCategories()`)
- Featured post card (only on "All" filter, first page) with large image and inline meta
- Grid of standard post cards (12 per page, paginated)
- Pagination controls preserving active category filter

Posts fetched server-side via `getBlogPosts()` with `limit`, `offset`, and optional `category_id`. Reading time calculated client-side.

### BlogPostCard

Inline card component in BlogIndex (`PostCard`). Displays:

- Featured image or sand placeholder with image icon
- Category badges (small turquoise pills)
- Post title with hover color transition
- Excerpt (clamped to 3 lines)
- Author, publish date, reading time in footer

Clickable via `LocalizedClientLink` to `/blog/{slug}`.

### BlogArticle

Server component at `src/app/[countryCode]/(main)/blog/[slug]/page.tsx`. Full post view:

- Back to Blog navigation link
- Category tags in uppercase
- Title, author, publish date, reading time
- Article body rendered via `BlogBodyRenderer` (supports Markdown + HTML + embedded CTAs)
- Related products section (fetched by matching blog category → product category)
- Related articles section (3 recent posts, excludes current)
- Schema.org JSON-LD for SEO

Supports preview mode via `?preview=true` for draft viewing (uses `BlogPostPreview`).

### BlogBodyRenderer

Server component at `src/modules/blog/components/blog-body-renderer.tsx`. Renders post body with:

- Markdown parsing via `react-markdown` + `remark-gfm`
- HTML passthrough with `dangerouslySetInnerHTML`
- CTA embedding: detects `[cta:ID]` placeholders, fetches CTA data server-side, renders `ImageCta` in place
- Silent removal of invalid/inactive CTAs

### BlogPostPreview

Client component at `src/modules/blog/components/blog-post-preview.tsx`. Admin-gated preview for draft posts:

- Yellow preview banner showing draft status with Edit Post link
- Requires admin token (from `admin-auth.ts`)
- Fetches post via admin API endpoint with slug query
- Renders title, author, date, reading time, body (HTML or plaintext)

### RichTextEditor

Client component at `src/modules/blog/components/rich-text-editor.tsx`. WYSIWYG editor using Tiptap with:

- Text formatting: bold, italic, underline, strikethrough
- Headings: H2, H3, H4
- Lists: bullet and ordered
- Block elements: blockquote, code block, horizontal rule
- Text alignment: left, center, right
- Links (with prompt) and image insertion (URL-based)
- CTA embedding: special turquoise button to insert `[cta:ID]` placeholders
- Undo/redo controls

Outputs HTML. Styling via CSS-in-JS with ProseMirror-specific classes.

### BlogEditorForm

Client component in `src/app/[countryCode]/(main)/blog/editor/page.tsx`. Admin form for creating/editing posts:

- Title (required, auto-generates slug)
- Slug (editable, auto-generated from title)
- Excerpt (textarea, 500 char limit)
- Body (RichTextEditor)
- Featured image URL with live preview
- Author name
- Tags (comma-separated, rendered as pills)
- Publish date (datetime-local input)
- Status toggle: Draft or Published
- Category multiselect (fetches available categories on mount)

Submit buttons: "Save as Draft" (POST to `/admin/blog`, saves as draft) and "Publish" (POST with status=published, redirects to published post).

### LoginForm & NotFoundPage

Auth UI in editor page (`src/app/[countryCode]/(main)/blog/editor/page.tsx`):

- **LoginForm**: Email/password admin login via `adminLogin()`, stores token in localStorage
- **NotFoundPage**: 404 with subtle "Admin" button to reveal login form

## Admin Authentication

Editor routes require admin token via `admin-auth.ts` (localStorage). Token validated on mount; if invalid, user redirected to login. Logout clears token and reloads page.
