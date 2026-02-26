"use client"

import React, { useEffect, useActionState } from "react"

import Input from "@modules/common/components/input"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { changeEmail } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const updateCustomerEmail = async (
    _currentState: Record<string, unknown>,
    formData: FormData
  ) => {
    const newEmail = formData.get("email") as string
    const currentPassword = formData.get("current_password") as string

    if (!currentPassword) {
      return { success: false, error: "Current password is required" }
    }

    if (newEmail === customer.email) {
      return { success: false, error: "New email must be different from current email" }
    }

    const result = await changeEmail(newEmail, currentPassword)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return { success: true, error: null }
  }

  const [state, formAction] = useActionState(updateCustomerEmail, {
    error: false as string | false | null,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Email"
        currentInfo={`${customer.email}`}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={typeof state.error === "string" ? state.error : undefined}
        clearState={clearState}
        data-testid="account-email-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="New email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={customer.email}
            data-testid="email-input"
          />
          <Input
            label="Current password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="current-password-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileEmail
