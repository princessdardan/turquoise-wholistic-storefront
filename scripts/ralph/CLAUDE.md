# Ralph Agent Instructions

You are an autonomous coding agent working on the **Turquoise Wholistic Storefront** — a Next.js 15 ecommerce storefront powered by a Medusa v2 backend.

## Your Task

1. Read the PRD at `scripts/ralph/prd.json`
2. Read the progress log at `scripts/ralph/progress.txt` (**check Codebase Patterns section first**)
3. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that single user story
6. Run quality checks (see Quality Requirements below)
7. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
8. Update the PRD to set `passes: true` for the completed story
9. Append your progress to `scripts/ralph/progress.txt`

## Single-Repo Focus

This ralph instance operates on the **storefront repo only**. All code changes and commits happen in this repo. If a story requires backend changes (new API routes, modules, etc.), skip it and note in progress.txt that it has a backend dependency.

The Medusa backend lives at `../turquoise-wholistic` (port 9000) — reference it for API route signatures, response shapes, and data models, but do NOT modify it.

## Project Architecture

### Storefront (Next.js 15 — this repo, port 8000)

**Routing — Country-Code-Prefixed App Router:**
- All pages under `src/app/[countryCode]/` with two route groups:
  - `(main)/` — Standard pages with Nav + Footer: home, store, products, cart, account, categories, blog, gift-cards, search, contact, about, etc.
  - `(checkout)/` — Minimal checkout layout without main nav
- `src/middleware.ts` handles region detection, country code redirects, and CSP nonce injection

**Module System (`src/modules/`):**
- UI components organized by feature domain: `layout/`, `home/`, `products/`, `cart/`, `checkout/`, `account/`, `order/`, `common/`, `blog/`, `skeletons/`, `store/`, `search/`, `gift-cards/`, `shipping/`
- Server Components by default; client components use `"use client"` directive
- Barrel exports via `index.tsx`

**Data Layer (`src/lib/`):**
- `config.ts` — `@medusajs/js-sdk` client pointing at `MEDUSA_BACKEND_URL`
- `data/` — Server Actions (`"use server"`) for each domain: `cart.ts`, `products.ts`, `customer.ts`, `regions.ts`, `categories.ts`, `collections.ts`, `orders.ts`, `payment.ts`, `fulfillment.ts`, `variants.ts`, `reviews.ts`, `wishlist.ts`, `blog.ts`, `subscriptions.ts`, `gift-cards.ts`, `store-settings.ts`
- `util/` — Price formatting, sorting, environment helpers, Turnstile CAPTCHA
- `context/` — React contexts: `modal-context`, `toast-context`, `wishlist-context`, `channel-context` (retail vs professional), `dual-cart-context`, `medusa-client-context`
- `hooks/` — `useInView`, `useToggleState`
- `constants.tsx` — Payment provider map, `LOW_STOCK_THRESHOLD`, currency config

**Key Patterns:**
- `LocalizedClientLink` — Always use instead of `next/link`. Auto-prepends `/{countryCode}`.
- Cache invalidation via `revalidateTag()` with `_medusa_cache_id` cookie
- Auth: JWT in httpOnly cookie. Account uses parallel routes (`@dashboard`/`@login`)
- Channel system: retail/professional via `ChannelProvider`, separate carts per channel
- Custom backend APIs: `/store/wishlist`, `/store/reviews`, `/store/blog-posts`, `/store/subscriptions`, `/store/gift-cards`, `/store/settings`, `/store/contact`
- Form protection: Cloudflare Turnstile + honeypot via `@marsidev/react-turnstile`
- Product cards: `ProductPreview` (server) + `QuickAddButton` (client) pattern
- Toast notifications: `useToast()` from `@lib/context/toast-context`

### Backend API Reference (Medusa v2 — `../turquoise-wholistic`, port 9000)

**Store routes (public):**
- `GET /store/blog` — List published posts (filterable by category, paginated)
- `GET /store/blog/[slug]` — Single blog post by slug
- `GET/POST /store/gift-cards` — Lookup/redeem gift cards
- `GET /store/gift-cards/[code]` — Gift card balance by code
- `GET /store/products/[id]/metadata` — Product metadata (npn_din_hm, brand, supplement_facts, etc.)
- `GET/POST /store/subscriptions` — List/create customer subscriptions (auth required)
- `PUT /store/subscriptions/[id]` — Update subscription (auth required)
- `DELETE /store/subscriptions/[id]/items/[item_id]` — Remove subscription item (auth required)
- `GET /store/customers/exists` — Check if email is registered
- `GET /store/settings` — Store config (name, currency, contact info)
- `GET /store/cta` — List active CTA components (filterable by placement)
- `GET /store/cta/[id]` — Single CTA component

**Custom modules on backend:** `product-metadata`, `blog`, `subscription`, `gift-card`, `wishlist`, `product-review`, `cta`

## Key Commands

```bash
yarn dev                              # Dev server with Turbopack (port 8000)
yarn build                            # Production build
yarn lint                             # ESLint
yarn test                             # Jest unit tests
yarn test:e2e                         # Playwright E2E tests (requires dev server)
```

### Quality Checks
```bash
# Typecheck
npx tsc --noEmit

# Lint
yarn lint
```

## Quality Requirements

- Run typecheck (`npx tsc --noEmit`) before committing
- **Known pre-existing typecheck errors** (do NOT try to fix these):
  - Errors in shipping, line-item-price, country-select components
- Do NOT commit broken code — your changes must not introduce new errors
- Keep changes focused and minimal; follow existing code patterns

## Styling Guidelines

- **Tailwind CSS 3** with `@medusajs/ui-preset` base
- **Fonts**: Inter (sans) and Playfair Display (serif headings)
- **Colors**: turquoise primary (`turquoise-400: #40E0D0`), sand neutral (`#F5F0EB`), gold accent (`#D4A853`), `brand-text: #1A1A2E`
- **Layout**: `.content-container` = `max-w-[1440px] w-full mx-auto px-6`
- **TypeScript aliases**: `@lib/*` → `src/lib/*`, `@modules/*` → `src/modules/*`
- **Code style**: Prettier — no semicolons, double quotes, trailing commas (es5), 2-space indent

## Progress Report Format

APPEND to `scripts/ralph/progress.txt` (never replace, always append):
```
## [Date] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
  - Useful context for future stories
---
```

## Consolidate Patterns

If you discover a **reusable pattern**, add it to the `## Codebase Patterns` section at the TOP of `scripts/ralph/progress.txt`. Only add patterns that are **general and reusable**, not story-specific details.

## Browser Testing

For UI stories, verify changes in the browser if browser testing tools are available (Playwright MCP):

1. Navigate to the relevant page (`localhost:8000`)
2. Verify the UI changes work as expected
3. Take a screenshot if helpful

If no browser tools are available, note that manual verification is needed.

## Stop Condition

After completing a story, check if ALL stories have `passes: true`.
- **All complete:** Reply with `<promise>COMPLETE</promise>`
- **Stories remaining:** End normally (next iteration picks up the next story)

## Rules

- Work on **ONE story** per iteration
- Commit frequently — one commit per story minimum
- Read the Codebase Patterns in progress.txt **before** starting implementation
- When disabling a feature: remove imports/usage, keep component files for re-enablement
- Server components by default; extract interactive parts into `"use client"` components
- Always use `LocalizedClientLink` instead of `next/link`
- Use existing contexts and hooks (toast, wishlist, channel) rather than creating new state management
- Skip stories that require backend changes — note the dependency in progress.txt
