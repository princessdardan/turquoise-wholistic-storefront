# Store Module

The `store` module (`src/modules/store/`) implements the product catalog browsing page at `/{countryCode}/store`. It provides a reusable server component architecture for listing, filtering, sorting, and paginating products across the storefront.

## Store

### StoreTemplate

Main container component for the store page. Renders the sort/filter sidebar alongside a paginated product grid.

**Props:**
- `sortBy` (optional `SortOptions`) — Current sort mode: "latest" (created_at), "price_asc", or "price_desc"
- `page` (optional `string`) — Current page number from URL query param `?page=`
- `countryCode` (required `string`) — ISO country code for region data

**Behavior:**
- Parses page number from string (defaults to 1)
- Parses sort mode (defaults to "created_at")
- Renders `RefinementList` sidebar with sort controls
- Renders `PaginatedProducts` grid with dynamic pagination (only visible if > 1 page)
- Suspends loading with `SkeletonProductGrid` fallback

### PaginatedProducts

Server Component that fetches products from Medusa with applied filters, sorting, and pagination. Renders a responsive product grid with `ProductPreview` cards.

**Props:**
- `sortBy` (optional `SortOptions`) — Sort mode
- `page` (required `number`) — Page number (1-based)
- `countryCode` (required `string`) — Region identifier
- `collectionId` (optional `string`) — Filter to single collection
- `categoryId` (optional `string`) — Filter to single category
- `productsIds` (optional `string[]`) — Explicit product list (search results)

**Behavior:**
- Fetches region data; returns null if not found
- Calls `listProductsWithSort()` with pagination (12 products per page)
- Maps sort mode to backend query parameter
- Renders `ul.grid` of `ProductPreview` cards (1/2/3/4 columns on xsmall/small/medium screens)
- Includes GA4 item list tracking with list name/ID
- Conditionally renders `Pagination` component (hidden if only 1 page)

### RefinementList

Client-side controls wrapper for sort and filter options. Currently renders sort dropdown; extensible for category/collection filters.

**Props:**
- `sortBy` (required `SortOptions`) — Current sort mode
- `search` (optional `boolean`) — Unused
- `data-testid` (optional `string`) — Test identifier

**Behavior:**
- Uses Next.js navigation hooks (`useRouter`, `usePathname`, `useSearchParams`)
- Provides `createQueryString()` and `setQueryParams()` utilities to update URL query parameters
- Renders `SortProducts` component with callback to update `?sortBy=` param

### SortProducts

Dropdown select component for product sorting. Renders radio group of sort options.

**Sort Options:**
- `"created_at"` — "Latest Arrivals" (default, newest first)
- `"price_asc"` — "Price: Low -> High"
- `"price_desc"` — "Price: High -> Low"

**Behavior:**
- Calls `setQueryParams("sortBy", value)` on selection
- Updates URL query string; navigation triggers fetch with new sort mode

### Pagination

Client-side page number navigator. Renders numbered buttons with intelligent ellipsis for large page counts.

**Props:**
- `page` (required `number`) — Current page (1-based)
- `totalPages` (required `number`) — Total page count
- `data-testid` (optional `string`) — Test identifier

**Behavior:**
- Shows all pages if ≤7 total
- For > 7 pages: shows first 5, or last 5 near end, or page ± 1 in middle, with ellipsis gaps
- Current page button is disabled and highlighted
- Clicking a page number sets `?page=N` and navigates

## Categories

The `categories` module (`src/modules/categories/templates/`) extends the store pattern for browsing products within a category hierarchy.

### CategoryTemplate

Browse products filtered by a single category with breadcrumb navigation and nested category listing.

**Props:**
- `category` (required `HttpTypes.StoreProductCategory`) — Category data object
- `sortBy` (optional `SortOptions`) — Sort mode
- `page` (optional `string`) — Page number
- `countryCode` (required `string`) — Region identifier

**Behavior:**
- Renders breadcrumb trail (Home > Shop > Parent Categories > Current Category)
- Displays category name, description, and product count
- Lists child categories as interactive links if present
- Passes category ID to `PaginatedProducts` to filter results
- Reuses `RefinementList` and `Pagination` from store module

## Collections

The `collections` module (`src/modules/collections/templates/`) provides a simplified variant for browsing collection products.

### CollectionTemplate

Browse products filtered by a single collection (no breadcrumb or nested structure).

**Props:**
- `collection` (required `HttpTypes.StoreCollection`) — Collection data object
- `sortBy` (optional `SortOptions`) — Sort mode
- `page` (optional `string`) — Page number
- `countryCode` (required `string`) — Region identifier

**Behavior:**
- Displays collection title
- Passes collection ID to `PaginatedProducts` to filter results
- Reuses `RefinementList` and `Pagination` from store module
- Otherwise identical layout to `CategoryTemplate` (sidebar + grid)
