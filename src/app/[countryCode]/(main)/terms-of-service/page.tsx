import { Metadata } from "next"
import { getStoreSettings, settingOrPlaceholder } from "@lib/data/store-settings"
import ContactInfoList from "@modules/common/components/contact-info-list"
import PlaceholderMarker from "@modules/common/components/placeholder-marker"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using the Turquoise Wholistic online store.",
}

export default async function TermsOfServicePage() {
  const settings = await getStoreSettings()
  return (
    <div className="bg-white">
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-16">
          <h1 className="font-playfair text-4xl font-bold text-turquoise-800">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: February 2026
          </p>
        </div>
      </div>

      <div className="content-container py-12 max-w-3xl">
        <div className="prose prose-gray prose-headings:font-playfair prose-headings:text-turquoise-700 max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Turquoise Wholistic website and online
            store, you agree to be bound by these Terms of Service. If you do
            not agree to these terms, please do not use our website.
          </p>

          <h2>2. Products &amp; Pricing</h2>
          <p>
            All prices on our website are listed in Canadian Dollars (CAD) and
            are subject to applicable taxes. We strive to ensure pricing
            accuracy, but errors may occur. We reserve the right to correct
            pricing errors and cancel orders placed at incorrect prices.
          </p>
          <p>
            Product descriptions, images, and specifications are provided for
            informational purposes. While we make every effort to ensure
            accuracy, we do not warrant that product descriptions or other
            content are error-free.
          </p>

          <h2>3. Orders &amp; Payment</h2>
          <p>
            Placing an order constitutes an offer to purchase. We reserve the
            right to accept or decline any order. Payment is processed securely
            through Stripe and must be completed at the time of purchase.
          </p>
          <p>
            We accept major credit and debit cards, Apple Pay, and Google Pay.
            All transactions are processed in Canadian Dollars.
          </p>

          <h2>4. Shipping &amp; Delivery</h2>
          <p>
            We ship within Canada via Canada Post. Delivery times are estimates
            and are not guaranteed. We are not responsible for delays caused by
            the carrier, weather, or other circumstances beyond our control.
          </p>
          <p>
            Local pickup is available at our Ontario store during regular
            business hours. You will receive a notification when your order is
            ready for pickup.
          </p>
          <p>
            Free standard shipping is available on orders above the current
            threshold (see checkout for details).
          </p>

          <h2>5. Returns &amp; Refunds</h2>
          <p>
            Due to the nature of health products, returns are accepted within 30
            days of purchase for unopened, sealed products in their original
            packaging. Opened products cannot be returned for health and safety
            reasons, except in cases of defective or damaged goods.
          </p>
          <p>
            To initiate a return, please contact us at{" "}
            <PlaceholderMarker value={settings.email} placeholder="[EMAIL]" />.
            Refunds will be processed to the
            original payment method within 5-10 business days of receiving the
            returned item.
          </p>

          <h2>6. Health Disclaimer</h2>
          <p>
            The products and information on this website are not intended to
            diagnose, treat, cure, or prevent any disease. Information provided
            on our website is for educational purposes only and should not be
            considered medical advice.
          </p>
          <p>
            Natural Health Products (NHPs) sold on our website are regulated by
            Health Canada and carry a Natural Product Number (NPN) or
            Homeopathic Medicine Number (DIN-HM) where applicable. Always
            consult a qualified healthcare practitioner before starting any new
            supplement regimen, especially if you are pregnant, nursing, taking
            medications, or have a medical condition.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images,
            and software, is the property of Turquoise Wholistic or its
            licensors and is protected by Canadian and international copyright
            laws. You may not reproduce, distribute, or use any content without
            our prior written consent.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Turquoise Wholistic shall
            not be liable for any indirect, incidental, special, consequential,
            or punitive damages arising from your use of our website or products.
            Our total liability shall not exceed the amount paid by you for the
            specific product or service giving rise to the claim.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance
            with the laws of the Province of Ontario and the federal laws of
            Canada applicable therein. Any disputes shall be resolved in the
            courts of Ontario, Canada.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms of Service at any time.
            Changes will be posted on this page with an updated revision date.
            Your continued use of the website constitutes acceptance of the
            revised terms.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            For questions about these Terms of Service, please contact us:
          </p>
          <ContactInfoList />
        </div>
      </div>
    </div>
  )
}
