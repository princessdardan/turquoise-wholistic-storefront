# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 storefront for "Turquoise Wholistic" — a holistic medicine, health resources, and merchandise ecommerce store. Connects to a Medusa v2 backend at `../turquoise-wholistic` (port 9000). Uses Yarn 4 (`packageManager: yarn@4.12.0`).

## Commands

```bash
yarn dev        # Start dev server with Turbopack (port 8000)
yarn build      # Production build (ESLint + TS errors are ignored)
yarn start      # Start production server (port 8000)
yarn lint       # ESLint (next/core-web-vitals)
yarn analyze    # Bundle analyzer build (ANALYZE=true)
```

### Testing

```bash
yarn test                    # Jest unit tests (src/lib/util/__tests__/)
yarn test -- --testPathPattern=money   # Run a single test file by name
yarn test:coverage           # Jest with coverage report (→ jest-coverage/)
yarn test:e2e                # Playwright E2E tests (requires dev server running on :8000)
yarn test:e2e:headed         # Playwright with visible browser
yarn test:e2e:report         # Open last Playwright HTML report
```

- **Unit tests**: Jest + ts-jest, test files at `src/lib/util/__tests__/*.test.ts`. Coverage collects from `src/lib/util/**/*.ts`.
- **E2E tests**: Playwright, test files in `e2e/`. Page objects in `e2e/pages/`. Runs against `http://localhost:8000` (Chromium only, no auto-start). Tests cover auth, cart, checkout, and wishlist flows.

## Architecture

### Routing — Country-Code-Prefixed App Router

All pages live under `src/app/[countryCode]/` with two route groups:
- **`(main)/`** — Standard pages with Nav + Footer layout: home, store, products, cart, account, categories, collections, orders, blog, gift-cards, search, contact, about, visit-us, and policy pages (privacy, terms, return, shipping)
- **`(checkout)/`** — Minimal checkout layout without main nav

The `src/middleware.ts` handles region detection and CSP: it fetches regions from Medusa, maps country codes → regions, redirects bare URLs to `/{countryCode}/...`, and injects a per-request CSP nonce. Falls back to `NEXT_PUBLIC_DEFAULT_REGION` (currently `us`).

### Module System

UI components live in `src/modules/` organized by feature domain. Key modules: `layout/`, `home/`, `products/`, `cart/`, `checkout/`, `account/` (parallel routes: `@dashboard` vs `@login`), `order/`, `common/` (reusable primitives including `LocalizedClientLink`), `skeletons/`, `store/`, `search/`, `gift-cards/`, `shipping/`.

Each module uses `index.tsx` barrel exports. Components are Server Components by default or marked `"use client"` when needed.

### Data Layer (`src/lib/`)

- **`config.ts`** — Initializes `@medusajs/js-sdk` client (`sdk`) pointing at `MEDUSA_BACKEND_URL`, attaches locale header
- **`data/`** — Server Actions (`"use server"`) for each domain:
  - Core commerce: `cart.ts`, `products.ts`, `customer.ts`, `regions.ts`, `categories.ts`, `collections.ts`, `orders.ts`, `payment.ts`, `fulfillment.ts`, `variants.ts`
  - Custom features: `reviews.ts`, `wishlist.ts`, `blog.ts`, `subscriptions.ts`, `gift-cards.ts`, `store-settings.ts`
  - Utilities: `cookies.ts` (auth/cart/cache cookies, server-only), `form-protection.ts` (Turnstile verification), `locales.ts`, `locale-actions.ts`
- **`util/`** — Price formatting (`money.ts`, `get-product-price.ts`), sorting, environment helpers, `turnstile.ts` (Cloudflare Turnstile + honeypot)
- **`context/`** — React contexts: `modal-context.tsx`, `toast-context.tsx` (toast notifications), `wishlist-context.tsx` (client-side wishlist state), `channel-context.tsx` (retail vs professional channel)
- **`hooks/`** — `useInView`, `useToggleState`
- **`constants.tsx`** — Payment provider map (`paymentInfoMap`), `LOW_STOCK_THRESHOLD`, currency config

### Key Patterns

- **`LocalizedClientLink`** — Always use instead of `next/link`. It auto-prepends `/{countryCode}` to all `href` values.
- **Cache invalidation** — Uses Next.js `revalidateTag()` with cache tags derived from `_medusa_cache_id` cookie. All SDK fetches include `cache: "force-cache"` with tag-based revalidation.
- **Auth flow** — JWT stored in httpOnly cookie. Account page uses parallel routes (`@dashboard`/`@login`) to show dashboard or login form based on customer auth state.
- **Payment providers** — Mapped in `src/lib/constants.tsx` (`paymentInfoMap`). Stripe and manual payment supported. Add `NEXT_PUBLIC_STRIPE_KEY` to enable Stripe.
- **Channel system** — Customers choose "retail" or "professional" channel via `ChannelProvider` (persisted in localStorage). `ChannelSplash` component prompts on first visit.
- **Custom backend APIs** — Several features call custom Medusa API routes (not standard SDK): `/store/wishlist`, `/store/reviews`, `/store/blog-posts`, `/store/subscriptions`, `/store/gift-cards`, `/store/settings`, `/store/contact`. These are defined in the Medusa backend (`../turquoise-wholistic`).
- **Form protection** — Contact and other public forms use Cloudflare Turnstile CAPTCHA + honeypot field via `@marsidev/react-turnstile`. Turnstile degrades gracefully when env vars are missing.

## Styling

- **Tailwind CSS 3** with `@medusajs/ui-preset` base preset, `tailwindcss-radix` plugin, and `@tailwindcss/typography`
- **Fonts**: Inter (sans, `--font-inter`) and Playfair Display (serif headings, `--font-playfair`) via `next/font/google`
- **Custom color palette**:
  - `turquoise-50` through `turquoise-900` (primary, `turquoise-400: #40E0D0`)
  - `sand-50` through `sand-300` (warm neutral backgrounds)
  - `gold-400`/`gold-500` (accent)
  - `brand-text: #1A1A2E`, `brand-text-secondary: #64748B`
- **CSS variables** defined in `src/styles/globals.css` under `:root`
- **Layout utility**: `.content-container` = `max-w-[1440px] w-full mx-auto px-6`
- **Text utilities**: Component classes `.text-xsmall-regular` through `.text-3xl-semi` defined in globals.css
- **Custom breakpoints**: `2xsmall: 320px`, `xsmall: 512px`, `small: 1024px`, `medium: 1280px`, `large: 1440px`

## TypeScript Aliases

```
@lib/*     → src/lib/*
@modules/* → src/modules/*
@pages/*   → src/pages/*
```

## Code Style

- Prettier: no semicolons, double quotes, trailing commas (es5), 2-space indent
- ESLint: `next/core-web-vitals` rules
- TypeScript: strict mode, `next` compiler plugin enabled

## Environment Variables

- `MEDUSA_BACKEND_URL` — Medusa server (default `http://localhost:9000`)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` — **Required**. Publishable API key from Medusa admin. Build fails without it.
- `NEXT_PUBLIC_BASE_URL` — Storefront URL (default `http://localhost:8000`)
- `NEXT_PUBLIC_DEFAULT_REGION` — Fallback region ISO-2 code (default `us`)
- `NEXT_PUBLIC_STRIPE_KEY` — Stripe publishable key (optional)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key (optional, forms degrade gracefully)
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile server-side secret (optional)
- `REVALIDATE_SECRET` — Next.js on-demand revalidation secret
