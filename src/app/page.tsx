import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: {
    absolute: "Turquoise Wholistic | Choose Your Experience",
  },
  description:
    "Choose between our retail wellness products or professional practitioner-grade formulas.",
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-sand-50 px-4">
      {from === "redirect" && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-turquoise-50 border border-turquoise-200 rounded-lg px-6 py-3 shadow-md text-sm text-turquoise-800">
          Welcome back! You can switch your browsing experience below.
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Turquoise Wholistic
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Holistic health and wellness — choose your experience
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* Retail Card */}
        <Link
          href="/retail"
          className="group flex flex-col items-center p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-turquoise-400 shadow-sm hover:shadow-lg transition-all duration-200"
        >
          <div className="w-16 h-16 rounded-full bg-turquoise-50 flex items-center justify-center mb-4 group-hover:bg-turquoise-100 transition-colors">
            <svg className="w-8 h-8 text-turquoise-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
            Shop All Products
          </h2>
          <p className="text-gray-500 text-center text-sm">
            Browse our curated collection of holistic health products, supplements, and wellness essentials.
          </p>
        </Link>

        {/* Professional Card */}
        <Link
          href="/professional"
          className="group flex flex-col items-center p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-professional-600 shadow-sm hover:shadow-lg transition-all duration-200"
        >
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
            <svg className="w-8 h-8 text-professional-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
            Professional Products
          </h2>
          <p className="text-gray-500 text-center text-sm">
            Practitioner-grade formulas and professional supplements. Access requires a practitioner code.
          </p>
        </Link>
      </div>
    </div>
  )
}
