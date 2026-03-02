# Common Module

The `common` module (`src/modules/common/`) is the shared component library used across all other modules. Import path: `@modules/common/components/<name>`.

---

## Navigation

### LocalizedClientLink

**Critical pattern — always use instead of `next/link`.**

A client component that reads `countryCode` from `useParams()` and automatically prepends `/{countryCode}` to every `href`. Without it, navigation strips the locale prefix and breaks region routing.

```tsx
// Correct
import LocalizedClientLink from "@modules/common/components/localized-client-link"

<LocalizedClientLink href="/products/my-product" className="text-turquoise-500">
  View Product
</LocalizedClientLink>
// renders: href="/ca/products/my-product"

// Incorrect — do not use next/link directly
import Link from "next/link"
<Link href="/products/my-product">View Product</Link>
// renders: href="/products/my-product"  <-- loses countryCode
```

| Prop | Type | Description |
|------|------|-------------|
| `href` | `string` | Destination path (without countryCode prefix) |
| `className` | `string?` | CSS classes |
| `onClick` | `() => void?` | Click handler |
| `passHref` | `true?` | Pass href to child element |
| `...rest` | `any` | Any other Next.js `<Link>` props |

### InteractiveLink

Styled navigation link with turquoise text and an `ArrowUpRightMini` icon that rotates 45 degrees on hover. Wraps `LocalizedClientLink`.

| Prop | Type | Description |
|------|------|-------------|
| `href` | `string` | Destination path |
| `children` | `ReactNode?` | Link label |
| `onClick` | `() => void?` | Click handler |

---

## Form Components

### Input

Floating-label text input with focus ring, error state support, and a built-in password visibility toggle for `type="password"` fields. Implemented as a `React.forwardRef` component.

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Input name and id |
| `label` | `string` | Floating label text |
| `type` | `string?` | HTML input type (default: `text`). Use `"password"` to enable the show/hide toggle |
| `topLabel` | `string?` | Static label rendered above the input |
| `required` | `boolean?` | Appends a red asterisk to the label |
| `touched` | `Record<string, unknown>?` | Touched state map (from form libraries) |
| `errors` | `Record<string, unknown>?` | Error state map (from form libraries) |
| `...rest` | `InputHTMLAttributes` | Any native input attribute |

### Checkbox

Accessible checkbox built on `@medusajs/ui`'s `Checkbox` primitive, paired with a `Label`. Generates a unique id via `useId()`.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Visible label text |
| `checked` | `boolean?` | Checked state (default: `true`) |
| `onChange` | `() => void?` | Toggle handler |
| `name` | `string?` | Field name |
| `data-testid` | `string?` | Test selector |

### Radio

Low-level radio button indicator. Renders a styled circular button that reflects checked/unchecked state visually. Does not manage its own state — intended to be used inside a parent that tracks selection.

| Prop | Type | Description |
|------|------|-------------|
| `checked` | `boolean` | Whether this option is selected |
| `data-testid` | `string?` | Test selector |

### NativeSelect

Custom-styled native `<select>` element with a `ChevronUpDown` icon and placeholder support. Implemented as a `React.forwardRef` component.

| Prop | Type | Description |
|------|------|-------------|
| `placeholder` | `string?` | Disabled first option text (default: `"Select..."`) |
| `defaultValue` | `string?` | Initial selected value |
| `className` | `string?` | Additional classes on the wrapper |
| `children` | `ReactNode` | `<option>` elements |
| `...rest` | `SelectHTMLAttributes` | Any native select attribute |

### FilterRadioGroup

Radio group used in product filter sidebars. Renders a title, then a list of labeled radio items from an `items` array. The selected item is visually indicated with an `EllipseMiniSolid` dot.

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Group heading |
| `items` | `{ value: string; label: string }[]` | Options to render |
| `value` | `any` | Currently selected value |
| `handleChange` | `(...args: any[]) => void` | Selection change callback |
| `data-testid` | `string?` | Test selector |

---

## UI Components

### Modal

Generic dialog built on `@headlessui/react` `Dialog` with animated enter/exit transitions and a blurred backdrop. Uses `ModalProvider` internally so sub-components can access `close()` via `useModal()`.

```tsx
<Modal isOpen={open} close={() => setOpen(false)} size="medium">
  <Modal.Title>Confirm Action</Modal.Title>
  <Modal.Body>Are you sure?</Modal.Body>
  <Modal.Footer>
    <button onClick={() => setOpen(false)}>Cancel</button>
  </Modal.Footer>
</Modal>
```

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls visibility |
| `close` | `() => void` | Called when backdrop or close button is clicked |
| `size` | `"small" \| "medium" \| "large"?` | Max-width: `md` / `xl` / `3xl` (default: `"medium"`) |
| `search` | `boolean?` | Transparent search-style variant, positioned at top |
| `children` | `ReactNode` | Modal content |
| `data-testid` | `string?` | Test selector |

