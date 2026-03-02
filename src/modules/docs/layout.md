# Layout Module

The `layout` module (`src/modules/layout/`) provides the site-wide navigation shell — the Nav, Footer, and all layout-level UI including the dual-channel system UI. Every page in the `(main)` route group renders `Nav` at the top and `Footer` at the bottom.

---

## Templates

### Nav (`templates/nav/`)

**Type:** Server Component (async)

The sticky top navigation bar. On every render it fetches regions, locales, the active locale, and product categories in parallel, then fetches up to three featured products (used by the MegaMenu) against the first available region.

**Data fetched at render time:**

| Call | Purpose |
|---|---|
| `listRegions()` | Region list passed to `SideMenu` → `CountrySelect` |
| `listLocales()` | Locale list passed to `SideMenu` → `LanguageSelect` |
| `getLocale()` | Active locale passed to `SideMenu` → `LanguageSelect` |
| `listCategories()` | Full category tree passed to `MegaMenu` and `SideMenu` |
| `getFeaturedProducts()` | Up to 3 products shown in MegaMenu feature column |

**Layout (left → right):**

- **Left** — Hamburger (`SideMenu`, hidden at `lg+`), logo mark (`/logo-mark.svg`), wordmark (hidden below `sm`), `ProfessionalBadge`
- **Center** — `MegaMenu` + Blog and View All links (desktop `lg+` only)
- **Right** — `SearchBar`, Account link, `ChannelToggle` (desktop `lg+`); `CartButton` always visible (wrapped in `Suspense`)

The nav is `sticky top-0 z-50` with a white background and a bottom border.

---

### Footer (`templates/footer/`)

**Type:** Server Component (async)

The site footer rendered on a `sand-50` background. Fetches category trees and store settings in parallel.

**Data fetched at render time:**

| Call | Returns |
|---|---|
| `getCategoryTrees()` | `{ healthConcerns, productTypes }` — two separate lists of root categories |
| `getStoreSettings()` | Name, address, phone, email, store hours |

**Layout — four-column grid (collapses to 2 cols on `md`, 1 col on mobile):**

| Column | Content |
|---|---|
| Health Concerns | Dynamic links to `/categories/{handle}` |
| Product Types | Dynamic links to `/categories/{handle}` |
| Quick Links | Blog, About, Visit Us, Gift Cards, Account, Privacy Policy, Terms of Service, Return Policy, Shipping Policy |
| Company | Contact Us, store hours (if set), formatted address (if set), phone (if set), email (if set) |

Below the grid, a `border-t` bar shows the copyright line using `storeSettings.name` and the current year.

---

## Components

### ChannelSplash

**File:** `components/channel-splash/`
**Type:** Client Component (`"use client"`)

Full-screen overlay modal shown on first visit when the user has not yet chosen a shopping channel. It blocks interaction with the page behind a `backdrop-blur-sm` overlay until a selection is made.

**Behavior:**
- Reads `isChannelSelected` and `hydrated` from `useChannel()`. Renders `null` until the context has hydrated from localStorage (prevents a flash of the modal on returning visits).
- Presents two channel cards: "Shop All Products" (retail) and "Professional Products" (professional).
- On selection, calls `setChannel(key)` then waits 150 ms before calling `router.refresh()`. The delay lets `MedusaClientProvider` reconfigure the SDK with the correct publishable API key before server components re-fetch.
- Once `isChannelSelected` is `true`, the component renders nothing.

**Props:** none (reads everything from context)

---

### ChannelToggle

**File:** `components/channel-toggle/`
**Type:** Client Component (`"use client"`)

Compact pill button in the desktop nav header that switches the active shopping channel.

**Behavior:**
- Shows a colored dot: turquoise for retail, blue for professional.
- While switching, replaces the dot with a turquoise spinner and disables the button (`switching` guard prevents double-fires).
- On click, calls `setChannel()` with the opposite channel, fires an `addToast("Showing {Label} Products", "info")` notification, then calls `router.refresh()` after 150 ms.
- Renders `null` until the channel context has hydrated.

**Props:** none (reads everything from `useChannel()` and `useToast()`)

---

### ChannelReminder

**File:** `components/channel-reminder/`
**Type:** Client Component (`"use client"`) — renders no DOM (returns `null`)

Silent background component that fires a toast reminder prompting the user to consider switching channels if they have been in the same channel for more than 30 days.

**Behavior:**
- Checks `localStorage` key `tw-channel-last-confirmed`. If the stored timestamp is absent or older than 30 days (2,592,000,000 ms), it fires once per mount via a `shownRef` guard.
- The toast includes a "Switch" action button that calls `setChannel()` and `router.refresh()`. On dismiss, the timestamp is written back to `localStorage`.
- The 30-day window resets only when the user explicitly dismisses the toast.

