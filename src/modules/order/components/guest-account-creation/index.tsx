"use client"

import { createAccountAfterOrder } from "@lib/data/customer"
import { useToast } from "@lib/context/toast-context"
import { useActionState, useState } from "react"

type GuestAccountCreationProps = {
  email: string
  firstName: string
  lastName: string
}

const GuestAccountCreation = ({
  email,
  firstName,
  lastName,
}: GuestAccountCreationProps) => {
  const { addToast } = useToast()
  const [created, setCreated] = useState(false)

  const [state, formAction, isPending] = useActionState(
    async (
      prev: { success: boolean; error: string | null },
      formData: FormData
    ) => {
      const result = await createAccountAfterOrder(prev, formData)

      if (result.success) {
        setCreated(true)
        addToast("Account created successfully! You can now sign in.", "success")
      } else if (result.error) {
        addToast(result.error, "error")
      }

      return result
    },
    { success: false, error: null }
  )

  if (created) {
    return (
      <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-turquoise-100 flex items-center justify-center mx-auto mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-turquoise-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <p className="text-ui-fg-base font-medium">Account created!</p>
        <p className="text-ui-fg-subtle text-sm mt-1">
          You can now sign in with {email} to track your orders.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-sand-50 border border-sand-200 rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-turquoise-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-turquoise-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-ui-fg-base">
            Create an account to track your order
          </h3>
          <p className="text-sm text-ui-fg-subtle mt-1">
            Set a password to view order history, manage addresses, and check
            out faster next time.
          </p>
        </div>
      </div>

      <form action={formAction}>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="first_name" value={firstName} />
        <input type="hidden" name="last_name" value={lastName} />

        <div className="space-y-3">
          <div>
            <label
              htmlFor="guest-password"
              className="block text-sm font-medium text-ui-fg-base mb-1"
            >
              Password
            </label>
            <input
              id="guest-password"
              name="password"
              type="password"
              required
              minLength={8}
              pattern="^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$"
              title="At least 8 characters with one letter and one number"
              className="w-full px-4 py-2.5 border border-ui-border-base rounded-md bg-ui-bg-field text-ui-fg-base focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
              placeholder="At least 8 characters"
              data-testid="guest-password-input"
            />
            <p className="text-xs text-ui-fg-muted mt-1">
              Min 8 characters, at least 1 letter and 1 number
            </p>
          </div>

          {state.error && (
            <p className="text-sm text-rose-500">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-turquoise-600 hover:bg-turquoise-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="guest-create-account-button"
          >
            {isPending ? "Creating account..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default GuestAccountCreation
