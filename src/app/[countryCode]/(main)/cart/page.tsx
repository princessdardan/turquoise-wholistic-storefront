import { retrieveCart } from "@lib/data/cart"
import { getCartIdForChannel } from "@lib/data/cookies"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart() {
  const [retailCartId, professionalCartId, customer] = await Promise.all([
    getCartIdForChannel("retail"),
    getCartIdForChannel("professional"),
    retrieveCustomer(),
  ])

  const [retailCart, professionalCart] = await Promise.all([
    retailCartId ? retrieveCart(retailCartId).catch(() => null) : null,
    professionalCartId
      ? retrieveCart(professionalCartId).catch(() => null)
      : null,
  ])

  return (
    <CartTemplate
      retailCart={retailCart}
      professionalCart={professionalCart}
      customer={customer}
    />
  )
}