**Props:** none

---

### CartButton

**File:** `components/cart-button/`
**Type:** Server Component (async)

Thin server wrapper that reads both channel carts before passing counts into the client `CartDropdown`.

**Behavior:**
- Calls `retrieveCart()` to get the active channel's full cart (used for line item display).
- Calls `getCartIdForChannel("retail")` and `getCartIdForChannel("professional")` in parallel, then separately fetches each cart's item quantities.
- Passes `retailItemCount` and `professionalItemCount` down to `CartDropdown` so it can display the cross-channel indicator dot.

**Props passed to CartDropdown:**

| Prop | Type | Description |
|---|---|---|
| `cart` | `StoreCart \| null` | Active channel's full cart |
| `retailItemCount` | `number` | Total item quantity in retail cart |
| `professionalItemCount` | `number` | Total item quantity in professional cart |

---

### CartDropdown

**File:** `components/cart-dropdown/`
**Type:** Client Component (`"use client"`)

Hover-activated popover showing a live preview of the active cart, rendered using Headless UI `Popover`.

**Behavior:**
- Opens automatically for 5 seconds when the item count changes (but not when the user is on `/cart`). Hovering keeps it open; mouse-leave closes it.
- Displays sorted line items (newest first) with thumbnails, variant options, quantity, and price. Items fade out optimistically when removed via `DeleteButton`.
- Shows subtotal (excl. taxes) and a "Go to cart" button.
- When the other channel also has items, a blue dot (`bg-blue-500`) appears on the cart link as a cross-channel indicator.
- Empty state shows an "Explore products" button linking to `/store`.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `cart` | `StoreCart \| null` | — | Active cart data |
| `retailItemCount` | `number` | `0` | Item count in retail cart |
| `professionalItemCount` | `number` | `0` | Item count in professional cart |

---

### CartMismatchBanner

**File:** `components/cart-mismatch-banner/`
**Type:** Client Component (`"use client"`)

Orange warning banner displayed when a logged-in customer's session cart has not been transferred to their account (i.e., `cart.customer_id` is null while a `customer` object exists).

**Behavior:**
- Renders nothing if the customer is absent or the cart is already associated with the customer.
- Provides a "Run transfer again" button that calls `transferCart()`. Shows "Transferring.." while pending. Resets the label on error.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `customer` | `StoreCustomer` | Currently authenticated customer |
| `cart` | `StoreCart` | Active cart to check for mismatch |

---

### SearchBar

**File:** `components/search-bar/`
**Type:** Client Component (`"use client"`)

Inline product search input with real-time autocomplete dropdown, visible in the desktop nav.

**Behavior:**
- Debounces input by 300 ms before calling `searchProducts(q, countryCode)`. Requires at least 2 characters to trigger.
- Results are shown in a 272 px wide dropdown anchored to the right of the input, containing product thumbnails and titles. A "View all results" button at the bottom navigates to `/search?q=`.
- Keyboard navigation: `ArrowUp`/`ArrowDown` move the selection, `Enter` on a highlighted item navigates directly to that product, `Escape` closes the dropdown and blurs the input.
- Dropdown closes on outside click via a `mousedown` listener. An `aria-live` region announces result counts to screen readers.
- Input renders at `w-28` on smaller screens and `w-40` on `lg+`.

**Props:** none

---

### MegaMenu

**File:** `components/mega-menu/`
**Type:** Client Component (`"use client"`)

Two hover-activated mega-dropdown panels in the desktop nav — "Health Concerns" and "Product Types" — built on Headless UI `Popover`.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `categories` | `StoreProductCategory[]` | Full category tree fetched by Nav |
| `featuredProducts` | `FeaturedProduct[]` | Up to 3 products for the featured column |

**Behavior:**
- Splits the flat category list into `healthConcerns` (children of the "Health Concerns" root) and `productTypes` (children of "Product Types" root).
- Builds a `Map<typeName, concernNames[]>` so the Product Types panel can show "For: Digestive Health, Immune Support, ..." under each type.
- Each dropdown uses a 150 ms `setTimeout` on `mouseLeave` before closing to prevent accidental dismissal.
- The panel is `max(820px, min(calc(100vw - 48px), 1200px))` wide, split ~70 % category grid / ~30 % featured product card.
- The first `featuredProducts` entry is shown in both panels as a `FeaturedProductCard`.

---

### ShopDropdown

**File:** `components/shop-dropdown/`
**Type:** Client Component (`"use client"`)

