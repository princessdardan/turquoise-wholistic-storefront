# Account Module

`src/modules/account/` implements all customer authentication and account management UI for Turquoise Wholistic.

## Table of Contents

- [Routing Architecture](#routing-architecture)
- [Template](#template)
- [Auth Components](#auth-components)
  - [LoginTemplate](#logintemplate)
  - [Login](#login)
  - [Register](#register)
  - [ForgotPassword](#forgotpassword)
  - [ResetPassword](#resetpassword)
- [Dashboard Components](#dashboard-components)
  - [AccountNav](#accountnav)
  - [Overview](#overview)
  - [Profile Sections](#profile-sections)
  - [AddressBook](#addressbook)
  - [OrderOverview](#orderoverview)
  - [OrderCard](#ordercard)
  - [GiftCardsOverview](#giftcardsoverview)
  - [SubscriptionOverview](#subscriptionoverview)
  - [WishlistOverview](#wishlistoverview)
  - [TransferRequestForm](#transferrequestform)
  - [DeleteAccount](#deleteaccount)
  - [AccountInfo](#accountinfo)

---

## Routing Architecture

The account section uses Next.js parallel routes under `src/app/[countryCode]/(main)/account/`:

- **`@dashboard`** — rendered when `retrieveCustomer()` returns a customer (authenticated users)
- **`@login`** — rendered when `retrieveCustomer()` returns `null` (unauthenticated users)

The account layout page calls `retrieveCustomer()` on the server. If a customer object is returned, the `@dashboard` slot's page is rendered inside `AccountLayout`. If the customer is `null`, the `@login` slot is rendered instead (showing `LoginTemplate`).

Sub-pages `forgot-password` and `reset-password` render via the `children` slot and are accessible to both authenticated and unauthenticated users — they are not gated by the parallel route mechanism.

---

## Template

### AccountLayout

- **File**: `src/modules/account/templates/account-layout.tsx`
- **Type**: Server Component

Wrapper rendered around all authenticated account pages. Accepts `customer: HttpTypes.StoreCustomer | null` and `children: React.ReactNode`.

Renders a two-column grid layout (`240px` sidebar + flex main area) at the `small` breakpoint and above. The left column renders `AccountNav` only when `customer` is non-null. The right column renders `children` (the active page). A footer strip with a "Got questions?" customer service link (`/customer-service`) is shown at the bottom of every account page.

---

## Auth Components

### LoginTemplate

- **File**: `src/modules/account/templates/login-template.tsx`
- **Type**: Client Component (`"use client"`)

Top-level container for unauthenticated users. Manages a `currentView` string state (values: `"sign-in"` | `"register"`) using `useState`. Conditionally renders `<Login>` or `<Register>`, passing `setCurrentView` as a prop to each so either form can trigger a switch to the other view without a page navigation.

### Login

- **File**: `src/modules/account/components/login/index.tsx`
- **Type**: Client Component (uses `useActionState`)

Email and password sign-in form. Calls the `login` server action (from `@lib/data/customer`) via React's `useActionState`. Displays inline error messages via `ErrorMessage` on failure. Includes a link to `/account/forgot-password` and a "Join us" button that calls `setCurrentView(LOGIN_VIEW.REGISTER)` to switch to registration without navigation.

### Register

- **File**: `src/modules/account/components/register/index.tsx`
- **Type**: Client Component (`"use client"`)

Registration form collecting first name, last name, email, phone (optional), and password. Calls the `signup` server action via `useActionState`. Includes a `HoneypotField` and a `TurnstileField` (Cloudflare Turnstile CAPTCHA) for bot protection. Links to `/content/privacy-policy` and `/content/terms-of-use`. After successful registration the server action auto-logs the customer in. A "Sign in" button switches back to the login view.

### ForgotPassword

- **File**: `src/modules/account/components/forgot-password/index.tsx`
- **Type**: Client Component (`"use client"`)

Single email input form. Calls the `requestPasswordToken` server action via `useActionState`, which posts to `/store/customers/password-token`. Includes `HoneypotField` and `TurnstileField` for bot protection. On success (`state.success === true`) the form is replaced with a confirmation banner ("If an account exists with that email, you will receive a reset link.") and a back-to-sign-in link. Backend rate-limits this endpoint to 3 requests per hour per email.

### ResetPassword

- **File**: `src/modules/account/components/reset-password/index.tsx`
- **Type**: Client Component (`"use client"`)

Accepts `token` and `email` as props (read from URL search params by the page). If either is missing, renders an "Invalid Reset Link" state with a link to request a new one. Otherwise renders a two-field form (new password + confirm password) with real-time password strength validation against three rules: minimum 8 characters, at least one letter, at least one number. Passwords-match check updates live as the confirm field changes. Calls the `resetPassword` server action via `useActionState`. On success, uses `addToast` and `router.push` to redirect to the account page.

---

## Dashboard Components

### AccountNav

- **File**: `src/modules/account/components/account-nav/index.tsx`
- **Type**: Client Component (`"use client"`)

Sidebar navigation rendered inside `AccountLayout` for authenticated customers. Uses `usePathname()` and `useParams()` to determine the active route. Has two responsive layouts:

- **Mobile** (`small:hidden`): On the overview page (`/account`), renders a full list of links with chevrons. On any sub-page, renders a single back-to-account link.
- **Desktop** (`hidden small:block`): Renders a vertical list of `AccountNavLink` items with active state highlighting (bold, full-opacity text) based on current route.

Navigation links: Overview (`/account`), Profile (`/account/profile`), Addresses (`/account/addresses`), Orders (`/account/orders`), Wishlist (`/account/wishlist`), Subscriptions (`/account/subscriptions`), Gift Cards (`/account/gift-cards`). A "Log out" button calls `signout(countryCode)` from `@lib/data/customer`.

The internal `AccountNavLink` helper component applies `font-semibold` and full-opacity text to the active route by comparing `route.split(countryCode)[1]` to the `href` prop.

### Overview

- **File**: `src/modules/account/components/overview/index.tsx`
- **Type**: Server Component

Dashboard home page. Props: `customer: HttpTypes.StoreCustomer | null`, `orders: HttpTypes.StoreOrder[] | null`.

Displays a welcome greeting with the customer's first name and their signed-in email. Shows two stat counters: profile completion percentage and saved address count. Profile completion is calculated by `getProfileCompletion()` — a helper that awards one point each for: email set, first+last name set, phone set, and a default billing address existing — returning a 0-100 percentage.

Below the stats, renders the 5 most recent orders as clickable rows showing date placed, order number (`#display_id`), and total amount. Clicking navigates to `/account/orders/details/{order.id}`. Renders "No recent orders" when the orders array is empty.

### Profile Sections

All profile components are Client Components (`"use client"`) and follow the same pattern: wrap an `AccountInfo` component inside a `<form>` with a `useActionState` bound server action. `AccountInfo` handles the edit/cancel toggle and success/error feedback display.

#### ProfileName

- **File**: `src/modules/account/components/profile-name/index.tsx`

Displays current full name. Edit form: two side-by-side inputs for first name and last name. Calls `updateCustomer({ first_name, last_name })`.

#### ProfileEmail

- **File**: `src/modules/account/components/profile-email/index.tsx`

Displays current email. Edit form: new email input and current password input. Validates that the new email differs from the current email, then calls `changeEmail(newEmail, currentPassword)` which posts to `/store/customers/change-email`. Password confirmation is required by the backend to prevent unauthorized email changes.

#### ProfilePassword

- **File**: `src/modules/account/components/profile-password/index.tsx`

Displays "The password is not shown for security reasons". Edit form: old password, new password, and confirm password inputs. Note: the update action currently shows a toast ("Password update is not implemented") — this feature is not yet wired to a backend call.

#### ProfilePhone

- **File**: `src/modules/account/components/profile-phone/index.tsx`

Displays current phone number. Edit form: single phone input. Calls `updateCustomer({ phone })`.

#### ProfileBillingAddress

- **File**: `src/modules/account/components/profile-billing-address/index.tsx`

Displays the current default billing address (street, city, postal code, country). Edit form: full address fields including company, address lines, postal code, city, province, and a country `NativeSelect` populated from the available regions. If no billing address exists, calls `addCustomerAddress`; if one exists, calls `updateCustomerAddress` with the existing address ID. First-time add sets `isDefaultBilling: true`.

### AddressBook

- **File**: `src/modules/account/components/address-book/index.tsx`
- **Type**: Server Component

Renders a responsive two-column grid of all customer addresses. The first cell is always an `AddAddress` button/modal. Each subsequent cell renders an `EditAddress` modal for an existing address. Both sub-components are in `src/modules/account/components/address-card/`.

`AddAddress` (`add-address.tsx`, Client Component): A card-shaped button that opens a `Modal` containing a full address form. Calls `addCustomerAddress`. Automatically sets `isDefaultShipping: true` when this is the customer's first address.

`EditAddress` (`edit-address-modal.tsx`, Client Component): Displays an existing address card with edit and delete controls. Edit opens a modal pre-filled with the existing values. Delete calls `deleteCustomerAddress`.

### OrderOverview

- **File**: `src/modules/account/components/order-overview/index.tsx`
- **Type**: Client Component (`"use client"`)

Renders the full paginated list of customer orders. When orders exist, maps them into `OrderCard` components separated by a bottom border. When the list is empty, shows a "Nothing to see here" state with a "Continue shopping" link to the store home.

### OrderCard

- **File**: `src/modules/account/components/order-card/index.tsx`
- **Type**: Client Component (uses `useMemo`)

Individual order summary card. Displays order number (`#display_id`), creation date, total amount, and item count. Shows thumbnails for the first 3 line items (title and quantity). If more than 4 products exist, shows a "+N more" indicator. Links to `/account/orders/details/{order.id}` via a "See details" button.

### GiftCardsOverview

- **File**: `src/modules/account/components/gift-cards-overview/index.tsx`
- **Type**: Client Component (`"use client"`)

Renders a list of gift cards associated with the customer's orders (fetched via `getCustomerGiftCards()` from `@lib/data/gift-cards`). Each card shows the code in monospace font, a status badge (active = green, redeemed = grey, disabled = red), expiry date, purchase date, remaining balance, and original value when partially used. Empty state shows a gift box icon and helper text.

### SubscriptionOverview

- **File**: `src/modules/account/components/subscription-overview/index.tsx`
- **Type**: Client Component (`"use client"`)

Renders a list of customer subscriptions fetched via `getCustomerSubscriptions()`. Each subscription is displayed in a `SubscriptionCard` sub-component with:

- Frequency label (Weekly / Bi-weekly / Monthly / Bi-monthly) and status badge (Active = green, Paused = yellow, Cancelled = grey)
- Discount percentage applied
- Item list with product ID, variant ID, and quantity
- Next order date and current frequency (hidden for cancelled subscriptions)
- Action buttons: Pause (active only), Resume (paused only), Skip Next Delivery, Change Frequency (dropdown), Cancel

Pause and Cancel use native `<dialog>` elements for confirmation. State updates call `updateSubscription(id, action)` from `@lib/data/subscriptions` via `useTransition`. Optimistic updates are applied immediately to local state; errors are shown inline.

### WishlistOverview

- **File**: `src/modules/account/components/wishlist-overview/index.tsx`
- **Type**: Client Component (`"use client"`)

Renders a list of wishlisted products fetched via `getWishlist()`. Each item is a `WishlistItemCard` showing product thumbnail, title, variant name (if not "Default"), and price. Two actions per item:

- **Add to Cart**: calls `addToCart({ variantId, quantity: 1, countryCode })` via `useTransition`. Shows "Adding..." then "Added!" for 2 seconds on success.
- **Remove**: calls `removeFromWishlist(item.id)` via `useTransition`. Item is removed from local state optimistically before the server call completes.

Empty state shows a "Your wishlist is empty" message and a "Browse Products" link to `/store`.

### TransferRequestForm

- **File**: `src/modules/account/components/transfer-request-form/index.tsx`
- **Type**: Client Component (`"use client"`)

Form to connect a guest order to the authenticated customer account. Accepts an order ID input and calls `createTransferRequest` server action via `useActionState`. On success, shows an inline confirmation banner with the order ID and the email address a transfer request was sent to, plus a dismiss button. On failure, shows the error message in red below the form.

### DeleteAccount

- **File**: `src/modules/account/components/delete-account/index.tsx`
- **Type**: Client Component (`"use client"`)

Destructive action section rendered at the bottom of the profile page. Initially shows a label and a red "Delete Account" text button. Clicking reveals an expanded confirmation panel with a warning banner listing what will be permanently removed (order history, wishlist, subscriptions, reviews), a password input for confirmation, and "Cancel" / "Delete My Account" buttons.

Calls `deleteAccount(password)` from `@lib/data/customer` which posts to `/store/customers/delete-account`. On success, fires a success toast and redirects to the country home (`/{countryCode}`). On failure, displays the error inline and re-enables the button.

### AccountInfo

- **File**: `src/modules/account/components/account-info/index.tsx`
- **Type**: Client Component (uses `useFormStatus`, `useToggleState`)

Reusable wrapper used by all profile field editors (ProfileName, ProfileEmail, ProfilePhone, ProfilePassword, ProfileBillingAddress). Renders a row with a label, the current value, and an Edit/Cancel toggle button. When in edit mode, reveals the `children` slot (the edit form inputs) and a "Save changes" submit button via animated `Disclosure.Panel` transitions.

Manages three animated disclosure panels: success state (green badge), error state (red badge with `errorMessage`), and the edit form itself. Automatically closes the edit panel when `isSuccess` becomes `true`. The `clearState` callback is called before toggling to reset parent form state.
