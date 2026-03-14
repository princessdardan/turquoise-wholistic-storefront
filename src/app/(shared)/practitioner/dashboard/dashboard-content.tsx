"use client"

import { useState, useTransition } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  type Practitioner,
  type PractitionerCode,
  type PractitionerStats,
  deactivatePractitionerCode,
} from "@lib/data/practitioner"

type Props = {
  practitioner: Practitioner
  initialCodes: PractitionerCode[]
  initialCount: number
  initialStats: PractitionerStats
}

function StatusBadge({ status }: { status: Practitioner["status"] }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    suspended: "bg-rose-100 text-rose-800 border-rose-200",
  }

  const labels = {
    pending: "Pending Approval",
    approved: "Approved",
    suspended: "Suspended",
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

function StatsCards({ stats }: { stats: PractitionerStats }) {
  const cards = [
    { label: "Total Codes", value: stats.total_codes },
    { label: "Active Codes", value: stats.active_codes },
    { label: "Total Redemptions", value: stats.total_redemptions },
  ]

  return (
    <div className="grid grid-cols-1 small:grid-cols-3 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-sand-50 border border-sand-200 rounded-lg p-5"
        >
          <p className="text-sm text-gray-500 mb-1">{card.label}</p>
          <p className="text-2xl font-bold text-turquoise-800">{card.value}</p>
        </div>
      ))}
    </div>
  )
}

function CodeRow({
  code,
  onDeactivate,
}: {
  code: PractitionerCode
  onDeactivate: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
  const atMax =
    code.max_redemptions !== null &&
    code.redemption_count >= code.max_redemptions

  let statusText = "Active"
  let statusClass = "text-emerald-600"

  if (!code.is_active) {
    statusText = "Inactive"
    statusClass = "text-gray-400"
  } else if (isExpired) {
    statusText = "Expired"
    statusClass = "text-amber-600"
  } else if (atMax) {
    statusText = "Max Reached"
    statusClass = "text-amber-600"
  }

  const handleDeactivate = () => {
    startTransition(async () => {
      const result = await deactivatePractitionerCode(code.id)
      if (result.success) {
        onDeactivate(code.id)
      }
    })
  }

  return (
    <div className="flex flex-col small:flex-row small:items-center justify-between gap-3 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
            {code.code}
          </code>
          <span className={`text-xs font-medium ${statusClass}`}>
            {statusText}
          </span>
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          <span>
            {code.redemption_count}
            {code.max_redemptions !== null
              ? ` / ${code.max_redemptions}`
              : ""}{" "}
            redemptions
          </span>
          {code.expires_at && (
            <span>
              Expires {new Date(code.expires_at).toLocaleDateString()}
            </span>
          )}
          <span>
            Created {new Date(code.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      {code.is_active && (
        <button
          onClick={handleDeactivate}
          disabled={isPending}
          className="text-xs text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50 shrink-0"
        >
          {isPending ? "Deactivating..." : "Deactivate"}
        </button>
      )}
    </div>
  )
}

export default function DashboardContent({
  practitioner,
  initialCodes,
  initialCount,
  initialStats,
}: Props) {
  const [codes, setCodes] = useState(initialCodes)
  const [stats, setStats] = useState(initialStats)

  const handleDeactivate = (codeId: string) => {
    setCodes((prev) =>
      prev.map((c) => (c.id === codeId ? { ...c, is_active: false } : c))
    )
    setStats((prev) => ({
      ...prev,
      active_codes: Math.max(0, prev.active_codes - 1),
    }))
  }

  if (practitioner.status === "pending") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="font-playfair text-xl font-bold text-amber-800 mb-2">
          Application Pending
        </h3>
        <p className="text-amber-700">
          Your practitioner application is pending approval. We&apos;ll notify
          you once it&apos;s been reviewed. This usually takes 1-2 business
          days.
        </p>
      </div>
    )
  }

  if (practitioner.status === "suspended") {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-8 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-rose-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="font-playfair text-xl font-bold text-rose-800 mb-2">
          Account Suspended
        </h3>
        <p className="text-rose-700">
          Your practitioner account has been suspended. If you believe this is an
          error, please contact our support team for assistance.
        </p>
      </div>
    )
  }

  // Approved state
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <StatusBadge status={practitioner.status} />
        <LocalizedClientLink
          href="/practitioner/dashboard/codes/new"
          className="inline-flex items-center bg-turquoise-600 text-white font-medium px-5 py-2.5 rounded-md hover:bg-turquoise-700 transition-colors text-sm"
        >
          Create New Code
        </LocalizedClientLink>
      </div>

      <StatsCards stats={stats} />

      <div>
        <h2 className="font-playfair text-xl font-bold text-turquoise-800 mb-4">
          Your Codes
        </h2>
        {codes.length === 0 ? (
          <div className="bg-sand-50 border border-sand-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              You haven&apos;t created any codes yet.
            </p>
            <LocalizedClientLink
              href="/practitioner/dashboard/codes/new"
              className="text-turquoise-600 font-medium hover:text-turquoise-700 underline"
            >
              Create your first code
            </LocalizedClientLink>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg px-5">
            {codes.map((code) => (
              <CodeRow
                key={code.id}
                code={code}
                onDeactivate={handleDeactivate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
