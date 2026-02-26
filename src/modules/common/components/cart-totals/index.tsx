"use client"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    promotions?: HttpTypes.StorePromotion[]
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
    promotions,
  } = totals

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>Subtotal (excl. shipping and taxes)</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Estimated Shipping</span>
          <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {shipping_subtotal
              ? convertToLocale({
                  amount: shipping_subtotal,
                  currency_code,
                })
              : "Calculated at checkout"}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex flex-col gap-y-1">
            {promotions && promotions.length > 0 ? (
              promotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-x-1">
                    <span>Discount</span>
                    <span className="text-ui-fg-muted txt-small">
                      ({promotion.code}
                      {promotion.application_method?.type === "percentage"
                        ? ` ${promotion.application_method.value}% off`
                        : ""}
                      )
                    </span>
                  </span>
                  {promotions.length === 1 ? (
                    <span
                      className="text-ui-fg-interactive"
                      data-testid="cart-discount"
                      data-value={discount_subtotal || 0}
                    >
                      -{" "}
                      {convertToLocale({
                        amount: discount_subtotal ?? 0,
                        currency_code,
                      })}
                    </span>
                  ) : (
                    <span className="text-ui-fg-interactive txt-small">
                      {promotion.application_method?.type === "percentage"
                        ? `${promotion.application_method.value}% off`
                        : promotion.application_method?.value !== undefined
                          ? `- ${convertToLocale({
                              amount: +promotion.application_method.value,
                              currency_code,
                            })}`
                          : ""}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between">
                <span>Discount</span>
                <span
                  className="text-ui-fg-interactive"
                  data-testid="cart-discount"
                  data-value={discount_subtotal || 0}
                >
                  -{" "}
                  {convertToLocale({
                    amount: discount_subtotal ?? 0,
                    currency_code,
                  })}
                </span>
              </div>
            )}
            {promotions && promotions.length > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-1 mt-1">
                <span className="txt-small font-medium">Total Savings</span>
                <span
                  className="text-ui-fg-interactive font-medium"
                  data-testid="cart-discount"
                  data-value={discount_subtotal || 0}
                >
                  -{" "}
                  {convertToLocale({
                    amount: discount_subtotal ?? 0,
                    currency_code,
                  })}
                </span>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center">Estimated HST (13%)</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>Total</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
