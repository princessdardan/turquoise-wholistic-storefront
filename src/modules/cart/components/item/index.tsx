"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { trackRemoveFromCart, lineItemToGA4Item } from "@lib/analytics"
import { useToast } from "@lib/context/toast-context"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useEffect, useRef, useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const { addToast } = useToast()
  const [optimisticQuantity, setOptimisticQuantity] = useState(item.quantity)
  const [isRemoved, setIsRemoved] = useState(false)
  const pendingUpdates = useRef(0)

  // Sync optimistic quantity from server when no updates are in-flight
  useEffect(() => {
    if (pendingUpdates.current === 0) {
      setOptimisticQuantity(item.quantity)
    }
  }, [item.quantity])

  const changeQuantity = async (quantity: number) => {
    setOptimisticQuantity(quantity)
    pendingUpdates.current++

    try {
      await updateLineItem({
        lineId: item.id,
        quantity,
      })
    } catch {
      addToast("Failed to update quantity", "error")
    } finally {
      pendingUpdates.current--
      // When all pending updates resolve, sync with server state
      if (pendingUpdates.current === 0) {
        setOptimisticQuantity(item.quantity)
      }
    }
  }

  const maxQuantity = 10

  return (
    <Table.Row
      className={clx("w-full transition-opacity duration-300", {
        "opacity-0 pointer-events-none": isRemoved,
      })}
      data-testid="product-row"
    >
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
                onClick={() => changeQuantity(optimisticQuantity - 1)}
                disabled={optimisticQuantity <= 1}
                aria-label="Decrease quantity"
                data-testid="quantity-decrement"
              >
                −
              </button>
              <span
                className="w-10 h-10 flex items-center justify-center text-sm font-medium text-ui-fg-base select-none border-x border-gray-200"
                data-testid="product-quantity"
              >
                {optimisticQuantity}
              </span>
              <button
                className="w-10 h-10 flex items-center justify-center text-ui-fg-subtle hover:text-ui-fg-base hover:bg-gray-50 rounded-r-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => changeQuantity(optimisticQuantity + 1)}
                disabled={optimisticQuantity >= maxQuantity}
                aria-label="Increase quantity"
                data-testid="quantity-increment"
              >
                +
              </button>
            </div>
            <DeleteButton
              id={item.id}
              data-testid="product-delete-button"
              onDelete={() => {
                setIsRemoved(true)
                trackRemoveFromCart(
                  lineItemToGA4Item(item, currencyCode)
                )
              }}
              onError={() => {
                setIsRemoved(false)
                addToast("Failed to remove item from cart", "error")
              }}
            />
          </div>
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