Simple 264 px wide dropdown listing root-level product categories, accessed via a "Shop" button with a chevron. Uses the same 150 ms `mouseLeave` debounce as `MegaMenu`.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `categories` | `StoreProductCategory[]` | Full category list; filtered to root categories internally |

---

### SideMenu

**File:** `components/side-menu/`
**Type:** Client Component (`"use client"`)

Mobile slide-in navigation panel, opened via a "Menu" button in the nav (visible below `lg`). Rendered as a frosted-glass `PopoverPanel` covering the left third of the viewport.

**Behavior:**
- Shows primary links (Home, View All Products, Blog, Account, Cart) and two collapsible accordion sections for Health Concerns (2-level: concern → subcategory) and Product Types (1-level).
- Individual health concerns with subcategories have their own expand/collapse toggle via a `Set<string>` in local state.
- Footer of the panel contains `LanguageSelect` and `CountrySelect`, each controlled by a `useToggleState` instance.
- A transparent backdrop div closes the menu on outside click.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `regions` | `StoreRegion[] \| null` | Passed to `CountrySelect` |
| `locales` | `Locale[] \| null` | Passed to `LanguageSelect` |
| `currentLocale` | `string \| null` | Active locale code |
| `categories` | `StoreProductCategory[] \| null` | Full category tree for accordions |

---

### CookieConsent

**File:** `components/cookie-consent/`
**Type:** Client Component (`"use client"`)

Fixed bottom banner requesting cookie consent, shown on first visit only.

**Behavior:**
- On mount, checks `localStorage` key `tw-cookie-consent`. If absent, sets `visible = true`.
- Provides two buttons: "Decline" (writes `"essential"`) and "Accept" (writes `"all"`). Either action hides the banner.
- Links to `/privacy-policy` for more information.

**Props:** none

---

### CountrySelect

**File:** `components/country-select/`
**Type:** Client Component (`"use client"`)

Headless UI `Listbox` displaying a country flag and name for the current shipping destination. Used inside `SideMenu`.

**Behavior:**
- Derives a flat sorted list of `{ country, region, label }` options from the `regions` prop.
- On change, calls `updateRegion(countryCode, currentPath)` which updates the cart region and redirects to `/{newCountryCode}{currentPath}`.
- Opens/closes via the `toggleState` controlled externally by `SideMenu`.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `toggleState` | `StateType` | External open/close state from `useToggleState` |
| `regions` | `StoreRegion[]` | All available regions with their countries |

---

### LanguageSelect

**File:** `components/language-select/`
**Type:** Client Component (`"use client"`)

Headless UI `Listbox` for switching the active locale. Used inside `SideMenu`.

**Behavior:**
- Builds options from the `locales` prop plus a "Default" option (empty code). Derives a country flag code from each locale using `Intl.Locale.maximize()`.
- Uses `useTransition` to show "..." during the async `updateLocale()` Server Action call, then calls `router.refresh()`.
- Resolves localized display names via `Intl.DisplayNames` (e.g., `fr-CA` → "Canadian French").

**Props:**

| Prop | Type | Description |
|---|---|---|
| `toggleState` | `StateType` | External open/close state from `useToggleState` |
| `locales` | `Locale[]` | Available locale definitions |
| `currentLocale` | `string \| null` | Active locale code |

---

### MedusaCTA

**File:** `components/medusa-cta/`
**Type:** Server Component

Minimal copyright line (`© {year} Turquoise Wholistic`) rendered as a `Text` element. Originally the "Powered by Medusa" footer CTA; repurposed as a lightweight copyright component.

**Props:** none

---

## localStorage Keys

| Key | Set by | Purpose |
|---|---|---|
| `tw-channel` | `ChannelContext` | Active channel (`"retail"` or `"professional"`) |
| `tw-channel-last-confirmed` | `ChannelReminder` | Unix timestamp of last reminder dismissal |
| `tw-cookie-consent` | `CookieConsent` | Cookie preference (`"all"` or `"essential"`) |

## z-index Layers

| Layer | Value | Component |
|---|---|---|
| Nav bar | `z-50` | `Nav` wrapper |
| Cart dropdown | `z-50` | `CartDropdown` container |
| MegaMenu / ShopDropdown panels | `z-[60]` | `PopoverPanel` |
| Side menu backdrop | `z-[50]` | `SideMenu` backdrop div |
| Side menu panel | `z-[51]` | `SideMenu` `PopoverPanel` |
| Country / Language select | `z-[900]` | `ListboxOptions` |
| Channel splash | `z-[100]` | `ChannelSplash` overlay |
| Cookie consent | `z-50` | `CookieConsent` fixed bar |
