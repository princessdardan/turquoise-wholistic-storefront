"use client"

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { ChevronDownMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef } from "react"
import Image from "next/image"

type FeaturedProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  price: string | null
}

type MegaMenuProps = {
  categories: HttpTypes.StoreProductCategory[]
  featuredProducts: FeaturedProduct[]
}

/**
 * Featured product card used in both dropdown panels.
 */
function FeaturedProductCard({
  product,
  onClose,
}: {
  product: FeaturedProduct
  onClose: () => void
}) {
  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="block rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
      onClick={onClose}
    >
      <div className="relative w-full aspect-square bg-sand-100">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="240px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ui-fg-muted">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 19.5V4.5a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-brand-text group-hover:text-turquoise-600 transition-colors truncate">
          {product.title}
        </p>
        {product.price && (
          <p className="text-xs text-ui-fg-muted mt-1">{product.price}</p>
        )}
        <span className="inline-block mt-2 text-xs font-medium text-turquoise-600 group-hover:text-turquoise-500">
          Shop Now →
        </span>
      </div>
    </LocalizedClientLink>
  )
}

/**
 * Reusable dropdown trigger with hover debounce.
 */
function MegaMenuDropdown({
  label,
  children,
}: {
  label: string
  children: (close: () => void) => React.ReactNode
}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <Popover className="h-full flex items-center">
      {({ open, close }) => (
        <div
          className="relative h-full flex items-center"
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
              timeoutRef.current = null
            }
          }}
          onMouseLeave={() => {
            timeoutRef.current = setTimeout(() => close(), 150)
          }}
        >
          <PopoverButton
            className={clx(
              "h-full flex items-center gap-x-1 text-sm font-medium transition-all ease-out duration-200",
              "focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:ring-offset-1 rounded",
              open
                ? "text-turquoise-600"
                : "text-ui-fg-subtle hover:text-turquoise-600"
            )}
            aria-expanded={open}
            aria-haspopup="true"
          >
            {label}
            <ChevronDownMini
              className={clx(
                "transition-transform duration-200",
                open ? "rotate-180" : ""
              )}
            />
          </PopoverButton>

          <PopoverPanel
            anchor="bottom"
            className={clx(
              "z-[60] w-[var(--panel-width)]",
              "mt-1 rounded-lg border border-ui-border-base bg-sand-50 shadow-lg",
              "transition-all duration-200 ease-out",
              "origin-top data-[closed]:scale-y-95 data-[closed]:opacity-0"
            )}
            style={
              {
                "--panel-width":
                  "max(820px, min(calc(100vw - 48px), 1200px))",
              } as React.CSSProperties
            }
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Escape") close()
            }}
          >
            {children(close)}
          </PopoverPanel>
        </div>
      )}
    </Popover>
  )
}

/**
 * MegaMenu renders "Health Concerns" and "Product Types" dropdown triggers.
 */
const MegaMenu = ({ categories, featuredProducts }: MegaMenuProps) => {
  const productTypesRoot = categories.find(
    (c) => !c.parent_category && c.name === "Product Types"
  )
  const healthConcernsRoot = categories.find(
    (c) => !c.parent_category && c.name === "Health Concerns"
  )

  const productTypes = productTypesRoot?.category_children ?? []
  const healthConcerns = healthConcernsRoot?.category_children ?? []

  const featured = featuredProducts[0] ?? null

  return (
    <>
      {/* ── Health Concerns dropdown ── */}
      {healthConcerns.length > 0 && (
        <MegaMenuDropdown label="Health Concerns">
          {(close) => (
            <div className="p-6 flex gap-6">
              {/* Left: Category grid (~70%) */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  {healthConcerns.map((concern) => {
                    const subcategories =
                      concern.category_children ?? []
                    return (
                      <div key={concern.id}>
                        <LocalizedClientLink
                          href={`/categories/${concern.handle}`}
                          className="text-sm font-semibold text-brand-text hover:text-turquoise-600 transition-colors"
                          onClick={() => close()}
                        >
                          {concern.name}
                        </LocalizedClientLink>
                        {subcategories.length > 0 && (
                          <ul className="mt-1.5 space-y-1">
                            {subcategories.map((sub) => (
                              <li key={sub.id}>
                                <LocalizedClientLink
                                  href={`/categories/${sub.handle}`}
                                  className="block text-xs text-ui-fg-muted hover:text-turquoise-500 transition-colors"
                                  onClick={() => close()}
                                >
                                  {sub.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right: Featured product (~30%) */}
              {featured && (
                <div className="w-56 flex-shrink-0">
                  <h4 className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider mb-3">
                    Featured
                  </h4>
                  <FeaturedProductCard
                    product={featured}
                    onClose={close}
                  />
                </div>
              )}
            </div>
          )}
        </MegaMenuDropdown>
      )}

      {/* ── Product Types dropdown (basic — enhanced in US-007) ── */}
      {productTypes.length > 0 && (
        <MegaMenuDropdown label="Product Types">
          {(close) => (
            <div className="p-6 flex gap-6">
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  {productTypes.map((type) => (
                    <div key={type.id}>
                      <LocalizedClientLink
                        href={`/categories/${type.handle}`}
                        className="text-sm font-semibold text-brand-text hover:text-turquoise-600 transition-colors"
                        onClick={() => close()}
                      >
                        {type.name}
                      </LocalizedClientLink>
                    </div>
                  ))}
                </div>
              </div>
              {featured && (
                <div className="w-56 flex-shrink-0">
                  <h4 className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider mb-3">
                    Featured
                  </h4>
                  <FeaturedProductCard
                    product={featured}
                    onClose={close}
                  />
                </div>
              )}
            </div>
          )}
        </MegaMenuDropdown>
      )}
    </>
  )
}

export default MegaMenu
