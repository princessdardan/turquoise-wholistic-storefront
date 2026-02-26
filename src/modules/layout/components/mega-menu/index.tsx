"use client"

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { ChevronDownMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef } from "react"
import Image from "next/image"

type MegaMenuProps = {
  categories: HttpTypes.StoreProductCategory[]
  featuredProducts: {
    id: string
    title: string
    handle: string
    thumbnail: string | null
    price: string | null
  }[]
}

const MegaMenu = ({ categories, featuredProducts }: MegaMenuProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Find root groups
  const productTypesRoot = categories.find(
    (c) => !c.parent_category && c.name === "Product Types"
  )
  const healthConcernsRoot = categories.find(
    (c) => !c.parent_category && c.name === "Health Concerns"
  )

  // Get children from category_children
  const productTypes = productTypesRoot?.category_children ?? []
  const healthConcerns = healthConcernsRoot?.category_children ?? []

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
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
            timeoutRef.current = setTimeout(() => {
              close()
            }, 150)
          }}
        >
          <PopoverButton
            className={clx(
              "h-full flex items-center gap-x-1 transition-all ease-out duration-200 focus:outline-none",
              open
                ? "text-turquoise-500"
                : "text-ui-fg-subtle hover:text-ui-fg-base"
            )}
            data-testid="shop-dropdown-button"
          >
            Shop
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
              "z-[60] w-[var(--button-width)] min-w-[820px] max-w-[1200px]",
              "mt-1 rounded-lg border border-ui-border-base bg-white shadow-lg",
              "transition-all duration-200 ease-out",
              "origin-top data-[closed]:scale-y-95 data-[closed]:opacity-0"
            )}
            style={
              {
                "--button-width": "max(820px, min(calc(100vw - 48px), 1200px))",
              } as React.CSSProperties
            }
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Escape") {
                close()
              }
            }}
          >
            <div className="p-6">
              {/* Header with "All Products" link */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-ui-border-base">
                <LocalizedClientLink
                  href="/store"
                  className="text-sm font-medium text-turquoise-600 hover:text-turquoise-500 transition-colors"
                  onClick={() => close()}
                >
                  View All Products →
                </LocalizedClientLink>
              </div>

              {/* Three-column grid */}
              <div className="grid grid-cols-3 gap-8">
                {/* Column 1: Product Categories */}
                <div>
                  <h3 className="font-serif text-base font-semibold text-brand-text mb-3">
                    Product Categories
                  </h3>
                  <ul className="space-y-1.5" data-testid="mega-menu-categories">
                    {productTypes.map((category) => (
                      <li key={category.id}>
                        <LocalizedClientLink
                          href={`/categories/${category.handle}`}
                          className="block py-1 text-sm text-ui-fg-subtle hover:text-turquoise-500 hover:translate-x-0.5 transition-all duration-150"
                          onClick={() => close()}
                          data-testid="mega-menu-category-link"
                        >
                          {category.name}
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Health Concerns */}
                <div>
                  <h3 className="font-serif text-base font-semibold text-brand-text mb-3">
                    Health Concerns
                  </h3>
                  <ul className="space-y-1.5" data-testid="mega-menu-health-concerns">
                    {healthConcerns.map((concern) => (
                      <li key={concern.id}>
                        <LocalizedClientLink
                          href={`/categories/${concern.handle}`}
                          className="block py-1 text-sm text-ui-fg-subtle hover:text-turquoise-500 hover:translate-x-0.5 transition-all duration-150"
                          onClick={() => close()}
                          data-testid="mega-menu-health-concern-link"
                        >
                          {concern.name}
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Featured Products */}
                <div>
                  <h3 className="font-serif text-base font-semibold text-brand-text mb-3">
                    Featured Products
                  </h3>
                  <div className="space-y-3" data-testid="mega-menu-featured">
                    {featuredProducts.map((product) => (
                      <LocalizedClientLink
                        key={product.id}
                        href={`/products/${product.handle}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-sand-50 transition-colors group"
                        onClick={() => close()}
                        data-testid="mega-menu-featured-product"
                      >
                        <div className="relative w-14 h-14 rounded-md overflow-hidden bg-sand-100 flex-shrink-0">
                          {product.thumbnail ? (
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-ui-fg-muted">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
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
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-brand-text group-hover:text-turquoise-600 transition-colors truncate">
                            {product.title}
                          </p>
                          {product.price && (
                            <p className="text-xs text-ui-fg-muted mt-0.5">
                              {product.price}
                            </p>
                          )}
                        </div>
                      </LocalizedClientLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PopoverPanel>
        </div>
      )}
    </Popover>
  )
}

export default MegaMenu
