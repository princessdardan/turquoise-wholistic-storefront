import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts, getProductMetadata } from "@lib/data/products"
import { getMyAccess } from "@lib/data/product-access"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductReviews } from "@lib/data/reviews"
import { getBaseURL } from "@lib/util/env"
import ProductTemplate from "@modules/products/templates"
import ProductLockGate from "@modules/products/components/product-lock-gate"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return product.images!.filter((i) => imageIdsMap.has(i.id))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const description =
    product.description || `Shop ${product.title} at Turquoise Wholistic.`

  return {
    title: product.title,
    description,
    openGraph: {
      title: `${product.title} | Turquoise Wholistic`,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: {
      handle: params.handle,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+categories,+categories.parent_category",
    },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  // Check if this is a locked professional product
  const metadata = await getProductMetadata(pricedProduct.id)
  if (metadata?.channel === "professional") {
    const accessibleIds = await getMyAccess()
    if (!accessibleIds.includes(pricedProduct.id)) {
      return (
        <ProductLockGate
          productTitle={pricedProduct.title}
          thumbnail={pricedProduct.thumbnail}
          images={pricedProduct.images}
        />
      )
    }
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  // Fetch reviews with the actual product ID
  const reviews = await getProductReviews(pricedProduct.id, 0, 1).catch(
    () => null
  )

  // Build Product JSON-LD
  const baseUrl = getBaseURL()
  const cheapestVariant = pricedProduct.variants?.reduce(
    (min: any, v: any) => {
      const amount = v.calculated_price?.calculated_amount
      if (amount == null) return min
      if (!min) return v
      return amount < min.calculated_price?.calculated_amount ? v : min
    },
    null as any
  )

  const priceAmount = cheapestVariant?.calculated_price?.calculated_amount
  const currencyCode =
    cheapestVariant?.calculated_price?.currency_code || "CAD"

  const hasStock = pricedProduct.variants?.some(
    (v: any) => v.inventory_quantity == null || v.inventory_quantity > 0
  )

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pricedProduct.title,
    description:
      pricedProduct.description ||
      `${pricedProduct.title} — holistic health product.`,
    url: `${baseUrl}/${params.countryCode}/products/${pricedProduct.handle}`,
    ...(pricedProduct.thumbnail && { image: pricedProduct.thumbnail }),
    brand: {
      "@type": "Brand",
      name: "Turquoise Wholistic",
    },
    ...(priceAmount != null && {
      offers: {
        "@type": "Offer",
        price: (priceAmount / 100).toFixed(2),
        priceCurrency: currencyCode.toUpperCase(),
        availability: hasStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "Turquoise Wholistic",
        },
      },
    }),
    ...(reviews &&
      reviews.total_count > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: reviews.average_rating.toFixed(1),
          reviewCount: reviews.total_count,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images}
      />
    </>
  )
}
