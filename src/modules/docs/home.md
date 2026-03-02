# Home Module

The `home` module (`src/modules/home/`) contains all homepage section components. Each component is a Server Component that composes the homepage layout with hero, featured products, call-to-action blocks, and category navigation.

---

## Hero

**File**: `src/modules/home/components/hero/index.tsx`

**Type**: Client Component

**Purpose**: Full-width hero banner that introduces the store's brand and value proposition. Displays a heading, subheading, and two call-to-action buttons ("Shop Now" and "Browse Categories") linking to the store.

**Props**: None

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| (none) | — | — | Component takes no props |

**Data Source**: None (static content)

---

## FeaturedProducts

**File**: `src/modules/home/components/featured-products/index.tsx`

**Type**: Server Component

**Purpose**: Renders a list of product collections as featured sections on the homepage. Maps over collections and renders a `ProductRail` component for each, displaying products within that collection.

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `collections` | `HttpTypes.StoreCollection[]` | Yes | Array of Medusa store collections to display |
| `region` | `HttpTypes.StoreRegion` | Yes | Current store region (used for pricing and currency) |

**Data Source**: Collections and region are passed as props (typically fetched at the page level)

---

## ProductRail

**File**: `src/modules/home/components/featured-products/product-rail/index.tsx`

**Type**: Server Component

**Purpose**: Horizontal scrollable product carousel within a featured collection. Fetches products for a specific collection, renders a collection header with title and "View all" link, and displays products in a responsive grid.

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `collection` | `HttpTypes.StoreCollection` | Yes | The collection whose products should be displayed |
| `region` | `HttpTypes.StoreRegion` | Yes | Current store region (used for pricing calculations) |

**Data Source**: Fetches products via `listProducts()` with `collection_id` filter and calculated pricing from Medusa

---

## CtaSection

**File**: `src/modules/home/components/cta-section/index.tsx`

**Type**: Server Component

**Purpose**: Renders custom call-to-action content blocks from the backend. Fetches CTA components filtered by placement ("homepage"), alternates their image orientation (left/right), and renders each via the `ImageCta` component. Returns null if no CTAs are configured.

**Props**: None

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| (none) | — | — | Component takes no props |

**Data Source**: Fetches CTA components from backend via `listCtasByPlacement("homepage")` from `@lib/data/cta`

---

## CategoryArray

**File**: `src/modules/home/components/category-array/index.tsx`

**Type**: Client Component

**Purpose**: Grid or horizontal-scrollable row of product health concern category links. Displays each category as a gradient-styled card with category name and product count. Supports mobile horizontal scrolling and desktop grid layout. Gradients auto-assign from a palette but can be overridden via category metadata.

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `healthConcerns` | `CategoryTree[]` | Yes | Array of health concern categories to display |

**Data Source**: Categories are typically passed as props (fetched at the page level)
