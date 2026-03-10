"use client"

import { useChannel, Channel } from "@lib/context/channel-context"

const channels: {
  key: Channel
  title: string
  description: string
  icon: string
}[] = [
  {
    key: "retail",
    title: "Shop All Products",
    description:
      "Browse our full catalog of natural health products, supplements, and wellness essentials.",
    icon: "🌿",
  },
  {
    key: "professional",
    title: "Professional Products",
    description:
      "View our curated selection of professional-grade products for health practitioners.",
    icon: "⚕️",
  },
]

export default function ChannelSplash() {
  const { isChannelSelected, setChannel, hydrated } = useChannel()

  // Don't render anything until hydrated (prevents flash)
  if (!hydrated || isChannelSelected) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-playfair text-3xl font-bold text-turquoise-600">
            Welcome to Turquoise Wholistic
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Choose your browsing experience to get started.
          </p>
        </div>

        {/* Channel cards */}
        <div className="flex flex-col gap-4">
          {channels.map((ch) => (
            <button
              key={ch.key}
              onClick={() => setChannel(ch.key)}
              className="group flex items-start gap-4 rounded-xl border-2 border-gray-100 bg-sand-50 p-5 text-left transition-all hover:border-turquoise-300 hover:shadow-md"
            >
              <span className="mt-0.5 text-2xl">{ch.icon}</span>
              <div>
                <span className="block text-base font-semibold text-gray-800 group-hover:text-turquoise-600">
                  {ch.title}
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  {ch.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          You can switch between channels anytime from the header.
        </p>
      </div>
    </div>
  )
}
