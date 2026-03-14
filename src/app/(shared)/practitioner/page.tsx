import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Practitioner Program | Turquoise Wholistic",
  description:
    "Join the Turquoise Wholistic Practitioner Program. Access professional-grade products, create referral codes for your clients, and grow your practice.",
}

export default function PractitionerPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-16 small:py-24">
          <h1 className="font-playfair text-3xl small:text-5xl font-bold text-turquoise-800 mb-4">
            Practitioner Program
          </h1>
          <p className="text-lg small:text-xl text-gray-600 max-w-2xl mb-8">
            Access professional-grade holistic health products and share them
            with your clients through personalized referral codes.
          </p>
          <LocalizedClientLink
            href="/practitioner/register"
            className="inline-block bg-turquoise-600 text-white font-medium px-8 py-3 rounded-md hover:bg-turquoise-700 transition-colors"
          >
            Register Now
          </LocalizedClientLink>
        </div>
      </div>

      {/* How It Works */}
      <div className="content-container py-16">
        <h2 className="font-playfair text-2xl small:text-3xl font-bold text-turquoise-800 mb-10 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 small:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-sand-50 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-turquoise-100 text-turquoise-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Register</h3>
            <p className="text-sm text-gray-600">
              Submit your business details and credentials. Our team will review
              and approve your application.
            </p>
          </div>
          <div className="bg-sand-50 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-turquoise-100 text-turquoise-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create Codes</h3>
            <p className="text-sm text-gray-600">
              Once approved, generate unique referral codes linked to specific
              professional products for your clients.
            </p>
          </div>
          <div className="bg-sand-50 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-turquoise-100 text-turquoise-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Share &amp; Track
            </h3>
            <p className="text-sm text-gray-600">
              Share codes with your clients. Track redemptions and manage your
              codes from your practitioner dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-sand-50 border-y border-sand-200">
        <div className="content-container py-16">
          <h2 className="font-playfair text-2xl small:text-3xl font-bold text-turquoise-800 mb-10 text-center">
            Program Benefits
          </h2>
          <div className="grid grid-cols-1 small:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                title: "Professional Product Access",
                desc: "Unlock practitioner-grade supplements and herbal remedies not available to the general public.",
              },
              {
                title: "Client Referral Codes",
                desc: "Create unique codes so your clients can access the professional products you recommend.",
              },
              {
                title: "Dashboard & Analytics",
                desc: "Track code redemptions and manage your active codes from a dedicated dashboard.",
              },
              {
                title: "Flexible Controls",
                desc: "Set expiry dates and redemption limits on codes to match your practice needs.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 bg-white rounded-lg p-5 border border-sand-200"
              >
                <div className="w-2 rounded-full bg-turquoise-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="content-container py-16 text-center">
        <h2 className="font-playfair text-2xl font-bold text-turquoise-800 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Create an account or sign in, then register as a practitioner. Our
          team will review your application promptly.
        </p>
        <LocalizedClientLink
          href="/practitioner/register"
          className="inline-block bg-turquoise-600 text-white font-medium px-8 py-3 rounded-md hover:bg-turquoise-700 transition-colors"
        >
          Register as a Practitioner
        </LocalizedClientLink>
      </div>
    </div>
  )
}
