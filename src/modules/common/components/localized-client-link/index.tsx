"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

const SHARED_PREFIXES = [
  "/account",
  "/checkout",
  "/cart",
  "/blog",
  "/order",
  "/practitioner",
  "/about",
  "/contact",
  "/gift-cards",
  "/search",
  "/visit-us",
  "/privacy-policy",
  "/terms-of-service",
  "/return-policy",
  "/shipping-policy",
]

/**
 * Channel-aware link component.
 * - Inside [channel] routes: prepends /{channel} unless href is a shared path
 * - On shared pages: uses bare href
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  const params = useParams()
  const channel = params.channel as string | undefined
  const isSharedPath = SHARED_PREFIXES.some((p) => href.startsWith(p))
  const prefix = channel && !isSharedPath ? `/${channel}` : ""

  return (
    <Link href={`${prefix}${href}`} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
