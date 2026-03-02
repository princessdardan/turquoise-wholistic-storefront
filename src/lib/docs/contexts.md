# Context Providers

All six client-side React contexts live in `src/lib/context/`. They are composed in the root layout in a fixed nesting order:

```
ToastProvider
  ChannelProvider
    MedusaClientProvider
      DualCartProvider
        WishlistProvider
          ModalProvider (per-component, not in root layout)
```

## Table of Contents

- [ChannelContext](#channelcontext)
- [MedusaClientProvider](#medusaclientprovider)
- [DualCartContext](#dualcartcontext)
- [WishlistContext](#wishlistcontext)
- [ToastContext](#toastcontext)
- [ModalContext](#modalcontext)

---

## ChannelContext

**File:** `src/lib/context/channel-context.tsx`

**Purpose:** Tracks whether the customer is shopping in the `retail` or `professional` channel. This drives which publishable API key, cart, and pricing tier are active across the entire session.

**State shape:**

```tsx
interface ChannelContextValue {
  channel: "retail" | "professional" | null  // null until hydrated
  setChannel: (channel: Channel) => void
  isChannelSelected: boolean                 // true once hydrated AND channel !== null
  hydrated: boolean                          // true after localStorage is read client-side
}
```

**Hook:**

```tsx
function useChannel(): ChannelContextValue
```

Throws if called outside `ChannelProvider`.

**Provider:**

```tsx
<ChannelProvider>{children}</ChannelProvider>
```

Already wraps the application in the root layout. No props required.

**Key behavior:**

- On mount, reads `localStorage.getItem("tw-channel")` and accepts only `"retail"` or `"professional"`.
- `setChannel()` writes the value to `localStorage` under key `tw-channel` and also records the current timestamp under `tw-channel-last-confirmed`. This timestamp is used by `ChannelReminder` to show a re-confirmation toast after 30 days.
- `hydrated` starts as `false` during SSR and becomes `true` after the `useEffect` runs. Gate any channel-specific UI behind `hydrated` to prevent hydration mismatches.

**Usage example:**

```tsx
"use client"
import { useChannel } from "@lib/context/channel-context"

export function ChannelBadge() {
  const { channel, hydrated } = useChannel()

  if (!hydrated) return null  // avoid SSR mismatch

  return (
    <span>{channel === "professional" ? "Pro Account" : "Retail"}</span>
  )
}
```

---

## MedusaClientProvider

**File:** `src/lib/context/medusa-client-context.tsx`

**Purpose:** Makes the Medusa JS SDK client (`sdk`) available in the React tree and keeps it channel-aware. Whenever the active channel changes, it calls `setActivePublishableKey()` to swap the publishable API key on the singleton `sdk` instance, and writes the channel value to a `tw-channel` cookie so server-side fetch handlers can read it.

**State shape:**

```tsx
interface MedusaClientContextValue {
  client: Medusa           // the sdk singleton from @lib/config
  publishableKey: string | undefined
}
```

**Hook:**

```tsx
function useMedusaClient(): MedusaClientContextValue
```

Throws if called outside `MedusaClientProvider`.

**Provider:**

```tsx
<MedusaClientProvider>{children}</MedusaClientProvider>
```

Must be nested inside `ChannelProvider` — it reads `channel` and `hydrated` from `useChannel()`.

**Key behavior:**

- Waits for `hydrated === true` before swapping keys, preventing a premature key update on SSR.
- Calls `setActivePublishableKey(key)` from `@lib/config` — this mutates the shared SDK instance in place, so all subsequent client-side SDK calls automatically use the correct key for the active channel.
- Writes `document.cookie = "tw-channel=..."` with a 1-year max-age so the server-side fetch interceptor in `config.ts` can route requests to the correct sales channel without requiring a client round-trip.
- Most data fetching in the app uses Server Actions (`src/lib/data/`), not this hook directly. Use `useMedusaClient()` only for imperative client-side SDK calls (e.g., payment confirmation, cart mutations that cannot be server actions).

**Usage example:**

```tsx
"use client"
import { useMedusaClient } from "@lib/context/medusa-client-context"

export function PaymentConfirmButton({ cartId }: { cartId: string }) {
  const { client } = useMedusaClient()

  const confirm = async () => {
    await client.store.payment.initiatePaymentSession(cartId, {
      provider_id: "pp_stripe_stripe",
    })
  }

  return <button onClick={confirm}>Pay</button>
}
```

---

## DualCartContext

**File:** `src/lib/context/dual-cart-context.tsx`

**Purpose:** Maintains separate cart IDs for the retail and professional channels. Cart IDs are the source of truth for which cart a customer is operating on — the active cart is derived from the current channel.

**State shape:**

```tsx
interface DualCartContextValue {
  retailCartId: string | null
  professionalCartId: string | null
  activeCartId: string | null   // whichever of the above matches the current channel
  refreshCartIds: () => void    // re-reads both cookies and syncs to localStorage
}
```

**Hook:**

```tsx
function useDualCart(): DualCartContextValue
```

Throws if called outside `DualCartProvider`.

**Provider:**

```tsx
<DualCartProvider>{children}</DualCartProvider>
```

Must be nested inside `ChannelProvider`.

**Key behavior:**

- Cart IDs are stored in two cookies: `tw-cart-retail` and `tw-cart-professional`. These cookies are set by server actions in `src/lib/data/cart.ts` (not by this context).
- On hydration and whenever `channel` changes, `refreshCartIds()` re-reads both cookies from `document.cookie` and also mirrors the values to `localStorage` (`tw-cart-retail`, `tw-cart-professional`). The localStorage copy exists so that synchronous client code can access cart IDs without waiting for a cookie read cycle.
- `activeCartId` is `null` until hydration completes — guard against this before passing it to cart API calls.
- Call `refreshCartIds()` manually after any server action that creates or clears a cart to keep context state in sync.

**Usage example:**

```tsx
"use client"
import { useDualCart } from "@lib/context/dual-cart-context"

export function CartItemCount() {
  const { activeCartId } = useDualCart()

  if (!activeCartId) return null

  // activeCartId is safe to pass to cart data fetchers
  return <span>Cart: {activeCartId.slice(0, 8)}&hellip;</span>
}
```

---

## WishlistContext

**File:** `src/lib/context/wishlist-context.tsx`

**Purpose:** Provides client-side wishlist state for authenticated customers. Exposes a toggle action with optimistic updates so the UI responds immediately without waiting for the server.

**State shape:**

```tsx
type WishlistContextValue = {
  isLoggedIn: boolean
  isLoading: boolean
  isInWishlist: (productId: string) => boolean
  getItemId: (productId: string) => string | undefined
  toggleWishlist: (productId: string) => Promise<void>
}
```

Internally, items are stored as a `Map<productId, wishlistItemId>` for O(1) membership and ID lookups. This map is not exposed directly.

**Hook:**

```tsx
const useWishlist: () => WishlistContextValue
```

Does not throw on missing provider — falls back to safe defaults (`isLoggedIn: false`, no-op functions).

**Provider:**

```tsx
<WishlistProvider isLoggedIn={boolean}>{children}</WishlistProvider>
```

`isLoggedIn` is a required boolean prop that must be resolved server-side (e.g., from the auth cookie) and passed down. Must be nested inside `ToastProvider` — it calls `useToast()` internally.

**Key behavior:**

- On mount, if `isLoggedIn` is `true`, fetches the full wishlist via `getWishlist()` (a Server Action from `@lib/data/wishlist`) and populates the internal map.
- Wishlist state is **purely client-side** — it is not server-cached or persisted in a cookie. A page refresh re-fetches from the API.
- `toggleWishlist()` uses optimistic updates in both directions:
  - **Remove**: deletes from the map immediately, reverts and shows an error toast if the API call fails.
  - **Add**: inserts with a temporary `temp-{productId}` ID immediately, replaces with the real ID on success, or reverts and shows an error toast on failure.

**Usage example:**

```tsx
"use client"
import { useWishlist } from "@lib/context/wishlist-context"

export function WishlistButton({ productId }: { productId: string }) {
  const { isInWishlist, toggleWishlist, isLoading } = useWishlist()

  return (
    <button
      disabled={isLoading}
      onClick={() => toggleWishlist(productId)}
      aria-pressed={isInWishlist(productId)}
    >
      {isInWishlist(productId) ? "Saved" : "Save"}
    </button>
  )
}
```

---

## ToastContext

**File:** `src/lib/context/toast-context.tsx`

**Purpose:** App-wide ephemeral notification system. Any component can push a toast message; the `ToastProvider` owns the list and auto-dismisses toasts after a configurable duration.

**State shape:**

```tsx
export type ToastVariant = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  action?: () => void
  actionLabel?: string
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant, options?: ToastOptions) => void
  removeToast: (id: string) => void
}
```

**Options accepted by `addToast`:**

```tsx
export interface ToastOptions {
  action?: () => void       // callback for an inline action button
  actionLabel?: string      // label for the action button
  duration?: number         // auto-dismiss delay in ms (default: 5000)
  onDismiss?: () => void    // called when the toast is removed for any reason
}
```

**Hook:**

```tsx
function useToast(): ToastContextValue
```

Throws if called outside `ToastProvider`.

**Provider:**

```tsx
<ToastProvider>{children}</ToastProvider>
```

Must be the outermost provider because `WishlistContext` and others call `useToast()` internally.

**Key behavior:**

- Toast IDs are module-level auto-incrementing integers (`toast-1`, `toast-2`, …), stable across re-renders.
- `onDismiss` callbacks are stored in a `useRef` map (not state) to avoid triggering re-renders.
- Auto-dismiss fires via `setTimeout` for `duration` ms (default 5000). Manual `removeToast()` cancels the `onDismiss` callback and removes from state.
- The `toasts` array is available for rendering a `<ToastList />` component — each toast should call `removeToast(id)` when dismissed by the user.

**Usage example:**

```tsx
"use client"
import { useToast } from "@lib/context/toast-context"

export function SubmitButton() {
  const { addToast } = useToast()

  const handleSubmit = async () => {
    const ok = await submitForm()
    if (ok) {
      addToast("Form submitted!", "success", { duration: 3000 })
    } else {
      addToast("Something went wrong.", "error", {
        action: () => handleSubmit(),
        actionLabel: "Retry",
      })
    }
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

---

## ModalContext

**File:** `src/lib/context/modal-context.tsx`

**Purpose:** Passes a `close` callback down through an arbitrary component subtree without prop drilling. Each modal wrapper supplies its own `close` function; inner components call `useModal().close()` without needing to know how the parent manages open/close state.

**State shape:**

```tsx
interface ModalContext {
  close: () => void
}
```

There is no `open` or `isOpen` state managed by this context. Open/close state lives in the parent component that renders the modal.

**Hook:**

```tsx
const useModal: () => ModalContext
```

Throws if called outside `ModalProvider`.

**Provider:**

```tsx
<ModalProvider close={closeHandler}>
  {children}
</ModalProvider>
```

`close` is a required prop — typically a state setter or a callback from a headless dialog primitive. Unlike the other providers, `ModalProvider` is not in the root layout. It is instantiated per-modal by each modal component.

**Key behavior:**

- Intentionally minimal. It only forwards a `close` callback — it does not manage modal content, stacking, focus trapping, or animations. Those concerns live in the component that renders the modal overlay.
- Because it is scoped per-modal, multiple independent modals can be open simultaneously, each with their own `close` callback.

**Usage example:**

```tsx
"use client"
import { useState } from "react"
import { ModalProvider, useModal } from "@lib/context/modal-context"

function CloseButton() {
  const { close } = useModal()
  return <button onClick={close}>Dismiss</button>
}

export function ExampleModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <ModalProvider close={() => setOpen(false)}>
          <div role="dialog">
            <p>Modal content</p>
            <CloseButton />
          </div>
        </ModalProvider>
      )}
    </>
  )
}
```
