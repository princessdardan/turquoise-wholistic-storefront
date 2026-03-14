import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle } from "@lib/data/categories"
import { getBaseURL } from "@lib/util/env"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; channel: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const description =
      productCategory.description ??
      `Browse ${productCategory.name} products at Turquoise Wholistic.`

    return {
      title: productCategory.name,
      description,
      alternates: {
        canonical: `${getBaseURL()}/categories/${params.category.join("/")}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  const baseUrl = getBaseURL()
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: productCategory.name,
    description:
      productCategory.description ??
      `Browse ${productCategory.name} products at Turquoise Wholistic.`,
    url: `${baseUrl}/${params.channel}/categories/${params.category.join("/")}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Turquoise Wholistic",
      url: baseUrl,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <CategoryTemplate
        category={productCategory}
        sortBy={sortBy}
        page={page}
      />
    </>
  )
}
