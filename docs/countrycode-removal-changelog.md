# countryCode Removal — Storefront Changelog

Completed the migration from `[countryCode]`-based routing to `[channel]`-based routing (`retail` / `professional`) with shared routes at the root level.

**Date**: 2026-03-12

---

## Step 1: Shared Pages (`src/app/(shared)/`)

### `gift-cards/page.tsx`
- Removed `countryCode` params type and destructuring
- Replaced `import { getRegion }` with no region import (page doesn't need region)
- Removed `countryCode` from `listProducts()` call

### `blog/[slug]/page.tsx`
- Removed `countryCode` from `Props` params type
- Replaced `import { getRegion }` with `import { getDefaultRegion }`
- `getRegion(countryCode)` → `getDefaultRegion()`
- Removed `countryCode` from `listProducts()` call
- Fixed OpenGraph URL: `/${countryCode}/blog/${slug}` → `/blog/${slug}`
- Fixed JSON-LD URLs: `/${countryCode}/blog/${slug}` → `/blog/${slug}`, `/${countryCode}/blog` → `/blog`

### `blog/editor/page.tsx`
- Removed `useParams` import (no longer needed)
- Removed `const countryCode = params.countryCode as string` from `BlogEditorForm`
- Fixed redirects: `/${countryCode}/blog/${slug}` → `/blog/${slug}`, `/${countryCode}/blog/editor/${id}` → `/blog/editor/${id}`
- Removed `countryCode` from `handleSave` dependency array

### `blog/editor/[id]/page.tsx`
- Removed `const countryCode = params.countryCode as string` from `BlogEditorEditForm`
- Fixed redirects: `/${countryCode}/blog/${slug}` → `/blog/${slug}`
- Fixed preview URL: `/${countryCode}/blog/${slug}?preview=true` → `/blog/${slug}?preview=true`
- Removed `countryCode` from `handleSave` and `handlePreview` dependency arrays

### `account/@dashboard/addresses/page.tsx`
- Replaced `import { getRegion }` with `import { getDefaultRegion }`
- Removed `countryCode` params type and destructuring
- `getRegion(countryCode)` → `getDefaultRegion()`

### `account/@dashboard/wishlist/page.tsx`
- Replaced `import { getRegion }` with `import { getDefaultRegion }`
- Removed `countryCode` params type and destructuring
- `getRegion(countryCode)` → `getDefaultRegion()`
- Removed `countryCode` prop from `<WishlistOverview>`

### `practitioner/register/page.tsx`
- Removed `countryCode` params type and destructuring
- Fixed redirect: `/${countryCode}/account` → `/account`

### `practitioner/dashboard/page.tsx`
- Removed `countryCode` params type and destructuring
- Fixed redirects: `/${countryCode}/account` → `/account`, `/${countryCode}/practitioner/register` → `/practitioner/register`

### `practitioner/dashboard/codes/new/page.tsx`
- Removed `countryCode` params type and destructuring
- Fixed 3 redirects: `/${countryCode}/account` → `/account`, `/${countryCode}/practitioner/register` → `/practitioner/register`, `/${countryCode}/practitioner/dashboard` → `/practitioner/dashboard`
- `listAllProducts(countryCode)` → `listAllProducts()` (no args)

---

## Step 2a: Client Components

### `account/components/account-nav/index.tsx`
- Removed `useParams` import
- `signout(countryCode)` → `signout()` (no args)
- Mobile nav check: `route !== \`/${countryCode}/account\`` → `route !== "/account"`
- `AccountNavLink` active detection: `route.split(countryCode)[1] === href` → `route === href`
- Removed `useParams()` call from `AccountNavLink`

### `account/components/delete-account/index.tsx`
- Removed `useParams` import
- Removed `countryCode` destructuring from `useParams()`
- Fixed redirect: `/${countryCode}` → `/`

### `account/components/reset-password/index.tsx`
- Removed `useParams` import
- Removed `countryCode` from `useParams()` destructuring
- Fixed redirect: `/${countryCode}/account` → `/account`
- Removed `countryCode` from `useEffect` dependency array

### `layout/components/search-bar/index.tsx`
- Replaced `const { countryCode } = useParams()` with `const { channel } = useParams()` + `const prefix = channel ? \`/${channel}\` : ""`
- `searchProducts(q, countryCode)` → `searchProducts(q)` (no country arg)
- Fixed search URL: `/${countryCode}/search?q=...` → `${prefix}/search?q=...`
- Fixed product URL: `/${countryCode}/products/${handle}` → `${prefix}/products/${handle}`
- Removed `countryCode` from `fetchResults` dependency array

### `blog/components/blog-post-preview.tsx`
- Removed `useParams` import
- Removed `const countryCode = params.countryCode as string`

### `products/components/wishlist-button/index.tsx`
- Renamed `countryCode` to `channel` from `useParams()`
- Simplified login redirect: removed channel prefix logic, now always redirects to `/account`

### `gift-cards/components/gift-card-purchase/index.tsx`
- Removed `useParams` import
- Removed `countryCode` from `useParams()`
- Removed `countryCode` from `addToCart()` call
- Fixed redirect: `/${countryCode}/cart` → `/cart`

---

## Step 2b: Server Components

### `products/templates/index.tsx`
- Removed `countryCode` from `ProductTemplateProps` type
- Removed `countryCode` from destructuring
- Removed `countryCode` prop from `<PairsWellWith>` and `<RelatedProducts>`

### `products/components/related-products/index.tsx`
- Replaced `import { getRegion }` with `import { getDefaultRegion }`
- Removed `countryCode` from `RelatedProductsProps` type
- `getRegion(countryCode)` → `getDefaultRegion()`
- Removed `countryCode` from `listProducts()` call

### `products/components/pairs-well-with/index.tsx`
- Replaced `import { getRegion }` with `import { getDefaultRegion }`
- Removed `countryCode` from `PairsWellWithProps` type
- `getRegion(countryCode)` → `getDefaultRegion()`
- Removed `countryCode` from both `listProducts()` calls

### `search/templates/index.tsx`
- Removed `countryCode` from props type and destructuring
- Removed `countryCode` prop from `<SearchResults>`

### `search/templates/search-results.tsx`
- Replaced `import { getRegion }` with `import { getDefaultRegion }`
- Removed `countryCode` from props type and destructuring
- `getRegion(countryCode)` → `getDefaultRegion()`
- Removed `countryCode` from `listProducts()` call

### `categories/templates/index.tsx`
- Removed `countryCode` from props type and destructuring
- Simplified guard: `if (!category || !countryCode)` → `if (!category)`
- Removed `countryCode` prop from `<PaginatedProducts>`

### `collections/templates/index.tsx`
- Removed `countryCode` from props type and destructuring
- Removed `countryCode` prop from `<PaginatedProducts>`

### `account/components/wishlist-overview/index.tsx`
- Removed `countryCode` from `WishlistOverviewProps` and `WishlistItemCardProps`
- Removed `countryCode` from all destructuring
- Removed `countryCode` from `addToCart()` call

---

## Step 2c: Image CTA

### `common/components/image-cta/index.tsx`
- Replaced `import { useChannel, Channel } from "@lib/context/channel-context"` with `import { useParams } from "next/navigation"` + local `type Channel = "retail" | "professional"`
- `const { channel, hydrated } = useChannel()` → `const channel = useParams().channel as Channel | undefined`
- Channel detection: `hydrated ? getOtherChannel(channel) : null` → `channel ? getOtherChannel(channel) : null`
- `ChannelNote`: converted from a `<button>` calling `setChannel()` to a `<LocalizedClientLink>` pointing to `/${otherChannel}/products/${handle}`
- Added `productHandle` prop to `ChannelNote`

---

## Step 3: Deleted Old Components

| Path | Reason |
|------|--------|
| `src/modules/layout/components/channel-splash/` | Replaced by route-based channel selection |
| `src/modules/layout/components/channel-toggle/` | No longer needed — channels are URL segments |
| `src/modules/layout/components/channel-reminder/` | No longer needed |
| `src/modules/layout/components/nav-professional-badge/` | No longer needed |
| `src/modules/layout/components/country-select/` | Layout version — single-region store |
| `src/modules/layout/components/language-select/` | Not used |
| `src/modules/store/components/channel-filter-sync/` | Replaced by route-based filtering |

---

## Step 4: Deleted `src/app/[countryCode]/`

Removed the entire legacy routing directory including:
- `(main)/` — all page routes (products, blog, search, practitioner, etc.)
- `(checkout)/` — old checkout layout (replaced by `(shared)/checkout/`)

---

## Verification

- `grep -r "countryCode" src/ --include="*.tsx" --include="*.ts"` returns zero matches outside checkout address components (which use `country_code` as address data, not routing)
- `npm run build` passes with zero errors
- All routes render under the new structure: `/[channel]/(main)/` for channel pages, `/(shared)/` for shared pages

---

## Files NOT Modified (Address Data)

These files use `country_code` as a billing/shipping address field and were intentionally left untouched:
- `src/modules/checkout/components/country-select/`
- `src/modules/checkout/components/shipping-address/`
- `src/modules/checkout/components/billing_address/`
- `src/modules/checkout/components/addresses/`
- `src/modules/checkout/components/address-select/`
- `src/modules/checkout/components/shipping/`
- `src/modules/account/components/address-card/`
- `src/modules/account/components/profile-billing-address/`
- `src/modules/order/components/shipping-details/`
