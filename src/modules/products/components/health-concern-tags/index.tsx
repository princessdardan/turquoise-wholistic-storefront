"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type HealthConcernTagsProps = {
  categories?: HttpTypes.StoreProductCategory[] | null
}

const HealthConcernTags = ({ categories }: HealthConcernTagsProps) => {
  if (!categories || categories.length === 0) return null

  const healthConcerns = categories.filter(
    (c) => c.parent_category?.name === "Health Concerns"
  )

  if (healthConcerns.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2" data-testid="health-concern-tags">
      {healthConcerns.map((concern) => (
        <LocalizedClientLink
          key={concern.id}
          href={`/categories/${concern.handle}`}
          className="inline-flex items-center rounded-full border border-turquoise-300 bg-sand-50 px-3 py-1 text-xs font-medium text-turquoise-700 hover:bg-turquoise-50 hover:border-turquoise-400 transition-colors"
          data-testid="health-concern-tag"
        >
          {concern.name}
        </LocalizedClientLink>
      ))}
    </div>
  )
}

export default HealthConcernTags
