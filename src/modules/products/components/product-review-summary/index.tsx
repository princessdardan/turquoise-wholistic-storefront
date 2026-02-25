import { getProductReviews } from "@lib/data/reviews"
import { StarRatingSummary } from "@modules/products/components/product-reviews"

type ProductReviewSummaryProps = {
  productId: string
}

export default async function ProductReviewSummary({
  productId,
}: ProductReviewSummaryProps) {
  const data = await getProductReviews(productId, 0, 1)

  return (
    <StarRatingSummary
      averageRating={data.average_rating}
      totalCount={data.total_count}
    />
  )
}
