import { CtaComponent } from "@lib/data/cta"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const BG_COLORS: Record<string, string> = {
  sand: "bg-sand-50",
  "turquoise-50": "bg-turquoise-50",
  white: "bg-white",
  "gold-50": "bg-amber-50",
  "turquoise-100": "bg-turquoise-100",
  "sand-dark": "bg-sand-100",
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

export default function ImageCta({ cta }: { cta: CtaComponent }) {
  if (cta.product_unavailable || !cta.is_active) {
    return null
  }

  const product = cta.product
  const imageUrl = cta.image_url || product?.thumbnail
  const productUrl = cta.cta_url || (product ? `/products/${product.handle}` : null)
  const bgClass = BG_COLORS[cta.background_color] || "bg-sand-50"
  const isRight = cta.image_orientation === "right"

  const price = product?.variants?.[0]?.calculated_price
  const formattedPrice = price
    ? formatPrice(price.calculated_amount, price.currency_code)
    : null

  return (
    <div
      className={`${bgClass} rounded-xl overflow-hidden border border-gray-100 my-8`}
    >
      <div
        className={`flex flex-col ${
          isRight ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* Image */}
        {imageUrl ? (
          <div className="md:w-2/5 flex-shrink-0">
            <div className="aspect-[4/3] md:aspect-auto md:h-full relative">
              <img
                src={imageUrl}
                alt={product?.title || cta.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="md:w-2/5 flex-shrink-0 bg-turquoise-50 flex items-center justify-center">
            <div className="aspect-[4/3] md:aspect-auto md:h-full w-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-turquoise-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
          {cta.heading && (
            <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-2">
              {cta.heading}
            </p>
          )}

          {product && (
            <h3 className="font-playfair text-xl md:text-2xl font-bold text-gray-900 mb-3">
              {product.title}
            </h3>
          )}

          {cta.description && (
            <div
              className="text-gray-600 text-sm leading-relaxed mb-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: cta.description }}
            />
          )}

          {formattedPrice && (
            <p className="text-lg font-semibold text-gray-900 mb-4">
              {formattedPrice}
            </p>
          )}

          {productUrl && (
            <div>
              <LocalizedClientLink
                href={productUrl}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-turquoise-500 text-white text-sm font-medium rounded-lg hover:bg-turquoise-600 transition-colors"
              >
                {cta.cta_text || "Shop Now"}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
