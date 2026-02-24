"use client"

import { useChannel } from "@lib/context/channel-context"

export default function ChannelToggle() {
  const { channel, setChannel, hydrated } = useChannel()

  if (!hydrated || !channel) return null

  return (
    <button
      onClick={() =>
        setChannel(channel === "retail" ? "professional" : "retail")
      }
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium transition-colors hover:border-turquoise-300"
      title={`Switch to ${channel === "retail" ? "Professional" : "Retail"} view`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          channel === "professional" ? "bg-blue-500" : "bg-turquoise-500"
        }`}
      />
      <span className="text-gray-600">
        {channel === "professional" ? "Professional" : "Retail"}
      </span>
    </button>
  )
}
