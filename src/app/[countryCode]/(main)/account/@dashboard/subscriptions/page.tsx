import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { listSubscriptions } from "@lib/data/subscriptions"
import SubscriptionOverview from "@modules/account/components/subscription-overview"

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "View and manage your subscriptions.",
}

export default async function Subscriptions(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  const subscriptions = await listSubscriptions()

  return (
    <div className="w-full" data-testid="subscriptions-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Subscriptions</h1>
        <p className="text-base-regular">
          View and manage your active subscriptions. You can pause, resume, skip
          deliveries, or cancel anytime.
        </p>
      </div>
      <SubscriptionOverview subscriptions={subscriptions} />
    </div>
  )
}
