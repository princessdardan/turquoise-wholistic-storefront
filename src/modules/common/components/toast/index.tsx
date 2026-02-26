"use client"

import { useToast, type Toast as ToastType, type ToastVariant } from "@lib/context/toast-context"

const variantStyles: Record<ToastVariant, string> = {
  success:
    "bg-turquoise-50 border-turquoise-400 text-turquoise-700",
  error:
    "bg-red-50 border-red-400 text-red-700",
  warning:
    "bg-amber-50 border-gold-400 text-amber-700",
  info:
    "bg-sand-50 border-turquoise-300 text-brand-text",
}

const variantIcons: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i",
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: ToastType
  onClose: () => void
}) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-rounded border px-4 py-3 shadow-lg animate-toast-in font-sans ${variantStyles[toast.variant]}`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/60 text-xs font-semibold leading-none">
        {variantIcons[toast.variant]}
      </span>
      <p className="flex-1 text-sm leading-5">{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-sm:right-0 max-sm:left-0 max-sm:items-center max-sm:px-4"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}
