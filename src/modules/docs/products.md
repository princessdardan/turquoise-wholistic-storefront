# Products Module

This module (`src/modules/products/`) contains all components for product detail pages and product listings. It is organized into two subdirectories: `templates/` for page-level compositions and `components/` for individual UI units.

---

## Templates

### ProductTemplate

**Location**: `templates/index.tsx` — Server Component

The root page template for the product detail page. Receives a resolved `StoreProduct`, `StoreRegion`, `countryCode`, and `images` array as props. Calls `notFound()` if the product is missing.

Layout structure:

- `Breadcrumb` — rendered above the two-column grid
- Two-column grid (`55% / 1fr` on desktop, stacked on mobile):
  - Left: `ImageGallery`
  - Right (sticky on desktop): `ProductInfo`, `ProductReviewSummary`, `ProductActionsWrapper`, `TrustBadges`, `HealthDisclaimer`, `WellnessMetadata`, `ProductTabs`
- Full-width sections below the grid: `ProductReviews`, `PairsWellWith`, `RelatedProducts`

All async data-fetching components are wrapped in `Suspense`. `ProductActionsWrapper` uses a disabled `ProductActions` as its skeleton fallback. `RelatedProducts` uses `SkeletonRelatedProducts`. Fires a `ViewItemTracker` GA4 event on mount.

### ProductInfo

**Location**: `templates/product-info/index.tsx` — Server Component

Composes the product title, description, and category tags in the right column. Renders a collection breadcrumb link when the product belongs to a collection. Places `WishlistButton` (in `"button"` variant) inline with the title. Passes `product.categories` to `HealthConcernTags`.

| Prop | Type | Description |
|---|---|---|
| `product` | `HttpTypes.StoreProduct` | The product to display |

### ProductActionsWrapper

**Location**: `templates/product-actions-wrapper/index.tsx` — Server Component

Fetches real-time pricing and the authenticated customer in parallel before rendering `ProductActions`. Uses `listProducts` with `regionId` to get calculated prices for the correct region. Passes `isLoggedIn` (boolean) to `ProductActions`. Returns `null` if the product cannot be found.

| Prop | Type | Description |
|---|---|---|
| `id` | `string` | Product ID to fetch |
| `region` | `HttpTypes.StoreRegion` | Active region (determines currency/pricing) |

---

## Components

### Thumbnail

**Location**: `components/thumbnail/index.tsx` — Server Component

Renders a product image inside a styled `Container` with hover shadow transition. Falls back to `PlaceholderImage` when no image URL is available. Uses `next/image` with `fill` and responsive `sizes`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `thumbnail` | `string \| null` | — | Primary image URL |
| `images` | `any[] \| null` | — | Fallback image array (uses `[0].url`) |
| `size` | `"small" \| "medium" \| "large" \| "full" \| "square"` | `"small"` | Controls fixed width and aspect ratio |
| `isFeatured` | `boolean` | — | Uses `11/14` aspect ratio instead of `9/16` |
| `productName` | `string` | — | Used as alt text |
| `className` | `string` | — | Additional class overrides |

### ProductPreview

**Location**: `components/product-preview/index.tsx` — Server Component

Card component used in product grid listings. Links the entire card to `/products/{handle}`. Renders `Thumbnail` at `size="full"`, overlays `ProfessionalBadge`, `SaleBadge`, and `StockBadge` in the top-left corner, and shows `WishlistButton` (icon variant, absolutely positioned top-right). Displays the product title and starting price below the image.

| Prop | Type | Description |
|---|---|---|
| `product` | `HttpTypes.StoreProduct` | Product data |
| `isFeatured` | `boolean` | Passed to `Thumbnail` for alternate aspect ratio |
| `region` | `HttpTypes.StoreRegion` | Used to resolve pricing |

### ProductActions

**Location**: `components/product-actions/index.tsx` — Client Component (`"use client"`)

