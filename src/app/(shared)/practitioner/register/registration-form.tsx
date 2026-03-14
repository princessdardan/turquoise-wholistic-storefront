"use client"

import { useActionState, useState } from "react"
import { registerPractitioner } from "@lib/data/practitioner"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type FormState = {
  success: boolean
  error: string | null
}

export default function RegistrationForm() {
  const [businessName, setBusinessName] = useState("")

  const submitAction = async (
    _prev: FormState,
    formData: FormData
  ): Promise<FormState> => {
    const business_name = formData.get("business_name") as string
    const license_number = formData.get("license_number") as string

    if (!business_name?.trim()) {
      return { success: false, error: "Business name is required." }
    }

    const result = await registerPractitioner({
      business_name: business_name.trim(),
      ...(license_number?.trim()
        ? { license_number: license_number.trim() }
        : {}),
    })

    if (!result.success) {
      if (result.error === "already_registered") {
        return {
          success: false,
          error: "already_registered",
        }
      }
      return {
        success: false,
        error: result.error || "Something went wrong. Please try again.",
      }
    }

    return { success: true, error: null }
  }

  const [state, formAction, isPending] = useActionState(submitAction, {
    success: false,
    error: null,
  })

  if (state.success) {
    return (
      <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-8 text-center max-w-md mx-auto">
        <div className="w-12 h-12 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-turquoise-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="font-playfair text-xl font-bold text-turquoise-800 mb-2">
          Application Submitted
        </h3>
        <p className="text-turquoise-700 mb-6">
          Your practitioner application is pending approval. We&apos;ll notify
          you once it&apos;s been reviewed.
        </p>
        <LocalizedClientLink
          href="/practitioner"
          className="text-turquoise-600 font-medium hover:text-turquoise-700 underline"
        >
          Back to Practitioner Program
        </LocalizedClientLink>
      </div>
    )
  }

  if (state.error === "already_registered") {
    return (
      <div className="bg-sand-50 border border-sand-200 rounded-lg p-8 text-center max-w-md mx-auto">
        <h3 className="font-playfair text-xl font-bold text-gray-900 mb-2">
          Already Registered
        </h3>
        <p className="text-gray-600 mb-6">
          You&apos;re already registered as a practitioner. Visit your dashboard
          to manage your codes and profile.
        </p>
        <LocalizedClientLink
          href="/practitioner/dashboard"
          className="inline-block bg-turquoise-600 text-white font-medium px-6 py-2.5 rounded-md hover:bg-turquoise-700 transition-colors"
        >
          Go to Dashboard
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <form action={formAction} className="max-w-md mx-auto space-y-6">
      <div>
        <label
          htmlFor="business_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Business Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Your practice or business name"
          className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="license_number"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          License Number{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="license_number"
          name="license_number"
          type="text"
          placeholder="Professional license or registration number"
          className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent transition-colors"
        />
      </div>

      {state.error && state.error !== "already_registered" && (
        <p role="alert" className="text-sm text-rose-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !businessName.trim()}
        className="w-full bg-turquoise-600 text-white font-medium px-8 py-3 rounded-md hover:bg-turquoise-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  )
}
