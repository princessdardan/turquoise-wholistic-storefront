# Utilities

Reference for all helper functions in `src/lib/util/`.

## Table of Contents

- [money.ts](#moneyts)
- [get-product-price.ts](#get-product-pricets)
- [product.ts](#productts)
- [sort-products.ts](#sort-productsts)
- [get-percentage-diff.ts](#get-percentage-diffts)
- [medusa-error.ts](#medusa-errorts)
- [turnstile.ts](#turnstilets)
- [env.ts](#envts)
- [get-locale-header.ts](#get-locale-headerts)
- [isEmpty.ts](#isemptyts)
- [compare-addresses.ts](#compare-addressests)
- [repeat.ts](#repeatts)

---

## `money.ts`

**Path**: `src/lib/util/money.ts`

Formats a raw integer currency amount into a locale-aware display string using `Intl.NumberFormat`. Amounts are passed as-is — division by 100 is the caller's responsibility for standard currencies, but currencies in `noDivisionCurrencies` (e.g. KRW, JPY, VND) store whole units and must not be divided.

| Function | Signature | Description |
|---|---|---|
| `convertToLocale` | `(params: ConvertToLocaleParams) => string` | Formats `amount` as a currency string for `currency_code`. Falls back to `amount.toString()` if `currency_code` is empty. |

**`ConvertToLocaleParams`**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `amount` | `number` | Yes | — | The numeric amount to format |
| `currency_code` | `string` | Yes | — | ISO 4217 currency code (e.g. `"cad"`, `"usd"`) |
| `minimumFractionDigits` | `number` | No | browser default | Minimum decimal places |
| `maximumFractionDigits` | `number` | No | browser default | Maximum decimal places |
| `locale` | `string` | No | `"en-US"` | BCP 47 locale tag |

```ts
import { convertToLocale } from "@lib/util/money"

// Standard currency — amount is already in minor units (cents)
convertToLocale({ amount: 1999, currency_code: "cad" })
// → "CA$19.99"

// Override locale for French Canadian formatting
convertToLocale({ amount: 1999, currency_code: "cad", locale: "fr-CA" })
// → "19,99 $CA"

// Empty currency_code falls back to raw number
convertToLocale({ amount: 500, currency_code: "" })
// → "500"
```

---

## `get-product-price.ts`

**Path**: `src/lib/util/get-product-price.ts`

Extracts formatted price information from a `StoreProduct`. Provides both the cheapest available variant price and the price for a specific variant. Internally delegates to `getPricesForVariant`, which reads `calculated_price` from the Medusa pricing response and detects sale status from either `price_list_type === "sale"` or compare-at pricing (`original_amount > calculated_amount`).

| Function | Signature | Description |
|---|---|---|
| `getProductPrice` | `({ product, variantId? }) => { product, cheapestPrice, variantPrice }` | Returns formatted price objects for the cheapest variant and (optionally) a specific variant. Throws if `product` or `product.id` is missing. |
| `getPricesForVariant` | `(variant: any) => VariantPrice \| null` | Low-level helper used by `getProductPrice`. Returns `null` if `calculated_price.calculated_amount` is absent. |

**Returned price object shape (`VariantPrice`)**

| Field | Type | Description |
|---|---|---|
| `calculated_price` | `string` | Formatted sale/current price (e.g. `"CA$14.99"`) |
| `calculated_price_number` | `number` | Raw calculated amount |
| `original_price` | `string` | Formatted original price before any discount |
| `original_price_number` | `number` | Raw original amount |
| `currency_code` | `string` | ISO 4217 code |
| `price_type` | `string \| undefined` | Price list type (e.g. `"sale"`) |
| `percentage_diff` | `string` | Discount percentage as a rounded string (e.g. `"25"`) |
| `is_on_sale` | `boolean` | `true` when price list type is `"sale"` or original exceeds calculated |

```ts
import { getProductPrice } from "@lib/util/get-product-price"

const { cheapestPrice, variantPrice } = getProductPrice({
  product,               // HttpTypes.StoreProduct with calculated_price on variants
  variantId: "var_01",  // optional — omit to get only cheapestPrice
})

if (cheapestPrice?.is_on_sale) {
  // Show cheapestPrice.original_price struck through
  // Show cheapestPrice.calculated_price as the sale price
  // Show cheapestPrice.percentage_diff + "% off"
}
```

---

## `product.ts`

**Path**: `src/lib/util/product.ts`

Product-level inspection helpers. Currently contains a single function used to simplify the product actions UI — when a product has only one option with one value there is no meaningful choice for the customer, so the option selector can be hidden.

| Function | Signature | Description |
|---|---|---|
| `isSimpleProduct` | `(product: HttpTypes.StoreProduct) => boolean` | Returns `true` when the product has exactly one option and that option has exactly one value. |

```ts
import { isSimpleProduct } from "@lib/util/product"

// Skip rendering the variant selector for products with no real choice
if (!isSimpleProduct(product)) {
  return <VariantSelector options={product.options} />
}
```

---

## `sort-products.ts`

**Path**: `src/lib/util/sort-products.ts`

Client-side product sorting utility. Exists because the Medusa store API does not yet support server-side price sorting. Precomputes the minimum variant price per product before sorting to avoid redundant comparisons.

| Function | Signature | Description |
|---|---|---|
| `sortProducts` | `(products: StoreProduct[], sortBy: SortOptions) => StoreProduct[]` | Sorts the products array in-place (mutates `_minPrice` on items) and returns the sorted array. |

**`SortOptions`** (from `@modules/store/components/refinement-list/sort-products`)

| Value | Label | Behaviour |
|---|---|---|
| `"created_at"` | Latest Arrivals | Descending by `created_at` timestamp |
| `"price_asc"` | Price: Low → High | Ascending by minimum variant `calculated_amount` |
| `"price_desc"` | Price: High → Low | Descending by minimum variant `calculated_amount` |

```ts
import { sortProducts } from "@lib/util/sort-products"

const sorted = sortProducts(products, "price_asc")
```

---

## `get-percentage-diff.ts`

**Path**: `src/lib/util/get-percentage-diff.ts`

Calculates the percentage discount between an original and a calculated (sale) price.

| Function | Signature | Description |
|---|---|---|
| `getPercentageDiff` | `(original: number, calculated: number) => string` | Returns the percentage decrease from `original` to `calculated` as a rounded string (no decimal places). |

```ts
import { getPercentageDiff } from "@lib/util/get-percentage-diff"

getPercentageDiff(2000, 1500) // → "25"
getPercentageDiff(1000, 1000) // → "0"
```

---

## `medusa-error.ts`

**Path**: `src/lib/util/medusa-error.ts`

Normalises Medusa SDK / Axios errors into a standard thrown `Error` with a human-readable message. Always re-throws — the return type is `never`. Logs the request URL, response body, status code, and headers to `console.error` before throwing.

| Function | Signature | Description |
|---|---|---|
| `medusaError` (default) | `(error: any) => never` | Inspects `error.response`, `error.request`, and `error.message` in that order. Extracts `response.data.message`, capitalises it, and appends a period before throwing. |

**Error branches**

| Condition | Thrown message |
|---|---|
| `error.response` present | `error.response.data.message` (or raw data), capitalised + `.` |
| `error.request` present (no response) | `"No response received: " + error.request` |
| Neither (setup failure) | `"Error setting up the request: " + error.message` |

```ts
import medusaError from "@lib/util/medusa-error"

try {
  await sdk.store.cart.retrieve(cartId)
} catch (err) {
  medusaError(err) // always throws a normalised Error
}
```

---

## `turnstile.ts`

**Path**: `src/lib/util/turnstile.ts`

Server-side Cloudflare Turnstile CAPTCHA verification and honeypot bot detection. Gracefully degrades: if `TURNSTILE_SECRET_KEY` is not set, `verifyTurnstileToken` returns `true` unconditionally so forms work in development without credentials.

| Function | Signature | Description |
|---|---|---|
| `verifyTurnstileToken` | `(token: string \| null) => Promise<boolean>` | POSTs token to Cloudflare's siteverify endpoint. Returns `true` if verification passes or if `TURNSTILE_SECRET_KEY` is unset. Returns `false` if the key is set but no token was provided, or if Cloudflare returns `success: false`. |
| `isHoneypotFilled` | `(formData: FormData) => boolean` | Returns `true` if the hidden `website_url` field in `formData` contains any text, indicating an automated bot submission. |

```ts
import { verifyTurnstileToken, isHoneypotFilled } from "@lib/util/turnstile"

// In a server action / route handler
export async function submitContactForm(formData: FormData) {
  if (isHoneypotFilled(formData)) return { error: "Spam detected" }

  const token = formData.get("cf-turnstile-response") as string | null
  const valid = await verifyTurnstileToken(token)
  if (!valid) return { error: "CAPTCHA verification failed" }

  // proceed with form processing ...
}
```

---

## `env.ts`

**Path**: `src/lib/util/env.ts`

Environment variable helpers for the storefront application.

| Function | Signature | Description |
|---|---|---|
| `getBaseURL` | `() => string` | Returns `NEXT_PUBLIC_BASE_URL` if set, otherwise falls back to `"https://localhost:8000"`. Used in `layout.tsx` metadata and Open Graph URLs. |

```ts
import { getBaseURL } from "@lib/util/env"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}
```

---

## `get-locale-header.ts`

**Path**: `src/lib/util/get-locale-header.ts`

Builds the locale request header consumed by the Medusa backend for locale-aware responses.

| Function | Signature | Description |
|---|---|---|
| `getLocaleHeader` | `() => Promise<{ "x-medusa-locale": string }>` | Reads the current locale from the `locale-actions` server action and returns it as a typed header object. |

```ts
import { getLocaleHeader } from "@lib/util/get-locale-header"

const headers = await getLocaleHeader()
// → { "x-medusa-locale": "en" }

const response = await fetch(`${backendUrl}/store/products`, { headers })
```

---

## `isEmpty.ts`

**Path**: `src/lib/util/isEmpty.ts`

Null/empty-state guards for a variety of JavaScript types.

| Function | Signature | Description |
|---|---|---|
| `isObject` | `(input: any) => boolean` | Returns `true` if `input instanceof Object`. |
| `isArray` | `(input: any) => boolean` | Returns `true` if `Array.isArray(input)`. |
| `isEmpty` | `(input: any) => boolean` | Returns `true` for `null`, `undefined`, empty objects `{}`, empty arrays `[]`, and blank/whitespace-only strings. |

```ts
import { isEmpty } from "@lib/util/isEmpty"

isEmpty(null)        // true
isEmpty("")          // true
isEmpty("  ")        // true
isEmpty([])          // true
isEmpty({})          // true
isEmpty("hello")     // false
isEmpty([1, 2])      // false
```

---

## `compare-addresses.ts`

**Path**: `src/lib/util/compare-addresses.ts`

Deep-equality check for two address objects, comparing only the fields relevant to shipping/billing. Uses `lodash` `pick` to extract the compared fields and `isEqual` for deep comparison. Ignores `id`, `updated_at`, and other metadata fields.

**Compared fields**: `first_name`, `last_name`, `address_1`, `company`, `postal_code`, `city`, `country_code`, `province`, `phone`

| Function | Signature | Description |
|---|---|---|
| `compareAddresses` (default) | `(address1: any, address2: any) => boolean` | Returns `true` if both addresses are equal across the nine compared fields. |

```ts
import compareAddresses from "@lib/util/compare-addresses"

const same = compareAddresses(cart.shipping_address, customer.addresses[0])
if (!same) {
  // prompt user to confirm address change
}
```

---

## `repeat.ts`

**Path**: `src/lib/util/repeat.ts`

Generates an array of sequential integers from `0` to `times - 1`. Useful for rendering skeleton loaders and placeholder lists without needing real data.

| Function | Signature | Description |
|---|---|---|
| `repeat` (default) | `(times: number) => number[]` | Returns `[0, 1, ..., times - 1]`. |

```ts
import repeat from "@lib/util/repeat"

// Render 4 skeleton product cards while data loads
repeat(4).map((i) => <ProductCardSkeleton key={i} />)
```
