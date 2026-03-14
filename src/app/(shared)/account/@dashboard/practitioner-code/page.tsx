import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { getMyAccess } from "@lib/data/product-access"
import PractitionerCodeOverview from "@modules/account/components/practitioner-code-overview"

export const metadata: Metadata = {
  title: "Practitioner Code",
  description: "Redeem a practitioner code to unlock professional products.",
}

export default async function PractitionerCodePage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    notFound()
  }

  const accessibleProductIds = await getMyAccess()

  return (
    <div className="w-full" data-testid="practitioner-code-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Practitioner Code</h1>
        <p className="text-base-regular">
          Enter a code from your practitioner to unlock professional products.
        </p>
      </div>
      <PractitionerCodeOverview
        initialAccessibleProductIds={accessibleProductIds}
      />
    </div>
  )
}
