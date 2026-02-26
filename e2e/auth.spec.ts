import { test, expect } from "@playwright/test"
import { AccountPage } from "./pages/account.page"

/**
 * Generate a unique email for test isolation so parallel/repeat runs don't collide.
 */
function uniqueEmail() {
  return `e2e-auth-${Date.now()}@test.example.com`
}

const TEST_PASSWORD = "TestPassword123!"

test.describe("Authentication Flow", () => {
  test("register → log in → view dashboard → log out → log in again", async ({
    page,
  }) => {
    const account = new AccountPage(page)
    const testEmail = uniqueEmail()

    // Step 1: Navigate to account page (should see login form)
    await account.goto()
    await account.waitForLoginForm()

    // Step 2: Switch to register and create a new account
    await account.register({
      firstName: "E2E",
      lastName: "TestUser",
      email: testEmail,
      phone: "6135559999",
      password: TEST_PASSWORD,
    })

    // After successful registration, should redirect to account dashboard
    await account.waitForDashboard()
    await expect(account.accountPage).toBeVisible()
    await expect(account.accountNav).toBeVisible()

    // Verify the overview link is visible (dashboard is loaded)
    await expect(account.overviewLink).toBeVisible()

    // Step 3: Log out
    await account.logout()

    // Should be back on the login form
    await account.waitForLoginForm()
    await expect(account.loginPage).toBeVisible()

    // Step 4: Log in again with the same credentials
    await account.login(testEmail, TEST_PASSWORD)

    // Should see the account dashboard again
    await account.waitForDashboard()
    await expect(account.accountPage).toBeVisible()
    await expect(account.overviewLink).toBeVisible()
  })
})
