import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import GiftCardPurchase from "@modules/gift-cards/components/gift-card-purchase"

export const metadata: Metadata = {
  title: "Gift Cards",
  description:
    "Give the gift of wellness! Purchase a Turquoise Wholistic digital gift card and share holistic health with someone special.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function GiftCardsPage(props: Props) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const giftCardProduct = await listProducts({
    countryCode,
    queryParams: {
      handle: "gift-card",
      fields: "*variants.calculated_price,+metadata",
    },
  }).then(({ response }) => response.products[0])

  if (!giftCardProduct) {
    notFound()
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-16 text-center">
          <div className="flex justify-center mb-4">
            <svg
              className="w-12 h-12 text-turquoise-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
          </div>
          <h1 className="font-playfair text-3xl small:text-4xl font-bold text-turquoise-800 mb-4">
            Gift Cards
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Give the gift of wellness. Our digital gift cards can be redeemed
            for any product in the Turquoise Wholistic store.
          </p>
        </div>
      </div>

      <div className="content-container py-16">
        <div className="max-w-2xl mx-auto">
          {/* Denomination selector */}
          <section className="mb-12">
            <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-6 text-center">
              Choose an Amount
            </h2>
            <GiftCardPurchase product={giftCardProduct} />
          </section>

          {/* How it works */}
          <section>
            <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-6 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Purchase",
                  description:
                    "Choose a denomination and add the gift card to your cart. Complete checkout as usual.",
                },
                {
                  step: "2",
                  title: "Receive Code",
                  description:
                    "After your order is confirmed, a unique gift card code will be delivered to your email.",
                },
                {
                  step: "3",
                  title: "Redeem",
                  description:
                    "Share the code with someone special. They can apply it at checkout to enjoy holistic wellness products.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-sand-50 rounded-lg p-6 text-center"
                >
                  <div className="w-10 h-10 bg-turquoise-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-brand-text mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