**Sub-components**: `Modal.Title`, `Modal.Description`, `Modal.Body`, `Modal.Footer`

`Modal.Title` renders a close (X) button automatically via `useModal()`.

### Toast (ToastContainer)

Renders all active toasts from `ToastContext` as a fixed stack in the bottom-right corner (`fixed bottom-4 right-4 z-50`). Each `ToastItem` has a variant icon, message text, an optional action button, and a close button. Uses `aria-live="polite"` for screen reader accessibility.

To trigger a toast, call `useToast()` from `@lib/context/toast-context` and invoke `addToast()`.

| Variant | Style |
|---------|-------|
| `success` | Turquoise background/border |
| `error` | Red background/border |
| `warning` | Amber background / gold border |
| `info` | Sand background / turquoise border |

The `Toast` type (from `toast-context`) accepts: `message: string`, `variant: ToastVariant`, `action?: () => void`, `actionLabel?: string`, and `duration` (auto-dismiss delay).

### Divider

Thin horizontal rule. `className` prop allows spacing overrides.

```tsx
<Divider className="my-4" />
```

### DeleteButton

Cart line-item delete button. Calls `deleteLineItem(id)` from `@lib/data/cart` on click. Shows a `Trash` icon at rest and a spinning `Spinner` while the delete is in-flight. Does not show a confirmation prompt — deletion is immediate.

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Line item ID to delete |
| `children` | `ReactNode?` | Optional label next to the icon |
| `className` | `string?` | Wrapper classes |
| `onDelete` | `() => void?` | Called before the delete request fires |
| `onError` | `() => void?` | Called if the delete request fails |

---

## Rich Text Editor

### RichTextEditor

TipTap-based WYSIWYG editor. Client component. Syncs external `value` changes (e.g. form resets, loading edit data) via a `useEffect` that calls `setContent` without emitting an update event.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | HTML content string |
| `onChange` | `(html: string) => void` | — | Called with updated HTML on every edit |
| `placeholder` | `string?` | `"Start writing..."` | Editor placeholder text |
| `mode` | `"medium" \| "full"?` | `"full"` | Toolbar feature set (see below) |
| `minHeight` | `number?` | `300` | Editor area minimum height in pixels |

**Toolbar modes:**

| Mode | Features |
|------|----------|
| `"medium"` | Bold, italic, bullet list, ordered list, blockquote, links, undo/redo |
| `"full"` | All `"medium"` features plus H2/H3/H4 headings, code block, and image insertion |

Both modes include undo/redo buttons. Links use `window.prompt()` for URL entry. Images (full mode only) also use `window.prompt()` for URL entry.

A character count is displayed below the editor.

Used in: blog post editing (`/admin/blog`), product description editing.

---

## Commerce Components

### CartTotals

Client component that renders a financial summary table for a cart or order. Displays subtotal (excluding shipping and taxes), estimated shipping (or "Calculated at checkout" when absent), discount breakdown per promotion code with percentage labels, estimated HST (13%), and grand total. All amounts are formatted via `convertToLocale()`.

| Prop | Type | Description |
|------|------|-------------|
| `totals.total` | `number \| null?` | Grand total |
| `totals.subtotal` | `number \| null?` | Subtotal |
| `totals.item_subtotal` | `number \| null?` | Items subtotal (excl. shipping and taxes) |
| `totals.shipping_subtotal` | `number \| null?` | Shipping cost |
| `totals.tax_total` | `number \| null?` | Tax amount |
| `totals.discount_subtotal` | `number \| null?` | Total discount amount |
| `totals.promotions` | `StorePromotion[]?` | Applied promotions for per-code breakdown |
| `totals.currency_code` | `string` | ISO currency code |

### LineItemOptions

Displays the selected variant title for a line item as `Variant: {title}`. Accepts `HttpTypes.StoreProductVariant`.

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `StoreProductVariant \| undefined` | The line item's variant |
| `data-testid` | `string?` | Test selector |
| `data-value` | `StoreProductVariant?` | Raw value for test assertions |

### LineItemPrice

Displays the total price for a line item (quantity x unit price). When a reduced price exists, shows the original price with strikethrough and the percentage discount. Supports `"default"` style (shows "Original:" label and discount percent) and `"tight"` style (numbers only).

| Prop | Type | Description |
|------|------|-------------|
| `item` | `StoreCartLineItem \| StoreOrderLineItem` | Line item data |
| `style` | `"default" \| "tight"?` | Display density (default: `"default"`) |
| `currencyCode` | `string` | ISO currency code |

### LineItemUnitPrice

Displays the per-unit price for a line item, calculated as `total / quantity`. Shows original unit price with strikethrough and discount percentage when a reduced price is in effect. Same `style` prop as `LineItemPrice`.

