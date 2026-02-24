"use client"

import { HttpTypes } from "@medusajs/types"
import { ChevronRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BreadcrumbProps = {
  product: HttpTypes.StoreProduct
}

export default function Breadcrumb({ product }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-x-1.5 text-sm text-ui-fg-muted"
    >
      <LocalizedClientLink href="/" className="hover:text-ui-fg-base transition-colors">
        Home
      </LocalizedClientLink>

      {product.collection && (
        <>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="hover:text-ui-fg-base transition-colors"
          >
            {product.collection.title}
          </LocalizedClientLink>
        </>
      )}

      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-ui-fg-base truncate max-w-[200px]">
        {product.title}
      </span>
    </nav>
  )
}
