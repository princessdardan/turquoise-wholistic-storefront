import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import TrustBadges from "@modules/products/components/trust-badges"
import Breadcrumb from "@modules/products/components/breadcrumb"
import HealthDisclaimer from "@modules/common/components/health-disclaimer"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const npn =
    typeof product.metadata?.npn === "string" ? product.metadata.npn : null

  return (
    <>
      <div
        className="content-container py-6"
        data-testid="product-container"
      >
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb product={product} />
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 small:grid-cols-[55%_1fr] gap-x-10 gap-y-8">
          {/* Left column: Image Gallery */}
          <div>
            <ImageGallery images={images} />
          </div>

          {/* Right column: Product info + actions */}
          <div className="flex flex-col gap-y-6 small:sticky small:top-32 small:self-start">
            <ProductInfo product={product} />

            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>

            <TrustBadges />

            {npn && <HealthDisclaimer npn={npn} />}

            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
