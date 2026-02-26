import { type Page, type Locator } from "@playwright/test"

export class WishlistPage {
  readonly page: Page
  readonly pageWrapper: Locator
  readonly itemsContainer: Locator
  readonly items: Locator
  readonly emptyState: Locator
  readonly browseProductsButton: Locator

  constructor(page: Page) {
    this.page = page
    this.pageWrapper = page.getByTestId("wishlist-page-wrapper")
    this.itemsContainer = page.getByTestId("wishlist-items-container")
    this.items = page.getByTestId("wishlist-item")
    this.emptyState = page.getByTestId("wishlist-empty-state")
    this.browseProductsButton = page.getByTestId("browse-products-button")
  }

  async goto(countryCode = "ca") {
    await this.page.goto(`/${countryCode}/account/wishlist`)
    await this.pageWrapper.waitFor({ state: "visible" })
  }

  async removeItem(index = 0) {
    const item = this.items.nth(index)
    await item.getByTestId("wishlist-remove-item").click()
  }

  async addItemToCart(index = 0) {
    const item = this.items.nth(index)
    await item.getByTestId("wishlist-add-to-cart").click()
  }

  async getItemCount() {
    return this.items.count()
  }
}
