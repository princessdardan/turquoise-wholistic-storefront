import { retrieveCart } from "@lib/data/cart"
import { getCartIdForChannel } from "@lib/data/cookies"
import CartDropdown from "../cart-dropdown"

export default async function CartButton() {
  const cart = await retrieveCart().catch(() => null)

  // Fetch both channel carts to determine item counts for the notification dot
  const [retailCartId, professionalCartId] = await Promise.all([
    getCartIdForChannel("retail"),
    getCartIdForChannel("professional"),
  ])

  let retailItemCount = 0
  let professionalItemCount = 0

  if (retailCartId) {
    const retailCart = await retrieveCart(retailCartId, "id,*items").catch(
      () => null
    )
    retailItemCount =
      retailCart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  }

  if (professionalCartId) {
    const proCart = await retrieveCart(professionalCartId, "id,*items").catch(
      () => null
    )
    professionalItemCount =
      proCart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  }

  return (
    <CartDropdown
      cart={cart}
      retailItemCount={retailItemCount}
      professionalItemCount={professionalItemCount}
    />
  )
}
