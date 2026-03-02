# Checkout Module

This module (`src/modules/checkout/`) implements the complete multi-step checkout flow. It is rendered under the `(checkout)` route group, which uses a minimal layout with no main navigation bar.

---

## Checkout Flow Overview

Navigation between steps is driven by the `?step=` URL query parameter. Each step component reads `searchParams.get("step")` to determine whether it is the active (open) step. Completed steps show a summary and an Edit button; incomplete future steps are rendered in a disabled/dimmed state.

```
1. Addresses   (?step=address)   — Shipping + optional billing address
        |
2. Delivery    (?step=delivery)  — Select a shipping method
        |
3. Payment     (?step=payment)   — Choose and enter payment details
        |
4. Review      (?step=review)    — Final confirmation before order placement
        |
   Order confirmed  (/{countryCode}/order/{id}/confirmed)
```

On success, Medusa redirects the customer to `/{countryCode}/order/{id}/confirmed`. On failure, an error message is shown inline and the customer remains on the current step.

---

## Templates

### CheckoutForm

**Location:** `templates/checkout-form/index.tsx`
**Type:** Server Component

The main checkout orchestrator. Receives `cart` and `customer` as props from the page. Before rendering it:

- Fetches available shipping methods via `listCartShippingMethods(cart.id)`
- Fetches available payment providers via `listCartPaymentMethods(cart.region.id)`
- Maps cart line items to GA4 event format and fires a `begin_checkout` event via `BeginCheckoutTracker`
- Returns `null` if the cart or either fetch result is absent

Renders all four step components vertically in sequence:

```
<Addresses />
<Shipping />
<Payment />
<Review />
```

Each step component independently reads `?step` from `useSearchParams` to toggle its open/closed state. There is no explicit step-routing logic in `CheckoutForm` itself — the steps manage themselves.

### CheckoutSummary

**Location:** `templates/checkout-summary/index.tsx`
**Type:** Client Component (no `"use server"` / no async; rendered as part of the checkout layout sidebar)

The sticky order summary sidebar displayed alongside the checkout form. Renders:

- `CartTotals` — subtotal, shipping cost, taxes, and order total
- `ItemsPreviewTemplate` — cart line items list (from `@modules/cart/templates/preview`)
- `DiscountCode` — promo/discount code input and applied promotions list
- `GiftCardCode` — gift card redemption input and applied cards list

---

## Components

### Addresses

**Location:** `components/addresses/index.tsx`
**Type:** Client Component (`"use client"`)

Controls the address step (`?step=address`). Manages the "same as shipping" billing toggle via `useToggleState`, comparing the current shipping and billing addresses with `compareAddresses`.

When open, renders a `<form>` wired to the `setAddresses()` server action via `useActionState`. The form contains:
- `ShippingAddress` — full shipping address fields
- `BillingAddress` — conditionally rendered when the "same as billing" checkbox is unchecked
- `SubmitButton` — "Continue to delivery"
- `ErrorMessage` — displays the server action error if present

When closed, shows a three-column summary of shipping address, contact (phone + email), and billing address. An Edit button pushes `?step=address` back to the URL.

### Shipping

**Location:** `components/shipping/index.tsx`
**Type:** Client Component (`"use client"`)

Controls the delivery step (`?step=delivery`). Separates available methods into two groups:
- Standard shipping methods — `service_zone.fulfillment_set.type !== "pickup"`
- Pickup methods — `service_zone.fulfillment_set.type === "pickup"`

For shipping options with `price_type === "calculated"`, prices are fetched asynchronously via `calculatePriceForShippingOption` on mount and displayed once resolved (shows a `<Loader />` spinner in the interim).

Selection calls `setShippingMethod({ cartId, shippingMethodId })` immediately on radio change (not on form submit). Tracks the GA4 `add_shipping_info` event via `trackAddShippingInfo` when the user clicks "Continue to payment". Advances to `?step=payment` on success.

When closed, shows the selected method name and price. An Edit button returns to `?step=delivery`.

### Payment

**Location:** `components/payment/index.tsx`
**Type:** Client Component (`"use client"`)

Controls the payment step (`?step=payment`). Reads the active payment session from `cart.payment_collection.payment_sessions` (status `"pending"`).

For each available payment method:
- Stripe-like providers render `StripePaymentElementContainer` (a Stripe `PaymentElement` inside `PaymentContainer`)
- All other providers render `PaymentContainer` with the provider's icon and title from `paymentInfoMap`

If the cart total is fully covered by gift cards (`paidByGiftcard === true`), the payment method selection is skipped entirely and "Gift card" is shown as the method.

Selecting a Stripe provider calls `initiatePaymentSession()` immediately. The "Continue to review" button is disabled until Stripe's `PaymentElement` reports `complete === true`. Tracks GA4 `add_payment_info` on advance. Pushes `?step=review` on success.

When closed, shows payment method title and a card/wallet icon summary.

### PaymentButton

**Location:** `components/payment-button/index.tsx`
**Type:** Client Component (`"use client"`)

The final "Place order" button. Rendered inside `Review`. Uses a switch on the active payment session's `provider_id` to select the correct implementation:

- **`StripePaymentButton`** — calls `elements.submit()`, then `stripe.confirmPayment()` with `redirect: "if_required"`. On `requires_capture` or `succeeded` status (or equivalent error state), calls `placeOrder()`. Requires `stripe` and `elements` from `useStripe`/`useElements` hooks.
- **`ManualTestPaymentButton`** — calls `placeOrder()` directly. No Stripe interaction.
- **Default** — renders a disabled `<Button>Select a payment method</Button>`.

