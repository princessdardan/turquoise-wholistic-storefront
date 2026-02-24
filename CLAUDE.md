# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 storefront for "Turquoise Wholistic" — a holistic medicine, health resources, and merchandise ecommerce store. Connects to a Medusa v2 backend at `../turquoise-wholistic` (port 9000).

## Commands

```bash
yarn dev        # Start dev server with Turbopack (port 8000)
yarn build      # Production build
yarn start      # Start production server (port 8000)
yarn lint       # ESLint (next/core-web-vitals)
yarn analyze    # Bundle analyzer build (ANALYZE=true)
```

## Architecture

### Routing — Country-Code-Prefixed App Router

All pages live under `src/app/[countryCode]/` with two route groups:
- **`(main)/`** — Standard pages with Nav + Footer layout (home, store, products, cart, account, categories, collections, orders)
- **`(checkout)/`** — Minimal checkout layout without main nav

The `src/middleware.ts` handles region detection: it fetches regions from Medusa, maps country codes → regions, and redirects bare URLs to `/{countryCode}/...`. Falls back to `NEXT_PUBLIC_DEFAULT_REGION` (currently `us`).

### Module System

UI components live in `src/modules/` organized by feature domain:
- **`layout/`** — Nav, Footer, SideMenu, CartButton, CountrySelect
- **`home/`** — Hero, FeaturedProducts
- **`products/`** — ProductPreview, ProductActions, ImageGallery, ProductTabs, RelatedProducts
- **`cart/`** — CartItem, EmptyCartMessage, SignInPrompt
- **`checkout/`** — Addresses, Shipping, Payment, Review (multi-step flow)
- **`account/`** — Login/Register, ProfileName/Email/Phone, AddressBook, OrderOverview (uses parallel routes: `@dashboard` vs `@login`)
- **`order/`** — OrderDetails, OrderSummary, PaymentDetails, ShippingDetails
- **`common/`** — Reusable primitives: Input, Checkbox, Radio, Modal, DeleteButton, LineItemPrice, `LocalizedClientLink`
- **`skeletons/`** — Loading state placeholders for each feature
- **`store/`** — Pagination, RefinementList, SortProducts

Each module uses `index.tsx` barrel exports. Components are either Server Components (default) or marked `"use client"` when needed.

### Data Layer (`src/lib/`)

- **`config.ts`** — Initializes `@medusajs/js-sdk` client (`sdk`) pointing at `MEDUSA_BACKEND_URL`, attaches locale header
- **`data/`** — Server Actions (`"use server"`) for each domain: `cart.ts`, `products.ts`, `customer.ts`, `regions.ts`, `categories.ts`, `collections.ts`, `orders.ts`, `payment.ts`, `fulfillment.ts`
- **`data/cookies.ts`** — Auth (`_medusa_jwt`), cart (`_medusa_cart_id`), and cache tag (`_medusa_cache_id`) cookie helpers. Server-only import.
- **`util/`** — Price formatting (`money.ts`, `get-product-price.ts`), sorting, environment helpers
- **`context/`** — React contexts (ModalContext)
- **`hooks/`** — `useInView`, `useToggleState`

### Key Patterns

- **`LocalizedClientLink`** — Always use instead of `next/link`. It auto-prepends `/{countryCode}` to all `href` values.
- **Cache invalidation** — Uses Next.js `revalidateTag()` with cache tags derived from `_medusa_cache_id` cookie. All SDK fetches include `cache: "force-cache"` with tag-based revalidation.
- **Auth flow** — JWT stored in httpOnly cookie. Account page uses parallel routes (`@dashboard`/`@login`) to show dashboard or login form based on customer auth state.
- **Payment providers** — Mapped in `src/lib/constants.tsx` (`paymentInfoMap`). Stripe and manual payment supported. Add `NEXT_PUBLIC_STRIPE_KEY` to enable Stripe.

## Styling

- **Tailwind CSS 3** with `@medusajs/ui-preset` base preset and `tailwindcss-radix` plugin
- **Fonts**: Inter (sans, `--font-inter`) and Playfair Display (serif headings, `--font-playfair`) via `next/font/google`
- **Custom color palette**:
  - `turquoise-50` through `turquoise-900` (primary, `turquoise-400: #40E0D0`)
  - `sand-50` through `sand-300` (warm neutral backgrounds)
  - `gold-400`/`gold-500` (accent)
  - `brand-text: #1A1A2E`, `brand-text-secondary: #64748B`
- **CSS variables** defined in `src/styles/globals.css` under `:root`
- **Layout utility**: `.content-container` = `max-w-[1440px] w-full mx-auto px-6`
- **Custom breakpoints**: `2xsmall: 320px`, `xsmall: 512px`, `small: 1024px`, `medium: 1280px`, `large: 1440px`

## TypeScript Aliases

```
@lib/*     → src/lib/*
@modules/* → src/modules/*
@pages/*   → src/pages/*
```

## Code Style

- Prettier: no semicolons, double quotes, trailing commas (es5), 2-space tabs
- ESLint: `next/core-web-vitals` rules
- TypeScript: strict mode, `next` compiler plugin enabled

## Environment Variables

- `MEDUSA_BACKEND_URL` — Medusa server (default `http://localhost:9000`)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` — Required. Publishable API key from Medusa admin
- `NEXT_PUBLIC_BASE_URL` — Storefront URL (default `http://localhost:8000`)
- `NEXT_PUBLIC_DEFAULT_REGION` — Fallback region ISO-2 code (default `us`)
- `NEXT_PUBLIC_STRIPE_KEY` — Stripe publishable key (optional)
- `REVALIDATE_SECRET` — Next.js on-demand revalidation secret
