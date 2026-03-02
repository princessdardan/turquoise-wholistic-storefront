# Module System

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Module List](#module-list)
4. [Components vs Templates](#components-vs-templates)
5. [Barrel Exports](#barrel-exports)
6. [Server vs Client Components](#server-vs-client-components)
7. [Common Module — Shared Primitives](#common-module--shared-primitives)
8. [LocalizedClientLink — Critical Pattern](#localizedclientlink--critical-pattern)
9. [TypeScript Alias](#typescript-alias)

---

## Overview

All UI components are organized by feature domain under `src/modules/`. There are 16 modules in total. The `@modules/*` TypeScript path alias maps directly to `src/modules/*`, so imports never require relative path traversal across module boundaries.

---

## Directory Structure

Each module follows this standard layout:

```
src/modules/<module-name>/
├── components/           # Feature-specific components
│   └── <component-name>/
│       └── index.tsx     # Component implementation
├── templates/            # Page-level compositions
│   └── index.tsx
└── icons/               # SVG icon components (some modules only)
```

Not every module has all three subdirectories. `templates/` is omitted when a module only provides reusable primitives (e.g., `skeletons`, `common`). `icons/` exists only in modules that define their own SVG assets (e.g., `common`).

---

## Module List

| Module | Purpose | Has Templates | Notes |
|---|---|---|---|
| `account` | Customer account, login, dashboard | Yes | Parallel routes: `@dashboard` / `@login` |
| `blog` | Blog post listing and detail | Yes | Includes `ImageCta`, category carousel |
| `cart` | Cart drawer, line items, totals | Yes | |
| `categories` | Product category browsing | Yes | |
| `checkout` | Multi-step checkout flow | Yes | Minimal layout, no main nav |
| `collections` | Product collection browsing | Yes | |
| `common` | Shared primitives across all modules | No | See [Common Module](#common-module--shared-primitives) |
| `gift-cards` | Gift card lookup and redemption | Yes | |
| `home` | Homepage hero and featured sections | Yes | |
| `layout` | Nav, footer, menus, country select | Yes | Nav and footer are templates |
| `order` | Order confirmation, details, history | Yes | |
| `products` | Product cards, detail page, reviews | Yes | Most component-dense module |
| `search` | Search modal and results | Yes | |
| `shipping` | Shipping option display | No | |
| `skeletons` | Loading skeleton screens | Yes | Mirrors structure of other modules |
| `store` | Store listing page, refinement, pagination | Yes | |

---

## Components vs Templates

**Components** are focused, reusable UI pieces with a single responsibility. They can be composed together and reused across multiple pages or other components.

```tsx
// src/modules/products/components/thumbnail/index.tsx
// Single responsibility: renders a product image or placeholder

const Thumbnail: React.FC<ThumbnailProps> = ({ thumbnail, images, size }) => {
  const initialImage = thumbnail || images?.[0]?.url
  return (
    <Container className="...">
      <ImageOrPlaceholder image={initialImage} size={size} />
    </Container>
  )
}
```

**Templates** are page-level compositions. They orchestrate multiple components and map to a specific page in `src/app/[countryCode]/`. They are imported directly in `page.tsx` files.

```tsx
// src/modules/store/templates/index.tsx
// Composes RefinementList + PaginatedProducts for the /store page

const StoreTemplate = ({ sortBy, page, countryCode }) => {
  return (
    <div className="flex flex-col small:flex-row ...">
      <RefinementList sortBy={sort} />
      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts sortBy={sort} page={pageNumber} countryCode={countryCode} />
      </Suspense>
    </div>
  )
}
```

Rule of thumb: if it is imported in a `page.tsx`, it is a template. If it is imported by another component or template, it is a component.

---

## Barrel Exports

Every component directory exports its default export via `index.tsx`. Import using the directory path — never reference the file directly.

```ts
// Correct
import Thumbnail from "@modules/products/components/thumbnail"

// Wrong — never reference the file extension explicitly
import Thumbnail from "@modules/products/components/thumbnail/index.tsx"
```

This applies to templates as well:

```ts
import StoreTemplate from "@modules/store/templates"
import NavTemplate from "@modules/layout/templates/nav"
```

---

## Server vs Client Components

All components are **Server Components by default**. No directive is needed for server components.

Mark a component `"use client"` only when it requires:

- React hooks (`useState`, `useEffect`, `useContext`, `useParams`, etc.)
- Browser APIs (`window`, `document`, `localStorage`)
- Event handlers attached directly to DOM elements (`onClick`, `onChange`)
- Context providers

```tsx
// Server Component — no directive, async data fetch is fine
// src/modules/products/components/wellness-metadata/index.tsx
const WellnessMetadata = async ({ productId }: { productId: string }) => {
  const metadata = await getProductMetadata(productId)
  return <div>{metadata.supplement_facts}</div>
}

// Client Component — needs useParams() for country code
// src/modules/common/components/localized-client-link/index.tsx
"use client"
const LocalizedClientLink = ({ href, children, ...props }) => {
  const { countryCode } = useParams()
  return <Link href={`/${countryCode}${href}`} {...props}>{children}</Link>
}
```

When wrapping a client component inside a server component tree, pass server-fetched data down as props rather than re-fetching inside the client component.

---

## Common Module — Shared Primitives

The `common` module is the shared utility layer consumed by all other modules. Do not add feature-specific logic here.

**Form components**

| Component | Path |
|---|---|
| `Input` | `common/components/input` |
| `Checkbox` | `common/components/checkbox` |
| `Radio` | `common/components/radio` |
| `NativeSelect` | `common/components/native-select` |
| `FilterRadioGroup` | `common/components/filter-radio-group` |

**UI utilities**

| Component | Path |
|---|---|
| `Modal` | `common/components/modal` |
| `Toast` | `common/components/toast` |
| `Divider` | `common/components/divider` |
| `InteractiveLink` | `common/components/interactive-link` |
| `DeleteButton` | `common/components/delete-button` |

**Navigation**

| Component | Path |
|---|---|
| `LocalizedClientLink` | `common/components/localized-client-link` |

**Ecommerce**

| Component | Path |
|---|---|
| `CartTotals` | `common/components/cart-totals` |
| `LineItemOptions` | `common/components/line-item-options` |
| `LineItemPrice` | `common/components/line-item-price` |
| `LineItemUnitPrice` | `common/components/line-item-unit-price` |

**Form protection**

| Component | Path |
|---|---|
| `HoneypotField` | `common/components/honeypot-field` |
| `Turnstile` | `common/components/turnstile` |

**Analytics**

| Component | Path |
|---|---|
| `AnalyticsTracker` | `common/components/analytics-tracker` |

**Icons** — SVG components live in `common/icons/`. Import by name:

```ts
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import Spinner from "@modules/common/icons/spinner"
```

---

## LocalizedClientLink — Critical Pattern

**Always use `LocalizedClientLink` instead of Next.js `<Link>`** for any internal navigation. All routes in this application are prefixed with `/{countryCode}` (e.g., `/ca/products`). Using the plain `<Link>` component omits the country code and breaks multi-region routing.

```tsx
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Correct — country code is injected automatically
<LocalizedClientLink href="/products/my-product">View Product</LocalizedClientLink>
// Renders: <a href="/ca/products/my-product">

// Wrong — missing country code, routing breaks
import Link from "next/link"
<Link href="/products/my-product">View Product</Link>
// Renders: <a href="/products/my-product">
```

`LocalizedClientLink` is a client component (`"use client"`) because it calls `useParams()` to read the active `countryCode` from the URL. It accepts all standard `<Link>` props.

---

## TypeScript Alias

The `@modules/*` alias is defined in `tsconfig.json` and resolves to `src/modules/*`.

```ts
// tsconfig.json paths entry:
"@modules/*" → "src/modules/*"

// Usage in any file under src/
import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import StoreTemplate from "@modules/store/templates"
```

Never use relative paths (e.g., `../../modules/common/...`) to import across module boundaries. Always use the `@modules/*` alias.
