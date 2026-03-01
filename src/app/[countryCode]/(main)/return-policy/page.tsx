import { Metadata } from "next"
import { getStoreSettings } from "@lib/data/store-settings"
import ContactInfoList from "@modules/common/components/contact-info-list"
import PlaceholderMarker from "@modules/common/components/placeholder-marker"

export const metadata: Metadata = {
  title: "Refund & Return Policy",
  description:
    "Learn about Turquoise Wholistic's refund and return policy for health and wellness products.",
}

export default async function ReturnPolicyPage() {
  const settings = await getStoreSettings()
  return (
    <div className="bg-white">
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-16">
          <h1 className="font-playfair text-4xl font-bold text-turquoise-800">
            Refund &amp; Return Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: February 2026
          </p>
        </div>
      </div>

      <div className="content-container py-12 max-w-3xl">
        <div className="prose prose-gray prose-headings:font-playfair prose-headings:text-turquoise-700 max-w-none">
          <p>
            At Turquoise Wholistic, your satisfaction is important to us. Due to
            the nature of health and wellness products, we have specific return
            and refund guidelines to ensure the safety and quality of our
            products. Please review this policy carefully before making a
            purchase.
          </p>

          <h2>1. Eligibility for Returns</h2>
          <p>
            We accept returns within <strong>30 days</strong> of the delivery
            date under the following conditions:
          </p>
          <ul>
            <li>
              <strong>Unopened &amp; Sealed Products:</strong> Items must be in
              their original, unopened, and sealed packaging.
            </li>
            <li>
              <strong>Defective or Damaged Goods:</strong> Products that arrived
              damaged, defective, or differ from what was ordered may be returned
              regardless of whether they have been opened.
            </li>
            <li>
              <strong>Incorrect Orders:</strong> If you received the wrong
              product, we will arrange a return and replacement at no cost to
              you.
            </li>
          </ul>

          <h2>2. Non-Returnable Items</h2>
          <p>
            For health and safety reasons, the following items cannot be
            returned:
          </p>
          <ul>
            <li>Opened supplements, herbal remedies, or teas</li>
            <li>Opened essential oils or skincare products</li>
            <li>Gift cards</li>
            <li>Sale or clearance items (unless defective)</li>
            <li>
              Products that have been used, altered, or are not in their original
              packaging
            </li>
          </ul>

          <h2>3. How to Initiate a Return</h2>
          <p>To start a return, please follow these steps:</p>
          <ol>
            <li>
              <strong>Contact Us:</strong> Email us at{" "}
              <PlaceholderMarker value={settings.email} placeholder="[EMAIL]" /> with your order number, the item(s) you
              wish to return, and the reason for the return.
            </li>
            <li>
              <strong>Receive Authorization:</strong> We will review your request
              and, if approved, provide you with a Return Merchandise
              Authorization (RMA) number and return shipping instructions.
            </li>
            <li>
              <strong>Ship the Item:</strong> Pack the item securely in its
              original packaging and ship it to the address provided. Please
              include the RMA number on the outside of the package.
            </li>
          </ol>
          <p>
            <strong>Important:</strong> Do not send returns without first
            obtaining an RMA number. Unauthorized returns may not be processed.
          </p>

          <h2>4. Return Shipping Costs</h2>
          <ul>
            <li>
              <strong>Defective, Damaged, or Incorrect Items:</strong> We will
              cover return shipping costs and provide a prepaid shipping label.
            </li>
            <li>
              <strong>Change of Mind:</strong> The customer is responsible for
              return shipping costs.
            </li>
          </ul>

          <h2>5. Refund Process</h2>
          <p>
            Once we receive and inspect your returned item, we will notify you
            by email regarding the status of your refund.
          </p>
          <ul>
            <li>
              <strong>Approved Refunds:</strong> Refunds are processed to the
              original payment method within 5&ndash;10 business days. Please
              allow additional time for your bank or credit card provider to
              reflect the refund.
            </li>
            <li>
              <strong>Partial Refunds:</strong> In some cases (e.g., items not
              in original condition, missing packaging), a partial refund may be
              issued at our discretion.
            </li>
          </ul>

          <h2>6. Exchanges</h2>
          <p>
            We do not offer direct exchanges. If you would like a different
            product or variant, please return the original item for a refund and
            place a new order.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about our return and refund policy, please
            contact us:
          </p>
          <ContactInfoList />
        </div>
      </div>
    </div>
  )
}
