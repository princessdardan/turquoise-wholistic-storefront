"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import { createPractitionerCode } from "@lib/data/practitioner"
import type { SimpleProduct } from "@lib/data/products"

type FormState = {
  success: boolean
  error: string | null
}

export default function CodeCreationForm({
  products,
}: {
  products: SimpleProduct[]
}) {
  const router = useRouter()
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  )

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)))
    }
  }

  const submitAction = async (
    _prev: FormState,
    formData: FormData
  ): Promise<FormState> => {
    if (selectedProducts.size === 0) {
      return { success: false, error: "Select at least one product." }
    }

    const code = (formData.get("code") as string)?.trim() || undefined
    const maxRedemptionsStr = formData.get("max_redemptions") as string
    const expiresAtStr = formData.get("expires_at") as string

    const max_redemptions = maxRedemptionsStr
      ? parseInt(maxRedemptionsStr, 10)
      : undefined
    const expires_at = expiresAtStr || undefined

    if (max_redemptions !== undefined && (isNaN(max_redemptions) || max_redemptions < 1)) {
      return { success: false, error: "Max redemptions must be a positive number." }
    }

    const result = await createPractitionerCode({
      code,
      allowed_product_ids: Array.from(selectedProducts),
      max_redemptions,
      expires_at,
    })

    if (!result.success) {
      if (result.error === "not_approved") {
        return {
          success: false,
          error: "Your account must be approved to create codes.",
        }
      }
      return {
        success: false,
        error: result.error || "Failed to create code. Please try again.",
      }
    }

    router.push("../dashboard")
    router.refresh()
    return { success: true, error: null }
  }

  const [state, formAction, isPending] = useActionState(submitAction, {
    success: false,
    error: null,
  })

  return (
    <form action={formAction} className="max-w-2xl mx-auto space-y-8">
      {/* Custom Code */}
      <div>
        <label
          htmlFor="code"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Custom Code{" "}
          <span className="text-gray-400 font-normal">
            (optional — auto-generated if blank)
          </span>
        </label>
        <input
          id="code"
          name="code"
          type="text"
          placeholder="e.g. DRSMITH2026"
          maxLength={32}
          className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent transition-colors font-mono uppercase"
        />
      </div>

      {/* Product Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Products <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-turquoise-600 hover:text-turquoise-700 font-medium"
          >
            {selectedProducts.size === products.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-gray-500 bg-sand-50 border border-sand-200 rounded-lg p-4">
            No products available. Products must be published before they can be
            added to a code.
          </p>
        ) : (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {products.map((product) => (
              <label
                key={product.id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-turquoise-50/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleProduct(product.id)}
                  className="h-4 w-4 rounded border-gray-300 text-turquoise-600 focus:ring-turquoise-400"
                />
                {product.thumbnail && (
                  <img
                    src={product.thumbnail}
                    alt=""
                    className="w-8 h-8 rounded object-cover shrink-0"
                  />
                )}
                <span className="text-sm text-gray-900">{product.title}</span>
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {selectedProducts.size} of {products.length} selected
        </p>
      </div>

      {/* Max Redemptions & Expiry */}
      <div className="grid grid-cols-1 small:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="max_redemptions"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Max Redemptions{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="max_redemptions"
            name="max_redemptions"
            type="number"
            min={1}
            placeholder="Unlimited"
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="expires_at"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Expiry Date{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="expires_at"
            name="expires_at"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Error */}
      {state.error && (
        <p role="alert" className="text-sm text-rose-600">
          {state.error}
        </p>
      )}

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending || selectedProducts.size === 0}
          className="flex-1 bg-turquoise-600 text-white font-medium px-8 py-3 rounded-md hover:bg-turquoise-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating..." : "Create Code"}
        </button>
      </div>
    </form>
  )
}
