# Testing

## Table of Contents

1. [Overview](#overview)
2. [Unit Tests (Jest)](#unit-tests-jest)
3. [Writing Unit Tests](#writing-unit-tests)
4. [E2E Tests (Playwright)](#e2e-tests-playwright)
5. [Running E2E Tests](#running-e2e-tests)
6. [Writing E2E Tests](#writing-e2e-tests)

---

## Overview

The storefront has two independent test suites:

| Suite | Tool | Scope | Location |
|---|---|---|---|
| Unit | Jest + ts-jest | Pure utility functions in `src/lib/util/` | `src/lib/util/__tests__/` |
| E2E | Playwright | Full user flows (auth, cart, checkout, wishlist) | `e2e/` |

Unit tests run entirely in Node with no browser and no running server. E2E tests run against the live application and require both the storefront dev server and the Medusa backend to be running.

---

## Unit Tests (Jest)

### Configuration

Config file: `jest.config.ts`

```ts
const config: Config = {
  preset: "ts-jest",          // TypeScript via ts-jest (not SWC)
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@pages/(.*)$": "<rootDir>/src/pages/$1",
  },
  coverageDirectory: "jest-coverage",
  collectCoverageFrom: ["src/lib/util/**/*.ts"],
}
```

Key points:
- Transformer: `ts-jest` (the Medusa backend uses `@swc/jest` — these are different)
- Test discovery: files matching `**/__tests__/**/*.test.ts` under `src/`
- Coverage: collected from `src/lib/util/**/*.ts`, written to `jest-coverage/`
- Aliases (`@lib/`, `@modules/`, `@pages/`) are resolved in tests

### Commands

```bash
yarn test                                          # Run all unit tests
yarn test -- --testPathPattern=money               # Run a single file by name
yarn test:coverage                                 # Run with coverage report
```

Coverage output lands in `jest-coverage/`. Open `jest-coverage/lcov-report/index.html` in a browser to view the HTML report.

### Existing Test Files

| File | Utility tested | What it covers |
|---|---|---|
| `compare-addresses.test.ts` | `compare-addresses.ts` | Address equality comparison |
| `env.test.ts` | `env.ts` | Environment variable helpers |
| `get-locale-header.test.ts` | `get-locale-header.ts` | Accept-Language header construction |
| `get-percentage-diff.test.ts` | `get-percentage-diff.ts` | Percentage difference calculation |
| `get-product-price.test.ts` | `get-product-price.ts` | Cheapest/calculated price extraction |
| `isEmpty.test.ts` | `isEmpty.ts` | Empty value detection |
| `medusa-error.test.ts` | `medusa-error.ts` | Medusa error normalisation |
| `money.test.ts` | `money.ts` | `convertToLocale` currency formatting |
| `product.test.ts` | `product.ts` | Product helper utilities |
| `repeat.test.ts` | `repeat.ts` | Array repeat helper |
| `sort-products.test.ts` | `sort-products.ts` | Price and date product sorting |
| `turnstile.test.ts` | `turnstile.ts` | Turnstile/honeypot form protection |

---

## Writing Unit Tests

### File Naming

Place new test files at `src/lib/util/__tests__/<module-name>.test.ts`, mirroring the source file name.

### Import Pattern

Use the `@lib` alias — do not use relative paths crossing directory boundaries:

```ts
import { convertToLocale } from "@lib/util/money"
```

### Test Structure

Follow the `describe` / `it` / `expect` pattern:

```ts
import { myUtil } from "@lib/util/my-util"

describe("myUtil", () => {
  it("handles the happy path", () => {
    const result = myUtil("input")
    expect(result).toBe("expected output")
  })

  it("returns a fallback for empty input", () => {
    const result = myUtil("")
    expect(result).toBe("")
  })
})
```

Keep each `it` block focused on a single behaviour. Use `describe` blocks to group related cases. Avoid testing implementation details — assert on return values and observable side effects only.

---

## E2E Tests (Playwright)

### Configuration

Config file: `playwright.config.ts`

| Setting | Value |
|---|---|
| Test directory | `./e2e` |
| Base URL | `http://localhost:8000` |
| Browser | Chromium only (Desktop Chrome) |
| Workers | 1 |
| Parallel | `false` |
| Action timeout | 15 000 ms |
| Navigation timeout | 30 000 ms |
| Retries | 2 in CI, 0 locally |
| Screenshots | On failure only |
| Traces | On first retry only |
| Reporter | HTML (never auto-opens) |
| Dev server | Not auto-started — must be running |

### Spec Files

| File | User flow covered |
|---|---|
| `e2e/auth.spec.ts` | Register, log in, log out |
| `e2e/cart.spec.ts` | Add item, update quantity, remove item, verify empty cart |
| `e2e/checkout.spec.ts` | Full checkout: address, shipping, payment, order confirmation |
| `e2e/wishlist.spec.ts` | Add to wishlist, view wishlist, remove from wishlist |

### Page Objects

All page objects live in `e2e/pages/` and are exported from the barrel file `e2e/pages/index.ts`.

| File | Class | Wraps |
|---|---|---|
| `account.page.ts` | `AccountPage` | `/[countryCode]/account` |
| `cart.page.ts` | `CartPage` | `/[countryCode]/cart` |
| `checkout.page.ts` | `CheckoutPage` | `/[countryCode]/checkout` |
| `product.page.ts` | `ProductPage` | Product detail page |
| `store.page.ts` | `StorePage` | `/[countryCode]/store` |
| `wishlist.page.ts` | `WishlistPage` | Wishlist UI |

---

## Running E2E Tests

### Prerequisites

Both servers must be running before executing any E2E test. Playwright does not start them automatically.

```bash
# Terminal 1 — Medusa backend (port 9000)
cd ../turquoise-wholistic
npm run dev

# Terminal 2 — Next.js storefront (port 8000)
yarn dev
```

### Commands

```bash
yarn test:e2e                # Run all E2E tests (headless Chromium)
yarn test:e2e:headed         # Run with a visible browser window (useful for debugging)
yarn test:e2e:report         # Open the last HTML report in the browser
```

### CI Behaviour

In CI (`process.env.CI` set), Playwright enables `forbidOnly` (fails if `.only` is committed) and sets retries to 2. Locally, tests run once with no retries.

---

## Writing E2E Tests

### Page Object Model

Each page or major UI section gets a corresponding class in `e2e/pages/`. The class owns:
- Locator declarations (typed `Locator` fields)
- A `goto()` method that navigates and waits for the page to be ready
- Action helpers that encapsulate multi-step interactions

**Example page object** (`e2e/pages/example.page.ts`):

```ts
import { type Page, type Locator } from "@playwright/test"

export class ExamplePage {
  readonly page: Page
  readonly heading: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByTestId("example-heading")
  }

  async goto(countryCode = "ca") {
    await this.page.goto(`/${countryCode}/example`)
    await this.heading.waitFor({ state: "visible" })
  }
}
```

Export the new class from `e2e/pages/index.ts`:

```ts
export { ExamplePage } from "./example.page"
```

**Example spec** (`e2e/example.spec.ts`):

```ts
import { test, expect } from "@playwright/test"
import { ExamplePage } from "./pages"

test.describe("Example flow", () => {
  test("heading is visible on load", async ({ page }) => {
    const examplePage = new ExamplePage(page)
    await examplePage.goto()
    await expect(examplePage.heading).toBeVisible()
  })
})
```

### Timeouts

Prefer Playwright's built-in waiting over `page.waitForTimeout()`. When explicit waits are unavoidable, keep them short and document why:

```ts
// Waits up to the configured 15 s action timeout
await expect(locator).toBeVisible()

// Navigation waits up to 30 s automatically
await page.goto("/ca/store")
```

Use `{ timeout: N }` on individual assertions only when the default is known to be insufficient (e.g., slow server-side state synchronisation).
