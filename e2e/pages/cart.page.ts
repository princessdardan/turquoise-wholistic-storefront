import { type Page, type Locator } from "@playwright/test"

export class CartPage {
  readonly page: Page
  readonly container: Locator
  readonly checkoutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.container = page.getByTestId("cart-container")
    this.checkoutButton = page.getByTestId("checkout-button")
  }

  async goto(countryCode = "ca") {
    await this.page.goto(`/${countryCode}/cart`)
    await this.container.waitFor({ state: "visible" })
  }

  async goToCheckout() {
    await this.checkoutButton.click()
  }
}
