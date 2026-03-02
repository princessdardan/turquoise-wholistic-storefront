# Custom Hooks

Two reusable React hooks available in `src/lib/hooks/`. Import via `@lib/hooks/<name>`.

## `useIntersection`

**File**: `use-in-view.tsx`

**Purpose**: IntersectionObserver hook to detect when an element enters or leaves the viewport. Useful for lazy loading, analytics triggers, and scroll-based animations.

**Signature**:
```tsx
const useIntersection = (
  element: RefObject<HTMLDivElement | null>,
  rootMargin: string
): boolean
```

**Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `element` | `RefObject<HTMLDivElement \| null>` | React ref to the DOM element to observe |
| `rootMargin` | `string` | IntersectionObserver margin (e.g., `"0px"`, `"-100px 0px -100px 0px"`) |

**Returns**: `boolean` — `true` when element is in viewport, `false` when out.

**Usage Example**:
```tsx
import { useRef } from "react"
import { useIntersection } from "@lib/hooks/use-in-view"

export function LazyImage({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useIntersection(ref, "0px")

  return (
    <div ref={ref}>
      {isVisible && <img src={src} alt="Lazy loaded" />}
    </div>
  )
}
```

---

## `useToggleState`

**File**: `use-toggle-state.tsx`

**Purpose**: Boolean toggle state management with open/close/toggle methods. Supports both array and object destructuring for flexible API.

**Signature**:
```tsx
const useToggleState = (initialState?: boolean): [
  boolean,
  () => void,
  () => void,
  () => void
] & {
  state: boolean
  open: () => void
  close: () => void
  toggle: () => void
}
```

**Parameters**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `initialState` | `boolean` | `false` | Starting state of the toggle |

**Returns**: Array-like object with dual API: array indices `[state, open, close, toggle]` and properties `{ state, open, close, toggle }`.

**Usage Example — Array Destructuring**:
```tsx
import useToggleState from "@lib/hooks/use-toggle-state"

export function Modal() {
  const [isOpen, open, close, toggle] = useToggleState()

  return (
    <>
      <button onClick={open}>Open Modal</button>
      {isOpen && (
        <div>
          <p>Modal content</p>
          <button onClick={close}>Close</button>
          <button onClick={toggle}>Toggle</button>
        </div>
      )}
    </>
  )
}
```

**Usage Example — Object Destructuring**:
```tsx
import useToggleState from "@lib/hooks/use-toggle-state"

export function Dropdown() {
  const { state, open, close, toggle } = useToggleState(false)

  return (
    <>
      <button onClick={toggle}>Menu</button>
      {state && <nav>Dropdown menu here</nav>}
    </>
  )
}
```
