import { ChannelProvider } from "@lib/context/channel-context"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
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
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <ChannelProvider>
          <main className="relative">{props.children}</main>
        </ChannelProvider>
      </body>
    </html>
  )
}
