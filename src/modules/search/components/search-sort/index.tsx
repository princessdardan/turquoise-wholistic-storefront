"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"

export type SearchSortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "created_at"

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low \u2192 High" },
  { value: "price_desc", label: "Price: High \u2192 Low" },
  { value: "created_at", label: "Newest" },
]

export default function SearchSort({
  sortBy,
}: {
  sortBy: SearchSortOption
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setQueryParams = useCallback(
    (_name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value === "relevance") {
        params.delete("sortBy")
      } else {
        params.set("sortBy", value)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  return (
    <FilterRadioGroup
      title="Sort by"
      items={sortOptions}
      value={sortBy}
      handleChange={(value: string) => setQueryParams("sortBy", value)}
    />
  )
}
