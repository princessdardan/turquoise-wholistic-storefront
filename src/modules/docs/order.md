# Order Module

Located at `src/modules/order/`, this module handles post-checkout order confirmation pages, account-level order detail views, and the order transfer accept/decline flow.

---

## Routes

| Route | Template Used | Notes |
|---|---|---|
| `/{countryCode}/order/{id}/confirmed` | `OrderCompletedTemplate` | Post-checkout confirmation; shown to both authenticated and guest customers |
| `/{countryCode}/account/@dashboard/orders/details/{id}` | `OrderDetailsTemplate` | Account dashboard order detail view |
| `/{countryCode}/order/{id}/transfer/{token}` | — | Transfer prompt page; renders `TransferImage` and order context |
| `/{countryCode}/order/{id}/transfer/{token}/accept` | — | Accept transfer page; renders `TransferActions` |
| `/{countryCode}/order/{id}/transfer/{token}/decline` | — | Decline transfer page; renders `TransferActions` |

---

## Templates

### `OrderCompletedTemplate`

**Server Component** — `src/modules/order/templates/order-completed-template.tsx`

Rendered after a successful checkout. Accepts an `HttpTypes.StoreOrder` and an `isGuest` boolean.

Behaviour:

- Reads the `_medusa_onboarding` cookie and conditionally renders `OnboardingCta` when it is set to `"true"`.
- Calls `getEstimatedDelivery()` — a local helper that reads the first shipping method name and computes a date range (2–4 days for express, 5–8 days for ground or unknown). Displays the range in a delivery banner.
- Fetches gift cards associated with the order via `listGiftCardsByOrder` and passes results to `OrderGiftCards`.
- Fires `PurchaseTracker` (GA4 analytics) with order line item data.
- When `isGuest` is true and `order.email` is present, renders `GuestAccountCreation` pre-filled with the order email and shipping name.
- Closes with a "Continue Shopping" link to `/store`.

Composition order: `OnboardingCta` (conditional) → thank-you header → estimated delivery banner → `OrderDetails` → `OrderGiftCards` → line item summary (`Items` + `CartTotals`) → `ShippingDetails` → `PaymentDetails` → `Help` → `GuestAccountCreation` (conditional) → continue shopping CTA.

### `OrderDetailsTemplate`

**Client Component** — `src/modules/order/templates/order-details-template.tsx`

Rendered inside the account dashboard for a specific order. Accepts `HttpTypes.StoreOrder`.

Renders a back-to-overview link (`/account/orders`) followed by: `OrderDetails` (with `showStatus` enabled) → `Items` → `ShippingDetails` → `OrderSummary` → `Help`.

Note: this template uses `OrderSummary` (a compact financial summary) instead of `CartTotals`, and does not include `PaymentDetails`, `OrderGiftCards`, or `GuestAccountCreation`.

---

## Components

### `OrderDetails`

**Server Component** — `src/modules/order/components/order-details/index.tsx`

Displays core order metadata:

- Confirmation email address.
- Order date (formatted via `Date.toDateString()`).
- Order number (`order.display_id`).
- When the optional `showStatus` prop is true, also renders fulfillment status and payment status. Both values are formatted by splitting underscores and title-casing (e.g. `"not_fulfilled"` → `"Not fulfilled"`).

Props: `order: HttpTypes.StoreOrder`, `showStatus?: boolean`.

### `OrderSummary`

**Server Component** — `src/modules/order/components/order-summary/index.tsx`

A compact financial breakdown used in the account order detail view. Renders:

- Subtotal
- Discount (shown only when `order.discount_total > 0`)
- Gift card discount (shown only when `order.gift_card_total > 0`)
- Shipping
- Taxes
- Total (separated by a dashed divider)

All amounts are formatted via `convertToLocale` using `order.currency_code`.

### `Items`

**Server Component** — `src/modules/order/components/items/index.tsx`

