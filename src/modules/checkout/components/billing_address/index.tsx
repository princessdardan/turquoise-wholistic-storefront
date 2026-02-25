import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import React, { useState } from "react"
import ProvinceSelect from "../province-select"

const POSTAL_CODE_REGEX = /^[A-CEGHJ-NPR-TVXY]\d[A-CEGHJ-NPR-TV-Z]\s?\d[A-CEGHJ-NPR-TV-Z]\d$/i

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [formData, setFormData] = useState<any>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code": "ca",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

  const [postalCodeError, setPostalCodeError] = useState("")

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

    if (e.target.name === "billing_address.postal_code") {
      setPostalCodeError("")
    }
  }

  const validatePostalCode = () => {
    const postalCode = formData["billing_address.postal_code"]
    if (postalCode && !POSTAL_CODE_REGEX.test(postalCode.trim())) {
      setPostalCodeError("Enter a valid Canadian postal code (e.g., K1A 0B1)")
    } else {
      setPostalCodeError("")
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="billing-first-name-input"
        />
        <Input
          label="Last name"
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="billing-last-name-input"
        />
        <Input
          label="Address"
          name="billing_address.address_1"
          autoComplete="address-line1"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="billing-address-input"
        />
        <Input
          label="Company"
          name="billing_address.company"
          value={formData["billing_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="billing-company-input"
        />
        <div className="flex flex-col">
          <Input
            label="Postal code"
            name="billing_address.postal_code"
            autoComplete="postal-code"
            value={formData["billing_address.postal_code"]}
            onChange={handleChange}
            onBlur={validatePostalCode}
            required
            data-testid="billing-postal-input"
          />
          {postalCodeError && (
            <p className="text-rose-500 text-xs mt-1 ml-1">{postalCodeError}</p>
          )}
        </div>
        <Input
          label="City"
          name="billing_address.city"
          autoComplete="address-level2"
          value={formData["billing_address.city"]}
          onChange={handleChange}
        />
        <div>
          <input
            type="hidden"
            name="billing_address.country_code"
            value="ca"
          />
          <div className="flex items-center h-11 px-4 bg-ui-bg-field border border-ui-border-base rounded-md text-ui-fg-muted cursor-not-allowed">
            Canada
          </div>
        </div>
        <ProvinceSelect
          name="billing_address.province"
          autoComplete="address-level1"
          value={formData["billing_address.province"]}
          onChange={handleChange}
          required
          data-testid="billing-province-select"
        />
        <Input
          label="Phone"
          name="billing_address.phone"
          autoComplete="tel"
          value={formData["billing_address.phone"]}
          onChange={handleChange}
          data-testid="billing-phone-input"
        />
      </div>
    </>
  )
}

export default BillingAddress
