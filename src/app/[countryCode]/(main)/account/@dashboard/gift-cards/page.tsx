import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listCustomerGiftCards } from "@lib/data/gift-cards"
import { retrieveCustomer } from "@lib/data/customer"
import GiftCardsOverview from "@modules/account/components/gift-cards-overview"

export const metadata: Metadata = {
  title: "Gift Cards",
  description: "View your purchased gift cards and their balances.",
}

export default async function GiftCardsPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    notFound()
  }

  const giftCards = await listCustomerGiftCards(customer.id).catch(() => [])

  return (
    <div className="w-full" data-testid="gift-cards-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Gift Cards</h1>
        <p className="text-base-regular">
          Your purchased gift cards and their remaining balances.
        </p>
      </div>
      <GiftCardsOverview giftCards={giftCards} />
    </div>
  )
}