| Prop | Type | Description |
|------|------|-------------|
| `item` | `StoreCartLineItem \| StoreOrderLineItem` | Line item data |
| `style` | `"default" \| "tight"?` | Display density (default: `"default"`) |
| `currencyCode` | `string` | ISO currency code |

---

## Form Protection

### HoneypotField

Hidden `<input name="website_url">` field for bot detection. Positioned off-screen via absolute CSS (not `display:none`, which bots can detect). If a bot fills the field, the server-side handler in `src/lib/util/turnstile.ts` rejects the submission. No props.

Add to every public-facing form:

```tsx
import HoneypotField from "@modules/common/components/honeypot-field"

<form>
  <HoneypotField />
  {/* ... real fields */}
</form>
```

### Turnstile

Cloudflare Turnstile CAPTCHA widget powered by `@marsidev/react-turnstile`. Reads `NEXT_PUBLIC_TURNSTILE_SITE_KEY` at module load time. Renders nothing when the env var is absent, so forms degrade gracefully in development.

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string?` | Wrapper div classes |

Widget options: `theme: "light"`, `size: "flexible"`.

Server-side token verification: `verifyTurnstile()` in `src/lib/data/form-protection.ts`.

---

## Analytics

### AnalyticsTracker

Four named client component exports, each rendering `null` (no UI) and firing a GA4 event once on mount via a `useRef` guard. A 100ms `setTimeout` delays the event to avoid blocking render.

| Component | GA4 Event | Use on |
|-----------|-----------|--------|
| `ViewItemTracker` | `view_item` | Product detail page |
| `ViewItemListTracker` | `view_item_list` | Product listing / category page |
| `BeginCheckoutTracker` | `begin_checkout` | Checkout entry page |
| `PurchaseTracker` | `purchase` | Order confirmation page |

All components accept a `GA4Item` or order object from `@lib/analytics`. Each fires at most once per component mount (guarded by `fired.current`).

---

## Other Components

### ProfessionalBadge

Client component. Renders a blue pill badge with the text "Professional" only when the active channel (from `useChannel()`) is `"professional"` and the context has hydrated. Renders nothing for retail users or during SSR hydration.

| Prop | Type | Description |
|------|------|-------------|
| `compact` | `boolean?` | Smaller text size for product cards (default: `false`) |

### HealthDisclaimer

Static server component. Renders a turquoise-bordered notice box with standard Health Canada NHP regulatory disclaimer text. Optionally displays the product's NPN (Natural Product Number).

| Prop | Type | Description |
|------|------|-------------|
| `npn` | `string \| null?` | Natural Product Number; displayed as a header line when present |

### ImageCta

Client component that renders a full-width split-layout promotional block: product image on one side, heading/description/price/CTA button on the other. Orientation (image left or right) is controlled by `image_orientation` or overridden via `orientationOverride`. Description HTML is sanitized with `isomorphic-dompurify`. Returns `null` if the product is unavailable or deleted.

Channel-aware: renders a note linking to the alternate channel when applicable. Background color is one of: `sand`, `turquoise-50`, `white`, `gold-50`, `turquoise-100`, `sand-dark`.

See `ImageCtaProps` in `src/modules/common/components/image-cta/index.tsx` for the full prop type (sourced from the CTA module API).

### PlaceholderMarker

Renders `value` as plain text when set, or renders `placeholder` with amber highlighting (`bg-amber-100 text-amber-800`) when `value` is falsy. Used to visually flag unconfigured store settings before launch.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string \| null \| undefined` | The real value to display |
| `placeholder` | `string` | Fallback label (e.g. `"[EMAIL]"`) |

### ContactInfoList

Async server component. Fetches store settings via `getStoreSettings()` and renders a `<ul>` with email, phone, and address rows. Each value is wrapped in `PlaceholderMarker` so unconfigured fields are visually flagged. Used in legal/policy pages.

---

## Icons

SVG icon components in `src/modules/common/icons/`. Each exports a React component accepting standard SVG props.

| File | Icon |
|------|------|
| `back.tsx` | Left-arrow back navigation |
| `bancontact.tsx` | Bancontact payment logo |
| `chevron-down.tsx` | Downward chevron |
| `eye.tsx` | Show password eye |
| `eye-off.tsx` | Hide password eye (used by `Input`) |
| `fast-delivery.tsx` | Fast delivery badge |
| `ideal.tsx` | iDEAL payment logo |
| `map-pin.tsx` | Location map pin |
| `medusa.tsx` | Medusa wordmark |
| `nextjs.tsx` | Next.js logo |
| `package.tsx` | Package/parcel icon |
| `paypal.tsx` | PayPal logo |
| `placeholder-image.tsx` | Grey placeholder image frame |
| `refresh.tsx` | Circular refresh arrow |
| `spinner.tsx` | Loading spinner |
| `trash.tsx` | Trash/delete icon (used by `DeleteButton`) |
| `user.tsx` | User/account silhouette |
| `x.tsx` | Close X (used by `Modal.Title`) |
