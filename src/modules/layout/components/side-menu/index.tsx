"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Blog: "/blog",
  Account: "/account",
  Cart: "/cart",
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories?: HttpTypes.StoreProductCategory[] | null
}

const SideMenu = ({ regions, locales, currentLocale, categories }: SideMenuProps) => {
  const rootCategories = categories?.filter((c) => !c.parent_category) ?? []
  const productTypesRoot = rootCategories.find((c) => c.name === "Product Types")
  const healthConcernsRoot = rootCategories.find((c) => c.name === "Health Concerns")
  const productTypes = productTypesRoot?.category_children ?? []
  const healthConcerns = healthConcernsRoot?.category_children ?? []
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()
  const categoriesToggleState = useToggleState()
  const healthToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base"
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
                    className="flex flex-col h-full bg-[rgba(3,7,18,0.5)] rounded-rounded justify-between p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button data-testid="close-menu-button" onClick={close} className="w-11 h-11 flex items-center justify-center">
                        <XMark />
                      </button>
                    </div>
                    <div className="flex flex-col gap-6">
                      <ul className="flex flex-col gap-6 items-start justify-start">
                        {Object.entries(SideMenuItems).map(([name, href]) => {
                          return (
                            <li key={name}>
                              <LocalizedClientLink
                                href={href}
                                className="text-3xl leading-10 hover:text-ui-fg-disabled"
                                onClick={close}
                                data-testid={`${name.toLowerCase()}-link`}
                              >
                                {name}
                              </LocalizedClientLink>
                            </li>
                          )
                        })}
                      </ul>
                      {/* Product Categories Accordion */}
                      {productTypes.length > 0 && (
                        <div className="border-t border-white/20 pt-4">
                          <button
                            onClick={categoriesToggleState.toggle}
                            className="flex items-center justify-between w-full mb-2"
                          >
                            <Text className="txt-compact-small uppercase tracking-widest text-ui-fg-muted">
                              Product Categories
                            </Text>
                            <ArrowRightMini
                              className={clx(
                                "transition-transform duration-150 text-ui-fg-muted",
                                categoriesToggleState.state ? "-rotate-90" : ""
                              )}
                            />
                          </button>
                          <div
                            className={clx(
                              "overflow-hidden transition-all duration-200",
                              categoriesToggleState.state ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                            )}
                          >
                            <ul className="flex flex-col gap-1.5 pl-1">
                              {productTypes.map((category) => (
                                <li key={category.id}>
                                  <LocalizedClientLink
                                    href={`/categories/${category.handle}`}
                                    className="text-base leading-7 hover:text-ui-fg-disabled transition-colors"
                                    onClick={close}
                                  >
                                    {category.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      {/* Health Concerns Accordion */}
                      {healthConcerns.length > 0 && (
                        <div className="border-t border-white/20 pt-4">
                          <button
                            onClick={healthToggleState.toggle}
                            className="flex items-center justify-between w-full mb-2"
                          >
                            <Text className="txt-compact-small uppercase tracking-widest text-ui-fg-muted">
                              Health Concerns
                            </Text>
                            <ArrowRightMini
                              className={clx(
                                "transition-transform duration-150 text-ui-fg-muted",
                                healthToggleState.state ? "-rotate-90" : ""
                              )}
                            />
                          </button>
                          <div
                            className={clx(
                              "overflow-hidden transition-all duration-200",
                              healthToggleState.state ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                            )}
                          >
                            <ul className="flex flex-col gap-1.5 pl-1">
                              {healthConcerns.map((concern) => (
                                <li key={concern.id}>
                                  <LocalizedClientLink
                                    href={`/categories/${concern.handle}`}
                                    className="text-base leading-7 hover:text-ui-fg-disabled transition-colors"
                                    onClick={close}
                                  >
                                    {concern.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-y-6">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between cursor-pointer"
                          onClick={languageToggleState.toggle}
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between cursor-pointer"
                        onClick={countryToggleState.toggle}
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small">
                        © {new Date().getFullYear()} Turquoise Wholistic. All
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
