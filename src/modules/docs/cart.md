# Cart Module

The `cart` module (`src/modules/cart/`) renders the full shopping cart page at `/{countryCode}/cart`. It manages cart display, item management, channel switching (retail vs. professional), and checkout navigation.

## Template

### CartTemplate

**Server/Client**: Client Component (`"use client"`)

Main cart page template. Displays two channel tabs (Retail Cart, Professional Cart) allowing customers to switch between their separate shopping carts for different sales channels. Each tab shows an item count badge and a notification indicator (colored dot) if the other channel has pending items.

Renders `ItemsTemplate` (list of cart items) on the left and `Summary` (cart totals and checkout button) on the right. Shows `SignInPrompt` above the items for unauthenticated customers. Falls back to `EmptyCartMessage` when the active cart has no items.

## Components

### Item

**Server/Client**: Client Component (`"use client"`)

Individual cart line item row displayed in a table. Shows:

- Product thumbnail (linked to product detail page)
- Product title and variant options (size, color, etc.)
- Quantity selector with increment/decrement buttons (range: 1–10)
- Unit price (hidden on mobile)
- Line item total price
- Delete button

Updates item quantity via `updateLineItem()` server action with optimistic UI updates — the quantity display updates immediately while the request is in-flight, then syncs with server state on completion. Uses GA4 tracking when items are removed via `trackRemoveFromCart()`.

Supports two display modes: `"full"` (cart page) and `"preview"` (mini cart). In preview mode, quantity and unit price are more compact.

### CartItemSelect

**Server/Client**: Client Component (`"use client"`)

Styled dropdown (`<select>`) component for changing cart item quantity. Used primarily as a utility component for quantity selection. Features custom styling with a chevron icon, placeholder text, and hover animations.

### EmptyCartMessage

**Server/Client**: Server Component

Displayed when the active cart contains no items. Shows a centered empty state with an icon, heading, descriptive text, and a "Browse Products" link back to the store. Uses sand-colored background for the icon container and turquoise color for the link.

### SignInPrompt

**Server/Client**: Server Component

Prompt displayed above cart items for unauthenticated customers. Encourages sign-in with a heading and descriptive text, with a "Sign in" button linking to `/account`.

**Note**: The `CartTotals` component (financial summary showing subtotal, tax, shipping, and final total) is located in `src/modules/common/components/cart-totals/`, not in this module.