Both concrete implementations manage their own `submitting` boolean and display an inline `ErrorMessage` on failure. The button is disabled if addresses, billing address, email, or shipping methods are missing (`notReady` guard).

### Review

**Location:** `components/review/index.tsx`
**Type:** Client Component (`"use client"`)

Controls the review step (`?step=review`). Renders only when `isOpen` is true and all previous steps are complete (shipping address, at least one shipping method, and a payment collection or full gift card coverage).

Displays a terms/policy acknowledgement message, then renders `PaymentButton` to place the order.

### DiscountCode

**Location:** `components/discount-code/index.tsx`
**Type:** Client Component (`"use client"`)

Collapsible promo code input in the `CheckoutSummary` sidebar. Calls `applyPromotions()` server action with the accumulated list of promo codes (add or remove). Displays toast notifications (via `useToast`) on success or failure. Applied promotions are shown as badges with percentage or fixed-amount values. Automatic promotions display without a remove button.

### GiftCardCode

**Location:** `components/gift-card-code/index.tsx`
**Type:** Client Component (`"use client"`)

Collapsible gift card input in the `CheckoutSummary` sidebar. Calls `validateGiftCard()` from `@lib/data/gift-cards` (which hits the custom `/store/gift-cards` backend route). Applied cards are tracked in local component state (`appliedCards`) and displayed as purple badges showing the remaining balance. Codes are normalized to uppercase before validation.

### ShippingAddress

**Location:** `components/shipping-address/index.tsx`
**Type:** Client Component (no directive, but uses hooks — rendered inside a Client Component parent)

Address form for the shipping step. Fields: first name, last name, address line 1, company (optional), postal code, city, province (via `ProvinceSelect`), email, and phone. Country is hardcoded to Canada (hidden `input[value="ca"]` + read-only display field).

For authenticated customers with saved addresses in the current region, renders `AddressSelect` to pre-fill from a saved address. On email blur, calls `checkEmailExists()` and shows a sign-in prompt if an account is found for that email. Validates Canadian postal code format (`K1A 0B1` pattern) on blur with an inline error.

### AddressSelect

**Location:** `components/address-select/index.tsx`
**Type:** Client Component (uses Headless UI `Listbox`)

Dropdown that lists a customer's saved addresses. Selecting an entry calls `onSelect(address)` to populate the `ShippingAddress` form fields. Highlights the currently matched address by comparing fields via `compareAddresses`.

### BillingAddress

**Location:** `components/billing_address/index.tsx`
**Type:** Client Component (uses React state)

Separate billing address form rendered when the "same as shipping" checkbox is unchecked. Fields mirror `ShippingAddress` (minus email): first name, last name, address line 1, company, postal code, city, province (via `ProvinceSelect`), phone. Country is hardcoded to Canada. Validates Canadian postal code format on blur.

### CountrySelect

**Location:** `components/country-select/index.tsx`
**Type:** Client Component (uses `forwardRef`)

A `NativeSelect` wrapper that builds its options from `region.countries`. Currently not used in `ShippingAddress` or `BillingAddress` (both hardcode Canada), but available for multi-country scenarios.

### ProvinceSelect

**Location:** `components/province-select/index.tsx`
**Type:** Client Component (uses `forwardRef`)

A `NativeSelect` wrapper with a hardcoded list of all 13 Canadian provinces and territories (AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT). Used in both `ShippingAddress` and `BillingAddress`.

### PaymentWrapper

**Location:** `components/payment-wrapper/index.tsx`
**Type:** Client Component (`"use client"`)

Initializes the Stripe JS provider when the active payment session is Stripe-like. Loads Stripe via `loadStripe()` using `NEXT_PUBLIC_STRIPE_KEY` (or `NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY` as fallback), optionally scoped to a `NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID`. Wraps children in `StripeWrapper` (which provides the Stripe Elements context) when Stripe is active; otherwise renders a plain `<div>`.

### PaymentContainer

**Location:** `components/payment-container/index.tsx`
**Type:** Client Component (uses Headless UI `Radio`)

A selectable radio card for a single payment provider. Renders the provider's title and icon from `paymentInfoMap`. For Stripe providers, the named export `StripePaymentElementContainer` wraps `PaymentContainer` and injects Stripe's `<PaymentElement>` when the option is selected and the Stripe context is ready (otherwise shows `SkeletonCardDetails`). Shows `PaymentTest` badge for manual providers in development.

### SubmitButton

**Location:** `components/submit-button/index.tsx`
**Type:** Client Component (`"use client"`)

Form submit button that reflects the React `useFormStatus` `pending` state as a loading spinner. Accepts `variant` (`"primary"` by default), `className`, and `data-testid` props.

### ErrorMessage

**Location:** `components/error-message/index.tsx`
**Type:** Server-compatible (no directive; pure render)

Renders a `role="alert"` `aria-live="assertive"` `<div>` in rose-500 when `error` is a non-empty string. Returns `null` when there is no error. Used throughout the checkout form for server action and payment errors.

### PaymentTest

**Location:** `components/payment-test/index.tsx`
**Type:** Server-compatible (no directive; pure render)

Renders an orange `<Badge>` reading "Attention: For testing purposes only." Shown alongside the manual payment provider in `PaymentContainer` when `NODE_ENV === "development"`.

---

## After Order Placement

On a successful `placeOrder()` call, Medusa's server action redirects the browser to:

```
/{countryCode}/order/{orderId}/confirmed
```

On failure, `placeOrder()` throws and the error is caught by `PaymentButton`, which sets `errorMessage` state and renders it via `ErrorMessage`. The customer remains on the review step.
