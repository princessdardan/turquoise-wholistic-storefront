# Routing

Reference for the Next.js 15 App Router structure, middleware, page map, layout hierarchy, parallel routes, dynamic segments, and SEO metadata.

## Table of Contents

- [Route Group Structure](#route-group-structure)
- [Middleware](#middleware)
- [Complete Page Map](#complete-page-map)
- [Layout Hierarchy](#layout-hierarchy)
- [Account Parallel Routes](#account-parallel-routes)
- [Dynamic Routes](#dynamic-routes)
- [Metadata and SEO](#metadata-and-seo)
- [Error and Loading States](#error-and-loading-states)

---

## Route Group Structure

Every URL is prefixed with a two-letter ISO country code. The `[countryCode]` dynamic segment is the universal first path segment, so all URLs take the form `/{countryCode}/...` (e.g., `/ca/store`, `/ca/products/ashwagandha`).

Inside `[countryCode]`, two **route groups** provide layout isolation without adding segments to the URL:

- **`(main)`** -- Full Nav + Footer layout. Covers home, store, products, categories, collections, cart, account, blog, gift cards, orders, search, contact, about, visit-us, and policy pages.
- **`(checkout)`** -- Minimal layout with logo, "Back to cart" link, and Medusa CTA. No main nav or footer.

Route groups are parenthesized directory names that never appear in the browser URL.

### Nesting Diagram

```
src/app/
  layout.tsx                            # Root (providers, fonts, GA4, nonce)
  [countryCode]/
    (main)/
      layout.tsx                        # Nav + Footer + WishlistProvider
      page.tsx                          # Home
      store/  products/[handle]/  categories/[...category]/
      collections/[handle]/  cart/  gift-cards/  search/
      account/
        layout.tsx                      # Parallel route (@dashboard / @login)
        @dashboard/  @login/
      blog/  blog/[slug]/  blog/editor/  blog/editor/[id]/
      order/[id]/confirmed/  order/[id]/transfer/[token]/
      contact/  about/  visit-us/
      privacy-policy/  terms-of-service/  return-policy/  shipping-policy/
    (checkout)/
      layout.tsx                        # Minimal checkout layout
      checkout/page.tsx
```

---

## Middleware

`src/middleware.ts` runs on the **Edge Runtime** for every matched request. It handles CSP, region/country resolution, and cache identity. It cannot import Node.js modules or the Medusa JS SDK.

### Route Matcher

```typescript
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
```

### Static Asset Detection

Before region logic, `request.nextUrl.pathname.includes(".")` triggers an early return with CSP headers but no redirect, preventing asset requests from entering the region pipeline.

### CSP Nonce Generation

Each request generates `const nonce = btoa(crypto.randomUUID())`. The nonce is injected as an `x-nonce` request header (readable by Server Components) and embedded into a `Content-Security-Policy` response header. Key CSP directives: `script-src` allows `'nonce-{nonce}' 'strict-dynamic'` plus Stripe JS and GTM; `frame-src` allows Stripe; `connect-src` allows Stripe API, GA, GTM, and `MEDUSA_BACKEND_URL`; `frame-ancestors 'none'`; `object-src 'none'`. In development, `connect-src` adds `ws://localhost:*` for HMR.

### Region Map Fetching

An in-memory `Map<string, HttpTypes.StoreRegion>` with **1-hour TTL** caches country-to-region mappings. When empty or stale, it fetches `${BACKEND_URL}/store/regions` with the publishable API key, using `cache: "force-cache"` and `revalidate: 3600`. Each region's countries are iterated and stored by `iso_2` code.

### Country Code Resolution Priority

1. **URL path** -- First path segment (`pathname.split("/")[1]`), checked against region map.
2. **Vercel IP header** -- `x-vercel-ip-country` header (auto-set on Vercel).
3. **Default region env** -- `NEXT_PUBLIC_DEFAULT_REGION` (defaults to `"us"`).
4. **First map key** -- First entry in the region map iterator.

### The `_medusa_cache_id` Cookie

If absent, generated via `crypto.randomUUID()` with `maxAge: 86400` (24 hours). Used to tag region cache entries for per-visitor invalidation.

### Redirect Logic

1. **URL has country code + cookie exists** -- Pass through with CSP headers.
2. **URL has country code + no cookie** -- Set `_medusa_cache_id` cookie, redirect 307 to same URL.
3. **URL contains a dot** -- Pass through (static asset).
4. **No country code + code resolved** -- Redirect 307 to `/{countryCode}{path}{query}`.
5. **No country code + no code resolved** -- Return 500: "No valid regions configured."

---

## Complete Page Map

### Commerce

| Route Pattern | File Path | Group | Description |
|---|---|---|---|
| `/{cc}` | `(main)/page.tsx` | main | Home: hero, categories, CTAs, featured products |
| `/{cc}/store` | `(main)/store/page.tsx` | main | Product listing / browse |
| `/{cc}/products/{handle}` | `(main)/products/[handle]/page.tsx` | main | Product detail |
| `/{cc}/categories/{...category}` | `(main)/categories/[...category]/page.tsx` | main | Category (catch-all for nesting) |
| `/{cc}/collections/{handle}` | `(main)/collections/[handle]/page.tsx` | main | Collection |
| `/{cc}/cart` | `(main)/cart/page.tsx` | main | Shopping cart |
| `/{cc}/checkout` | `(checkout)/checkout/page.tsx` | checkout | Checkout flow |
| `/{cc}/gift-cards` | `(main)/gift-cards/page.tsx` | main | Gift card lookup/redemption |
| `/{cc}/search` | `(main)/search/page.tsx` | main | Search results |

### Orders

| Route Pattern | File Path | Group | Description |
|---|---|---|---|
| `/{cc}/order/{id}/confirmed` | `(main)/order/[id]/confirmed/page.tsx` | main | Order confirmation |
| `/{cc}/order/{id}/transfer/{token}` | `(main)/order/[id]/transfer/[token]/page.tsx` | main | Transfer request landing |
| `/{cc}/order/{id}/transfer/{token}/accept` | `(main)/order/[id]/transfer/[token]/accept/page.tsx` | main | Accept transfer |
| `/{cc}/order/{id}/transfer/{token}/decline` | `(main)/order/[id]/transfer/[token]/decline/page.tsx` | main | Decline transfer |

### Account

| Route Pattern | File Path | Group | Description |
|---|---|---|---|
| `/{cc}/account` | `account/@dashboard/page.tsx` | main | Dashboard (authenticated) |
| `/{cc}/account` | `account/@login/page.tsx` | main | Login form (unauthenticated) |
| `/{cc}/account` (profile) | `account/@dashboard/profile/page.tsx` | main | Profile settings |
| `/{cc}/account` (addresses) | `account/@dashboard/addresses/page.tsx` | main | Saved addresses |
| `/{cc}/account` (orders) | `account/@dashboard/orders/page.tsx` | main | Order history |
| `/{cc}/account` (order detail) | `account/@dashboard/orders/details/[id]/page.tsx` | main | Single order detail |
| `/{cc}/account` (subscriptions) | `account/@dashboard/subscriptions/page.tsx` | main | Subscription management |
| `/{cc}/account` (wishlist) | `account/@dashboard/wishlist/page.tsx` | main | Wishlist items |
| `/{cc}/account` (gift cards) | `account/@dashboard/gift-cards/page.tsx` | main | Purchased gift cards |
| `/{cc}/account/forgot-password` | `account/forgot-password/page.tsx` | main | Password reset request |
| `/{cc}/account/reset-password` | `account/reset-password/page.tsx` | main | Reset password with token |

### Content

| Route Pattern | File Path | Group | Description |
|---|---|---|---|
| `/{cc}/blog` | `(main)/blog/page.tsx` | main | Blog listing |
| `/{cc}/blog/{slug}` | `(main)/blog/[slug]/page.tsx` | main | Blog post |
| `/{cc}/blog/editor` | `(main)/blog/editor/page.tsx` | main | Blog editor (new) |
| `/{cc}/blog/editor/{id}` | `(main)/blog/editor/[id]/page.tsx` | main | Blog editor (edit) |
| `/{cc}/about` | `(main)/about/page.tsx` | main | About us |
| `/{cc}/contact` | `(main)/contact/page.tsx` | main | Contact form |
| `/{cc}/visit-us` | `(main)/visit-us/page.tsx` | main | Location info |

### Legal

| Route Pattern | File Path | Group | Description |
|---|---|---|---|
| `/{cc}/privacy-policy` | `(main)/privacy-policy/page.tsx` | main | Privacy policy |
| `/{cc}/terms-of-service` | `(main)/terms-of-service/page.tsx` | main | Terms of service |
| `/{cc}/return-policy` | `(main)/return-policy/page.tsx` | main | Return policy |
| `/{cc}/shipping-policy` | `(main)/shipping-policy/page.tsx` | main | Shipping policy |

All file paths are relative to `src/app/[countryCode]/`.

---

## Layout Hierarchy

### Root Layout (`src/app/layout.tsx`)

- **Fonts**: Inter (`--font-inter`) and Playfair Display (`--font-playfair`) via `next/font/google`, set as CSS variable classes on `<html>`.
- **HTML**: `lang="en"`, `data-mode="light"`. Viewport: `device-width`, `initialScale: 1`, `themeColor: "#40E0D0"`.
- **CSP nonce**: Reads `x-nonce` header from middleware via `(await headers()).get("x-nonce")`.
- **Resource hints**: DNS prefetch for `googletagmanager.com` and `google-analytics.com`; preconnect to Medusa S3 image bucket.
- **GA4**: Conditionally loads GTM script + `gtag('config')` init when `GA4_MEASUREMENT_ID` is set. Both `<Script>` tags use `strategy="lazyOnload"` with the CSP nonce.
- **Skip-to-content**: `<a href="#main-content">` with `sr-only` styling, visible on focus.
- **Context providers** (outer to inner): `ChannelProvider` > `MedusaClientProvider` > `DualCartProvider` > `ToastProvider`.
- **Global UI**: `<ChannelReminder />` (30-day reminder toast), `<ToastContainer />`.
- **Content wrapper**: `<main id="main-content" className="relative">`.

### `(main)` Layout (`src/app/[countryCode]/(main)/layout.tsx`)

Wraps standard pages. Fetches customer and cart data server-side, then renders:

`WishlistProvider` > `Nav` > `CartMismatchBanner` (conditional) > `FreeShippingPriceNudge` (conditional) > `ChannelSplash` > `{children}` > `Footer` > `CookieConsent`

### `(checkout)` Layout (`src/app/[countryCode]/(checkout)/layout.tsx`)

Minimal checkout chrome: a top bar with "Back to shopping cart" link (left), logo + "Turquoise Wholistic" text (center), empty spacer (right). Children render in a `data-testid="checkout-container"` div. `<MedusaCTA />` at the bottom. No nav, footer, wishlist, or cookie consent.

### Account Layout (`src/app/[countryCode]/(main)/account/layout.tsx`)

Nested inside `(main)`. Calls `retrieveCustomer()` and accepts `dashboard`, `login`, and `children` slot props. Renders `<AccountLayout customer={customer}>` with conditional content: `customer ? dashboard : login`, falling back to `children` for sub-pages. Includes `<Toaster />` from `@medusajs/ui`.

---

## Account Parallel Routes

The `@dashboard` and `@login` directories are **named slots**. Next.js passes their content as props to the account layout:

```typescript
const customer = await retrieveCustomer().catch(() => null)
const slotContent = customer ? dashboard : login
// Renders: {slotContent || children}
```

### `default.tsx` Files

Both slots export `default.tsx` returning `null`. These prevent 404 errors during hard navigation -- Next.js requires a default render for each parallel slot when directly navigating to a URL.

### Sub-Pages Outside Slots

`forgot-password` and `reset-password` are regular child routes of `account/`, not part of either slot. They render via `children` when the slot props are `undefined`.

### Dashboard Slot Pages

| Path Suffix | File | Description |
|---|---|---|
| `/account` | `@dashboard/page.tsx` | Dashboard home |
| (profile) | `@dashboard/profile/page.tsx` | Edit name, email, phone |
| (addresses) | `@dashboard/addresses/page.tsx` | Manage addresses |
| (orders) | `@dashboard/orders/page.tsx` | Order history |
| (order detail) | `@dashboard/orders/details/[id]/page.tsx` | Single order |
| (subscriptions) | `@dashboard/subscriptions/page.tsx` | Subscriptions |
| (wishlist) | `@dashboard/wishlist/page.tsx` | Wishlist |
| (gift cards) | `@dashboard/gift-cards/page.tsx` | Gift cards |

The dashboard slot has its own `loading.tsx` rendering `<Spinner size={36} />`.

---

## Dynamic Routes

### `[countryCode]` -- ISO-2 Country Code

Present on every route. Validated against the region map in middleware.

```typescript
export default async function Home(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
}
```

### `[handle]` -- Product and Collection Handles

URL-friendly slugs (e.g., `/products/ashwagandha-capsules`). Both pages use `generateStaticParams` for build-time pre-rendering.

```typescript
type Props = { params: Promise<{ countryCode: string; handle: string }> }
```

### `[slug]` -- Blog Post Slugs

URL-friendly blog identifiers (e.g., `/blog/benefits-of-turmeric`).

```typescript
type Props = { params: Promise<{ slug: string; countryCode: string }> }
```

### `[...category]` -- Catch-All Category Segments

Supports nested hierarchies. `category` is always a `string[]`, even for a single segment.

```typescript
type Props = { params: Promise<{ category: string[]; countryCode: string }> }
```

### `[id]` -- Order and Blog Editor IDs

Used in order confirmation (`order/[id]/confirmed`), order detail (`@dashboard/orders/details/[id]`), and blog editor (`blog/editor/[id]`).

```typescript
type Props = { params: Promise<{ id: string }> }
```

### `[token]` -- Order Transfer Tokens

Used alongside `[id]` for order transfer pages (`order/[id]/transfer/[token]`).

```typescript
export default async function TransferPage({ params }: { params: { id: string; token: string } }) {
  const { id, token } = params
}
```

---

## Metadata and SEO

### Root Metadata

Exported from `src/app/layout.tsx`:

| Field | Value |
|---|---|
| `metadataBase` | `new URL(getBaseURL())` -- reads `NEXT_PUBLIC_BASE_URL`, defaults to `http://localhost:8000` |
| `title.default` | `"Turquoise Wholistic \| Holistic Health & Wellness"` |
| `title.template` | `"%s \| Turquoise Wholistic"` |
| `description` | `"Discover natural health solutions, herbal remedies, supplements, and wellness products..."` |
| `icons` | `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` |
| `openGraph.type` | `"website"`, `siteName: "Turquoise Wholistic"` |
| `twitter.card` | `"summary_large_image"` |
| `viewport.themeColor` | `"#40E0D0"` |

### Dynamic OG Image (`src/app/opengraph-image.tsx`)

Server-rendered 1200x630 PNG via `next/og` `ImageResponse`. Shows a lotus icon (`#40E0D0`), brand name at 64px, tagline, gold decorative line (`#D4A853`), and URL on a sand background (`#F5F0EB`). Exports: `alt = "Turquoise Wholistic -- Holistic Health & Wellness"`, `size = { width: 1200, height: 630 }`, `contentType = "image/png"`.

### `robots.ts`

Allows all crawlers on `/`, disallows `/checkout`, `/account`, `/cart`, `/order`. Includes sitemap URL from `getBaseURL()`.

### `sitemap.ts`

Generates entries per country code for: static pages (home, store, blog, about, contact, visit-us, privacy-policy, terms-of-service), products (`/store/products`, limit 1000, priority 0.8), categories (`/store/product-categories`, limit 100, priority 0.7), collections (`/store/collections`, limit 100, priority 0.7), and blog posts (`getBlogPosts`, limit 100, priority 0.6). Falls back to `["ca"]` if region fetch fails.

### Per-Page Metadata

Pages export `metadata` or `generateMetadata`. The home page uses `title.absolute` to bypass the template. Blog posts and products use `generateMetadata` to build dynamic title, description, and OG data. Static pages export simple metadata objects.

---

## Error and Loading States

### Error Boundaries

| File | Scope | Behavior |
|---|---|---|
| `src/app/error.tsx` | Global | "Something Went Wrong" -- Try Again + Go Home. Logs in dev. |
| `[countryCode]/(checkout)/error.tsx` | Checkout | "Checkout Issue" -- Try Again + Return to Cart (`LocalizedClientLink`). |
| `[countryCode]/(main)/account/error.tsx` | Account | "Account Error" -- Try Again + Go Home (`LocalizedClientLink`). |

Nested boundaries catch errors before they reach the global boundary, allowing contextual recovery actions.

### Not-Found Pages

| File | Scope | Notes |
|---|---|---|
| `src/app/not-found.tsx` | Global | Uses `next/link` (no country code context). |
| `[countryCode]/(main)/not-found.tsx` | All main routes | Uses `InteractiveLink` for localized navigation. |
| `[countryCode]/(checkout)/not-found.tsx` | Checkout | Uses `InteractiveLink`. |
| `[countryCode]/(main)/cart/not-found.tsx` | Cart | Cart-specific: "Clear your cookies and try again." |

Triggered by route mismatches or explicit `notFound()` calls in Server Components:

```typescript
const order = await retrieveOrder(params.id).catch(() => null)
if (!order) return notFound()
```

### Loading States

| File | Scope | Component |
|---|---|---|
| `(main)/account/loading.tsx` | Account layout | `<Spinner size={36} />` |
| `(main)/account/@dashboard/loading.tsx` | Dashboard slot | `<Spinner size={36} />` |
| `(main)/cart/loading.tsx` | Cart | `<SkeletonCartPage />` |
| `(main)/order/[id]/confirmed/loading.tsx` | Order confirmed | `<SkeletonOrderConfirmed />` |

Loading files act as React Suspense boundaries. Cart and order pages use purpose-built skeleton components; account pages use a generic spinner.
