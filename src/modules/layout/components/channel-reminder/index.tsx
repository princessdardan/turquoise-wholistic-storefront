"use client"

import { useChannel } from "@lib/context/channel-context"
import { useToast } from "@lib/context/toast-context"
import { useEffect, useRef } from "react"

const LAST_CONFIRMED_KEY = "tw-channel-last-confirmed"
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export default function ChannelReminder() {
  const { channel, setChannel, hydrated, isChannelSelected } = useChannel()
  const { addToast } = useToast()
  const shownRef = useRef(false)

  useEffect(() => {
    if (!hydrated || !isChannelSelected || !channel || shownRef.current) return

    const lastConfirmed = localStorage.getItem(LAST_CONFIRMED_KEY)

    // If never confirmed (pre-existing user) or 30 days have passed
    if (lastConfirmed && Date.now() - parseInt(lastConfirmed, 10) < THIRTY_DAYS_MS) {
      return
    }

    shownRef.current = true

    const label = channel === "professional" ? "Professional" : "Retail"

    addToast(
      `You\u2019re browsing as ${label}. Switch?`,
      "info",
      {
        action: () => {
          const newChannel = channel === "retail" ? "professional" : "retail"
          setChannel(newChannel)
        },
        actionLabel: "Switch",
        duration: 8000,
        onDismiss: () => {
          localStorage.setItem(LAST_CONFIRMED_KEY, Date.now().toString())
        },
      }
    )
  }, [hydrated, isChannelSelected, channel, addToast, setChannel])

  return null
}
