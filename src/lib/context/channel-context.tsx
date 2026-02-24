"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

export type Channel = "retail" | "professional"

const STORAGE_KEY = "tw-channel"

interface ChannelContextValue {
  channel: Channel | null
  setChannel: (channel: Channel) => void
  isChannelSelected: boolean
  hydrated: boolean
}

const ChannelContext = createContext<ChannelContextValue | null>(null)

export function ChannelProvider({ children }: { children: React.ReactNode }) {
  const [channel, setChannelState] = useState<Channel | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "retail" || stored === "professional") {
      setChannelState(stored)
    }
    setHydrated(true)
  }, [])

  const setChannel = useCallback((value: Channel) => {
    localStorage.setItem(STORAGE_KEY, value)
    setChannelState(value)
  }, [])

  const isChannelSelected = hydrated && channel !== null

  return (
    <ChannelContext.Provider
      value={{ channel, setChannel, isChannelSelected, hydrated }}
    >
      {children}
    </ChannelContext.Provider>
  )
}

export function useChannel(): ChannelContextValue {
  const context = useContext(ChannelContext)
  if (context === null) {
    throw new Error("useChannel must be used within a ChannelProvider")
  }
  return context
}
