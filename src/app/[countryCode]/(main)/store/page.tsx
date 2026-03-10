import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate, { ChannelFilter } from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse our curated collection of holistic health products, herbal remedies, supplements, and wellness essentials.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    channel?: ChannelFilter
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, channel } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      channel={channel}
    />
  )
}
