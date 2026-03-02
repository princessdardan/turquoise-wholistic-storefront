# Architecture

Comprehensive architecture overview of the Turquoise Wholistic Next.js 15 storefront. This is the starting point for new developers joining the project.

## Table of Contents

- [System Overview](#system-overview)
- [Directory Structure](#directory-structure)
- [Routing Architecture](#routing-architecture)
- [Data Flow](#data-flow)
- [Dual-Channel System](#dual-channel-system)
- [Provider Hierarchy](#provider-hierarchy)
- [Authentication](#authentication)
- [Caching Strategy](#caching-strategy)
- [Security](#security)
- [Analytics](#analytics)
- [Key Conventions](#key-conventions)
- [Related Docs](#related-docs)

---

## System Overview

Turquoise Wholistic is a holistic medicine and wellness ecommerce store built as a two-repository system:

| Component | Technology | Port | Repository |
|-----------|-----------|------|------------|
| Storefront | Next.js 15, React 19, Tailwind CSS 3 | 8000 | `turquoise-wholistic-storefront` |
| Backend | Medusa v2 (v2.13.1), PostgreSQL 16 | 9000 | `turquoise-wholistic` (sibling directory) |

The storefront is the customer-facing application. It renders product catalogs, handles cart and checkout flows, manages customer accounts, and serves content pages (blog, gift cards, contact). It communicates with the Medusa backend exclusively through HTTP API calls via the `@medusajs/js-sdk` client.

**Tech stack:** Next.js 15.3.9 with Turbopack (dev), React 19.0.4, Yarn 4.12.0, Tailwind CSS 3 with `@medusajs/ui-preset` and custom turquoise/sand/gold palette, Inter + Playfair Display fonts, Stripe payments, TipTap v3 for rich text, Jest + Playwright for testing, Google Analytics 4.

---

## Directory Structure

```
turquoise-wholistic-storefront/
├── e2e/                          # Playwright E2E tests and page objects
│   ├── pages/                    # Page object models for E2E tests
│   ├── auth.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   └── wishlist.spec.ts
├── src/
│   ├── app/                      # Next.js App Router pages and layouts
│   │   ├── layout.tsx            # Root layout: fonts, providers, GA4 scripts
│   │   └── [countryCode]/        # Dynamic country-code prefix for all routes
│   │       ├── (main)/           # Route group: standard pages with Nav + Footer
│   │       └── (checkout)/       # Route group: minimal checkout layout
│   ├── lib/                      # Shared logic, data fetching, utilities
│   │   ├── config.ts             # Medusa SDK initialization + fetch interceptor
│   │   ├── analytics.ts          # GA4 event tracking functions
│   │   ├── constants.tsx         # Payment provider map, thresholds, currency config
│   │   ├── context/              # React context providers (6 contexts)
│   │   ├── data/                 # Server Actions for all data fetching (23 files)
│   │   ├── hooks/                # Custom React hooks (useInView, useToggleState)
│   │   └── util/                 # Pure utility functions (money, sorting, env, etc.)
│   ├── modules/                  # UI components organized by feature domain (16 modules)
│   │   ├── account/              # Account dashboard, login, registration
│   │   ├── blog/                 # Blog listing, post detail, category carousel
│   │   ├── cart/                 # Cart page, line items, channel tabs
│   │   ├── categories/           # Category listing and filtering
│   │   ├── checkout/             # Checkout form, payment, shipping steps
│   │   ├── collections/          # Collection browsing
│   │   ├── common/               # Reusable primitives (LocalizedClientLink, etc.)
│   │   ├── gift-cards/           # Gift card purchase and redemption
│   │   ├── home/                 # Homepage hero, featured sections, CTA components
│   │   ├── layout/               # Nav, Footer, ChannelSplash, ChannelReminder
│   │   ├── order/                # Order confirmation and history
│   │   ├── products/             # Product cards, detail pages, reviews
│   │   ├── search/               # Search interface
│   │   ├── shipping/             # Free shipping nudge component
│   │   ├── skeletons/            # Loading skeleton placeholders
│   │   └── store/                # Store listing and filtering
│   ├── styles/
│   │   └── globals.css           # Tailwind imports, CSS variables, text utilities
│   └── types/                    # TypeScript type declarations (global.ts, icon.ts)
├── next.config.js                # Next.js config: security headers, image domains
├── tsconfig.json                 # TypeScript config with path aliases
└── package.json                  # Yarn 4, scripts, dependencies
```

---

## Routing Architecture

### Country-Code Prefix

Every page URL is prefixed with a two-letter country code: `/{countryCode}/store`, `/{countryCode}/cart`, etc. This is implemented as a dynamic route segment `[countryCode]` at `src/app/[countryCode]/`.

The middleware (`src/middleware.ts`) handles region detection on every request:

1. Checks if the URL already contains a valid country code (matched against Medusa regions)
2. Falls back to the `x-vercel-ip-country` header (Vercel geo-IP)
3. Falls back to `NEXT_PUBLIC_DEFAULT_REGION` env var (default: `us`)
4. Redirects bare URLs (e.g., `/store`) to the prefixed form (e.g., `/ca/store`) with a 307 redirect

### Route Groups

**`(main)/`** -- Standard pages with full Nav + Footer + WishlistProvider:

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/store` | Product catalog listing |
| `/products/[handle]` | Product detail page |
| `/categories/[...category]` | Category pages (catch-all for nested hierarchies) |
| `/collections/[handle]` | Collection pages |
| `/cart` | Shopping cart with channel tabs |
| `/account` | Account dashboard or login (parallel routes) |
| `/order/confirmed/[id]` | Order confirmation |
| `/blog`, `/blog/[slug]` | Blog listing and post detail |
| `/gift-cards` | Gift card purchase and redemption |
| `/search`, `/contact`, `/about`, `/visit-us` | Content pages |
| `/privacy-policy`, `/terms-of-service`, `/return-policy`, `/shipping-policy` | Legal pages |

**`(checkout)/`** -- Minimal layout with only a back-to-cart link and logo, used for `/checkout`.

### Parallel Routes (Account)

The account page uses Next.js parallel routes:

- **`@dashboard/`** -- Shown when customer is authenticated
- **`@login/`** -- Shown when no valid JWT is present
- Additional sub-routes: `forgot-password/`, `reset-password/`

---

## Data Flow

```
  Browser request
       |
       v
  middleware.ts (Edge Runtime)       Region detection, country-code redirect,
       |                             CSP nonce, _medusa_cache_id cookie
       v
  Server Component (page.tsx)        Reads params, calls server actions,
       |                             passes data as props to client components
       v
  Server Actions (src/lib/data/)     Marked "use server". Read auth/cache cookies,
       |                             call sdk.store.* or sdk.client.fetch()
       v
  @medusajs/js-sdk (config.ts)       Fetch interceptor adds publishable key
       |                             (cookie server-side, global client-side)
       v
  Medusa Backend (port 9000)         Processes request, returns JSON
```

### Standard vs Custom API Calls

For core Medusa resources (products, carts, customers, orders, regions), the data layer uses typed SDK methods:

```ts
const { products } = await sdk.store.product.list({ /* filters */ })
```

For custom features (blog, wishlist, reviews, subscriptions, gift cards, CTA, store settings), the data layer calls custom Medusa API routes via the untyped `sdk.client.fetch`:

```ts
const data = await sdk.client.fetch<BlogResponse>("/store/blog-posts", {
  method: "GET",
  query: { category, limit, offset },
})
```

This distinction matters: `sdk.client.fetch` does not provide type-safe request/response shapes -- types must be defined manually in the storefront.

---

## Dual-Channel System

The most architecturally significant custom pattern. Turquoise Wholistic supports two sales channels -- "Retail" and "Professional" -- each with its own Medusa publishable API key, product catalog, and shopping cart.

### ChannelProvider (`src/lib/context/channel-context.tsx`)

Client-side React context storing the active channel in `localStorage`:

- **Storage key**: `tw-channel` (value: `"retail"` or `"professional"`)
- **Confirmation timestamp**: `tw-channel-last-confirmed` (epoch ms, used by `ChannelReminder`)
- **State**: `channel` (nullable until hydration), `hydrated` flag, `isChannelSelected` derived boolean
- **On first visit**: `channel` is `null` until the user selects via `ChannelSplash`

### MedusaClientProvider (`src/lib/context/medusa-client-context.tsx`)

Wraps the Medusa SDK singleton and reacts to channel changes:

1. Listens to `channel` from `useChannel()`
2. Calls `setActivePublishableKey(key)` to update the global used by client-side fetch calls
3. Writes a `tw-channel` cookie (1-year expiry, `samesite=strict`) so server-side code can read the active channel

### DualCartProvider (`src/lib/context/dual-cart-context.tsx`)

Maintains separate cart IDs for each channel:

- **Cookies**: `tw-cart-retail` and `tw-cart-professional` (non-httpOnly so client can read)
- **Also synced to localStorage** under the same keys for synchronous client access
- Exposes `activeCartId` resolving to the correct cart based on current channel
- `refreshCartIds()` re-reads cookies (called after cart mutations)

### Fetch Interceptor (`src/lib/config.ts`)

The SDK's `client.fetch` is monkey-patched to inject the correct publishable API key per request:

```ts
// Server-side: reads tw-channel cookie -> picks key
const { cookies } = await import("next/headers")
const channel = cookieStore.get("tw-channel")?.value
publishableKey = channel === "professional"
  ? PROFESSIONAL_PUBLISHABLE_KEY
  : RETAIL_PUBLISHABLE_KEY

// Client-side: falls back to activePublishableKey global
publishableKey = activePublishableKey
```

The try/catch around `import("next/headers")` distinguishes server from client: the import throws on the client side, triggering the fallback.

### Environment Variable Hierarchy

```
Retail key:       NEXT_PUBLIC_MEDUSA_RETAIL_PUBLISHABLE_KEY
                  || NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY  (fallback, always required)

Professional key: NEXT_PUBLIC_MEDUSA_PROFESSIONAL_PUBLISHABLE_KEY
```

Channel-specific keys are generated by running `setup-sales-channels.ts` on the backend.

### UI Components

- **`ChannelSplash`** -- First-visit modal when `channel` is `null`. Rendered in `(main)` layout.
- **`ChannelReminder`** -- Toast re-prompt after 30 days (from `tw-channel-last-confirmed`). Rendered in root layout.
- **Professional indicators** -- Visual cues (badges, border accents) when browsing Professional channel.

### Legacy Cart Migration

`getCartId()` in `cookies.ts` migrates the old `_medusa_cart_id` cookie to `tw-cart-retail`, then deletes the legacy cookie.

---

## Provider Hierarchy

The exact nesting order across root layout and `(main)` route group layout:

```
<html>
  <body>
    ChannelProvider                  # Channel selection (localStorage)
      MedusaClientProvider           # SDK client + publishable key sync
        DualCartProvider             # Per-channel cart ID management
          ToastProvider              # Toast notification queue
            <main>
              [countryCode] router
                (main) layout:
                  WishlistProvider   # Wishlist state (server-fetched, auth-gated)
                    Nav / CartMismatchBanner / FreeShippingPriceNudge
                    ChannelSplash / {page content} / Footer / CookieConsent
                (checkout) layout:
                  {checkout nav} / {checkout content}
            ChannelReminder          # 30-day channel re-prompt toast
            ToastContainer           # Toast rendering container
</html>
```

| Provider | Scope | Purpose |
|----------|-------|---------|
| `ChannelProvider` | Root | Reads/writes `tw-channel` from localStorage, exposes `channel` + `setChannel` |
| `MedusaClientProvider` | Root | Syncs publishable API key to SDK global and `tw-channel` cookie |
| `DualCartProvider` | Root | Reads `tw-cart-retail`/`tw-cart-professional` cookies, exposes `activeCartId` |
| `ToastProvider` | Root | Queue-based toast notification system (`addToast`, auto-dismiss) |
| `WishlistProvider` | `(main)` | Fetches wishlist on mount (if logged in), exposes `toggleWishlist` with optimistic updates |

`WishlistProvider` lives in `(main)` (not root) because checkout does not need wishlist state. It receives `isLoggedIn` as a server-side prop from `retrieveCustomer()`.

---

## Authentication

### Token Storage

JWT stored in httpOnly cookie `_medusa_jwt`: 7-day max age, `sameSite: strict`, `secure: true` in production. Set by `setAuthToken()` in `src/lib/data/cookies.ts`.

### Auth Flow

**Registration:** (1) User submits form, (2) `sdk.auth.register("customer", "emailpass", { email, password })`, (3) receive JWT, (4) `setAuthToken(token)` writes cookie, (5) `sdk.store.customer.create(...)` with auth header, (6) transfer anonymous cart to new customer.

**Login:** (1) `sdk.auth.login("customer", "emailpass", { email, password })`, (2) receive JWT, (3) `setAuthToken(token)`, (4) transfer anonymous cart.

**Sign-out:** (1) `removeAuthToken()` clears `_medusa_jwt`, (2) `removeAllCartIds()` clears both cart cookies, (3) redirect to home.

### Server-Side Auth

```ts
import { getAuthHeaders } from "@lib/data/cookies"
const headers = await getAuthHeaders()
// Returns { authorization: "Bearer <token>" } or {} if not authenticated
```

### Account Parallel Routes

- **`@dashboard/`** -- Renders when authenticated (profile, orders, addresses, wishlist)
- **`@login/`** -- Renders when no valid JWT (login form, registration link)

---

## Caching Strategy

Next.js `fetch` caching with tag-based revalidation, isolated per browser session.

The middleware generates a `_medusa_cache_id` cookie (UUID, 24-hour expiry) on first visit. This ID is appended to every cache tag to isolate cached data per session, preventing one user's cached cart from leaking to another.

### Cache Tag Functions (`src/lib/data/cookies.ts`)

```ts
const cacheTag = await getCacheTag("cart")
// Result: "cart-a1b2c3d4-e5f6-..."

const options = await getCacheOptions("products")
// Result: { tags: ["products-a1b2c3d4-e5f6-..."] }
```

### Usage Pattern

```ts
// Fetch with cache tag
export async function listProducts() {
  const cacheOptions = await getCacheOptions("products")
  return sdk.store.product.list({ /* params */ }, { next: cacheOptions })
}

// After mutations, revalidate the tag
export async function addToCart(variantId: string, quantity: number) {
  // ... perform mutation ...
  const cacheTag = await getCacheTag("cart")
  revalidateTag(cacheTag)
}
```

Standard `revalidateTag("cart")` would invalidate every user's cached cart. By appending the session `_medusa_cache_id`, each user's cache is isolated.

---

## Security

### Content Security Policy (CSP)

The middleware generates a per-request nonce via `btoa(crypto.randomUUID())` and constructs a CSP header. The nonce is passed to server components via the `x-nonce` request header, then applied to GA4 `<Script>` tags. Key directives: `script-src` with nonce + `strict-dynamic` + Stripe/GTM origins, `frame-src` restricted to Stripe, `frame-ancestors 'none'`, `object-src 'none'`, `connect-src` scoped to Stripe/GA/Medusa backend.

### Response Headers (`next.config.js`)

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |

### Form Protection

Public forms use two-layer defense: **Cloudflare Turnstile** (`@marsidev/react-turnstile`) with server-side verification via `src/lib/data/form-protection.ts` (degrades gracefully when env vars are missing), and a **honeypot field** that silently rejects bot submissions.

### Server-Only Guard

`src/lib/data/cookies.ts` imports `"server-only"` at the top, causing a build-time error if any client component imports from it.

---

## Analytics

GA4 tracking is conditional on `NEXT_PUBLIC_GA4_MEASUREMENT_ID`. The GTM script and `gtag()` init load with `strategy="lazyOnload"` and receive the CSP nonce. DNS prefetch hints for GTM/GA domains are in `<head>`.

`src/lib/analytics.ts` exports typed functions for GA4 ecommerce events:

| Function | GA4 Event | When Fired |
|----------|-----------|------------|
| `trackViewItem()` | `view_item` | Product detail page |
| `trackViewItemList()` | `view_item_list` | Category/collection pages |
| `trackAddToCart()` | `add_to_cart` | Item added to cart |
| `trackRemoveFromCart()` | `remove_from_cart` | Item removed from cart |
| `trackBeginCheckout()` | `begin_checkout` | Checkout form opened |
| `trackAddShippingInfo()` | `add_shipping_info` | Shipping step completed |
| `trackAddPaymentInfo()` | `add_payment_info` | Payment step completed |
| `trackPurchase()` | `purchase` | Order confirmation page |

Helpers: `productToGA4Item()` converts Medusa products, `lineItemToGA4Item()` converts cart line items. All prices convert from Medusa cent-based format (divide by 100). Currency defaults to `CAD`. All functions are no-ops when GA4 is not configured.

---

## Key Conventions

### Always Use `LocalizedClientLink`

Never use `next/link` directly. `LocalizedClientLink` (from `@modules/common/components/localized-client-link`) auto-prepends `/{countryCode}` to all `href` values.

```ts
// Correct
import LocalizedClientLink from "@modules/common/components/localized-client-link"
<LocalizedClientLink href="/store">Shop</LocalizedClientLink>
// Renders: <a href="/ca/store">Shop</a>
```

### Server Components by Default

All components are Server Components unless marked `"use client"`. Use client components only for interactivity, browser APIs, or React hooks.

### `"use server"` for All Data Fetching

Every function in `src/lib/data/` that calls the Medusa backend uses `"use server"`. These are Next.js Server Actions callable from client components but executing on the server.

### TypeScript Path Aliases

```
@lib/*     -> src/lib/*
@modules/* -> src/modules/*
@pages/*   -> src/pages/*
```

### Barrel Exports

Each component directory in `src/modules/` uses an `index.tsx` barrel export. Import from the directory path.

### Custom Breakpoints

| Breakpoint | Width  | Notes                                              |
|------------|--------|----------------------------------------------------|
| `2xsmall:` | 320px  |                                                    |
| `xsmall:`  | 512px  |                                                    |
| `small:`   | 1024px | Use where you would use `lg:` in standard Tailwind |
| `medium:`  | 1280px |                                                    |
| `large:`   | 1440px |                                                    |

---

## Related Docs

| Document | Path | Description |
|----------|------|-------------|
| Development Setup | `docs/development-setup.md` | Environment setup, env vars, running locally |
| Styling | `docs/styling.md` | Tailwind config, color palette, fonts, CSS utilities |
| Testing | `docs/testing.md` | Jest unit tests, Playwright E2E, coverage |
| Routing | `src/app/docs/routing.md` | Detailed route map, params, metadata, middleware |
| Data Layer | `src/lib/docs/data-layer.md` | Server actions, SDK usage, custom API calls |
| Contexts | `src/lib/docs/contexts.md` | All React context providers in detail |
| Hooks | `src/lib/docs/hooks.md` | Custom hooks (useInView, useToggleState) |
| Utilities | `src/lib/docs/utilities.md` | Money formatting, sorting, env helpers, Turnstile |
| Modules Overview | `src/modules/docs/overview.md` | Module system, conventions, component organization |
| Layout Module | `src/modules/docs/layout.md` | Nav, Footer, ChannelSplash, CookieConsent |
| Home Module | `src/modules/docs/home.md` | Homepage sections, hero, CTA components |
| Products Module | `src/modules/docs/products.md` | Product cards, detail page, reviews, metadata |
| Cart Module | `src/modules/docs/cart.md` | Cart page, line items, channel tabs, free shipping nudge |
| Checkout Module | `src/modules/docs/checkout.md` | Checkout flow, payment, shipping, Stripe integration |
| Account Module | `src/modules/docs/account.md` | Dashboard, parallel routes, profile, addresses |
| Order Module | `src/modules/docs/order.md` | Order confirmation, order history |
| Blog Module | `src/modules/docs/blog.md` | Blog listing, post detail, categories, rich text |
| Common Module | `src/modules/docs/common.md` | Shared primitives, LocalizedClientLink, icons |
| Store Module | `src/modules/docs/store.md` | Store listing page, filtering, pagination |
| Skeletons Module | `src/modules/docs/skeletons.md` | Loading skeleton components |
