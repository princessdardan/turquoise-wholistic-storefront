"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Input from "@modules/common/components/input"
import { useToast } from "@lib/context/toast-context"
import { deleteAccount } from "@lib/data/customer"

const DeleteAccount: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { addToast } = useToast()
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }

  const handleDelete = async () => {
    if (!password) {
      setError("Please enter your current password")
      return
    }

    setIsDeleting(true)
    setError(null)

    const result = await deleteAccount(password)

    if (result.success) {
      addToast("Your account has been deleted", "success")
      router.push(`/${countryCode}`)
    } else {
      setError(result.error)
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
    setPassword("")
    setError(null)
  }

  return (
    <div className="w-full" data-testid="delete-account-section">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base-semi">Delete Account</h3>
          <p className="text-small-regular text-ui-fg-subtle mt-1">
            Permanently remove your account and all associated data.
          </p>
        </div>
        {!showConfirm && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
            data-testid="delete-account-button"
          >
            Delete Account
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="mt-4 border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-start gap-3 mb-4">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">
                This action cannot be undone
              </p>
              <p className="text-sm text-red-700 mt-1">
                Your order history, wishlist, subscriptions, and reviews will be
                permanently removed.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <Input
              label="Current password"
              name="delete_password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="delete-account-password-input"
            />
          </div>

          {error && (
            <p
              className="text-sm text-red-600 mb-4"
              data-testid="delete-account-error"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-ui-fg-base bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || !password}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="confirm-delete-button"
            >
              {isDeleting ? "Deleting..." : "Delete My Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeleteAccount
