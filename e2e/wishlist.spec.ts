import { test, expect } from "@playwright/test"
import { AccountPage } from "./pages/account.page"
import { StorePage } from "./pages/store.page"
import { WishlistPage } from "./pages/wishlist.page"

function uniqueEmail() {
  return `e2e-wish-${Date.now()}@test.example.com`
}

const TEST_PASSWORD = "TestPassword123!"

test.describe("Wishlist Flow", () => {
  test("log in → add product to wishlist → view wishlist → verify product → remove from wishlist", async ({
    page,
  }) => {
    const account = new AccountPage(page)
    const storePage = new StorePage(page)
    const wishlistPage = new WishlistPage(page)
    const testEmail = uniqueEmail()

    // Step 1: Register a new account (needed for wishlist access)
    await account.goto()
    await account.waitForLoginForm()
    await account.register({
      firstName: "E2E",
      lastName: "WishlistUser",
      email: testEmail,
      password: TEST_PASSWORD,
    })
    await account.waitForDashboard()

    // Step 2: Navigate to store and find a product
    await storePage.goto()
    await expect(storePage.productCards.first()).toBeVisible()

    // Step 3: Click on a product and add to wishlist using the heart button
    await storePage.clickProduct(0)

    // Wait for the product page to load
    const productContainer = page.getByTestId("product-container")
    await productContainer.waitFor({ state: "visible" })

    // Click the "Add to wishlist" button (aria-label based selector)
    const addToWishlistButton = page.getByRole("button", {
      name: "Add to wishlist",
    })
    await addToWishlistButton.waitFor({ state: "visible" })
    await addToWishlistButton.click()

    // Wait for the wishlist toggle to complete (button text changes)
    await expect(
      page.getByRole("button", { name: "Remove from wishlist" })
    ).toBeVisible({ timeout: 10_000 })

    // Step 4: Navigate to the wishlist page
    await wishlistPage.goto()

    // Step 5: Verify the product is listed in the wishlist
    await expect(wishlistPage.itemsContainer).toBeVisible()
    const itemCount = await wishlistPage.getItemCount()
    expect(itemCount).toBeGreaterThanOrEqual(1)

    // Verify the first wishlist item has a remove button
    await expect(
      wishlistPage.items.first().getByTestId("wishlist-remove-item")
    ).toBeVisible()

    // Step 6: Remove the product from the wishlist
    await wishlistPage.removeItem(0)

    // Verify the wishlist is now empty
    await expect(wishlistPage.emptyState).toBeVisible({ timeout: 10_000 })
  })
})
