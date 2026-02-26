import { test, expect } from "@playwright/test"
import { StorePage } from "./pages/store.page"
import { ProductPage } from "./pages/product.page"
import { CartPage } from "./pages/cart.page"

test.describe("Cart Management", () => {
  test("add item → update quantity → remove item → verify empty → add item again", async ({
    page,
  }) => {
    const storePage = new StorePage(page)
    const productPage = new ProductPage(page)
    const cartPage = new CartPage(page)

    // Step 1: Browse the store and add an item to cart
    await storePage.goto()
    await expect(storePage.productCards.first()).toBeVisible()
    await storePage.clickProduct(0)

    await productPage.waitForAddToCartEnabled()
    await productPage.addToCart()

    // Wait for the cart to process
    await page.waitForTimeout(1500)

    // Step 2: Navigate to cart and verify item is present
    await cartPage.goto()
    await expect(cartPage.container).toBeVisible()

    const productRows = page.getByTestId("product-row")
    await expect(productRows.first()).toBeVisible()

    // Verify initial quantity is 1
    const quantity = productRows.first().getByTestId("product-quantity")
    await expect(quantity).toHaveText("1")

    // Step 3: Increment quantity
    const incrementButton = productRows
      .first()
      .getByTestId("quantity-increment")
    await incrementButton.click()

    // Wait for quantity to update (optimistic UI + server sync)
    await expect(quantity).toHaveText("2", { timeout: 10_000 })

    // Step 4: Decrement quantity back to 1
    const decrementButton = productRows
      .first()
      .getByTestId("quantity-decrement")
    await decrementButton.click()
    await expect(quantity).toHaveText("1", { timeout: 10_000 })

    // Step 5: Remove the item
    const deleteButton = productRows
      .first()
      .getByTestId("product-delete-button")
    await deleteButton.click()

    // Verify the cart is empty
    const emptyMessage = page.getByTestId("empty-cart-message")
    await expect(emptyMessage).toBeVisible({ timeout: 15_000 })

    // Step 6: Go back to store and add an item again
    await storePage.goto()
    await expect(storePage.productCards.first()).toBeVisible()
    await storePage.clickProduct(0)

    await productPage.waitForAddToCartEnabled()
    await productPage.addToCart()

    await page.waitForTimeout(1500)

    // Verify the cart has an item again
    await cartPage.goto()
    await expect(cartPage.container).toBeVisible()
    await expect(productRows.first()).toBeVisible()
    await expect(
      productRows.first().getByTestId("product-quantity")
    ).toHaveText("1")
  })
})
