"use client"

import { requestPasswordToken } from "@lib/data/customer"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState } from "react"

const ForgotPassword = () => {
  const [state, formAction] = useActionState(requestPasswordToken, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="forgot-password-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Forgot Password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>

      {state?.success ? (
        <div className="w-full">
          <div className="bg-turquoise-50 border border-turquoise-400 rounded-md p-4 mb-6">
            <p className="text-sm text-brand-text">
              If an account exists with that email, you will receive a reset
              link.
            </p>
          </div>
          <LocalizedClientLink
            href="/account"
            className="text-ui-fg-base text-small-regular underline"
          >
            Back to sign in
          </LocalizedClientLink>
        </div>
      ) : (
        <form className="w-full" action={formAction}>
          <div className="flex flex-col w-full gap-y-2">
            <Input
              label="Email"
              name="email"
              type="email"
              title="Enter a valid email address."
              autoComplete="email"
              required
              data-testid="forgot-password-email-input"
            />
          </div>
          <SubmitButton
            data-testid="forgot-password-submit"
            className="w-full mt-6"
          >
            Send reset link
          </SubmitButton>
          <div className="mt-6 text-center">
            <LocalizedClientLink
              href="/account"
              className="text-ui-fg-base text-small-regular underline"
            >
              Back to sign in
            </LocalizedClientLink>
          </div>
        </form>
      )}
    </div>
  )
}

export default ForgotPassword
