import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "About Us | Turquoise Wholistic",
  description:
    "Learn about Turquoise Wholistic — our mission to bring holistic health and natural wellness products to Canadians. Rooted in Ontario, guided by nature.",
}

const values = [
  {
    title: "Natural Integrity",
    description:
      "Every product we carry meets our rigorous standards for purity, potency, and ethical sourcing. We believe that what goes into your body matters.",
  },
  {
    title: "Evidence-Informed Wellness",
    description:
      "We bridge traditional wisdom with modern research. Our team stays current on naturopathic science so we can guide you with confidence.",
  },
  {
    title: "Community First",
    description:
      "We are more than a store — we are a gathering place for health-conscious Canadians. From workshops to one-on-one consultations, we invest in our community.",
  },
  {
    title: "Sustainability",
    description:
      "From eco-friendly packaging to partnerships with responsible growers, we are committed to practices that honour the planet we depend on.",
  },
]

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-16">
          <h1 className="font-playfair text-4xl font-bold text-turquoise-800 mb-4">
            About Turquoise Wholistic
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Rooted in Ontario, guided by nature. We are on a mission to make
            holistic health accessible, trustworthy, and joyful for every
            Canadian.
          </p>
        </div>
      </div>

      <div className="content-container py-16">
        {/* Company Story */}
        <section className="max-w-3xl mb-16">
          <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-4">
            Our Story
          </h2>
          <div className="bg-sand-50 rounded-lg p-6 space-y-4 text-gray-700 leading-relaxed">
            <p>
              Turquoise Wholistic was born from a simple belief: that everyone
              deserves access to natural, high-quality health products and the
              knowledge to use them well. What started as a passion for
              naturopathic medicine has grown into a trusted destination for
              supplements, herbal remedies, essential oils, and wellness
              resources.
            </p>
            <p>
              Based in Ontario, Canada, we carefully curate every product in our
              catalogue — from NPN-certified supplements to small-batch herbal
              tinctures — so you can shop with confidence. Our team includes
              wellness enthusiasts, herbalists, and naturopathic practitioners
              who are always happy to help you find the right solution for your
              health journey.
            </p>
            <p>
              Whether you visit us in store or shop online, you will find a warm,
              knowledgeable community ready to support your path to wholistic
              well-being.
            </p>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="mb-16">
          <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-2">
            Mission &amp; Values
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl">
            We exist to empower Canadians to take charge of their health through
            natural, evidence-informed products and education.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-sand-50 rounded-lg p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-turquoise-500 mb-2">
                  {v.title}
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Approach to Wellness */}
        <section className="mb-16 max-w-3xl">
          <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-4">
            Our Approach to Wellness
          </h2>
          <div className="bg-sand-50 rounded-lg p-6 space-y-4 text-gray-700 leading-relaxed">
            <p>
              We take a wholistic view of health — one that considers the body,
              mind, and spirit as interconnected. Rather than quick fixes, we
              champion lasting habits: nourishing nutrition, mindful movement,
              restorative sleep, and the thoughtful use of natural supplements
              and remedies.
            </p>
            <p>
              Our product selection reflects this philosophy. We partner with
              Canadian and international producers who share our commitment to
              quality, transparency, and sustainability. Every supplement carries
              an NPN (Natural Product Number) where required, and we prioritise
              organic, non-GMO, and ethically sourced ingredients.
            </p>
            <p>
              Beyond products, we are building a resource hub — through our blog,
              in-store events, and one-on-one consultations — to help you make
              informed decisions about your well-being.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 bg-turquoise-50 rounded-lg">
          <h2 className="font-playfair text-2xl font-semibold text-turquoise-700 mb-3">
            Ready to start your wellness journey?
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Browse our curated collection of natural health products or get in
            touch — we would love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LocalizedClientLink
              href="/store"
              className="inline-block bg-turquoise-600 text-white font-medium px-8 py-3 rounded-md hover:bg-turquoise-700 transition-colors"
            >
              Shop Now
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/visit-us"
              className="inline-block border border-turquoise-600 text-turquoise-600 font-medium px-8 py-3 rounded-md hover:bg-turquoise-50 transition-colors"
            >
              Visit Us
            </LocalizedClientLink>
          </div>
        </section>
      </div>
    </div>
  )
}
