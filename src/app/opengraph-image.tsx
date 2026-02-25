import { ImageResponse } from "next/og"

export const alt = "Turquoise Wholistic — Holistic Health & Wellness"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#F5F0EB",
          padding: "60px",
        }}
      >
        {/* Lotus icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          width="120"
          height="120"
          fill="none"
        >
          <path
            d="M32 8 C32 8, 22 24, 22 36 C22 44, 26.5 48, 32 48 C37.5 48, 42 44, 42 36 C42 24, 32 8, 32 8Z"
            fill="#40E0D0"
          />
          <path
            d="M20 20 C20 20, 10 32, 10 40 C10 46, 14 50, 20 50 C25 50, 28 47, 28 42 C28 34, 20 20, 20 20Z"
            fill="#40E0D0"
            opacity="0.7"
          />
          <path
            d="M44 20 C44 20, 54 32, 54 40 C54 46, 50 50, 44 50 C39 50, 36 47, 36 42 C36 34, 44 20, 44 20Z"
            fill="#40E0D0"
            opacity="0.7"
          />
          <path
            d="M14 50 Q32 58, 50 50"
            stroke="#D4A853"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Brand name */}
        <div
          style={{
            display: "flex",
            fontSize: "64px",
            fontWeight: 700,
            color: "#40E0D0",
            marginTop: "30px",
            letterSpacing: "-1px",
          }}
        >
          Turquoise Wholistic
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: "#6B7280",
            marginTop: "16px",
          }}
        >
          Holistic Health & Natural Wellness Products
        </div>

        {/* Decorative line */}
        <div
          style={{
            display: "flex",
            width: "120px",
            height: "3px",
            backgroundColor: "#D4A853",
            marginTop: "30px",
            borderRadius: "2px",
          }}
        />

        {/* URL */}
        <div
          style={{
            display: "flex",
            fontSize: "20px",
            color: "#9CA3AF",
            marginTop: "24px",
          }}
        >
          turquoisewholistic.com
        </div>
      </div>
    ),
    { ...size }
  )
}
