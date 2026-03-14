import { Metadata } from "next"
import ContactInfoList from "@modules/common/components/contact-info-list"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Turquoise Wholistic collects, uses, and protects your personal information in accordance with PIPEDA.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <div className="bg-turquoise-50 border-b border-turquoise-100">
        <div className="content-container py-16">
          <h1 className="font-playfair text-4xl font-bold text-turquoise-800">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: February 2026
          </p>
        </div>
      </div>

      <div className="content-container py-12 max-w-3xl">
        <div className="prose prose-gray prose-headings:font-playfair prose-headings:text-turquoise-700 max-w-none">
          <p>
            Turquoise Wholistic (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
            protecting your personal information and your right to privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you visit our website and make purchases from
            our online store, in accordance with Canada&apos;s Personal Information
            Protection and Electronic Documents Act (PIPEDA).
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li>
              <strong>Account Information:</strong> Name, email address, password
              (encrypted), and phone number when you create an account.
            </li>
            <li>
              <strong>Order Information:</strong> Shipping and billing addresses,
              payment method details (processed securely by Stripe), and order
              history.
            </li>
            <li>
              <strong>Communication:</strong> Any messages or inquiries you send
              to us.
            </li>
          </ul>
          <p>We also automatically collect:</p>
          <ul>
            <li>
              <strong>Usage Data:</strong> Browser type, IP address, pages
              visited, time spent, and referring URLs.
            </li>
            <li>
              <strong>Cookies:</strong> Essential cookies for site functionality
              and optional analytics cookies (with your consent).
            </li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To process and fulfill your orders</li>
            <li>To manage your account and provide customer support</li>
            <li>To send transactional emails (order confirmation, shipping updates)</li>
            <li>To improve our website and product offerings</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>3. Third-Party Services</h2>
          <p>
            We share your information with the following third-party service
            providers, solely for the purposes described:
          </p>
          <ul>
            <li>
              <strong>Stripe (Payment Processing):</strong> Processes your
              payment information securely. Stripe is headquartered in the United
              States. See{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Vercel (Website Hosting):</strong> Hosts our website.
              Vercel may process data in the United States. See{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Transactional Email Provider:</strong> Sends order
              confirmations and shipping notifications on our behalf.
            </li>
          </ul>

          <h2>4. Cookies</h2>
          <p>We use the following types of cookies:</p>
          <ul>
            <li>
              <strong>Essential Cookies:</strong> Required for the website to
              function (cart, authentication, region selection). These cannot be
              disabled.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Help us understand how visitors
              use our site. Only set with your explicit consent.
            </li>
          </ul>
          <p>
            You can manage your cookie preferences at any time through the cookie
            consent banner or your browser settings.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is
            active or as needed to provide you with our services. Order records
            are retained for a minimum of 7 years to comply with Canadian tax and
            business record requirements. You may request deletion of your account
            at any time.
          </p>

          <h2>6. Your Rights Under PIPEDA</h2>
          <p>Under PIPEDA, you have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Withdraw consent for non-essential data processing</li>
            <li>Request deletion of your personal information</li>
            <li>
              File a complaint with the Office of the Privacy Commissioner of
              Canada
            </li>
          </ul>

          <h2>7. Cross-Border Data Transfers</h2>
          <p>
            Some of our service providers (Stripe, Vercel) are headquartered in
            the United States. This means your personal information may be
            transferred to and processed in the United States or other
            jurisdictions outside Canada. We ensure that all third-party
            providers maintain adequate data protection safeguards.
          </p>

          <h2>8. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information, including encryption of data in
            transit (TLS/SSL), secure password hashing, and access controls. No
            method of transmission over the Internet is 100% secure, but we
            strive to protect your information.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise
            your rights under PIPEDA, please contact us:
          </p>
          <ContactInfoList />
        </div>
      </div>
    </div>
  )
}
