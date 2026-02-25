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
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function SearchPage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { q, sortBy, page } = searchParams

  return (
    <SearchTemplate
      query={q || ""}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
