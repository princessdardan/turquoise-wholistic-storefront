import { Metadata } from "next"
import SearchTemplate from "@modules/search/templates"

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search our collection of holistic health and wellness products.",
}

type Params = {
  searchParams: Promise<{
    q?: string
    sortBy?: string
    page?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
  }>
}

export default async function SearchPage(props: Params) {
  const searchParams = await props.searchParams
  const { q, sortBy, page, category, minPrice, maxPrice, inStock } =
    searchParams

  return (
    <SearchTemplate
      query={q || ""}
      sortBy={sortBy}
      page={page}
      categoryIds={category || ""}
      minPrice={minPrice || ""}
      maxPrice={maxPrice || ""}
      inStock={inStock === "true"}
    />
  )
}
