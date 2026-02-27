import Image from "next/image"

import { getCategoryTrees } from "@lib/data/categories"
import { getStoreSettings, formatAddress } from "@lib/data/store-settings"
import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const [{ healthConcerns, productTypes }, storeSettings] = await Promise.all([
    getCategoryTrees(),
    getStoreSettings(),
  ])

  const fullAddress = formatAddress(storeSettings)

  return (
    <footer aria-label="Site footer" className="border-t border-ui-border-base w-full bg-sand-50">
      <div className="content-container flex flex-col w-full">
        {/* Logo and tagline */}
        <div className="pt-12 pb-8">
          <LocalizedClientLink
            href="/"
            className="flex items-center gap-x-2 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/logo-mark.svg"
              alt="Turquoise Wholistic"
              width={40}
              height={40}
              sizes="40px"
              loading="lazy"
            />
            <span className="font-serif text-xl font-bold text-turquoise-600 tracking-tight">
              Turquoise Wholistic
            </span>
          </LocalizedClientLink>
          <p className="mt-3 text-sm text-brand-text-secondary max-w-sm">
            Your destination for holistic health, natural remedies, and mindful
            wellness products.
          </p>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12">
          {/* Column 1: Health Concerns */}
          <div className="flex flex-col gap-y-3">
            <span className="text-sm font-semibold text-brand-text">
              Health Concerns
            </span>
            <ul className="flex flex-col gap-y-2 text-sm text-ui-fg-subtle">
              {healthConcerns.map((concern) => (
                <li key={concern.id}>
                  <LocalizedClientLink
                    className="hover:text-turquoise-500 transition-colors"
                    href={`/categories/${concern.handle}`}
                  >
                    {concern.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Product Types */}
          <div className="flex flex-col gap-y-3">
            <span className="text-sm font-semibold text-brand-text">
              Product Types
            </span>
            <ul className="flex flex-col gap-y-2 text-sm text-ui-fg-subtle">
              {productTypes.map((type) => (
                <li key={type.id}>
                  <LocalizedClientLink
                    className="hover:text-turquoise-500 transition-colors"
                    href={`/categories/${type.handle}`}
                  >
                    {type.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="flex flex-col gap-y-3">
            <span className="text-sm font-semibold text-brand-text">
              Quick Links
            </span>
            <ul className="flex flex-col gap-y-2 text-sm text-ui-fg-subtle">
              <li>
                <LocalizedClientLink className="hover:text-turquoise-500 transition-colors" href="/blog">
                  Blog
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-turquoise-500 transition-colors" href="/about">
                  About
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-turquoise-500 transition-colors" href="/visit-us">
                  Visit Us
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-turquoise-500 transition-colors" href="/store">
                  Gift Cards
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-turquoise-500 transition-colors" href="/account">
                  Account
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-turquoise-500 transition-colors" href="/privacy-policy">
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-turquoise-500 transition-colors" href="/terms-of-service">
                  Terms of Service
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-turquoise-500 transition-colors" href="/return-policy">
                  Return Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink className="hover:text-turquoise-500 transition-colors" href="/shipping-policy">
                  Shipping Policy
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="flex flex-col gap-y-3">
            <span className="text-sm font-semibold text-brand-text">
              Company
            </span>
            <ul className="flex flex-col gap-y-2 text-sm text-ui-fg-subtle">
              <li>
                <LocalizedClientLink className="hover:text-turquoise-500 transition-colors" href="/contact">
                  Contact Us
                </LocalizedClientLink>
              </li>
              {storeSettings.hours && storeSettings.hours.length > 0 && (
                <li>
                  <span className="font-medium text-brand-text text-xs">Store Hours</span>
                  <ul className="mt-1 space-y-0.5">
                    {storeSettings.hours.map((h, i) => (
                      <li key={i} className="text-xs">
                        {h.day}: {h.time}
                      </li>
                    ))}
                  </ul>
                </li>
              )}
              {fullAddress && (
                <li className="text-xs leading-relaxed">{fullAddress}</li>
              )}
              {storeSettings.phone && (
                <li>
                  <a
                    href={`tel:${storeSettings.phone}`}
                    className="hover:text-turquoise-500 transition-colors"
                  >
                    {storeSettings.phone}
                  </a>
                </li>
              )}
              {storeSettings.email && (
                <li>
                  <a
                    href={`mailto:${storeSettings.email}`}
                    className="hover:text-turquoise-500 transition-colors"
                  >
                    {storeSettings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-ui-border-base py-6">
          <Text className="txt-compact-small text-ui-fg-muted">
            &copy; {new Date().getFullYear()} {storeSettings.name}. All rights
            reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}
