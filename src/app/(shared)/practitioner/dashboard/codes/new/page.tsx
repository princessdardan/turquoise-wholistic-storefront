import { Metadata } from "next"
import { redirect } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { getMyPractitionerProfile } from "@lib/data/practitioner"
import { listAllProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CodeCreationForm from "./code-creation-form"

export const metadata: Metadata = {
  title: "Create Code | Turquoise Wholistic",
  description: "Create a new practitioner referral code.",
}

export default async function NewCodePage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    redirect("/account")
  }

  const profileResult = await getMyPractitionerProfile()

  if (!profileResult.success || !profileResult.practitioner) {
    redirect("/practitioner/register")
  }

  if (profileResult.practitioner.status !== "approved") {
    redirect("/practitioner/dashboard")
  }

  const products = await listAllProducts()

  return (
    <div className="bg-white">
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-12">
          <LocalizedClientLink
            href="/practitioner/dashboard"
            className="text-sm text-turquoise-600 hover:text-turquoise-700 mb-4 inline-block"
          >
            &larr; Back to Dashboard
          </LocalizedClientLink>
          <h1 className="font-playfair text-3xl small:text-4xl font-bold text-turquoise-800 mb-2">
            Create New Code
          </h1>
          <p className="text-gray-600">
            Generate a referral code to give your clients access to professional
            products.
          </p>
        </div>
      </div>

      <div className="content-container py-12">
        <CodeCreationForm products={products} />
      </div>
    </div>
  )
}
