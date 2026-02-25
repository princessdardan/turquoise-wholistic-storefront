"use client"

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { ChevronDownMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef } from "react"

type ShopDropdownProps = {
  categories: HttpTypes.StoreProductCategory[]
}

const ShopDropdown = ({ categories }: ShopDropdownProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Filter to only root categories (no parent)
  const rootCategories = categories.filter((c) => !c.parent_category)

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
            ref={panelRef}
            anchor="bottom start"
            className="z-[60] mt-1 w-64 rounded-lg border border-ui-border-base bg-white shadow-lg"
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Escape") {
                close()
              }
            }}
          >
            <div className="py-2">
              <div className="px-4 py-2 border-b border-ui-border-base">
                <LocalizedClientLink
                  href="/store"
                  className="text-sm font-medium text-ui-fg-base hover:text-turquoise-500 transition-colors"
                  onClick={() => close()}
                >
                  All Products
                </LocalizedClientLink>
              </div>
              <ul className="py-1" data-testid="shop-dropdown-categories">
                {rootCategories.map((category) => (
                  <li key={category.id}>
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      className="block px-4 py-2 text-sm text-ui-fg-subtle hover:bg-sand-50 hover:text-turquoise-500 transition-colors"
                      onClick={() => close()}
                      data-testid="shop-dropdown-category-link"
                    >
                      {category.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          </PopoverPanel>
        </div>
      )}
    </Popover>
  )
}

export default ShopDropdown
