import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Visit Us",
  description:
    "Find Turquoise Wholistic in Ontario, Canada. Store hours, directions, and contact information for our holistic health and wellness shop.",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Turquoise Wholistic",
  description:
    "Holistic health, natural remedies, supplements, and wellness products.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "[Street Address]",
    addressLocality: "[City]",
    addressRegion: "ON",
    addressCountry: "CA",
  },
  telephone: "(XXX) XXX-XXXX",
  email: "info@turquoisewholistic.ca",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "10:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "17:00",
    },
  ],
}

const hours = [
  { day: "Monday", time: "10:00 AM – 6:00 PM" },
  { day: "Tuesday", time: "10:00 AM – 6:00 PM" },
  { day: "Wednesday", time: "10:00 AM – 6:00 PM" },
  { day: "Thursday", time: "10:00 AM – 6:00 PM" },
  { day: "Friday", time: "10:00 AM – 6:00 PM" },
  { day: "Saturday", time: "10:00 AM – 5:00 PM" },
  { day: "Sunday", time: "Closed" },
]

export default function VisitUsPage() {
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
                      [Street Address]
                      <br />
                      Ontario, Canada
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-1">
                      Phone
                    </p>
                    <p className="text-gray-700">(XXX) XXX-XXXX</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-1">
                      Email
                    </p>
                    <p className="text-gray-700">info@turquoisewholistic.ca</p>
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
                            className={`py-2 ${time === "Closed" ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {time}
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