The primary add-to-cart interaction panel. Manages all local state for variant selection, quantity, and purchase mode. Single-variant products have their options pre-selected automatically. Updates the `?v_id` query param as the user selects options.

Key behaviors:

- **Variant selection**: `OptionSelect` buttons for each product option; only shown when more than one variant exists
- **Stock gating**: the "Add to cart" button is disabled when the selected variant is out of stock or not yet selected
- **Subscribe & Save**: integrates `SubscribeSave` to toggle between `"one-time"` and `"subscription"` purchase modes
- **Subscription flow**: when `purchaseMode === "subscription"` and the user is not logged in, clicking the button redirects to `/account` rather than submitting
- **GA4 tracking**: calls `trackAddToCart` on every successful one-time add
- **Mobile sticky bar**: `MobileActions` renders a sticky bottom bar that appears when the main action panel scrolls out of view (controlled by `useIntersection`)
- **Subscription discount**: reads `product.metadata.subscription_discount_percent`; defaults to 10% if absent or invalid

| Prop | Type | Default | Description |
|---|---|---|---|
| `product` | `HttpTypes.StoreProduct` | — | Product with variants and metadata |
| `region` | `HttpTypes.StoreRegion` | — | Active region |
| `disabled` | `boolean` | `false` | Disables all controls (used as Suspense fallback) |
| `isLoggedIn` | `boolean` | `false` | Controls subscription eligibility and button label |

### ProductPrice

**Location**: `components/product-price/index.tsx` — Server Component

Displays the formatted price for a product or a specific variant. Uses `getProductPrice()` from `@lib/util/get-product-price`. When no variant is selected, shows the cheapest price prefixed with "From". When on sale, renders the calculated price in turquoise and the original price struck through. Shows a loading skeleton (`animate-pulse`) while price data is absent.

| Prop | Type | Description |
|---|---|---|
| `product` | `HttpTypes.StoreProduct` | Product to price |
| `variant` | `HttpTypes.StoreProductVariant` | When provided, shows variant-specific price instead of cheapest |

### ImageGallery

**Location**: `components/image-gallery/index.tsx` — Client Component (`"use client"`)

Renders a main image (4/5 aspect ratio) with a scrollable thumbnail strip below it when more than one image is present. Clicking or pressing Enter/Space on the main image opens a `Lightbox` overlay. The active thumbnail is highlighted with a `ring-2 ring-turquoise-400` border. Resets to the first image whenever the `images` prop changes (e.g., on variant switch).

| Prop | Type | Description |
|---|---|---|
| `images` | `HttpTypes.StoreProductImage[]` | Ordered array of product images |

### WellnessMetadata

**Location**: `components/wellness-metadata/index.tsx` — Server Component (async)

Fetches custom product metadata from `/store/products/{id}/metadata` via `getProductMetadata()`. Returns `null` if no metadata exists or if none of the displayed fields have content. Renders up to four sections:

- **CertificationBadges** — turquoise pill badges for each certification string
- **IngredientsSection** — bulleted list of ingredients on a sand background
- **DosageSection** — dosage instructions on a turquoise-tinted panel
- **WarningsSection** — warnings text on an amber-tinted panel

| Prop | Type | Description |
|---|---|---|
| `productId` | `string` | Product ID passed to the metadata API |

### HealthConcernTags

**Location**: `components/health-concern-tags/index.tsx` — Client Component (`"use client"`)

Filters `product.categories` to those whose `parent_category.name` equals `"Health Concerns"` and renders each as a linked pill badge. Returns `null` when no matching categories exist. Each badge links to `/categories/{handle}` via `LocalizedClientLink`.

| Prop | Type | Description |
|---|---|---|
| `categories` | `HttpTypes.StoreProductCategory[] \| null` | Full category array from the product |

### ProductTabs

**Location**: `components/product-tabs/index.tsx` — Client Component (`"use client"`)

Accordion component with always-present "Product Information" and "Shipping & Returns" tabs. Two additional tabs appear conditionally when the product has corresponding metadata keys:

