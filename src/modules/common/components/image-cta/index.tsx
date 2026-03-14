"use client"

import React from "react"
import Image from "next/image"
import DOMPurify from "isomorphic-dompurify"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams } from "next/navigation"
import { convertToLocale } from "@lib/util/money"

type Channel = "retail" | "professional"

type CtaProduct = {
  name: string
  thumbnail: string | null
  handle: string
  calculated_price: {
    calculated_amount: number
    original_amount: number | null
    currency_code: string
  } | null
}

export type ImageCtaProps = {
  id: string
  title: string
  heading: string | null
  description: string | null
  product_id: string
  image_url: string | null
  image_orientation: "left" | "right"
  cta_text: string
  cta_url: string | null
  background_color: string
  product_unavailable: boolean
  product: CtaProduct | null
  /** Override orientation for alternating layout on homepage */
  orientationOverride?: "left" | "right"
}

const BACKGROUND_CLASSES: Record<string, string> = {
  sand: "bg-sand-100",
  "turquoise-50": "bg-turquoise-50",
  white: "bg-white",
  "gold-50": "bg-[#FBF5E8]",
  "turquoise-100": "bg-turquoise-100",
  "sand-dark": "bg-sand-200",
}

const CHANNEL_LABELS: Record<Channel, string> = {
  retail: "Retail",
  professional: "Professional",
}

function getOtherChannel(current: Channel | null): Channel {
  return current === "professional" ? "retail" : "professional"
}

export default function ImageCta({
  title,
  heading,
  description,
  image_url,
  image_orientation,
  cta_text,
  cta_url,
  background_color,
  product_unavailable,
  product,
  orientationOverride,
}: ImageCtaProps) {
  const params = useParams()
  const channel = params.channel as Channel | undefined

  // Hide if product is unavailable (deleted)
  if (product_unavailable || !product) {
    return null
  }

  const orientation = orientationOverride ?? image_orientation
  const imageLeft = orientation === "left"
  const imageSrc = image_url || product.thumbnail
  const bgClass = BACKGROUND_CLASSES[background_color] || "bg-sand-100"
  const productHref = `/products/${product.handle}`
  const ctaHref = cta_url || productHref

  // Format price
  const price = product.calculated_price
  const formattedPrice = price
    ? convertToLocale({
        amount: price.calculated_amount,
        currency_code: price.currency_code,
      })
    : null

  // Sanitize description HTML
  const sanitizedDescription = description
    ? DOMPurify.sanitize(description, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "em",
          "a",
          "ul",
          "ol",
          "li",
          "blockquote",
        ],
        ALLOWED_ATTR: ["href", "target", "rel"],
      })
    : null

  // Channel awareness: detect if product might be in another channel
  const otherChannel = channel ? getOtherChannel(channel) : null

  return (
    <div
      className={clx("w-full overflow-hidden rounded-xl", bgClass)}
      role="region"
      aria-label={`Promotion: ${title}`}
    >
      <div
        className={clx(
          "flex flex-col small:flex-row items-center gap-0",
          !imageLeft && "small:flex-row-reverse"
        )}
      >
        {/* Image Section */}
        <div className="w-full small:w-1/2 relative aspect-[4/3] small:aspect-auto small:min-h-[360px]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={`${heading || product.name} product image`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={80}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-sand-100">
              <span className="text-brand-text-secondary text-sm">
                No image available
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="w-full small:w-1/2 flex flex-col justify-center p-8 small:p-12 gap-4">
          {heading && (
            <h3 className="font-serif text-2xl small:text-3xl text-brand-text font-medium leading-tight">
              {heading}
            </h3>
          )}

          {!heading && (
            <h3 className="font-serif text-2xl small:text-3xl text-brand-text font-medium leading-tight">
              {product.name}
            </h3>
          )}

          {sanitizedDescription && (
            <div
              className="text-brand-text-secondary text-base leading-relaxed prose prose-sm max-w-none
                prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
                prose-a:text-turquoise-500 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-turquoise-300 prose-blockquote:text-brand-text-secondary"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          )}

          {formattedPrice && (
            <p className="text-lg font-semibold text-brand-text">
              {formattedPrice}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2">
            <LocalizedClientLink
              href={ctaHref}
              className="inline-flex items-center px-6 py-3 bg-turquoise-400 text-white rounded-full
                hover:bg-turquoise-500 transition-colors duration-200 font-medium text-sm"
            >
              {cta_text}
            </LocalizedClientLink>
          </div>

          {/* Channel awareness note */}
          {!product_unavailable && otherChannel && (
            <ChannelNote
              otherChannel={otherChannel}
              productHandle={product.handle}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Shows a note about product availability in another channel.
 * Only shown when the product exists — if it's in both channels, this is informational.
 */
function ChannelNote({
  otherChannel,
  productHandle,
}: {
  otherChannel: Channel
  productHandle: string
}) {
  const label = CHANNEL_LABELS[otherChannel]

  return (
    <p className="text-xs text-brand-text-secondary mt-1">
      Also available in{" "}
      <LocalizedClientLink
        href={`/${otherChannel}/products/${productHandle}`}
        className="text-turquoise-500 underline hover:text-turquoise-600 transition-colors"
      >
        {label}
      </LocalizedClientLink>{" "}
      channel
    </p>
  )
}
