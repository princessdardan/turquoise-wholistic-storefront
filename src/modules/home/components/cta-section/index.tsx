import { listCtasByPlacement } from "@lib/data/cta"
import ImageCta, {
  ImageCtaProps,
} from "@modules/common/components/image-cta"

export default async function CtaSection() {
  const ctas = await listCtasByPlacement("homepage")

  if (ctas.length === 0) {
    return null
  }

  return (
    <div className="w-full py-12 bg-white">
      <div className="content-container flex flex-col gap-8">
        {ctas.map((cta, index) => {
          // Alternate orientation (left, right, left...) unless admin set a
          // specific orientation that differs from the default "left"
          const adminSetOrientation = cta.image_orientation !== "left"
          const alternating: "left" | "right" =
            index % 2 === 0 ? "left" : "right"

          const props: ImageCtaProps = {
            id: cta.id,
            title: cta.title,
            heading: cta.heading,
            description: cta.description,
            product_id: cta.product_id,
            image_url: cta.image_url,
            image_orientation: cta.image_orientation,
            cta_text: cta.cta_text,
            cta_url: cta.cta_url,
            background_color: cta.background_color,
            product_unavailable: cta.product_unavailable ?? false,
            product: cta.product
              ? {
                  name: cta.product.title,
                  thumbnail: cta.product.thumbnail,
                  handle: cta.product.handle,
                  calculated_price: cta.product.variants?.[0]
                    ?.calculated_price
                    ? {
                        ...cta.product.variants[0].calculated_price,
                        original_amount: null,
                      }
                    : null,
                }
              : null,
            // Only override orientation for auto-alternating when admin
            // hasn't explicitly set a non-default orientation
            orientationOverride: adminSetOrientation
              ? undefined
              : alternating,
          }

          return <ImageCta key={cta.id} {...props} />
        })}
      </div>
    </div>
  )
}
