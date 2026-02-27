"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useChannel } from "@lib/context/channel-context"

const RETAIL_CART_COOKIE = "tw-cart-retail"
const PROFESSIONAL_CART_COOKIE = "tw-cart-professional"

/** Also store in localStorage so client code can access cart IDs synchronously */
const RETAIL_CART_LS_KEY = "tw-cart-retail"
const PROFESSIONAL_CART_LS_KEY = "tw-cart-professional"

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
  )
  return match ? decodeURIComponent(match[1]) : null
}

function syncToLocalStorage(key: string, value: string | null) {
  try {
    if (value) {
      localStorage.setItem(key, value)
    } else {
      localStorage.removeItem(key)
    }
  } catch {
    // localStorage unavailable (SSR, incognito full, etc.)
  }
}

interface DualCartContextValue {
  retailCartId: string | null
  professionalCartId: string | null
  activeCartId: string | null
  refreshCartIds: () => void
}

const DualCartContext = createContext<DualCartContextValue | null>(null)

export function DualCartProvider({ children }: { children: React.ReactNode }) {
  const { channel, hydrated } = useChannel()
  const [retailCartId, setRetailCartId] = useState<string | null>(null)
  const [professionalCartId, setProfessionalCartId] = useState<string | null>(
    null
  )

  const refreshCartIds = useCallback(() => {
    const retail = getCookie(RETAIL_CART_COOKIE)
    const professional = getCookie(PROFESSIONAL_CART_COOKIE)
    setRetailCartId(retail)
    setProfessionalCartId(professional)
    syncToLocalStorage(RETAIL_CART_LS_KEY, retail)
    syncToLocalStorage(PROFESSIONAL_CART_LS_KEY, professional)
  }, [])

  // Read cart IDs from cookies on hydration and when channel changes
  useEffect(() => {
    if (!hydrated) return
    refreshCartIds()
  }, [hydrated, channel, refreshCartIds])

  const activeCartId =
    channel === "professional" ? professionalCartId : retailCartId

  return (
    <DualCartContext.Provider
      value={{ retailCartId, professionalCartId, activeCartId, refreshCartIds }}
    >
      {children}
    </DualCartContext.Provider>
  )
}

export function useDualCart(): DualCartContextValue {
  const context = useContext(DualCartContext)
  if (context === null) {
    throw new Error("useDualCart must be used within a DualCartProvider")
  }
  return context
}
