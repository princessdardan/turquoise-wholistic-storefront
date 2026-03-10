import { Suspense } from "react"
import Image from "next/image"

import { listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NavProfessionalBadge from "@modules/layout/components/nav-professional-badge"
import CartButton from "@modules/layout/components/cart-button"
import ChannelToggle from "@modules/layout/components/channel-toggle"
import MegaMenu from "@modules/layout/components/mega-menu"
import SearchBar from "@modules/layout/components/search-bar"
import SideMenu from "@modules/layout/components/side-menu"

async function getFeaturedProducts(regions: StoreRegion[]) {
  if (!regions.length) return []
  try {
    const { response } = await listProducts({
      pageParam: 1,
      queryParams: { limit: 3 },
      regionId: regions[0].id,
    })
    return response.products.map((p: HttpTypes.StoreProduct) => {
      const { cheapestPrice } = getProductPrice({ product: p })
      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        thumbnail: p.thumbnail ?? null,
        price: cheapestPrice?.calculated_price ?? null,
      }
    })
  } catch {
    return []
  }
}

export default async function Nav() {
  const [regions, locales, currentLocale, categories] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories(),
  ])

  const featuredProducts = await getFeaturedProducts(regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav
          aria-label="Main navigation"
          className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular"
        >
          {/* ── Left: Hamburger (mobile) + Logo ── */}
          <div className="flex items-center h-full gap-x-3 flex-1 basis-0">
            {/* Hamburger — hidden at lg and above */}
            <div className="lg:hidden h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                categories={categories}
              />
            </div>

            <LocalizedClientLink
              href="/"
              className="flex items-center gap-x-2 hover:opacity-90 transition-opacity"
              data-testid="nav-store-link"
            >
              <Image
                src="/logo-mark.svg"
                alt="Turquoise Wholistic"
                width={36}
                height={36}
                sizes="36px"
                priority
              />
              <span className="font-serif text-xl font-bold text-turquoise-600 tracking-tight hidden sm:inline">
                Turquoise Wholistic
              </span>
            </LocalizedClientLink>
            <NavProfessionalBadge />
          </div>

          {/* ── Center: Category nav links (desktop lg+) ── */}
          <div className="hidden lg:flex items-center gap-x-6 h-full">
            {categories && categories.length > 0 && (
              <MegaMenu
                categories={categories}
                featuredProducts={featuredProducts}
              />
            )}
            <LocalizedClientLink
              className="text-sm font-medium hover:text-turquoise-600 transition-colors"
              href="/blog"
            >
              Blog
            </LocalizedClientLink>
            <LocalizedClientLink
              className="text-sm font-medium hover:text-turquoise-600 transition-colors"
              href="/store"
            >
              View All
            </LocalizedClientLink>
          </div>

          {/* ── Right: Search + Account + Cart + Channel toggle ── */}
          <div className="flex items-center gap-x-4 h-full flex-1 basis-0 justify-end">
            <div className="hidden lg:flex items-center gap-x-4 h-full">
              <SearchBar />
              <LocalizedClientLink
                className="text-sm font-medium hover:text-turquoise-600 transition-colors"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
              <ChannelToggle />
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
