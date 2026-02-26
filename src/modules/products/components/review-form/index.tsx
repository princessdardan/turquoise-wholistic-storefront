"use client"

import { useState } from "react"
import { submitReview } from "@lib/data/reviews"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ReviewFormProps = {
  productId: string
  isLoggedIn: boolean
}

export default function ReviewForm({ productId, isLoggedIn }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="rounded-lg border border-turquoise-200 bg-turquoise-50 px-6 py-8 text-center">
        <p className="text-sm font-medium text-turquoise-800">
          Thank you! Your review has been submitted for approval.
        </p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-gray-100 bg-sand-50 px-6 py-8 text-center">
        <p className="text-sm text-ui-fg-subtle">
          <LocalizedClientLink
            href="/account"
            className="font-medium text-turquoise-600 underline underline-offset-2 hover:text-turquoise-700"
          >
            Sign in
          </LocalizedClientLink>{" "}
          to write a review
        </p>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-turquoise-600 px-6 py-2.5 text-sm font-medium text-turquoise-600 transition-colors hover:bg-turquoise-50"
      >
        Write a Review
      </button>
    )
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!rating) newErrors.rating = "Please select a rating"
    if (!title.trim()) newErrors.title = "Title is required"
    if (!body.trim()) newErrors.body = "Review body is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setErrors({})

    const result = await submitReview(productId, {
      rating,
      title: title.trim(),
      body: body.trim(),
    })

    setSubmitting(false)

    if (result.success) {
      setSubmitted(true)
    } else {
      setErrors({ form: result.error || "Something went wrong" })
    }
  }

  const displayRating = hoveredRating || rating

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-100 bg-white p-6"
    >
      <h3 className="mb-4 font-serif text-lg text-brand-text">
        Write a Review
      </h3>

      {/* Star Rating Selector */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-brand-text">
          Rating
        </label>
        <div
          className="flex items-center gap-x-1"
          onMouseLeave={() => setHoveredRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              className="p-0.5 transition-transform hover:scale-110"
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <svg
                className="h-7 w-7"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 13.88 5.06 16.7l.94-5.49-4-3.9 5.53-.8L10 1.5z"
                  fill="currentColor"
                  className={
                    star <= displayRating
                      ? "text-gold-400"
                      : "text-gray-200"
                  }
                />
              </svg>
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-sm text-ui-fg-subtle">
              {displayRating} of 5
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="mt-1 text-xs text-rose-500">{errors.rating}</p>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label
          htmlFor="review-title"
          className="mb-1.5 block text-sm font-medium text-brand-text"
        >
          Title
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          aria-describedby={errors.title ? "review-title-error" : undefined}
          aria-invalid={!!errors.title}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-brand-text placeholder:text-gray-400 focus:border-turquoise-500 focus:outline-none focus:ring-1 focus:ring-turquoise-500"
        />
        {errors.title && (
          <p id="review-title-error" role="alert" className="mt-1 text-xs text-rose-500">{errors.title}</p>
        )}
      </div>

      {/* Body */}
      <div className="mb-4">
        <label
          htmlFor="review-body"
          className="mb-1.5 block text-sm font-medium text-brand-text"
        >
          Review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts about this product"
          rows={4}
          aria-describedby={errors.body ? "review-body-error" : undefined}
          aria-invalid={!!errors.body}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-brand-text placeholder:text-gray-400 focus:border-turquoise-500 focus:outline-none focus:ring-1 focus:ring-turquoise-500"
        />
        {errors.body && (
          <p id="review-body-error" role="alert" className="mt-1 text-xs text-rose-500">{errors.body}</p>
        )}
      </div>

      {errors.form && (
        <p role="alert" className="mb-4 text-sm text-rose-500">{errors.form}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-x-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-turquoise-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-turquoise-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            setRating(0)
            setTitle("")
            setBody("")
            setErrors({})
          }}
          className="text-sm text-ui-fg-subtle hover:text-brand-text"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