- **Ingredients** — shown when `product.metadata.ingredients` is a non-empty string; renders a comma-separated bulleted list
- **Benefits** — shown when `product.metadata.benefits` is a non-empty string; renders a comma-separated list with turquoise checkmark icons

The "Product Information" tab shows material, country of origin, type, weight, and dimensions. "Shipping & Returns" shows static copy with icons for fast delivery, exchanges, and returns.

| Prop | Type | Description |
|---|---|---|
| `product` | `HttpTypes.StoreProduct` | Source of metadata and physical attributes |

### ProductReviews

**Location**: `components/product-reviews/index.tsx` — Server Component (async)

Fetches up to 50 reviews and the authenticated customer in parallel. Renders a header with the aggregate star rating, a `RatingDistribution` bar chart (5-star breakdown), a list of `ReviewCard` items, and a `ReviewForm` at the bottom. Returns an empty state message when there are no reviews. The `StarRatingSummary` named export is used by `ProductReviewSummary` for the compact rating shown near the product title.

| Prop | Type | Description |
|---|---|---|
| `productId` | `string` | Product ID used to fetch reviews |

### ReviewForm

**Location**: `components/review-form/index.tsx` — Client Component (`"use client"`)

Collects a star rating (1–5, interactive hover state), a title, and a body text. Validates all three fields before submitting via `submitReview()`. Shows a sign-in prompt instead of the form when `isLoggedIn` is false. On success, replaces the form with a thank-you confirmation panel.

| Prop | Type | Description |
|---|---|---|
| `productId` | `string` | Passed to `submitReview()` |
| `isLoggedIn` | `boolean` | Controls whether the form or the sign-in prompt is rendered |

### WishlistButton

**Location**: `components/wishlist-button/index.tsx` — Client Component (`"use client"`)

Heart icon button backed by `useWishlist()` context. Redirects unauthenticated users to `/account` on click. Applies a brief scale animation on toggle. Supports two visual variants:

| Variant | Appearance |
|---|---|
| `"icon"` (default) | Small circular button, absolutely positioned (for product cards) |
| `"button"` | Inline text + icon button ("Add to Wishlist" / "In Wishlist") |

| Prop | Type | Default | Description |
|---|---|---|---|
| `productId` | `string` | — | ID used to check and toggle wishlist state |
| `variant` | `"icon" \| "button"` | `"icon"` | Controls visual presentation |

### SubscribeSave

**Location**: `components/subscribe-save/index.tsx` — Client Component (`"use client"`)

Presents two radio-style purchase mode cards: "One-time Purchase" and "Subscribe & Save". When the subscription option is selected, a frequency selector (`weekly`, `biweekly`, `monthly`, `bimonthly`) and the discounted price appear. Shows a sign-in link when `isLoggedIn` is false. All state is owned by the parent (`ProductActions`).

| Prop | Type | Description |
|---|---|---|
| `purchaseMode` | `"one-time" \| "subscription"` | Controlled selection state |
| `onPurchaseModeChange` | `(mode) => void` | Callback when mode changes |
| `frequency` | `SubscriptionFrequency` | Selected delivery frequency |
| `onFrequencyChange` | `(freq) => void` | Callback when frequency changes |
| `originalPrice` | `string \| null` | Formatted full price |
| `discountedPrice` | `string \| null` | Formatted discounted price |
| `discountPercentage` | `number` | Percentage shown on the "Save X%" badge |
| `isLoggedIn` | `boolean` | Controls whether the sign-in prompt is shown |
| `disabled` | `boolean` | Disables all inputs |

### TrustBadges

**Location**: `components/trust-badges/index.tsx` — Server Component

Static row of three trust indicators: "Free Shipping" (`TruckFast`), "Secure Checkout" (`LockClosedSolid`), and "Easy Returns" (`ArrowPath`). No props. Rendered in the product actions column below the add-to-cart button.

### PairsWellWith

