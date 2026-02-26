import { Metadata } from "next"
import {
  getStoreSettings,
  formatAddress,
} from "@lib/data/store-settings"
import PlaceholderMarker from "@modules/common/components/placeholder-marker"
import ContactForm from "./contact-form"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Turquoise Wholistic. Questions about products, orders, or partnerships? We are here to help. Based in Ontario, Canada.",
}

export default async function ContactPage() {
  const settings = await getStoreSettings()
  const fullAddress = formatAddress(settings)

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-16">
          <h1 className="font-playfair text-3xl small:text-4xl font-bold text-turquoise-800 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Have a question about a product, need help with an order, or
            interested in a partnership? We would love to hear from you.
          </p>
        </div>
      </div>

      <div className="content-container py-16">
        <div className="grid grid-cols-1 small:grid-cols-3 gap-8 small:gap-12">
          {/* Form */}
          <div className="small:col-span-2">
            <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-6">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>

          {/* Store Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-6">
                Store Information
              </h2>

              <div className="space-y-6">
                <div className="bg-sand-50 rounded-lg p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-2">
                    Email
                  </p>
                  {settings.email ? (
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-gray-700 hover:text-turquoise-600 transition-colors"
                    >
                      {settings.email}
                    </a>
                  ) : (
                    <PlaceholderMarker value={null} placeholder="[EMAIL]" />
                  )}
                </div>

                <div className="bg-sand-50 rounded-lg p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-2">
                    Phone
                  </p>
                  <p className="text-gray-700">
                    <PlaceholderMarker
                      value={settings.phone}
                      placeholder="[PHONE]"
                    />
                  </p>
                </div>

                <div className="bg-sand-50 rounded-lg p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-2">
                    Business Hours
                  </p>
                  {settings.hours ? (
                    <ul className="text-gray-700 text-sm space-y-1">
                      {settings.hours.map((h) => (
                        <li key={h.day}>
                          {h.day}: {h.time}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <PlaceholderMarker value={null} placeholder="[HOURS]" />
                  )}
                </div>

                <div className="bg-sand-50 rounded-lg p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-2">
                    Location
                  </p>
                  <p className="text-gray-700 text-sm">
                    <PlaceholderMarker
                      value={fullAddress}
                      placeholder="[ADDRESS]"
                    />
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    We ship across Canada via Purolator
                  </p>
                </div>

                <div className="bg-sand-50 rounded-lg p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-2">
                    Response Time
                  </p>
                  <p className="text-gray-700 text-sm">
                    We typically respond within 1–2 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
