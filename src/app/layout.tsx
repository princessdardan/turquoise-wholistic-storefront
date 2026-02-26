import { ChannelProvider } from "@lib/context/channel-context"
import { ToastProvider } from "@lib/context/toast-context"
import ToastContainer from "@modules/common/components/toast"
import { getBaseURL } from "@lib/util/env"
import { GA4_MEASUREMENT_ID } from "@lib/analytics"
import { Metadata } from "next"
import Script from "next/script"
import { Inter, Playfair_Display } from "next/font/google"
import "styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Turquoise Wholistic | Holistic Health & Wellness",
    template: "%s | Turquoise Wholistic",
  },
  description:
    "Discover natural health solutions, herbal remedies, supplements, and wellness products. Turquoise Wholistic is your destination for holistic medicine and mindful living.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "Turquoise Wholistic",
    title: "Turquoise Wholistic | Holistic Health & Wellness",
    description:
      "Discover natural health solutions, herbal remedies, supplements, and wellness products. Your destination for holistic medicine and mindful living.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Turquoise Wholistic | Holistic Health & Wellness",
    description:
      "Discover natural health solutions, herbal remedies, supplements, and wellness products.",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${inter.variable} ${playfair.variable}`}>
      {GA4_MEASUREMENT_ID && (
        <head>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_MEASUREMENT_ID}');
            `}
          </Script>
        </head>
      )}
      <body>
        <ChannelProvider>
          <ToastProvider>
            <main className="relative">{props.children}</main>
            <ToastContainer />
          </ToastProvider>
        </ChannelProvider>
      </body>
    </html>
  )
}
