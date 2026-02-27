"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useChannel } from "@lib/context/channel-context"
import { useToast } from "@lib/context/toast-context"

export default function ChannelToggle() {
  const { channel, setChannel, hydrated } = useChannel()
  const { addToast } = useToast()
  const router = useRouter()
  const [switching, setSwitching] = useState(false)

  const handleSwitch = useCallback(() => {
    if (switching) return

    const newChannel = channel === "retail" ? "professional" : "retail"
    const label = newChannel === "professional" ? "Professional" : "Retail"

    setSwitching(true)
    setChannel(newChannel)

    addToast(`Showing ${label} Products`, "info")

    // Brief delay lets the SDK reconfigure before server components re-fetch
    setTimeout(() => {
      router.refresh()
      setSwitching(false)
    }, 150)
  }, [channel, switching, setChannel, addToast, router])

  if (!hydrated || !channel) return null

  return (
    <button
      onClick={handleSwitch}
      disabled={switching}
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium transition-colors hover:border-turquoise-300 disabled:opacity-60"
      title={`Switch to ${channel === "retail" ? "Professional" : "Retail"} view`}
    >
      {switching ? (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-turquoise-500" />
      ) : (
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            channel === "professional" ? "bg-blue-500" : "bg-turquoise-500"
          }`}
        />
      )}
      <span className="text-gray-600">
        {channel === "professional" ? "Professional" : "Retail"}
      </span>
    </button>
  )
}
