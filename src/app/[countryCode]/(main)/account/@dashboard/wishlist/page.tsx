import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getRegion } from "@lib/data/regions"
import { getWishlistWithProducts } from "@lib/data/wishlist"
import { retrieveCustomer } from "@lib/data/customer"
import WishlistOverview from "@modules/account/components/wishlist-overview"

export const metadata: Metadata = {
  title: "Wishlist",
  description: "View and manage your wishlist.",
}

export default async function Wishlist(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  const items = await getWishlistWithProducts(region.id)

  return (
    <div className="w-full" data-testid="wishlist-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Wishlist</h1>
        <p className="text-base-regular">
          Your saved products. Add items to your cart or remove them from your
          wishlist.
        </p>
      </div>
      <WishlistOverview items={items} countryCode={countryCode} />
    </div>
  )
}
