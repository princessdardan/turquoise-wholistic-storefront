import { Metadata } from "next"
import { redirect } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import RegistrationForm from "./registration-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Register as Practitioner | Turquoise Wholistic",
  description:
    "Register as a practitioner to access professional-grade products and create referral codes for your clients.",
}

export default async function PractitionerRegisterPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    redirect(`/${countryCode}/account`)
  }

  return (
    <div className="bg-white">
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-12">
          <LocalizedClientLink
            href="/practitioner"
            className="text-sm text-turquoise-600 hover:text-turquoise-700 mb-4 inline-block"
          >
            &larr; Back to Practitioner Program
          </LocalizedClientLink>
          <h1 className="font-playfair text-3xl small:text-4xl font-bold text-turquoise-800 mb-2">
            Practitioner Registration
          </h1>
          <p className="text-gray-600">
            Fill out the form below to apply for practitioner access.
          </p>
        </div>
      </div>

      <div className="content-container py-12">
        <RegistrationForm />
      </div>
    </div>
  )
}
