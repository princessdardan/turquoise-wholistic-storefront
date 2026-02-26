"use client"

import { addToCart } from "@lib/data/cart"
import {
  createSubscription,
  SubscriptionFrequency,
} from "@lib/data/subscriptions"
import { useIntersection } from "@lib/hooks/use-in-view"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import QuantitySelector from "@modules/products/components/quantity-selector"
import SubscribeSave, {
  PurchaseMode,
} from "@modules/products/components/subscribe-save"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import StockBadge from "../stock-badge"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  isLoggedIn?: boolean
}

const DISCOUNT_PERCENTAGE = 10

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
  isLoggedIn = false,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>("one-time")
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("monthly")
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const maxQuantity = useMemo(() => {
    if (!selectedVariant?.manage_inventory) return undefined
    if (selectedVariant?.allow_backorder) return undefined
    return selectedVariant?.inventory_quantity || undefined
  }, [selectedVariant])

  // Compute subscription prices
  const subscriptionPrices = useMemo(() => {
    const variant = selectedVariant as any
    if (!variant?.calculated_price?.calculated_amount) {
      return { originalPrice: null, discountedPrice: null }
    }

    const amount = variant.calculated_price.calculated_amount
    const currencyCode = variant.calculated_price.currency_code
    const discountedAmount = amount * (1 - DISCOUNT_PERCENTAGE / 100)

    return {
      originalPrice: convertToLocale({ amount, currency_code: currencyCode }),
      discountedPrice: convertToLocale({
        amount: discountedAmount,
        currency_code: currencyCode,
      }),
    }
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart or create a subscription
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    if (purchaseMode === "subscription") {
      if (!isLoggedIn) {
        setIsAdding(false)
        router.push(`/${countryCode}/account`)
        return
      }

      const result = await createSubscription({
        items: [
          {
            product_id: product.id,
            variant_id: selectedVariant.id,
            quantity,
          },
        ],
        frequency,
      })

      if (result.success) {
        setQuantity(1)
        setPurchaseMode("one-time")
      }
    } else {
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })

      setQuantity(1)
    }

    setIsAdding(false)
  }

  const isSubscribing = purchaseMode === "subscription"

  const buttonText = useMemo(() => {
    if (isAdding) return null // handled by spinner
    if (!selectedVariant && !options) return "Select variant"
    if (!inStock || !isValidVariant) return "Out of stock"
    if (isSubscribing) {
      return isLoggedIn ? "Subscribe" : "Sign in to subscribe"
    }
    return "Add to cart"
  }, [
    isAdding,
    selectedVariant,
    options,
    inStock,
    isValidVariant,
    isSubscribing,
    isLoggedIn,
  ])

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        {selectedVariant && (
          <StockBadge variant={selectedVariant} />
        )}

        <SubscribeSave
          purchaseMode={purchaseMode}
          onPurchaseModeChange={setPurchaseMode}
          frequency={frequency}
          onFrequencyChange={setFrequency}
          originalPrice={subscriptionPrices.originalPrice}
          discountedPrice={subscriptionPrices.discountedPrice}
          isLoggedIn={isLoggedIn}
          disabled={!!disabled || isAdding}
        />

        <div className="flex items-center gap-x-4 my-2">
          <QuantitySelector
            quantity={quantity}
            onChange={setQuantity}
            max={maxQuantity}
            disabled={!!disabled || isAdding}
          />
        </div>

        <button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant
          }
          className="w-full h-12 bg-turquoise-500 hover:bg-turquoise-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
          data-testid="add-product-button"
        >
          {isAdding ? (
            <span className="flex items-center justify-center gap-x-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {isSubscribing ? "Subscribing..." : "Adding..."}
            </span>
          ) : (
            buttonText
          )}
        </button>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
          quantity={quantity}
          onQuantityChange={setQuantity}
        />
      </div>
    </>
  )
}
