import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import CategoryArray from "@modules/home/components/category-array"
import CtaSection from "@modules/home/components/cta-section"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getCategoryTrees } from "@lib/data/categories"
import { getStoreSettings } from "@lib/data/store-settings"
import { getBaseURL } from "@lib/util/env"

export const metadata: Metadata = {
  title: {
    absolute: "Turquoise Wholistic | Holistic Health & Wellness",
  },
  description:
    "Discover natural health solutions, herbal remedies, supplements, and wellness products. Your destination for holistic medicine and mindful living.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const [region, { collections }, storeSettings, categoryTrees] = await Promise.all([
    getRegion(countryCode),
    listCollections({ fields: "id, handle, title" }),
    getStoreSettings(),
    getCategoryTrees(),
  ])

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeSettings.name,
    url: getBaseURL(),
    logo: `${getBaseURL()}/logo.svg`,
    description:
      "Holistic health, natural remedies, supplements, and wellness products. Ontario-based holistic medicine and mindful living company.",
    address: {
      "@type": "PostalAddress",
      ...(storeSettings.address ? { streetAddress: storeSettings.address } : {}),
      ...(storeSettings.city ? { addressLocality: storeSettings.city } : {}),
      addressRegion: storeSettings.province || "ON",
      addressCountry: storeSettings.country || "CA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      ...(storeSettings.email ? { email: storeSettings.email } : {}),
      ...(storeSettings.phone ? { telephone: storeSettings.phone } : {}),
      contactType: "customer service",
    },
    sameAs: [],
  }

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
      <CategoryArray healthConcerns={categoryTrees.healthConcerns} />
      <CtaSection />
      <div className="py-12 bg-white">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
