import { type Page, type Locator } from "@playwright/test"

export class AccountPage {
  readonly page: Page

  // Login form
  readonly loginPage: Locator
  readonly loginEmailInput: Locator
  readonly loginPasswordInput: Locator
  readonly signInButton: Locator
  readonly loginErrorMessage: Locator
  readonly forgotPasswordLink: Locator
  readonly switchToRegisterButton: Locator

  // Register form
  readonly registerPage: Locator
  readonly registerFirstNameInput: Locator
  readonly registerLastNameInput: Locator
  readonly registerEmailInput: Locator
  readonly registerPhoneInput: Locator
  readonly registerPasswordInput: Locator
  readonly registerSubmitButton: Locator
  readonly registerErrorMessage: Locator

  // Account dashboard
  readonly accountPage: Locator
  readonly accountNav: Locator
  readonly overviewLink: Locator
  readonly profileLink: Locator
  readonly ordersLink: Locator
  readonly wishlistLink: Locator
  readonly logoutButton: Locator

  constructor(page: Page) {
    this.page = page

    // Login
    this.loginPage = page.getByTestId("login-page")
    this.loginEmailInput = page.getByTestId("login-page").getByTestId("email-input")
    this.loginPasswordInput = page.getByTestId("login-page").getByTestId("password-input")
    this.signInButton = page.getByTestId("sign-in-button")
    this.loginErrorMessage = page.getByTestId("login-error-message")
    this.forgotPasswordLink = page.getByTestId("forgot-password-link")
    this.switchToRegisterButton = page.getByTestId("login-page").getByTestId("register-button")

    // Register
    this.registerPage = page.getByTestId("register-page")
    this.registerFirstNameInput = page.getByTestId("register-page").getByTestId("first-name-input")
    this.registerLastNameInput = page.getByTestId("register-page").getByTestId("last-name-input")
    this.registerEmailInput = page.getByTestId("register-page").getByTestId("email-input")
    this.registerPhoneInput = page.getByTestId("register-page").getByTestId("phone-input")
    this.registerPasswordInput = page.getByTestId("register-page").getByTestId("password-input")
    this.registerSubmitButton = page.getByTestId("register-page").getByTestId("register-button")
    this.registerErrorMessage = page.getByTestId("register-error")

    // Dashboard (use desktop nav)
    this.accountPage = page.getByTestId("account-page")
    this.accountNav = page.getByTestId("account-nav")
    this.overviewLink = page.getByTestId("account-nav").getByTestId("overview-link")
    this.profileLink = page.getByTestId("account-nav").getByTestId("profile-link")
    this.ordersLink = page.getByTestId("account-nav").getByTestId("orders-link")
    this.wishlistLink = page.getByTestId("account-nav").getByTestId("wishlist-link")
    this.logoutButton = page.getByTestId("account-nav").getByTestId("logout-button")
  }

  async goto(countryCode = "ca") {
    await this.page.goto(`/${countryCode}/account`)
  }

  async login(email: string, password: string) {
    await this.loginEmailInput.waitFor({ state: "visible" })
    await this.loginEmailInput.fill(email)
    await this.loginPasswordInput.fill(password)
    await this.signInButton.click()
  }

  async register(user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password: string
  }) {
    await this.switchToRegisterButton.waitFor({ state: "visible" })
    await this.switchToRegisterButton.click()
    await this.registerFirstNameInput.waitFor({ state: "visible" })
    await this.registerFirstNameInput.fill(user.firstName)
    await this.registerLastNameInput.fill(user.lastName)
    await this.registerEmailInput.fill(user.email)
    if (user.phone) {
      await this.registerPhoneInput.fill(user.phone)
    }
    await this.registerPasswordInput.fill(user.password)
    await this.registerSubmitButton.click()
  }

  async logout() {
    await this.logoutButton.click()
  }

  async waitForDashboard() {
    await this.accountPage.waitFor({ state: "visible" })
    await this.accountNav.waitFor({ state: "visible" })
  }

  async waitForLoginForm() {
    await this.loginPage.waitFor({ state: "visible" })
  }

  async navigateToWishlist() {
    await this.wishlistLink.click()
  }
}
