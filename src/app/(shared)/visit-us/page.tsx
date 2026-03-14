import { Metadata } from "next"
import {
  getStoreSettings,
  formatAddress,
  StoreSettings,
} from "@lib/data/store-settings"
import PlaceholderMarker from "@modules/common/components/placeholder-marker"

export const metadata: Metadata = {
  title: "Visit Us",
  description:
    "Find Turquoise Wholistic in Ontario, Canada. Store hours, directions, and contact information for our holistic health and wellness shop.",
}

const PLACEHOLDER_HOURS = [
  { day: "Monday", time: "[HOURS]" },
  { day: "Tuesday", time: "[HOURS]" },
  { day: "Wednesday", time: "[HOURS]" },
  { day: "Thursday", time: "[HOURS]" },
  { day: "Friday", time: "[HOURS]" },
  { day: "Saturday", time: "[HOURS]" },
  { day: "Sunday", time: "[HOURS]" },
]

function buildJsonLd(settings: StoreSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.name,
    description:
      "Holistic health, natural remedies, supplements, and wellness products.",
    address: {
      "@type": "PostalAddress",
      ...(settings.address ? { streetAddress: settings.address } : {}),
      ...(settings.city ? { addressLocality: settings.city } : {}),
      addressRegion: settings.province || "ON",
      addressCountry: settings.country || "CA",
    },
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
  }
}

export default async function VisitUsPage() {
  const settings = await getStoreSettings()
  const fullAddress = formatAddress(settings)
  const hours = settings.hours || PLACEHOLDER_HOURS
  const jsonLd = buildJsonLd(settings)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-white">
        {/* Hero */}
        <div className="bg-turquoise-50 border-b border-turquoise-100">
          <div className="content-container py-16">
            <h1 className="font-playfair text-4xl font-bold text-turquoise-800 mb-4">
              Visit Us
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              We&apos;d love to welcome you in person. Explore our full
              selection of natural health products and speak with our
              knowledgeable staff.
            </p>
          </div>
        </div>

        <div className="content-container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left */}
            <div className="flex flex-col gap-10">
              <section>
                <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-4">
                  Location &amp; Contact
                </h2>
                <div className="bg-sand-50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-1">
                      Address
                    </p>
                    <p className="text-gray-700">
                      <PlaceholderMarker
                        value={fullAddress}
                        placeholder="[ADDRESS]"
                      />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-1">
                      Phone
                    </p>
                    <p className="text-gray-700">
                      <PlaceholderMarker
                        value={settings.phone}
                        placeholder="[PHONE]"
                      />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-1">
                      Email
                    </p>
                    <p className="text-gray-700">
                      <PlaceholderMarker
                        value={settings.email}
                        placeholder="[EMAIL]"
                      />
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-4">
                  Store Hours
                </h2>
                <div className="bg-sand-50 rounded-lg p-6">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-sand-200">
                      {hours.map(({ day, time }) => (
                        <tr key={day}>
                          <td className="py-2 font-medium text-gray-700 w-1/2">
                            {day}
                          </td>
                          <td
                            className={`py-2 ${time.toLowerCase() === "closed" ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {time.startsWith("[") ? (
                              <PlaceholderMarker
                                value={null}
                                placeholder={time}
                              />
                            ) : (
                              time
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-4 text-xs text-gray-400">
                    Hours may vary on statutory holidays.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-4">
                  Getting Here
                </h2>
                <div className="bg-sand-50 rounded-lg p-6 space-y-4 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">
                      Parking
                    </p>
                    <p>
                      Free street parking is available nearby. Details to be
                      updated once store address is confirmed.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">
                      Public Transit
                    </p>
                    <p>
                      Transit directions will be added once the store address is
                      confirmed.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-10">
              <section>
                <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-4">
                  Map
                </h2>
                <div className="w-full h-72 bg-turquoise-50 border-2 border-dashed border-turquoise-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-turquoise-400">
                    <p className="text-sm font-medium">Map Loading...</p>
                    <p className="text-xs mt-1">
                      Google Maps embed will appear here
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-4">
                  Inside Our Store
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="aspect-square bg-turquoise-50 border-2 border-dashed border-turquoise-200 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-xs text-turquoise-300 font-medium">
                        Photo {n}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Store photos coming soon.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
