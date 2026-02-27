"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { useChannel, Channel } from "@lib/context/channel-context"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  /** If set, clicking checkout will switch to this channel first */
  checkoutChannel?: Channel
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, checkoutChannel }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const { setChannel } = useChannel()
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }

  const handleCheckout = () => {
    if (checkoutChannel) {
      setChannel(checkoutChannel)
      // Brief delay to let the channel switch propagate (cookie + SDK key)
      setTimeout(() => {
        router.push(`/${countryCode}/checkout?step=${step}`)
      }, 150)
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      {checkoutChannel ? (
        <Button
          className="w-full h-10"
          onClick={handleCheckout}
          data-testid="checkout-button"
        >
          Go to checkout
        </Button>
      ) : (
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
        >
          <Button className="w-full h-10">Go to checkout</Button>
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default Summary
