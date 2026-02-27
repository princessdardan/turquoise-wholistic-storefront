"use client"

import React, { createContext, useContext, useEffect, useRef } from "react"
import { useChannel, Channel } from "@lib/context/channel-context"
import {
  sdk,
  RETAIL_PUBLISHABLE_KEY,
  PROFESSIONAL_PUBLISHABLE_KEY,
  setActivePublishableKey,
} from "@lib/config"
import type Medusa from "@medusajs/js-sdk"

const CHANNEL_COOKIE = "tw-channel"

function getPublishableKeyForChannel(
  channel: Channel | null
): string | undefined {
  if (channel === "professional") return PROFESSIONAL_PUBLISHABLE_KEY
  return RETAIL_PUBLISHABLE_KEY
}

function setChannelCookie(channel: Channel) {
  document.cookie = `${CHANNEL_COOKIE}=${channel};path=/;max-age=${60 * 60 * 24 * 365};samesite=strict`
}

interface MedusaClientContextValue {
  client: Medusa
  publishableKey: string | undefined
}

const MedusaClientContext = createContext<MedusaClientContextValue | null>(null)

export function MedusaClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { channel, hydrated } = useChannel()
  const prevChannelRef = useRef<Channel | null>(null)

  useEffect(() => {
    if (!hydrated) return

    const key = getPublishableKeyForChannel(channel)
    setActivePublishableKey(key)

    if (channel) {
      setChannelCookie(channel)
    }

    prevChannelRef.current = channel
  }, [channel, hydrated])

  const publishableKey = getPublishableKeyForChannel(channel)

  return (
    <MedusaClientContext.Provider value={{ client: sdk, publishableKey }}>
      {children}
    </MedusaClientContext.Provider>
  )
}

export function useMedusaClient(): MedusaClientContextValue {
  const context = useContext(MedusaClientContext)
  if (context === null) {
    throw new Error(
      "useMedusaClient must be used within a MedusaClientProvider"
    )
  }
  return context
}