**Location**: `components/pairs-well-with/index.tsx` — Server Component (async)

Fetches up to 4 complementary products, excluding the current product. Attempts category-based suggestions first using the product's `category_id` values; falls back to the most recently created products. Renders a horizontal scroll carousel on mobile and a responsive grid on desktop (`3` columns at `small`, `4` at `medium`). Returns `null` if no products are found or the region cannot be resolved.

| Prop | Type | Description |
|---|---|---|
| `product` | `HttpTypes.StoreProduct` | Source product (used for category IDs and exclusion) |
| `countryCode` | `string` | Used to resolve the active region |

### StockBadge

**Location**: `components/stock-badge/index.tsx` — Server Component

Renders a pill badge for non-in-stock states only (returns `null` when in stock). Supports two modes:

- **Single variant** (via `variant` prop): evaluates that variant's inventory directly
- **Product card** (via `variants` prop): aggregates across all managed variants — shows "Out of Stock" only if total managed stock is zero, otherwise shows the minimum individual variant stock for the most urgent signal

Thresholds are compared against `LOW_STOCK_THRESHOLD` from `@lib/constants`.

| Badge | Condition | Color |
|---|---|---|
| "Out of Stock" | All managed stock is 0 | Gray |
| "Only X left in stock" | Min stock `<= LOW_STOCK_THRESHOLD` | Gold |

| Prop | Type | Description |
|---|---|---|
| `variant` | `HttpTypes.StoreProductVariant \| null` | Single-variant mode |
| `variants` | `HttpTypes.StoreProductVariant[]` | Product-card aggregate mode |
| `compact` | `boolean` | Smaller text/padding for use in product cards |

### SaleBadge

**Location**: `components/sale-badge/index.tsx` — Server Component

Renders a red pill badge displaying the discount percentage (e.g., `-20%`). Returns `null` when `percentageOff` parses to zero or less.

| Prop | Type | Default | Description |
|---|---|---|---|
| `percentageOff` | `string` | — | Discount percentage as a string (e.g., `"20"`) |
| `compact` | `boolean` | `false` | Smaller text/padding for product cards |
| `className` | `string` | — | Additional class overrides |

### Breadcrumb

**Location**: `components/breadcrumb/index.tsx` — Client Component (`"use client"`)

Navigation breadcrumb: Home > Collection (when present) > Product title. Uses `LocalizedClientLink` for localized hrefs. The product title is truncated at `max-w-[200px]`.

| Prop | Type | Description |
|---|---|---|
| `product` | `HttpTypes.StoreProduct` | Provides `title` and optional `collection` |

### QuantitySelector

**Location**: `components/quantity-selector/index.tsx` — Client Component (`"use client"`)

Pill-shaped increment/decrement control. The decrement button is disabled at quantity `1`. The increment button is disabled when `quantity >= max` (when `max` is provided). Quantity is fully controlled via props.

| Prop | Type | Description |
|---|---|---|
| `quantity` | `number` | Controlled quantity value |
| `onChange` | `(quantity: number) => void` | Callback on change |
| `max` | `number` | Upper bound (tied to variant inventory) |
| `disabled` | `boolean` | Disables both buttons |

### ProductOnboardingCta

**Location**: `components/product-onboarding-cta/index.tsx` — Server Component (async)

Reads the `_medusa_onboarding` cookie. Renders a setup prompt linking to the Medusa admin onboarding flow only when the cookie value is `"true"`. Returns `null` in all other cases. Intended for developer onboarding only and is not shown in production customer flows.

### ProductReviewSummary

**Location**: `components/product-review-summary/index.tsx` — Server Component (async)

Lightweight aggregate rating display for the product title area. Fetches only 1 review record to retrieve `average_rating` and `total_count`, then delegates rendering to the `StarRatingSummary` named export from `ProductReviews`. Returns `null` when `total_count` is 0.

| Prop | Type | Description |
|---|---|---|
| `productId` | `string` | Product ID used to fetch the rating summary |