Renders the line item table. Sorts items by `created_at` descending, then maps each to an `Item` row. Falls back to five `SkeletonLineItem` rows when `order.items` is empty or undefined.

### `Item`

**Server Component** — `src/modules/order/components/item/index.tsx`

A single table row for one line item. Displays:

- Product thumbnail (via `Thumbnail`).
- Product title and variant options (via `LineItemOptions`).
- Quantity, unit price, and total line price (via `LineItemUnitPrice` and `LineItemPrice`).

Accepts `HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem` and `currencyCode`.

### `OrderGiftCards`

**Client Component** — `src/modules/order/components/order-gift-cards/index.tsx`

Shown on the order confirmation page when the order generated gift cards (e.g. the customer purchased a gift card product). Renders null when the `giftCards` array is empty.

For each gift card, displays the code in monospace text alongside the current balance formatted with `convertToLocale`. Includes a prompt to save the codes for future use at Turquoise Wholistic.

Props: `giftCards: GiftCardInfo[]`.

### `ShippingDetails`

**Server Component** — `src/modules/order/components/shipping-details/index.tsx`

Displays the delivery section with three columns:

- Shipping Address — full name, street, postal code/city, country code.
- Contact — phone number and email.
- Method — name of the first shipping method and its cost.

### `PaymentDetails`

**Server Component** — `src/modules/order/components/payment-details/index.tsx`

Displays the payment section using the first payment from `order.payment_collections`. Shows:

- Payment method title (looked up from `paymentInfoMap` by `provider_id`).
- Payment details: for Stripe-like providers with `card_last4` data, shows masked card number (`**** **** **** XXXX`); otherwise shows the formatted amount and timestamp.

### `TransferActions`

**Client Component** — `src/modules/order/components/transfer-actions/index.tsx`

Accept/Decline button pair for the order transfer flow. Receives the order `id` and transfer `token` as props.

State machine per button: `null` → `"pending"` → `"success" | "error"`. While one action is pending, both buttons are disabled. On success, the buttons are replaced with a confirmation message. On error, a red error message is shown below the buttons.

Calls `acceptTransferRequest(id, token)` or `declineTransferRequest(id, token)` from `@lib/data/orders`.

Props: `id: string`, `token: string`.

### `TransferImage`

**Server Component** — `src/modules/order/components/transfer-image/index.tsx`

A static inline SVG (280x181) used as a visual illustration on the transfer prompt page. Depicts two stylised mobile devices with transfer arrows between them. Accepts standard `SVGProps<SVGSVGElement>`.

### `GuestAccountCreation`

**Client Component** — `src/modules/order/components/guest-account-creation/index.tsx`

Shown on the order confirmation page only when the customer checked out as a guest (`isGuest === true`). Prompts the guest to set a password and create a full account.

- Email, first name, and last name are injected as hidden form fields from the completed order — no manual entry required.
- Password field requires minimum 8 characters with at least one letter and one number (enforced via `pattern` attribute and server-side validation).
- Uses `useActionState` to call `createAccountAfterOrder` from `@lib/data/customer` and shows a toast notification on success or failure.
- On success, the form is replaced with a branded confirmation banner and a prompt to sign in.

Props: `email: string`, `firstName: string`, `lastName: string`.

### `OnboardingCta`

**Client Component** — `src/modules/order/components/onboarding-cta/index.tsx`

Displayed at the top of the order confirmation page when the `_medusa_onboarding` cookie equals `"true"`. Indicates that a test order was placed during store setup. Renders a button that calls `resetOnboardingState(orderId)` from `@lib/data/onboarding`, which clears the onboarding cookie and redirects the merchant to the admin dashboard to complete store configuration.

Props: `orderId: string`.

### `Help`

**Server Component** — `src/modules/order/components/help/index.tsx`

A small "Need help?" footer section appended to all order views. Renders two `LocalizedClientLink` entries:

- "Contact" → `/contact`
- "Returns & Exchanges" → `/contact`
