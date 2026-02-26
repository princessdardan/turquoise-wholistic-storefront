import { type Page, type Locator } from "@playwright/test"

export class StorePage {
  readonly page: Page
  readonly container: Locator
  readonly pageTitle: Locator
  readonly productsList: Locator
  readonly productCards: Locator

  constructor(page: Page) {
    this.page = page
    this.container = page.getByTestId("category-container")
    this.pageTitle = page.getByTestId("store-page-title")
    this.productsList = page.getByTestId("products-list")
    this.productCards = page.getByTestId("product-wrapper")
  }

  async goto(countryCode = "ca") {
    await this.page.goto(`/${countryCode}/store`)
    await this.container.waitFor({ state: "visible" })
  }

  async clickProduct(index = 0) {
    const card = this.productCards.nth(index)
    await card.waitFor({ state: "visible" })
    await card.click()
  }

  async clickProductByTitle(title: string) {
    const card = this.page
      .getByTestId("product-wrapper")
      .filter({ has: this.page.getByTestId("product-title").getByText(title) })
    await card.click()
  }
}
