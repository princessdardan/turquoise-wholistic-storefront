# Data Layer

The data layer is the bridge between the Next.js storefront and the Medusa v2 backend. It consists of a single SDK client configured in `config.ts`, a cookie management module, and 23 server action files organized by domain.

## Table of Contents

1. [SDK Configuration](#1-sdk-configuration)
2. [Cookie Management](#2-cookie-management)
3. [Server Actions — Core Commerce](#3-server-actions--core-commerce)
   - [cart.ts](#carttS)
   - [products.ts](#productsts)
   - [customer.ts](#customerts)
   - [regions.ts](#regionsts)
   - [categories.ts](#categoriests)
   - [collections.ts](#collectionsts)
   - [orders.ts](#ordersts)
   - [payment.ts](#paymentts)
   - [fulfillment.ts](#fulfillmentts)
   - [variants.ts](#variantsts)
4. [Server Actions — Custom Features](#4-server-actions--custom-features)
   - [reviews.ts](#reviewsts)
   - [wishlist.ts](#wishlistts)
   - [blog.ts](#blogts)
   - [subscriptions.ts](#subscriptionsts)
   - [gift-cards.ts](#gift-cardsts)
   - [store-settings.ts](#store-settingsts)
   - [cta.ts](#ctats)
5. [Server Actions — Utilities](#5-server-actions--utilities)
   - [form-protection.ts](#form-protectionts)
   - [locales.ts](#localests)
   - [locale-actions.ts](#locale-actionsts)
   - [onboarding.ts](#onboardingts)
   - [admin-auth.ts](#admin-authts)
6. [Cache Invalidation Pattern](#6-cache-invalidation-pattern)
7. [Custom Backend Routes Reference](#7-custom-backend-routes-reference)

---

## 1. SDK Configuration

**File:** `src/lib/config.ts`

The Medusa JS SDK is initialized once and exported as `sdk`. All server action files import from this module.

```ts
import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,   // env: MEDUSA_BACKEND_URL, default "http://localhost:9000"
  debug: process.env.NODE_ENV === "development",
  publishableKey: RETAIL_PUBLISHABLE_KEY,
})
```

### Publishable Key Selection

Two channel-specific keys are read from environment variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_MEDUSA_RETAIL_PUBLISHABLE_KEY` | Retail sales channel (falls back to `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`) |
| `NEXT_PUBLIC_MEDUSA_PROFESSIONAL_PUBLISHABLE_KEY` | Professional sales channel |

### Fetch Interceptor

`sdk.client.fetch` is replaced with a wrapper that runs before every request. Its responsibilities:

1. **Publishable key injection** — On the server, reads the `tw-channel` cookie via `next/headers`. If the value is `"professional"`, uses `PROFESSIONAL_PUBLISHABLE_KEY`; otherwise uses `RETAIL_PUBLISHABLE_KEY`. On the client, `next/headers` throws, so the catch block falls back to the module-level `activePublishableKey` variable.
2. **Locale header injection** — Calls `getLocaleHeader()` and sets `x-medusa-locale` on the request (skipped silently if unavailable).

```ts
// Server path
const channel = cookieStore.get("tw-channel")?.value
publishableKey = channel === "professional"
  ? PROFESSIONAL_PUBLISHABLE_KEY
  : RETAIL_PUBLISHABLE_KEY

// Client path (after Next.js headers import throws)
publishableKey = activePublishableKey
```

### `setActivePublishableKey`

```ts
export function setActivePublishableKey(key: string | undefined): void
```

Called by `MedusaClientProvider` (in `src/lib/context/medusa-client-context.tsx`) whenever the active channel changes. Updates the module-level `activePublishableKey` so subsequent client-side fetches use the correct key.

---

## 2. Cookie Management

**File:** `src/lib/data/cookies.ts`

Guarded with `import "server-only"` — this module cannot be imported from client components.

| Function | Signature | Description |
|---|---|---|
| `getAuthHeaders` | `() => Promise<{ authorization: string } \| {}>` | Reads `_medusa_jwt` httpOnly cookie; returns `Authorization: Bearer <token>` or empty object |
| `getCacheTag` | `(tag: string) => Promise<string>` | Returns `"{tag}-{_medusa_cache_id}"` for session-scoped cache isolation; empty string if no cache ID cookie |
| `getCacheOptions` | `(tag: string) => Promise<{ tags: string[] } \| {}>` | Returns `{ tags: [cacheTag] }` for use as `next` option on `force-cache` fetches; empty object on client or missing cache ID |
| `setAuthToken` | `(token: string) => Promise<void>` | Writes `_medusa_jwt` cookie (httpOnly, sameSite strict, 7-day expiry, secure in production) |
| `removeAuthToken` | `() => Promise<void>` | Expires `_medusa_jwt` by setting `maxAge: -1` |
| `getCartId` | `() => Promise<string \| undefined>` | Reads `tw-cart-{channel}` cookie for the active channel; migrates legacy `_medusa_cart_id` cookie to `tw-cart-retail` on first access |
| `getCartIdForChannel` | `(channel: string) => Promise<string \| undefined>` | Reads cart cookie for a specific channel without consulting `tw-channel` |
| `setCartId` | `(cartId: string) => Promise<void>` | Writes `tw-cart-{channel}` for the active channel (non-httpOnly so `DualCartProvider` can read it client-side) |
| `removeCartId` | `() => Promise<void>` | Expires `tw-cart-{channel}` for the active channel |
| `removeAllCartIds` | `() => Promise<void>` | Expires `tw-cart-retail` and `tw-cart-professional`; called on logout and account deletion |

### Cart Cookie Strategy

Cart IDs are stored per-channel in cookies named `tw-cart-retail` and `tw-cart-professional`. The active channel is read from the `tw-channel` cookie (set by the channel selector UI). A one-time migration path moves the old `_medusa_cart_id` cookie to `tw-cart-retail` and deletes the legacy cookie.

---

## 3. Server Actions — Core Commerce

### `cart.ts`

**File:** `src/lib/data/cart.ts`

All cart mutations call `revalidateTag` after completion. Most also invalidate `"fulfillment"` because shipping options depend on cart state.

| Function | Description | Revalidates |
|---|---|---|
| `retrieveCart(cartId?, fields?)` | Fetches cart by ID (or from cookie). Cached with `"carts"` tag. Returns `null` on error. | None (read) |
| `getOrSetCart(countryCode)` | Returns existing cart or creates one in the correct region. Sets cart cookie and revalidates on creation. | `carts` |
| `updateCart(data)` | Updates cart fields (addresses, region, etc.). | `carts`, `fulfillment` |
| `addToCart({ variantId, quantity, countryCode })` | Calls `getOrSetCart`, then creates a line item on the cart. | `carts`, `fulfillment` |
| `updateLineItem({ lineId, quantity })` | Updates quantity of an existing line item. | `carts`, `fulfillment` |
| `deleteLineItem(lineId)` | Removes a line item from the cart. | `carts`, `fulfillment` |
| `setShippingMethod({ cartId, shippingMethodId })` | Adds a shipping method to the cart. | `carts` |
| `initiatePaymentSession(cart, data)` | Initiates a payment session on the cart. | `carts` |
| `applyPromotions(codes)` | Applies promo codes to the cart via `promo_codes` field. | `carts`, `fulfillment` |
| `applyGiftCard(code)` | Placeholder — not yet implemented. | None |
| `removeDiscount(code)` | Placeholder — not yet implemented. | None |
| `removeGiftCard(codeToRemove, giftCards)` | Placeholder — not yet implemented. | None |
| `submitPromotionForm(currentState, formData)` | Form action wrapper around `applyPromotions`. | `carts`, `fulfillment` |
| `setAddresses(currentState, formData)` | Parses address form data and calls `updateCart`, then redirects to delivery step. | `carts`, `fulfillment` |
| `placeOrder(cartId?)` | Completes the cart. On success, clears cart cookie and redirects to order confirmation. | `carts`, `orders` |
| `updateRegion(countryCode, currentPath)` | Updates cart region and redirects to new country prefix. | `carts`, `regions`, `products` |
| `listCartOptions()` | Fetches available shipping options for the current cart. Cached with `"shippingOptions"` tag. | None (read) |

### `products.ts`

**File:** `src/lib/data/products.ts`

| Function | Description | Cache |
|---|---|---|
| `getProductMetadata(productId)` | Calls custom route `GET /store/products/{id}/metadata`. Returns typed `ProductMetadata` or `null`. | `force-cache`, `"products"` tag |
| `searchProducts(q, countryCode)` | Searches `/store/products` with `limit: 6`, returns id/title/handle/thumbnail only. | No cache |
| `listProducts({ pageParam, queryParams, countryCode, regionId })` | Paginated product list. Default limit 12. Includes variant calculated prices, inventory quantity, images, metadata. | `force-cache`, `"products"` tag |
| `listProductsWithSort({ page, queryParams, sortBy, countryCode })` | Fetches up to 100 products, client-sorts them, then slices to the requested page. | Inherits from `listProducts` |

**`ProductMetadata` type:**

```ts
type ProductMetadata = {
  id: string
  ingredients_list: string[] | null
  dosage_instructions: string | null
  warnings: string | null
  certifications: string[] | null
  origin_country: string | null
  suggested_use: string | null
  npn_din_hm: string | null
  brand_name: string | null
  serving_size: string | null
  servings_per_container: string | null
  supplement_facts: Record<string, unknown>[] | null
}
```

### `customer.ts`

**File:** `src/lib/data/customer.ts`

Authentication uses Medusa's `sdk.auth` methods. The JWT is stored as an httpOnly cookie via `setAuthToken`. Bot protection (honeypot + Turnstile) is applied to `signup` and `requestPasswordToken`.

| Function | Description | Revalidates |
|---|---|---|
| `retrieveCustomer()` | Fetches `GET /store/customers/me` with auth header. Returns `null` when unauthenticated. | None (read), `"customers"` tag |
| `updateCustomer(body)` | Updates profile fields (name, phone, etc.). | `customers` |
| `signup(_currentState, formData)` | Registers via `sdk.auth.register`, creates customer record, logs in, transfers anonymous cart. | `customers` |
| `login(_currentState, formData)` | Authenticates, sets JWT cookie, transfers anonymous cart. | `customers` |
| `signout(countryCode)` | Logs out via SDK, clears JWT and all cart cookies, redirects to account page. | `customers`, `carts` |
| `transferCart()` | Associates the current anonymous cart with the authenticated customer. | `carts` |
| `requestPasswordToken(_currentState, formData)` | Posts to `POST /store/customers/password-token`. Always returns success to prevent email enumeration. | None |
| `resetPassword(_currentState, formData)` | Posts to `POST /store/customers/password-reset`. Returns typed error on expired/invalid token. | None |
| `createAccountAfterOrder(_currentState, formData)` | Guest-to-account conversion after order completion. Registers, creates customer, then logs in. | `customers` |
| `changeEmail(newEmail, currentPassword)` | Posts to `POST /store/customers/change-email` with auth header. | `customers` |
| `deleteAccount(currentPassword)` | Posts to `POST /store/customers/delete-account`, then clears all local session data. | `customers`, `carts` |
| `checkEmailExists(email)` | Posts to `POST /store/customers/exists`. Returns boolean. | None |
| `addCustomerAddress(currentState, formData)` | Creates a new address via `sdk.store.customer.createAddress`. | `customers` |
| `deleteCustomerAddress(addressId)` | Deletes an address by ID. | `customers` |
| `updateCustomerAddress(currentState, formData)` | Updates an existing address by ID parsed from `currentState.addressId`. | `customers` |

### `regions.ts`

**File:** `src/lib/data/regions.ts`

| Function | Description | Cache |
|---|---|---|
| `listRegions()` | Fetches all regions from `/store/regions`. | `force-cache`, `"regions"` tag |
| `retrieveRegion(id)` | Fetches a single region by ID. Cache tag is `"regions-{id}"`. | `force-cache`, `"regions-{id}"` tag |
| `getRegion(countryCode)` | Resolves a region from a country ISO-2 code using an in-memory `Map`. Calls `listRegions()` to populate on first access. | Inherits from `listRegions` |

### `categories.ts`

**File:** `src/lib/data/categories.ts`

| Function | Description | Cache |
|---|---|---|
| `getCategoryTrees()` | Fetches all root categories with two levels of children and product count. Splits the response into `healthConcerns` and `productTypes` arrays by looking for root categories named `"Health Concerns"` and `"Product Types"`. | `force-cache`, `"categories"` tag |
| `listCategories(query?)` | Generic paginated category list. Default limit 100. Includes children, products, parent chain. | `force-cache`, `"categories"` tag |
| `getCategoryByHandle(categoryHandle[])` | Joins handle segments with `/` and queries by handle. Returns the first match. | `force-cache`, `"categories"` tag |

**`CategoryTree` type:**

```ts
type CategoryTree = {
  id: string
  name: string
  handle: string
  description: string | null
  children: CategoryTree[]
  productCount: number
  metadata?: Record<string, unknown> | null
}
```

### `collections.ts`

**File:** `src/lib/data/collections.ts`

| Function | Description | Cache |
|---|---|---|
| `retrieveCollection(id)` | Fetches a single collection by ID. | `force-cache`, `"collections"` tag |
| `listCollections(queryParams?)` | Lists collections. Default limit 100, offset 0. Returns `{ collections, count }`. | `force-cache`, `"collections"` tag |
| `getCollectionByHandle(handle)` | Queries `/store/collections?handle={handle}&fields=*products`. Returns first match. | `force-cache`, `"collections"` tag |

### `orders.ts`

**File:** `src/lib/data/orders.ts`

All order reads require the `authorization` header.

| Function | Description | Cache |
|---|---|---|
| `retrieveOrder(id)` | Fetches a single order with payment collections, items, variants, and products. | `force-cache`, `"orders"` tag |
| `listOrders(limit, offset, filters?)` | Lists customer orders sorted by `-created_at` with item and variant details. | `force-cache`, `"orders"` tag |
| `createTransferRequest(state, formData)` | Submits an order transfer request via `sdk.store.order.requestTransfer`. | None |
| `acceptTransferRequest(id, token)` | Accepts a pending order transfer. | None |
| `declineTransferRequest(id, token)` | Declines a pending order transfer. | None |

### `payment.ts`

**File:** `src/lib/data/payment.ts`

| Function | Description | Cache |
|---|---|---|
| `listCartPaymentMethods(regionId)` | Fetches available payment providers for a region from `/store/payment-providers`. Sorted alphabetically by provider ID. Returns `null` on error. | `force-cache`, `"payment_providers"` tag |

### `fulfillment.ts`

**File:** `src/lib/data/fulfillment.ts`

| Function | Description | Cache |
|---|---|---|
| `listCartShippingMethods(cartId)` | Fetches available shipping options for a cart from `/store/shipping-options`. Returns `null` on error. | `force-cache`, `"fulfillment"` tag |
| `calculatePriceForShippingOption(optionId, cartId, data?)` | Posts to `/store/shipping-options/{id}/calculate` to get a price quote for a specific option. Returns `null` on error. | `force-cache`, `"fulfillment"` tag |

### `variants.ts`

**File:** `src/lib/data/variants.ts`

| Function | Description | Cache |
|---|---|---|
| `retrieveVariant(variant_id)` | Fetches a single product variant with images. Returns `null` if unauthenticated or on error. | `force-cache`, `"variants"` tag |

---

## 4. Server Actions — Custom Features

These files call custom API routes defined in the Medusa backend (`../turquoise-wholistic/src/api/`), not standard Medusa SDK methods.

### `reviews.ts`

**File:** `src/lib/data/reviews.ts`

Endpoint: `GET/POST /store/products/{id}/reviews`

| Function | Description | Cache / Revalidate |
|---|---|---|
| `getProductReviews(productId, offset?, limit?)` | Fetches paginated approved reviews for a product. Returns a zeroed response object on error. | `force-cache`, `"products"` tag |
| `submitReview(productId, data)` | Posts a new review `{ rating, title, body }`. Revalidates product cache on success. | Revalidates `"products"` |

**`ProductReview` type** includes `id`, `product_id`, `customer_id`, `rating`, `title`, `body`, `is_verified_purchase`, `status` (`"pending" | "approved" | "rejected"`), and `created_at`.

### `wishlist.ts`

**File:** `src/lib/data/wishlist.ts`

Endpoint: `GET/POST/DELETE /store/wishlist`

| Function | Description | Cache / Revalidate |
|---|---|---|
| `getWishlist()` | Fetches all wishlist items for the authenticated customer. Returns `[]` if unauthenticated or on error. | No cache |
| `addToWishlist(productId, variantId?)` | Adds a product to the wishlist. A 409 response is treated as success (already in list). | Revalidates `"products"` |
| `removeFromWishlist(itemId)` | Deletes a wishlist item by ID. | Revalidates `"products"` |
| `getWishlistWithProducts(regionId)` | Combines `getWishlist()` with a bulk product fetch to return items with full product data. | Inherits from products fetch |

### `blog.ts`

**File:** `src/lib/data/blog.ts`

Endpoint: `GET /store/blog`, `GET /store/blog/{slug}`, `GET /store/blog/categories`

Uses `next: { revalidate: 60 }` with `force-cache` rather than tag-based invalidation (blog content changes infrequently).

| Function | Description | Cache |
|---|---|---|
| `getBlogCategories()` | Fetches all blog categories. | `force-cache`, revalidate 60s |
| `getBlogPosts(options?)` | Paginated blog post list. Accepts `limit`, `offset`, `category_id`. | `force-cache`, revalidate 60s |
| `getBlogPostBySlug(slug)` | Fetches a single post by slug. Returns `null` if not found. | `force-cache`, revalidate 60s |
| `getReadingTime(content)` | Utility: estimates reading time in minutes (200 wpm). Not a server action. | N/A |

### `subscriptions.ts`

**File:** `src/lib/data/subscriptions.ts`

Endpoint: `GET/POST /store/subscriptions`, `PUT /store/subscriptions/{id}`

All operations require authentication. Returns typed error strings for 401 responses so the UI can prompt login.

| Function | Description |
|---|---|
| `createSubscription(input)` | Creates a new subscription with items, frequency, and optional payment method. Returns `{ success, subscription?, error? }`. |
| `listSubscriptions()` | Fetches all subscriptions for the authenticated customer. Returns `[]` on error. |
| `updateSubscription(subscriptionId, input)` | Updates status, frequency, payment method, or skips next order. Returns `{ success, subscription?, error? }`. |

**`Subscription` type** includes `id`, `customer_id`, `status` (`"active" | "paused" | "cancelled"`), `frequency` (`"weekly" | "biweekly" | "monthly" | "bimonthly"`), `next_order_date`, `payment_method_id`, `discount_percentage`, and `items[]`.

### `gift-cards.ts`

**File:** `src/lib/data/gift-cards.ts`

Endpoint: `GET /store/gift-cards`, `GET /store/gift-cards/{code}`

| Function | Description | Cache |
|---|---|---|
| `validateGiftCard(code)` | Normalizes the code to uppercase and calls `GET /store/gift-cards/{code}`. Returns `{ gift_card }`. | No cache |
| `listGiftCardsByOrder(orderId)` | Queries `/store/gift-cards?order_id={id}` to retrieve gift cards issued for an order. | `force-cache`, `"orders"` tag |
| `listCustomerGiftCards(customerId)` | Queries `/store/gift-cards?customer_id={id}` to retrieve a customer's gift cards. | `force-cache`, `"orders"` tag |

### `store-settings.ts`

**File:** `src/lib/data/store-settings.ts`

Endpoint: `GET /store/settings`

| Function | Description | Cache |
|---|---|---|
| `getStoreSettings()` | Fetches store name and metadata (phone, email, address, city, province, country, hours). Returns safe defaults on error. | `force-cache`, `"store-settings"` tag |
| `settingOrPlaceholder(value, placeholder)` | Returns `value` if truthy, else `placeholder`. Pure utility. | N/A |
| `formatAddress(settings)` | Joins address, city, province, country into a single comma-separated string. Returns `null` if no parts exist. | N/A |

### `cta.ts`

**File:** `src/lib/data/cta.ts`

Endpoint: `GET /store/cta`, `GET /store/cta/{id}`

Uses `next: { revalidate: 60 }` with `force-cache`.

| Function | Description | Cache |
|---|---|---|
| `listCtasByPlacement(placement)` | Fetches up to 20 active CTA components for a placement slot. Filters out inactive and unavailable-product CTAs. Returns `[]` on error. | `force-cache`, revalidate 60s |
| `getCta(id)` | Fetches a single CTA by ID. Returns `null` if inactive, product unavailable, or on error. | `force-cache`, revalidate 60s |

---

## 5. Server Actions — Utilities

### `form-protection.ts`

**File:** `src/lib/data/form-protection.ts`

| Function | Description |
|---|---|
| `verifyTurnstile(token)` | Server action wrapper around `verifyTurnstileToken()` from `@lib/util/turnstile`. Used by client-side forms that cannot call the utility directly. Returns `boolean`. |

### `locales.ts`

**File:** `src/lib/data/locales.ts`

| Function | Description | Cache |
|---|---|---|
| `listLocales()` | Fetches available locales from `GET /store/locales`. Returns `null` (not `[]`) when the endpoint 404s, allowing the UI to hide locale selection entirely. | `force-cache`, `"locales"` tag |

### `locale-actions.ts`

**File:** `src/lib/data/locale-actions.ts`

Manages the `_medusa_locale` cookie (1-year expiry, non-httpOnly).

| Function | Description | Revalidates |
|---|---|---|
| `getLocale()` | Reads `_medusa_locale` cookie. Returns `null` if absent. | None |
| `setLocaleCookie(locale)` | Writes the `_medusa_locale` cookie. | None |
| `updateLocale(localeCode)` | Sets the cookie, updates the active cart with the new locale, and revalidates `carts`, `products`, `categories`, and `collections` cache tags. | `carts`, `products`, `categories`, `collections` |

### `onboarding.ts`

**File:** `src/lib/data/onboarding.ts`

| Function | Description |
|---|---|
| `resetOnboardingState(orderId)` | Clears the `_medusa_onboarding` cookie and redirects to the admin order detail page at `localhost:7001`. Used during Medusa's developer onboarding flow only. |

### `admin-auth.ts`

**File:** `src/lib/data/admin-auth.ts`

Client-side only (checks `typeof window === "undefined"`). Stores admin JWT in `localStorage` under the key `tw_admin_jwt`. Used by the in-storefront blog editor page.

| Function | Description |
|---|---|
| `getAdminToken()` | Reads JWT from `localStorage`. Returns `null` on the server. |
| `setAdminToken(token)` | Writes JWT to `localStorage`. |
| `removeAdminToken()` | Removes JWT from `localStorage`. |
| `adminLogin(email, password)` | Posts to `POST /auth/user/emailpass` on the Medusa backend. Stores and returns the token. |
| `validateAdminToken()` | Probes `GET /admin/blog?limit=1` with the stored token to verify it is still valid. |
| `adminFetch<T>(path, options?)` | Authenticated fetch wrapper for admin API calls. Injects `Authorization: Bearer` header automatically. Throws on non-OK responses with the server's error message. |

---

## 6. Cache Invalidation Pattern

Next.js `force-cache` is used for all read operations. Cache entries are scoped to a session via the `_medusa_cache_id` cookie, preventing cross-user cache pollution on shared infrastructure.

```ts
// Reading — attach session-scoped tag
const next = {
  ...(await getCacheOptions("carts")),
  // resolves to: { tags: ["carts-<cache_id>"] }
}
await sdk.client.fetch("/store/carts/...", { cache: "force-cache", next })

// Writing — invalidate the session-scoped tag
const cartCacheTag = await getCacheTag("carts")
// resolves to: "carts-<cache_id>"
revalidateTag(cartCacheTag)
```

If `_medusa_cache_id` is absent (unauthenticated / cookie not yet set), `getCacheTag` returns an empty string and `getCacheOptions` returns `{}`. In that case, `force-cache` still applies but without a revalidation tag.

### Tags Invalidated Per Domain

| Domain | Tags Invalidated on Mutation |
|---|---|
| Cart (create, update, line items, promotions, payment) | `carts`, `fulfillment` |
| Cart (shipping method) | `carts` |
| Cart (complete / place order) | `carts`, `orders` |
| Cart (update region) | `carts`, `regions`, `products` |
| Customer (register, login, update) | `customers` |
| Customer (logout, delete account) | `customers`, `carts` |
| Customer (address add/update/delete) | `customers` |
| Locale (update) | `carts`, `products`, `categories`, `collections` |
| Reviews (submit) | `products` |
| Wishlist (add, remove) | `products` |

---

## 7. Custom Backend Routes Reference

These routes are implemented in the Medusa backend (`src/api/`) and are not part of the standard Medusa SDK. All are called via `sdk.client.fetch` using the custom URL directly.

| Route | Method | Auth Required | Description | Data File |
|---|---|---|---|---|
| `/store/products/{id}/metadata` | GET | No | Product wellness metadata (NPN/DIN, ingredients, supplement facts) | `products.ts` |
| `/store/products/{id}/reviews` | GET | No | Paginated approved product reviews | `reviews.ts` |
| `/store/products/{id}/reviews` | POST | Optional | Submit a product review | `reviews.ts` |
| `/store/wishlist` | GET | Required | List authenticated customer's wishlist items | `wishlist.ts` |
| `/store/wishlist` | POST | Required | Add a product/variant to the wishlist | `wishlist.ts` |
| `/store/wishlist/{itemId}` | DELETE | Required | Remove a wishlist item by ID | `wishlist.ts` |
| `/store/blog` | GET | No | Paginated blog post list, filterable by `category_id` | `blog.ts` |
| `/store/blog/{slug}` | GET | No | Single published blog post by slug | `blog.ts` |
| `/store/blog/categories` | GET | No | All blog categories | `blog.ts` |
| `/store/subscriptions` | GET | Required | List customer subscriptions | `subscriptions.ts` |
| `/store/subscriptions` | POST | Required | Create a new subscription | `subscriptions.ts` |
| `/store/subscriptions/{id}` | PUT | Required | Update subscription status/frequency | `subscriptions.ts` |
| `/store/gift-cards` | GET | No | List gift cards filtered by `order_id` or `customer_id` | `gift-cards.ts` |
| `/store/gift-cards/{code}` | GET | No | Look up a gift card balance by code | `gift-cards.ts` |
| `/store/settings` | GET | No | Store name, contact info, and hours | `store-settings.ts` |
| `/store/cta` | GET | No | Active CTA components, filterable by `placement` | `cta.ts` |
| `/store/cta/{id}` | GET | No | Single CTA component by ID | `cta.ts` |
| `/store/customers/exists` | POST | No | Check whether an email address is registered | `customer.ts` |
| `/store/customers/password-token` | POST | No | Request a password reset token (rate-limited: 3/hr) | `customer.ts` |
| `/store/customers/password-reset` | POST | No | Reset password using a token | `customer.ts` |
| `/store/customers/change-email` | POST | Required | Change authenticated customer's email address | `customer.ts` |
| `/store/customers/delete-account` | POST | Required | Permanently delete the authenticated customer's account | `customer.ts` |
