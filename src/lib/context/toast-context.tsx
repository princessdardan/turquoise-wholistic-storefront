"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react"

export type ToastVariant = "success" | "error" | "warning" | "info"

export interface ToastOptions {
  action?: () => void
  actionLabel?: string
  duration?: number
  onDismiss?: () => void
}

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  action?: () => void
  actionLabel?: string
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant, options?: ToastOptions) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastCounter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const onDismissMap = useRef(new Map<string, () => void>())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const onDismiss = onDismissMap.current.get(id)
    if (onDismiss) {
      onDismiss()
      onDismissMap.current.delete(id)
    }
  }, [])

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", options?: ToastOptions) => {
      const id = `toast-${++toastCounter}`

      if (options?.onDismiss) {
        onDismissMap.current.set(id, options.onDismiss)
      }

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          variant,
          action: options?.action,
          actionLabel: options?.actionLabel,
        },
      ])

      setTimeout(() => {
        removeToast(id)
      }, options?.duration ?? 5000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (context === null) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
