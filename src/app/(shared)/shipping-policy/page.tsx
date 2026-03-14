import { Metadata } from "next"
import ContactInfoList from "@modules/common/components/contact-info-list"

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Learn about Turquoise Wholistic's shipping options, delivery times, and policies for orders within Canada.",
}

export default async function ShippingPolicyPage() {
  return (
    <div className="bg-white">
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-16">
          <h1 className="font-playfair text-4xl font-bold text-turquoise-800">
            Shipping Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: February 2026
          </p>
        </div>
      </div>

      <div className="content-container py-12 max-w-3xl">
        <div className="prose prose-gray prose-headings:font-playfair prose-headings:text-turquoise-700 max-w-none">
          <p>
            Turquoise Wholistic ships exclusively within Canada. We partner with
            Purolator to deliver your health and wellness products safely and
            efficiently. Please review our shipping policy below for details on
            delivery options, processing times, and more.
          </p>

          <h2>1. Shipping Coverage</h2>
          <p>
            We currently ship to all provinces and territories within Canada. At
            this time, we do not offer international shipping.
          </p>

          <h2>2. Shipping Options</h2>
          <table>
            <thead>
              <tr>
                <th>Option</th>
                <th>Estimated Delivery</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Purolator Ground</td>
                <td>5&ndash;8 business days</td>
                <td>Calculated at checkout</td>
              </tr>
              <tr>
                <td>Purolator Express</td>
                <td>2&ndash;3 business days</td>
                <td>Calculated at checkout</td>
              </tr>
            </tbody>
          </table>
          <p>
            Shipping rates are calculated based on your delivery address,
            package weight, and chosen shipping method. Final rates will be
            displayed at checkout before you complete your order.
          </p>

          <h2>3. Order Processing Time</h2>
          <p>
            Orders are processed within <strong>1&ndash;2 business days</strong>{" "}
            after payment is confirmed. Orders placed on weekends or holidays
            will be processed on the next business day.
          </p>
          <p>
            During peak periods (holidays, promotional events), processing times
            may be slightly longer. We will notify you of any significant
            delays.
          </p>

          <h2>4. Order Tracking</h2>
          <p>
            Once your order has been shipped, you will receive a confirmation
            email with a Purolator tracking number. You can track your
            package&apos;s progress on the{" "}
            <a
              href="https://www.purolator.com/en/shipping/tracker"
              target="_blank"
              rel="noopener noreferrer"
            >
              Purolator tracking page
            </a>
            .
          </p>

          <h2>5. Delivery Issues</h2>
          <ul>
            <li>
              <strong>Missed Deliveries:</strong> If you are not available to
              receive your package, Purolator will leave a delivery notice with
              instructions for pickup or redelivery.
            </li>
            <li>
              <strong>Damaged Packages:</strong> If your order arrives damaged,
              please contact us within 48 hours of delivery with photos of the
              damage. We will arrange a replacement or refund.
            </li>
            <li>
              <strong>Lost Packages:</strong> If your tracking shows the package
              as delivered but you have not received it, please contact us. We
              will work with Purolator to investigate and resolve the issue.
            </li>
          </ul>

          <h2>6. Local Pickup</h2>
          <p>
            Local pickup is available at our Ontario store location during
            regular business hours. Select &quot;Local Pickup&quot; at checkout
            to choose this option. You will receive an email notification when
            your order is ready for pickup.
          </p>

          <h2>7. Remote &amp; Northern Areas</h2>
          <p>
            Deliveries to remote or northern communities may take additional
            time and may incur higher shipping costs due to carrier surcharges.
            These costs will be reflected at checkout.
          </p>

          <h2>8. Order Changes &amp; Cancellations</h2>
          <p>
            If you need to change or cancel your order, please contact us as
            soon as possible. Once an order has been shipped, it cannot be
            cancelled. In that case, you may return the order per our{" "}
            <a href="/return-policy">Refund &amp; Return Policy</a>.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about our shipping policy, please contact
            us:
          </p>
          <ContactInfoList />
        </div>
      </div>
    </div>
  )
}
