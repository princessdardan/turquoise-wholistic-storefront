"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { trackRemoveFromCart, lineItemToGA4Item } from "@lib/analytics"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const maxQuantity = 10

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center">
            <div className="flex items-center border border-gray-200 rounded-md">
              <button
                className="w-10 h-10 flex items-center justify-center text-ui-fg-subtle hover:text-ui-fg-base hover:bg-gray-50 rounded-l-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => changeQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1 || updating}
                aria-label="Decrease quantity"
                data-testid="quantity-decrement"
              >
                −
              </button>
              <span
                className="w-10 h-10 flex items-center justify-center text-sm font-medium text-ui-fg-base select-none border-x border-gray-200"
                data-testid="product-quantity"
              >
                {item.quantity}
              </span>
              <button
                className="w-10 h-10 flex items-center justify-center text-ui-fg-subtle hover:text-ui-fg-base hover:bg-gray-50 rounded-r-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => changeQuantity(item.quantity + 1)}
                disabled={item.quantity >= maxQuantity || updating}
                aria-label="Increase quantity"
                data-testid="quantity-increment"
              >
                +
              </button>
            </div>
            {updating && <Spinner />}
            <DeleteButton
              id={item.id}
              data-testid="product-delete-button"
              onDelete={() =>
                trackRemoveFromCart(
                  lineItemToGA4Item(item, currencyCode)
                )
              }
            />
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
