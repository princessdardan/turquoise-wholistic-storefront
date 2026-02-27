import { ChannelProvider } from "@lib/context/channel-context"
import { MedusaClientProvider } from "@lib/context/medusa-client-context"
import { ToastProvider } from "@lib/context/toast-context"
import ToastContainer from "@modules/common/components/toast"
import { getBaseURL } from "@lib/util/env"
import { GA4_MEASUREMENT_ID } from "@lib/analytics"
import { Metadata, Viewport } from "next"
import { headers } from "next/headers"
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#40E0D0",
}

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

export default async function RootLayout(props: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? ""

  return (
    <html lang="en" data-mode="light" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://medusa-public-images.s3.eu-west-1.amazonaws.com" crossOrigin="anonymous" />
      </head>
      {GA4_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
            strategy="lazyOnload"
            nonce={nonce}
          />
          <Script id="ga4-init" strategy="lazyOnload" nonce={nonce}>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-turquoise-600 focus:text-white focus:rounded-md focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to content
        </a>
        <ChannelProvider>
          <MedusaClientProvider>
            <ToastProvider>
              <main id="main-content" className="relative">{props.children}</main>
              <ToastContainer />
            </ToastProvider>
          </MedusaClientProvider>
        </ChannelProvider>
      </body>
    </html>
  )
}
