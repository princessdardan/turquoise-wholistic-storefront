"use client"

import { resetPassword } from "@lib/data/customer"
import { useToast } from "@lib/context/toast-context"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useRouter, useParams } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

type PasswordCheck = {
  label: string
  test: (password: string) => boolean
}

const PASSWORD_CHECKS: PasswordCheck[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "At least one letter", test: (p) => /[a-zA-Z]/.test(p) },
  { label: "At least one number", test: (p) => /\d/.test(p) },
]

const ResetPassword = ({
  token,
  email,
}: {
  token: string | null
  email: string | null
}) => {
  const [state, formAction] = useActionState(resetPassword, null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { addToast } = useToast()
  const router = useRouter()
  const { countryCode } = useParams()

  const passwordsMatch = password === confirmPassword
  const allChecksPassed = PASSWORD_CHECKS.every((check) => check.test(password))
  const isValid = allChecksPassed && passwordsMatch && confirmPassword.length > 0

  useEffect(() => {
    if (state?.success) {
      addToast("Password reset successfully", "success")
      router.push(`/${countryCode}/account`)
    }
  }, [state?.success, addToast, router, countryCode])

  if (!token || !email) {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center"
        data-testid="reset-password-page"
      >
        <h1 className="text-large-semi uppercase mb-6">Invalid Reset Link</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          This password reset link is invalid or has expired.
        </p>
        <LocalizedClientLink
          href="/account/forgot-password"
          className="text-turquoise-500 underline text-base-regular"
        >
          Request a new link
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="reset-password-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Reset Password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your new password below.
      </p>

      {state?.error ? (
        <div className="w-full mb-6">
          <div className="bg-rose-50 border border-rose-200 rounded-md p-4 mb-4">
            <p className="text-sm text-rose-700">{state.error}</p>
          </div>
          <LocalizedClientLink
            href="/account/forgot-password"
            className="text-turquoise-500 underline text-base-regular"
          >
            Request a new link
          </LocalizedClientLink>
        </div>
      ) : (
        <form className="w-full" action={formAction}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />
          <div className="flex flex-col w-full gap-y-2">
            <Input
              label="New Password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              data-testid="reset-password-input"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm Password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              data-testid="reset-confirm-password-input"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Password strength validation */}
          {password.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {PASSWORD_CHECKS.map((check) => {
                const passed = check.test(password)
                return (
                  <div
                    key={check.label}
                    className="flex items-center gap-2 text-small-regular"
                  >
                    <span
                      className={
                        passed ? "text-turquoise-500" : "text-ui-fg-subtle"
                      }
                    >
                      {passed ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        passed ? "text-brand-text" : "text-ui-fg-subtle"
                      }
                    >
                      {check.label}
                    </span>
                  </div>
                )
              })}
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 text-small-regular">
                  <span
                    className={
                      passwordsMatch ? "text-turquoise-500" : "text-rose-500"
                    }
                  >
                    {passwordsMatch ? "✓" : "✗"}
                  </span>
                  <span
                    className={
                      passwordsMatch ? "text-brand-text" : "text-rose-500"
                    }
                  >
                    Passwords match
                  </span>
                </div>
              )}
            </div>
          )}

          <SubmitButton
            data-testid="reset-password-submit"
            className={`w-full mt-6 ${!isValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Reset password
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

export default ResetPassword
