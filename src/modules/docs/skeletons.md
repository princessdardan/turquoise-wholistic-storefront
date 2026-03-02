# Skeletons Module

The `skeletons` module (`src/modules/skeletons/`) contains loading placeholder components used in Next.js `Suspense` boundaries and `loading.tsx` files. These components prevent layout shift during data fetching by displaying a visual skeleton that matches the shape and structure of the actual content.

## How Skeletons Work

Next.js App Router provides two mechanisms for showing loading states:

1. **`loading.tsx` files** — Automatically displayed by Next.js while the page segment loads. Create a `loading.tsx` export in any route directory to show a fallback UI.
2. **`<Suspense>` boundaries** — React Suspense allows wrapping async components with a `fallback` prop to display loader UI.

Skeletons match the visual layout of the real component (same grid structure, text height, spacing) to prevent jarring layout shifts when actual content arrives.

```tsx
// In a page or layout:
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

<Suspense fallback={<SkeletonProductGrid />}>
  <PaginatedProducts ... />
</Suspense>
```

## Skeleton Components

Atomic skeleton components used as building blocks within templates. Each component replicates the dimensions and layout of its corresponding real component.

| Component | Matches | Purpose |
|---|---|---|
| `SkeletonButton` | Button | Full-width button placeholder (50px height) |
| `SkeletonCardDetails` | Card/form field | Input field with label above |
| `SkeletonCartItem` | CartItem | Table row with image, name, quantity, price |
| `SkeletonCartTotals` | Cart totals section | Subtotal, tax, shipping, total amounts |
| `SkeletonCodeForm` | Promo code form | Input + button grid (2 columns) |
| `SkeletonLineItem` | LineItem | Table row for order line items |
| `SkeletonOrderConfirmedHeader` | Order header | Status label, order ID, date, time |
| `SkeletonOrderInformation` | Order details | Shipping/billing addresses, totals |
| `SkeletonOrderItems` | Order items list | 3 item rows with image, name, details |
| `SkeletonOrderSummary` | Order summary | Totals + button (used in checkout) |
| `SkeletonProductPreview` | ProductPreview | Product image + title + price (card) |

## Skeleton Templates

Page-level skeleton templates that compose multiple atomic components to fill an entire page or major section.

| Template | Matches | Composition |
|---|---|---|
| `SkeletonCartPage` | Cart page | Header, table with 4 items, order summary, promo code form |
| `SkeletonOrderConfirmed` | Order confirmation page | Header, items (3), shipping/billing, totals |
| `SkeletonProductGrid` | Product listing grid | 8 product previews (configurable via `numberOfProducts` prop) |
| `SkeletonRelatedProducts` | Related products section | Section title + 3 product previews |

## loading.tsx Files

The following pages use skeletons in their `loading.tsx` files:

| Page | Path | Skeleton Template | Purpose |
|---|---|---|---|
| Cart | `/cart/loading.tsx` | `SkeletonCartPage` | Shows while fetching user's cart items |
| Order Confirmed | `/order/[id]/confirmed/loading.tsx` | `SkeletonOrderConfirmed` | Shows while fetching order details after purchase |
| Account | `/account/loading.tsx` | Spinner | Displays a simple spinner icon |
| Account Dashboard | `/account/@dashboard/loading.tsx` | Spinner | Displays a simple spinner icon |

## Usage Pattern

### In a Suspense Boundary

```tsx
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import ProductGrid from "@modules/products/components/product-grid"

export default function StorePage() {
  return (
    <Suspense fallback={<SkeletonProductGrid numberOfProducts={12} />}>
      <ProductGrid limit={12} />
    </Suspense>
  )
}
```

### In a loading.tsx File

```tsx
// src/app/[countryCode]/(main)/cart/loading.tsx
import SkeletonCartPage from "@modules/skeletons/templates/skeleton-cart-page"

export default function Loading() {
  return <SkeletonCartPage />
}
```

## Key Characteristics

- **Animate on load**: All skeletons use `animate-pulse` Tailwind class for subtle pulsing effect during load
- **Gray placeholders**: Background colors use `bg-gray-100` and `bg-gray-200` for visual distinction
- **Fixed dimensions**: Placeholder bars have fixed width/height to match expected content
- **No interactivity**: Skeletons are static; they do not respond to clicks or input
- **Responsive grids**: Product grids use responsive Tailwind classes (`grid-cols-1`, `xsmall:grid-cols-2`, etc.) to match actual layouts
