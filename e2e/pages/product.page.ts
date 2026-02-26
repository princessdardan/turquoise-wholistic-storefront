import { type Page, type Locator } from "@playwright/test"

export class ProductPage {
  readonly page: Page
  readonly container: Locator
  readonly addToCartButton: Locator
  readonly productOptions: Locator

  constructor(page: Page) {
    this.page = page
    this.container = page.getByTestId("product-container")
    this.addToCartButton = page.getByTestId("add-product-button")
    this.productOptions = page.getByTestId("product-options")
  }

  async goto(handle: string, countryCode = "ca") {
    await this.page.goto(`/${countryCode}/products/${handle}`)
    await this.container.waitFor({ state: "visible" })
  }

  async addToCart() {
    await this.addToCartButton.click()
  }

  async waitForAddToCartEnabled() {
    await this.addToCartButton.waitFor({ state: "visible" })
    // Wait until button text is "Add to cart" (not "Out of stock" or loading)
    await this.page.waitForFunction(() => {
      const btn = document.querySelector('[data-testid="add-product-button"]')
      return btn && !btn.hasAttribute("disabled")
    })
  }
}
