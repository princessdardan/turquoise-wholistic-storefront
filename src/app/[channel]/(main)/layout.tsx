import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { ProductAccessProvider } from "@lib/context/product-access-context"
import { WishlistProvider } from "@lib/context/wishlist-context"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import CookieConsent from "@modules/layout/components/cookie-consent"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

const VALID_CHANNELS = ["retail", "professional"] as const

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function ChannelLayout(props: {
  children: React.ReactNode
  params: Promise<{ channel: string }>
}) {
  const { channel } = await props.params

  if (!(VALID_CHANNELS as readonly string[]).includes(channel)) {
    notFound()
  }

  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()
    shippingOptions = shipping_options
  }

  return (
    <WishlistProvider isLoggedIn={!!customer}>
      <ProductAccessProvider isLoggedIn={!!customer}>
        <Nav channel={channel as "retail" | "professional"} />
        {customer && cart && (
          <CartMismatchBanner customer={customer} cart={cart} />
        )}

        {cart && (
          <FreeShippingPriceNudge
            variant="popup"
            cart={cart}
            shippingOptions={shippingOptions}
          />
        )}
        {props.children}
        <Footer />
        <CookieConsent />
      </ProductAccessProvider>
    </WishlistProvider>
  )
}
