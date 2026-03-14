"use client"

import { useState, useRef, FormEvent } from "react"
import TurnstileField from "@modules/common/components/turnstile"
import HoneypotField from "@modules/common/components/honeypot-field"
import { verifyTurnstile } from "@lib/data/form-protection"

const SUBJECTS = [
  "General Inquiry",
  "Product Question",
  "Order Support",
  "Wholesale/Partnership",
  "Other",
] as const

type FormData = {
  name: string
  email: string
  subject: string
  message: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.name.trim()) {
    errors.name = "Name is required"
  }

  if (!data.email.trim()) {
    errors.email = "Email is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address"
  }

  if (!data.subject) {
    errors.subject = "Please select a subject"
  }

  if (!data.message.trim()) {
    errors.message = "Message is required"
  } else if (data.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters"
  }

  return errors
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)

    // Bot protection: check honeypot field
    if (formRef.current) {
      const nativeFormData = new globalThis.FormData(formRef.current)
      const honeypot = nativeFormData.get("website_url")
      if (typeof honeypot === "string" && honeypot.length > 0) {
        // Silently pretend success for bots
        await new Promise((resolve) => setTimeout(resolve, 500))
        setSubmitting(false)
        setSubmitted(true)
        return
      }

      // Verify Turnstile token server-side
      const turnstileToken = nativeFormData.get("cf-turnstile-response") as string | null
      const isValid = await verifyTurnstile(turnstileToken)
      if (!isValid) {
        setErrors({ message: "CAPTCHA verification failed. Please try again." })
        setSubmitting(false)
        return
      }
    }

    // Placeholder: log to console. Replace with Resend/SendGrid integration.
    console.log("Contact form submission:", formData)

    // Simulate brief network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-8 text-center">
        <div className="w-14 h-14 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-turquoise-600"
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
        <h3 className="font-playfair text-xl font-semibold text-turquoise-700 mb-2">
          Message Sent!
        </h3>
        <p className="text-gray-600 mb-6">
          Thank you for reaching out. We will get back to you within 1–2
          business days.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setFormData({ name: "", email: "", subject: "", message: "" })
            setErrors({})
          }}
          className="text-turquoise-600 font-medium hover:text-turquoise-700 transition-colors underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      <HoneypotField />
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={!!errors.name}
          className={`w-full border rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent transition-colors ${
            errors.name ? "border-rose-400 bg-rose-50" : "border-gray-300"
          }`}
          placeholder="Your full name"
        />
        {errors.name && (
          <p id="name-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={!!errors.email}
          className={`w-full border rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent transition-colors ${
            errors.email ? "border-rose-400 bg-rose-50" : "border-gray-300"
          }`}
          placeholder="your@email.com"
        />
        {errors.email && (
          <p id="email-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.email}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Subject <span className="text-rose-500">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          aria-describedby={errors.subject ? "subject-error" : undefined}
          aria-invalid={!!errors.subject}
          className={`w-full border rounded-md px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent transition-colors ${
            errors.subject ? "border-rose-400 bg-rose-50" : "border-gray-300"
          } ${!formData.subject ? "text-gray-400" : ""}`}
        >
          <option value="" disabled>
            Select a subject
          </option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p id="subject-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Message <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={formData.message}
          onChange={handleChange}
          aria-describedby={errors.message ? "message-error" : undefined}
          aria-invalid={!!errors.message}
          className={`w-full border rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent transition-colors resize-vertical ${
            errors.message ? "border-rose-400 bg-rose-50" : "border-gray-300"
          }`}
          placeholder="How can we help you?"
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.message}</p>
        )}
      </div>

      <TurnstileField />

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="bg-turquoise-600 text-white font-medium px-8 py-3 rounded-md hover:bg-turquoise-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  )
}
