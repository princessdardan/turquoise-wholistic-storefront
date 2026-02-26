import { test, expect } from "@playwright/test"
import { StorePage } from "./pages/store.page"
import { ProductPage } from "./pages/product.page"
import { CartPage } from "./pages/cart.page"
import { CheckoutPage } from "./pages/checkout.page"

const TEST_ADDRESS = {
  firstName: "Jane",
  lastName: "Doe",
  address: "123 Wellness Ave",
  postalCode: "K1A 0B1",
  city: "Ottawa",
  province: "ON",
  email: "jane.doe@example.com",
  phone: "6135551234",
}

test.describe("Checkout Flow", () => {
  test("browse store → add to cart → complete checkout steps", async ({
    page,
  }) => {
    const storePage = new StorePage(page)
    const productPage = new ProductPage(page)
    const cartPage = new CartPage(page)
    const checkoutPage = new CheckoutPage(page)

    // Step 1: Browse the store
    await storePage.goto()
    await expect(storePage.pageTitle).toBeVisible()
    await expect(storePage.productCards.first()).toBeVisible()

    // Step 2: Select the first product
    await storePage.clickProduct(0)
    await expect(productPage.container).toBeVisible()

    // Step 3: Add to cart
    await productPage.waitForAddToCartEnabled()
    await productPage.addToCart()

    // Wait for the cart to update (cart dropdown or notification)
    await page.waitForTimeout(1500)

    // Step 4: Navigate to cart
    await cartPage.goto()
    await expect(cartPage.container).toBeVisible()
    await expect(cartPage.checkoutButton).toBeVisible()

    // Step 5: Proceed to checkout
    await cartPage.goToCheckout()
    await expect(page).toHaveURL(/checkout/)

    // Step 6: Fill shipping address
    await checkoutPage.shippingFirstNameInput.waitFor({ state: "visible" })
    await checkoutPage.fillShippingAddress(TEST_ADDRESS)
    await checkoutPage.submitAddress()

    // Wait for address to be saved and delivery step to open
    await expect(checkoutPage.shippingAddressSummary).toBeVisible({
      timeout: 15_000,
    })

    // Step 7: Select shipping method
    await checkoutPage.deliveryOptionsContainer.waitFor({ state: "visible" })
    await checkoutPage.selectFirstDeliveryOption()

    // Wait for shipping method to be set
    await expect(checkoutPage.submitDeliveryButton).toBeEnabled({
      timeout: 10_000,
    })
    await checkoutPage.submitDelivery()

    // Step 8: Select payment method — wait for payment step
    await checkoutPage.submitPaymentButton.waitFor({ state: "visible" })

    // Select the first available payment option (manual/test payment)
    // The RadioGroup auto-selects when clicked
    await checkoutPage.submitPayment()

    // Step 9: Verify we reached the review step
    await expect(page).toHaveURL(/step=review/)
    await expect(
      page.getByRole("heading", { name: "Review" })
    ).toBeVisible()

    // Verify the order summary is visible
    await expect(checkoutPage.submitOrderButton).toBeVisible()
  })
})
