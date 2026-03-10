"use client"

import { useChannel } from "@lib/context/channel-context"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

/**
 * Syncs the channel context (localStorage) with the URL search params.
 * When the channel toggle changes, this updates the store page URL
 * so the server component re-renders with the new channel filter.
 */
export default function ChannelFilterSync() {
  const { channel, hydrated } = useChannel()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!hydrated) return

    const currentChannel = searchParams.get("channel") || "all"
    const targetChannel = channel || "all"

    if (currentChannel !== targetChannel) {
      const params = new URLSearchParams(searchParams)
      if (targetChannel === "all") {
        params.delete("channel")
      } else {
        params.set("channel", targetChannel)
      }
      // Reset to page 1 when channel changes
      params.delete("page")
      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ""}`)
    }
  }, [channel, hydrated, searchParams, pathname, router])

  return null
}
