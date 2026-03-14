import { Metadata } from "next"
import { redirect } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import {
  getMyPractitionerProfile,
  getMyPractitionerCodes,
  getMyPractitionerStats,
} from "@lib/data/practitioner"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DashboardContent from "./dashboard-content"

export const metadata: Metadata = {
  title: "Practitioner Dashboard | Turquoise Wholistic",
  description:
    "Manage your practitioner codes, view stats, and track redemptions.",
}

export default async function PractitionerDashboardPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    redirect("/account")
  }

  const profileResult = await getMyPractitionerProfile()

  if (!profileResult.success || !profileResult.practitioner) {
    redirect("/practitioner/register")
  }

  const practitioner = profileResult.practitioner

  const [{ codes, count }, stats] = await Promise.all([
    getMyPractitionerCodes(),
    getMyPractitionerStats(),
  ])

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
            Practitioner Dashboard
          </h1>
          <p className="text-gray-600">
            {practitioner.business_name}
          </p>
        </div>
      </div>

      <div className="content-container py-12">
        <DashboardContent
          practitioner={practitioner}
          initialCodes={codes}
          initialCount={count}
          initialStats={stats}
        />
      </div>
    </div>
  )
}
