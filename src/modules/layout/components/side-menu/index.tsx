"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment, useState, useCallback } from "react"
import Link from "next/link"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SideMenuProps = {
  categories?: HttpTypes.StoreProductCategory[] | null
  channel?: "retail" | "professional"
}

const SideMenu = ({ categories, channel }: SideMenuProps) => {
  const rootCategories = categories?.filter((c) => !c.parent_category) ?? []
  const productTypesRoot = rootCategories.find((c) => c.name === "Product Types")
  const healthConcernsRoot = rootCategories.find((c) => c.name === "Health Concerns")
  const productTypes = productTypesRoot?.category_children ?? []
  const healthConcerns = healthConcernsRoot?.category_children ?? []

  const healthToggleState = useToggleState()
  const productTypesToggleState = useToggleState()

  const [expandedConcerns, setExpandedConcerns] = useState<Set<string>>(new Set())

  const toggleConcern = useCallback((id: string) => {
    setExpandedConcerns((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const otherChannel = channel === "professional" ? "retail" : "professional"
  const otherLabel = channel === "professional" ? "Switch to Retail" : "Switch to Professional"

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  aria-label="Open navigation menu"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:ring-offset-1 rounded hover:text-ui-fg-base"
                >
                  Menu
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/0 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-[51] inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-[rgba(3,7,18,0.5)] rounded-rounded justify-between p-6 overflow-y-auto"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button data-testid="close-menu-button" onClick={close} aria-label="Close navigation menu" className="w-11 h-11 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-turquoise-400 rounded">
                        <XMark />
                      </button>
                    </div>
                    <div className="flex flex-col gap-6">
                      {/* Primary nav links */}
                      <ul className="flex flex-col gap-6 items-start justify-start">
                        <li>
                          <LocalizedClientLink
                            href="/"
                            className="text-3xl leading-10 hover:text-ui-fg-disabled"
                            onClick={close}
                            data-testid="home-link"
                          >
                            Home
                          </LocalizedClientLink>
                        </li>
                      </ul>

                      {/* Health Concerns: 2-level accordion */}
                      {healthConcerns.length > 0 && (
                        <div className="border-t border-white/20 pt-4">
                          <button
                            onClick={healthToggleState.toggle}
                            aria-expanded={healthToggleState.state}
                            className="flex items-center justify-between w-full mb-2 focus:outline-none focus:ring-2 focus:ring-turquoise-400 rounded"
                          >
                            <span className="text-3xl leading-10">
                              Health Concerns
                            </span>
                            <ArrowRightMini
                              className={clx(
                                "transition-transform duration-150 text-ui-fg-muted",
                                healthToggleState.state ? "rotate-90" : ""
                              )}
                            />
                          </button>
                          <div
                            className={clx(
                              "overflow-hidden transition-all duration-200",
                              healthToggleState.state ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                            )}
                          >
                            <ul className="flex flex-col gap-1 pl-2">
                              {healthConcerns.map((concern) => {
                                const subcategories = concern.category_children ?? []
                                const isExpanded = expandedConcerns.has(concern.id)

                                return (
                                  <li key={concern.id}>
                                    <div className="flex items-center gap-2">
                                      {subcategories.length > 0 && (
                                        <button
                                          onClick={() => toggleConcern(concern.id)}
                                          aria-expanded={isExpanded}
                                          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${concern.name}`}
                                          className="p-1 focus:outline-none focus:ring-2 focus:ring-turquoise-400 rounded"
                                        >
                                          <ArrowRightMini
                                            className={clx(
                                              "transition-transform duration-150 text-ui-fg-muted",
                                              isExpanded ? "rotate-90" : ""
                                            )}
                                          />
                                        </button>
                                      )}
                                      <LocalizedClientLink
                                        href={`/categories/${concern.handle}`}
                                        className="text-lg leading-8 hover:text-ui-fg-disabled transition-colors"
                                        onClick={close}
                                      >
                                        {concern.name}
                                      </LocalizedClientLink>
                                    </div>

                                    {subcategories.length > 0 && (
                                      <div
                                        className={clx(
                                          "overflow-hidden transition-all duration-200",
                                          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                        )}
                                      >
                                        <ul className="flex flex-col gap-0.5 pl-8 pb-2">
                                          {subcategories.map((sub) => (
                                            <li key={sub.id}>
                                              <LocalizedClientLink
                                                href={`/categories/${sub.handle}`}
                                                className="text-sm leading-6 text-ui-fg-muted hover:text-ui-fg-on-color transition-colors"
                                                onClick={close}
                                              >
                                                {sub.name}
                                              </LocalizedClientLink>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Product Types: 1-level accordion */}
                      {productTypes.length > 0 && (
                        <div className="border-t border-white/20 pt-4">
                          <button
                            onClick={productTypesToggleState.toggle}
                            aria-expanded={productTypesToggleState.state}
                            className="flex items-center justify-between w-full mb-2 focus:outline-none focus:ring-2 focus:ring-turquoise-400 rounded"
                          >
                            <span className="text-3xl leading-10">
                              Product Types
                            </span>
                            <ArrowRightMini
                              className={clx(
                                "transition-transform duration-150 text-ui-fg-muted",
                                productTypesToggleState.state ? "rotate-90" : ""
                              )}
                            />
                          </button>
                          <div
                            className={clx(
                              "overflow-hidden transition-all duration-200",
                              productTypesToggleState.state ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                            )}
                          >
                            <ul className="flex flex-col gap-1 pl-2">
                              {productTypes.map((type) => (
                                <li key={type.id}>
                                  <LocalizedClientLink
                                    href={`/categories/${type.handle}`}
                                    className="text-lg leading-8 hover:text-ui-fg-disabled transition-colors"
                                    onClick={close}
                                  >
                                    {type.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Additional nav links */}
                      <ul className="flex flex-col gap-6 items-start justify-start border-t border-white/20 pt-4">
                        <li>
                          <LocalizedClientLink
                            href="/store"
                            className="text-3xl leading-10 hover:text-ui-fg-disabled"
                            onClick={close}
                            data-testid="view-all-link"
                          >
                            View All Products
                          </LocalizedClientLink>
                        </li>
                        <li>
                          <LocalizedClientLink
                            href="/blog"
                            className="text-3xl leading-10 hover:text-ui-fg-disabled"
                            onClick={close}
                            data-testid="blog-link"
                          >
                            Blog
                          </LocalizedClientLink>
                        </li>
                        <li>
                          <LocalizedClientLink
                            href="/account"
                            className="text-3xl leading-10 hover:text-ui-fg-disabled"
                            onClick={close}
                            data-testid="account-link"
                          >
                            Account
                          </LocalizedClientLink>
                        </li>
                        <li>
                          <LocalizedClientLink
                            href="/cart"
                            className="text-3xl leading-10 hover:text-ui-fg-disabled"
                            onClick={close}
                            data-testid="cart-link"
                          >
                            Cart
                          </LocalizedClientLink>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-col gap-y-6">
                      {channel && (
                        <Link
                          href={`/${otherChannel}`}
                          className="text-sm font-medium text-ui-fg-muted hover:text-ui-fg-on-color transition-colors"
                          onClick={close}
                        >
                          {otherLabel}
                        </Link>
                      )}
                      <Text className="flex justify-between txt-compact-small">
                        &copy; {new Date().getFullYear()} Turquoise Wholistic. All
                        rights reserved.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
