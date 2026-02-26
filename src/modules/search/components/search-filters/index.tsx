"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { clx, Text, Label } from "@medusajs/ui"

type Category = {
  id: string
  name: string
  handle: string
}

export default function SearchFilters({
  categories,
  selectedCategories,
  minPrice,
  maxPrice,
  inStock,
}: {
  categories: Category[]
  selectedCategories: string[]
  minPrice: string
  maxPrice: string
  inStock: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams)
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const handleCategoryToggle = useCallback(
    (categoryId: string) => {
      const current = new Set(selectedCategories)
      if (current.has(categoryId)) {
        current.delete(categoryId)
      } else {
        current.add(categoryId)
      }
      const value = Array.from(current).join(",")
      updateParams({ category: value || null })
    },
    [selectedCategories, updateParams]
  )

  const handlePriceChange = useCallback(
    (field: "minPrice" | "maxPrice", value: string) => {
      // Only allow digits and empty string
      const cleaned = value.replace(/[^\d]/g, "")
      updateParams({ [field]: cleaned || null })
    },
    [updateParams]
  )

  const handleInStockToggle = useCallback(() => {
    updateParams({ inStock: inStock ? null : "true" })
  }, [inStock, updateParams])

  const hasActiveFilters =
    selectedCategories.length > 0 || minPrice || maxPrice || inStock

  const handleClearAll = useCallback(() => {
    updateParams({
      category: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
    })
  }, [updateParams])

  return (
    <div className="flex flex-col gap-y-6">
      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={handleClearAll}
          className="text-sm text-turquoise-600 hover:text-turquoise-700 underline underline-offset-2 text-left"
        >
          Clear all filters
        </button>
      )}

      {/* Category Filter */}
      <div className="flex flex-col gap-y-3">
        <Text className="txt-compact-small-plus text-ui-fg-muted">
          Category
        </Text>
        <div className="flex flex-col gap-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-x-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => handleCategoryToggle(cat.id)}
                className="h-4 w-4 rounded border-ui-border-base text-turquoise-600 focus:ring-turquoise-500 accent-turquoise-600"
              />
              <span
                className={clx(
                  "txt-compact-small text-ui-fg-subtle group-hover:text-ui-fg-base transition-colors",
                  {
                    "text-ui-fg-base font-medium":
                      selectedCategories.includes(cat.id),
                  }
                )}
              >
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="flex flex-col gap-y-3">
        <Text className="txt-compact-small-plus text-ui-fg-muted">
          Price range
        </Text>
        <div className="flex items-center gap-x-2">
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-ui-fg-muted text-sm">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-sm border border-ui-border-base rounded-md focus:outline-none focus:ring-1 focus:ring-turquoise-400 bg-transparent"
            />
          </div>
          <span className="text-ui-fg-muted text-sm">–</span>
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-ui-fg-muted text-sm">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-sm border border-ui-border-base rounded-md focus:outline-none focus:ring-1 focus:ring-turquoise-400 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="flex flex-col gap-y-3">
        <Text className="txt-compact-small-plus text-ui-fg-muted">
          Availability
        </Text>
        <label className="flex items-center gap-x-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStock}
            onChange={handleInStockToggle}
            className="h-4 w-4 rounded border-ui-border-base text-turquoise-600 focus:ring-turquoise-500 accent-turquoise-600"
          />
          <span
            className={clx(
              "txt-compact-small text-ui-fg-subtle group-hover:text-ui-fg-base transition-colors",
              { "text-ui-fg-base font-medium": inStock }
            )}
          >
            In stock only
          </span>
        </label>
      </div>
    </div>
  )
}
