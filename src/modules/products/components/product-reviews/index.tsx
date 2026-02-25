import { getProductReviews, ProductReview } from "@lib/data/reviews"

type ProductReviewsProps = {
  productId: string
}

export default async function ProductReviews({
  productId,
}: ProductReviewsProps) {
  const data = await getProductReviews(productId, 0, 50)

  const { reviews, average_rating, total_count } = data

  return (
    <div className="flex flex-col gap-y-8">
      {/* Header with average rating */}
      <div className="flex flex-col gap-y-1">
        <h2 className="font-serif text-2xl text-brand-text">
          Customer Reviews
        </h2>
        {total_count > 0 ? (
          <div className="flex items-center gap-x-3">
            <StarRating rating={average_rating} size="lg" />
            <span className="text-lg font-medium text-brand-text">
              {average_rating.toFixed(1)}
            </span>
            <span className="text-sm text-ui-fg-subtle">
              Based on {total_count} {total_count === 1 ? "review" : "reviews"}
            </span>
          </div>
        ) : (
          <p className="text-sm text-ui-fg-subtle">No reviews yet</p>
        )}
      </div>

      {total_count > 0 ? (
        <div className="grid grid-cols-1 small:grid-cols-[280px_1fr] gap-x-10 gap-y-8">
          {/* Rating distribution */}
          <RatingDistribution reviews={reviews} totalCount={total_count} />

          {/* Reviews list */}
          <div className="flex flex-col gap-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 bg-sand-50 px-6 py-10 text-center">
          <p className="text-sm text-ui-fg-subtle">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Star Rating ────────────────────────────── */

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number
  size?: "sm" | "lg"
}) {
  const starSize = size === "lg" ? "w-5 h-5" : "w-4 h-4"

  return (
    <div className="flex items-center gap-x-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(Math.max(rating - (star - 1), 0), 1)
        return <Star key={star} fill={fill} className={starSize} />
      })}
    </div>
  )
}

function Star({ fill, className }: { fill: number; className?: string }) {
  const id = `star-${Math.random().toString(36).slice(2, 9)}`

  if (fill <= 0) {
    return (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 13.88 5.06 16.7l.94-5.49-4-3.9 5.53-.8L10 1.5z"
          className="text-gray-300"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (fill >= 1) {
    return (
      <svg
        className={className}
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 13.88 5.06 16.7l.94-5.49-4-3.9 5.53-.8L10 1.5z"
          className="text-gold-400"
          fill="currentColor"
        />
      </svg>
    )
  }

  // Partial fill
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} className="text-gold-400" stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} className="text-gray-300" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <path
        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 13.88 5.06 16.7l.94-5.49-4-3.9 5.53-.8L10 1.5z"
        fill={`url(#${id})`}
      />
    </svg>
  )
}

/* ─── Rating Distribution ────────────────────── */

function RatingDistribution({
  reviews,
  totalCount,
}: {
  reviews: ProductReview[]
  totalCount: number
}) {
  const counts = [0, 0, 0, 0, 0] // index 0 = 1 star, index 4 = 5 star
  for (const review of reviews) {
    if (review.rating >= 1 && review.rating <= 5) {
      counts[review.rating - 1]++
    }
  }

  return (
    <div className="flex flex-col gap-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = counts[star - 1]
        const pct = totalCount > 0 ? (count / totalCount) * 100 : 0

        return (
          <div key={star} className="flex items-center gap-x-2 text-sm">
            <span className="w-8 text-right text-ui-fg-subtle">
              {star} ★
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gold-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-ui-fg-muted">
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Review Card ────────────────────────────── */

function ReviewCard({ review }: { review: ProductReview }) {
  const date = new Date(review.created_at).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="border-b border-gray-100 pb-6 last:border-b-0">
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <StarRating rating={review.rating} />
            <span className="text-small-semi text-brand-text">
              {review.title}
            </span>
          </div>
          <div className="flex items-center gap-x-2 text-xs text-ui-fg-muted">
            <span>{date}</span>
            {review.is_verified_purchase && (
              <span className="inline-flex items-center rounded-full bg-turquoise-50 px-2 py-0.5 text-[10px] font-medium text-turquoise-700 ring-1 ring-inset ring-turquoise-200">
                Verified Purchase
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm text-ui-fg-subtle leading-relaxed">
        {review.body}
      </p>
    </div>
  )
}

/* ─── Inline Star Rating Summary (for product title area) ── */

export function StarRatingSummary({
  averageRating,
  totalCount,
}: {
  averageRating: number
  totalCount: number
}) {
  if (totalCount === 0) return null

  return (
    <div className="flex items-center gap-x-2">
      <StarRating rating={averageRating} />
      <span className="text-sm font-medium text-brand-text">
        {averageRating.toFixed(1)}
      </span>
      <span className="text-xs text-ui-fg-muted">
        ({totalCount})
      </span>
    </div>
  )
}
