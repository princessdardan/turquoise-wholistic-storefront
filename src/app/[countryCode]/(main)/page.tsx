import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"

export const metadata: Metadata = {
  title: {
    absolute: "Turquoise Wholistic | Holistic Health & Wellness",
  },
  description:
    "Discover natural health solutions, herbal remedies, supplements, and wellness products. Your destination for holistic medicine and mindful living.",
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Turquoise Wholistic",
  url: getBaseURL(),
  logo: `${getBaseURL()}/logo.svg`,
  description:
    "Holistic health, natural remedies, supplements, and wellness products. Ontario-based holistic medicine and mindful living company.",
  address: {
    "@type": "PostalAddress",
    addressRegion: "ON",
    addressCountry: "CA",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@turquoisewholistic.ca",
    contactType: "customer service",
  },
  sameAs: [],
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero />
      <div className="py-12 bg-white">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
