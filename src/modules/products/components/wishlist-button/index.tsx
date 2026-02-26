"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

type WishlistButtonProps = {
  productId: string
  variant?: "icon" | "button"
}

export default function WishlistButton({
  productId,
  variant = "icon",
}: WishlistButtonProps) {
  const { isLoggedIn, isInWishlist, toggleWishlist, isLoading } = useWishlist()
  const router = useRouter()
  const params = useParams()
  const [animating, setAnimating] = useState(false)

  const wishlisted = isInWishlist(productId)
  const countryCode = params.countryCode as string | undefined

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!isLoggedIn) {
      const prefix = countryCode ? `/${countryCode}` : ""
      router.push(`${prefix}/account`)
      return
    }

    setAnimating(true)
    await toggleWishlist(productId)
    setTimeout(() => setAnimating(false), 300)
  }

  const colorClass = wishlisted
    ? "text-turquoise-500"
    : "text-gray-400 hover:text-turquoise-500"

  if (variant === "button") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-x-2 text-sm transition-colors disabled:opacity-50 shrink-0 pt-1 ${colorClass}`}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <HeartIcon
          filled={wishlisted}
          className="w-5 h-5"
          animating={animating}
        />
        <span className="whitespace-nowrap">
          {wishlisted ? "In Wishlist" : "Add to Wishlist"}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md transition-all disabled:opacity-50 ${colorClass}`}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <HeartIcon
        filled={wishlisted}
        className="w-[18px] h-[18px]"
        animating={animating}
      />
    </button>
  )
}

function HeartIcon({
  filled,
  className = "",
  animating = false,
}: {
  filled: boolean
  className?: string
  animating?: boolean
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${animating ? "scale-125" : "scale-100"} transition-transform duration-200`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  )
}
