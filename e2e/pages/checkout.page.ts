import { type Page, type Locator } from "@playwright/test"

export class CheckoutPage {
  readonly page: Page

  // Address step
  readonly editAddressButton: Locator
  readonly submitAddressButton: Locator
  readonly shippingFirstNameInput: Locator
  readonly shippingLastNameInput: Locator
  readonly shippingAddressInput: Locator
  readonly shippingPostalCodeInput: Locator
  readonly shippingCityInput: Locator
  readonly shippingProvinceSelect: Locator
  readonly shippingEmailInput: Locator
  readonly shippingPhoneInput: Locator
  readonly shippingAddressSummary: Locator
  readonly shippingContactSummary: Locator

  // Delivery step
  readonly editDeliveryButton: Locator
  readonly deliveryOptionsContainer: Locator
  readonly deliveryOptionRadios: Locator
  readonly submitDeliveryButton: Locator

  // Payment step
  readonly editPaymentButton: Locator
  readonly submitPaymentButton: Locator
  readonly paymentMethodSummary: Locator

  // Review step
  readonly submitOrderButton: Locator

  constructor(page: Page) {
    this.page = page

    // Address
    this.editAddressButton = page.getByTestId("edit-address-button")
    this.submitAddressButton = page.getByTestId("submit-address-button")
    this.shippingFirstNameInput = page.getByTestId("shipping-first-name-input")
    this.shippingLastNameInput = page.getByTestId("shipping-last-name-input")
    this.shippingAddressInput = page.getByTestId("shipping-address-input")
    this.shippingPostalCodeInput = page.getByTestId(
      "shipping-postal-code-input"
    )
    this.shippingCityInput = page.getByTestId("shipping-city-input")
    this.shippingProvinceSelect = page.getByTestId("shipping-province-select")
    this.shippingEmailInput = page.getByTestId("shipping-email-input")
    this.shippingPhoneInput = page.getByTestId("shipping-phone-input")
    this.shippingAddressSummary = page.getByTestId("shipping-address-summary")
    this.shippingContactSummary = page.getByTestId("shipping-contact-summary")

    // Delivery
    this.editDeliveryButton = page.getByTestId("edit-delivery-button")
    this.deliveryOptionsContainer = page.getByTestId(
      "delivery-options-container"
    )
    this.deliveryOptionRadios = page.getByTestId("delivery-option-radio")
    this.submitDeliveryButton = page.getByTestId(
      "submit-delivery-option-button"
    )

    // Payment
    this.editPaymentButton = page.getByTestId("edit-payment-button")
    this.submitPaymentButton = page.getByTestId("submit-payment-button")
    this.paymentMethodSummary = page.getByTestId("payment-method-summary")

    // Review
    this.submitOrderButton = page.getByTestId("submit-order-button")
  }

  async fillShippingAddress(address: {
    firstName: string
    lastName: string
    address: string
    postalCode: string
    city: string
    province: string
    email: string
    phone?: string
  }) {
    await this.shippingFirstNameInput.fill(address.firstName)
    await this.shippingLastNameInput.fill(address.lastName)
    await this.shippingAddressInput.fill(address.address)
    await this.shippingPostalCodeInput.fill(address.postalCode)
    await this.shippingCityInput.fill(address.city)
    await this.shippingProvinceSelect.selectOption(address.province)
    await this.shippingEmailInput.fill(address.email)
    if (address.phone) {
      await this.shippingPhoneInput.fill(address.phone)
    }
  }

  async submitAddress() {
    await this.submitAddressButton.click()
  }

  async selectFirstDeliveryOption() {
    const firstOption = this.deliveryOptionRadios.first()
    await firstOption.waitFor({ state: "visible" })
    await firstOption.click()
  }

  async submitDelivery() {
    await this.submitDeliveryButton.click()
  }

  async selectManualPayment() {
    // Click on the manual payment option (non-Stripe)
    const manualPayment = this.page.locator(
      '[data-testid="payment-container"]'
    )
    if (await manualPayment.isVisible()) {
      await manualPayment.click()
    }
  }

  async submitPayment() {
    await this.submitPaymentButton.click()
  }
}
