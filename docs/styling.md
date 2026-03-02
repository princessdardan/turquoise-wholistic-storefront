# Styling & Design System

## Table of Contents

1. [Tailwind Configuration](#1-tailwind-configuration)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Layout Utilities](#4-layout-utilities)
5. [CSS Variables](#5-css-variables)
6. [Animations](#6-animations)
7. [Border Radius](#7-border-radius)
8. [Dark Mode](#8-dark-mode)

---

## 1. Tailwind Configuration

**File**: `tailwind.config.js`

Tailwind 3 is configured with the `@medusajs/ui-preset` as a base preset. This preset overrides many standard Tailwind defaults — including colors, border radius, and typography scale — so values from the preset take precedence unless explicitly extended or replaced in the local config.

```js
module.exports = {
  darkMode: "class",
  presets: [require("@medusajs/ui-preset")],
  plugins: [require("tailwindcss-radix")(), require("@tailwindcss/typography")],
  // ...theme.extend
}
```

**Plugins**

| Plugin | Purpose |
|---|---|
| `tailwindcss-radix` | Generates `radix-*` state variants for Radix UI component styling |
| `@tailwindcss/typography` | Provides the `prose` classes for rich text / blog content |

**Content paths scanned for class names**

```
./src/app/**/*.{js,ts,jsx,tsx}
./src/pages/**/*.{js,ts,jsx,tsx}
./src/components/**/*.{js,ts,jsx,tsx}
./src/modules/**/*.{js,ts,jsx,tsx}
./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}
```

---

## 2. Color Palette

All custom colors are defined under `theme.extend.colors` in `tailwind.config.js`. Use them as Tailwind utilities: `bg-turquoise-400`, `text-brand-text`, `border-gold-500`, etc.

### Turquoise (Primary Brand Color)

The core brand color. Use the mid-range shades (`400`–`600`) for interactive elements, the light shades (`50`–`200`) for tinted backgrounds, and the dark shades (`700`–`900`) for high-contrast contexts.

| Token | Hex | Usage |
|---|---|---|
| `turquoise-50` | `#E8FAF7` | Tinted page backgrounds, hover states on light surfaces |
| `turquoise-100` | `#D1F5EF` | Subtle section backgrounds |
| `turquoise-200` | `#A8F0E6` | Decorative borders, dividers |
| `turquoise-300` | `#72E8D8` | Icon fills, badges |
| `turquoise-400` | `#40E0D0` | Primary brand highlight, focus rings, theme-color meta |
| `turquoise-500` | `#1F8A7E` | Primary button backgrounds, active states |
| `turquoise-600` | `#1A7568` | Button hover states, skip-link background |
| `turquoise-700` | `#166058` | Pressed/active states |
| `turquoise-800` | `#0D3833` | Dark UI elements |
| `turquoise-900` | `#061C1A` | Near-black brand-tinted text |

### Sand (Warm Neutral Backgrounds)

Used for warm off-white page backgrounds and card surfaces. Keeps the UI from feeling stark white.

| Token | Hex | Usage |
|---|---|---|
| `sand-50` | `#FDFCFB` | Near-white page backgrounds |
| `sand-100` | `#F5F0EB` | Section backgrounds, card fills |
| `sand-200` | `#EBE3DA` | Subtle borders, dividers |
| `sand-300` | `#D9CEC2` | Input borders, stronger dividers |

### Gold (Accent Color)

Used sparingly for highlights, star ratings, and premium visual accents.

| Token | Hex | Usage |
|---|---|---|
| `gold-400` | `#D4A853` | Star ratings, accent badges, highlights |
| `gold-500` | `#BF9540` | Gold hover/active states |

### Brand Text

Semantic text color tokens for body copy and secondary labels.

| Token | Hex | Usage |
|---|---|---|
| `brand-text` | `#1A1A2E` | Primary body text, headings |
| `brand-text-secondary` | `#64748B` | Secondary labels, metadata, captions |

### Grey Scale

A neutral grey scale (from `@medusajs/ui-preset` extended locally) for UI chrome.

| Token | Hex | Usage |
|---|---|---|
| `grey-0` | `#FFFFFF` | Pure white backgrounds |
| `grey-5` | `#F9FAFB` | Light backgrounds |
| `grey-10` | `#F3F4F6` | Skeleton loaders, disabled states |
| `grey-20` | `#E5E7EB` | Borders |
| `grey-30` | `#D1D5DB` | Dividers |
| `grey-40` | `#9CA3AF` | Placeholder text |
| `grey-50` | `#6B7280` | Muted text |
| `grey-60` | `#4B5563` | Secondary text |
| `grey-70` | `#374151` | Body text |
| `grey-80` | `#1F2937` | Strong body text |
| `grey-90` | `#111827` | Near-black |

---

## 3. Typography

### Fonts

Both fonts are loaded via `next/font/google` in `src/app/layout.tsx` and injected as CSS custom properties on the `<html>` element.

```tsx
// src/app/layout.tsx
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

<html className={`${inter.variable} ${playfair.variable}`}>
```

| Font | CSS Variable | Tailwind Class | Role |
|---|---|---|---|
| Inter | `--font-inter` | `font-sans` | Body copy, UI labels, navigation |
| Playfair Display | `--font-playfair` | `font-serif` | Page headings, hero titles, editorial text |

**Font family stacks** (from `tailwind.config.js`):

```js
fontFamily: {
  sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont",
         "Segoe UI", "Roboto", "Helvetica Neue", "Ubuntu", "sans-serif"],
  serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
}
```

### Text Utility Classes

Semantic text size classes defined in `src/styles/globals.css` under `@layer components`. These are the preferred way to set text sizes — do not mix ad-hoc Tailwind font size utilities with these classes in the same component.

| Class | Size | Line Height | Weight | Example Usage |
|---|---|---|---|---|
| `.text-xsmall-regular` | 10px | 1rem (16px) | 400 | Floating input labels, fine print |
| `.text-small-regular` | 12px (`text-xs`) | 1.25rem (20px) | 400 | Captions, tags, badges |
| `.text-small-semi` | 12px (`text-xs`) | 1.25rem (20px) | 600 | Small bold labels |
| `.text-base-regular` | 14px (`text-sm`) | 1.5rem (24px) | 400 | Standard body copy, form inputs |
| `.text-base-semi` | 14px (`text-sm`) | 1.5rem (24px) | 600 | Table headers, section labels |
| `.text-large-regular` | 16px (`text-base`) | 1.5rem (24px) | 400 | Larger body copy |
| `.text-large-semi` | 16px (`text-base`) | 1.5rem (24px) | 600 | Card titles, nav items |
| `.text-xl-regular` | 24px (`text-2xl`) | 36px | 400 | Sub-headings |
| `.text-xl-semi` | 24px (`text-2xl`) | 36px | 600 | Section headings |
| `.text-2xl-regular` | 30px | 48px | 400 | Page headings |
| `.text-2xl-semi` | 30px | 48px | 600 | Prominent page headings |
| `.text-3xl-regular` | 32px | 44px | 400 | Hero headings |
| `.text-3xl-semi` | 32px | 44px | 600 | Hero headings (bold variant) |

---

## 4. Layout Utilities

### Component Classes

**`.content-container`** — The standard page-width wrapper. Apply to every top-level section that needs to be constrained to the max layout width.

```css
/* Equivalent Tailwind */
max-w-[1440px] w-full mx-auto px-6
```

**`.contrast-btn`** — A turquoise outline button with full-circle rounding. Used for secondary CTAs on light backgrounds.

```css
/* Equivalent Tailwind */
px-4 py-2 border border-turquoise-500 text-turquoise-500 rounded-full
hover:bg-turquoise-500 hover:text-white hover:border-turquoise-500
transition-colors duration-200 ease-in
```

**`.no-scrollbar`** — Hides the scrollbar on any element while keeping scroll functionality. Cross-browser (Chrome/Safari, IE/Edge, Firefox).

### Custom Breakpoints

The project replaces all standard Tailwind breakpoints. Do not use `sm:`, `md:`, `lg:`, or `xl:` — they may resolve to unexpected values from the `@medusajs/ui-preset`.

| Token | Min-Width | Notes |
|---|---|---|
| `2xsmall:` | 320px | Smallest phones |
| `xsmall:` | 512px | Large phones / small tablets |
| `small:` | 1024px | Desktop (equivalent to standard `lg:` — 1024px) |
| `medium:` | 1280px | Large desktop (equivalent to standard `xl:`) |
| `large:` | 1440px | Wide desktop, matches `.content-container` max-width |
| `xlarge:` | 1680px | Extra-wide screens |
| `2xlarge:` | 1920px | Full HD and above |

> **Gotcha**: `small:` = 1024px. In standard Tailwind, `lg:` is also 1024px. Always use the project-specific tokens listed above. Never write `lg:text-xl` — write `small:text-xl`.

---

## 5. CSS Variables

Defined in `src/styles/globals.css` under `@layer base { :root { ... } }`. These are available globally in CSS. The Tailwind color tokens above are the preferred way to apply colors in component markup, but these variables are useful in custom CSS or when passing color values to third-party components.

| Variable | Value | Purpose |
|---|---|---|
| `--color-turquoise-400` | `#40E0D0` | Primary brand highlight |
| `--color-turquoise-500` | `#1F8A7E` | Primary interactive color |
| `--color-turquoise-50` | `#E8FAF7` | Light tinted background |
| `--color-sand-100` | `#F5F0EB` | Warm neutral background |
| `--color-gold-400` | `#D4A853` | Accent / gold highlight |
| `--color-brand-text` | `#1A1A2E` | Primary text color |
| `--color-brand-text-secondary` | `#64748B` | Secondary / muted text |

**Global focus style** — All focusable elements receive a turquoise outline via `:focus-visible`, providing accessible keyboard navigation across the entire site:

```css
*:focus-visible {
  outline: 2px solid #40E0D0;
  outline-offset: 2px;
}
```

---

## 6. Animations

All keyframes and animation utilities are defined in `tailwind.config.js` under `theme.extend.keyframes` and `theme.extend.animation`.

| Animation Name | Tailwind Class | Duration / Easing | Description | Used In |
|---|---|---|---|---|
| `ring` | `animate-ring` | 2.2s, cubic-bezier(0.5,0,0.5,1), infinite | Continuous 360° rotation | Loading spinners |
| `fade-in-right` | `animate-fade-in-right` | 0.3s, cubic-bezier(0.5,0,0.5,1), forwards | Fade in while sliding from right (+10px) | Slide-in panels, notifications |
| `fade-in-top` | `animate-fade-in-top` | 0.2s, cubic-bezier(0.5,0,0.5,1), forwards | Fade in while sliding down from above (-10px) | Dropdowns, tooltips |
| `fade-out-top` | `animate-fade-out-top` | 0.2s, cubic-bezier(0.5,0,0.5,1), forwards | Collapse height to 0 then hide | Dismissing banners |
| `accordion-open` | `animate-accordion-open` | 300ms, cubic-bezier(0.87,0,0.13,1), forwards | Expand from 0 to `--radix-accordion-content-height` | Accordion expand |
| `accordion-close` | `animate-accordion-close` | 300ms, cubic-bezier(0.87,0,0.13,1), forwards | Collapse from content height to 0 | Accordion collapse |
| `enter` | `animate-enter` | 200ms, ease-out | Scale from 0.9→1 and fade in | Modal / popover entrance |
| `leave` | `animate-leave` | 150ms, ease-in, forwards | Scale from 1→0.9 and fade out | Modal / popover exit |
| `slide-in` | `animate-slide-in` | 1.2s, cubic-bezier(.41,.73,.51,1.02) | Slide down from -100% translateY | Banner / announcement bar |
| `toast-in` | `animate-toast-in` | 0.25s, ease-out, forwards | Fade in + rise from +8px + scale from 0.96→1 | Toast notifications |

---

## 7. Border Radius

Custom border radius scale defined in `tailwind.config.js`. These values come from the `@medusajs/ui-preset` naming convention and are re-declared locally to ensure they are available regardless of preset resolution order.

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `none` | `0px` | `rounded-none` | Sharp corners, table cells |
| `soft` | `2px` | `rounded-soft` | Subtle rounding on tags, inputs |
| `base` | `4px` | `rounded-base` | Default buttons, cards |
| `rounded` | `8px` | `rounded-rounded` | Modals, dropdowns, panels |
| `large` | `16px` | `rounded-large` | Feature cards, image containers |
| `circle` | `9999px` | `rounded-circle` | Pills, avatar circles, `.contrast-btn` |

---

## 8. Dark Mode

Dark mode is configured at the Tailwind level with `darkMode: "class"` — meaning dark styles activate when a `dark` class is present on a parent element (typically `<html>`).

The root layout hard-codes `data-mode="light"` on the `<html>` element:

```tsx
// src/app/layout.tsx
<html lang="en" data-mode="light" className={`${inter.variable} ${playfair.variable}`}>
```

Dark mode is **not currently implemented** — no dark-mode component variants or `dark:` Tailwind utilities are in use. The infrastructure (Tailwind config + `data-mode` attribute) is in place and can be activated in the future by:

1. Adding `dark` to the `<html>` class list when a user preference is detected
2. Writing `dark:` variant utilities on components
