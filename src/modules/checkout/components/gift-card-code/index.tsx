"use client"

import { Badge, Heading, Input, Label, Text } from "@medusajs/ui"
import React from "react"

import { validateGiftCard, GiftCardInfo } from "@lib/data/gift-cards"
import { convertToLocale } from "@lib/util/money"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"

const GiftCardCode: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")
  const [appliedCards, setAppliedCards] = React.useState<GiftCardInfo[]>([])

  const addGiftCard = async (formData: FormData) => {
    setErrorMessage("")

    const code = formData.get("gift_card_code")
    if (!code) {
      return
    }

    const codeStr = code.toString().trim().toUpperCase()

    if (appliedCards.some((gc) => gc.code === codeStr)) {
      setErrorMessage("This gift card has already been applied")
      return
    }

    const input = document.getElementById(
      "gift-card-input"
    ) as HTMLInputElement

    try {
      const { gift_card } = await validateGiftCard(codeStr)
      setAppliedCards((prev) => [...prev, gift_card])
    } catch (e: any) {
      setErrorMessage(e.message || "Invalid gift card code")
    }

    if (input) {
      input.value = ""
    }
  }

  const removeGiftCard = (code: string) => {
    setAppliedCards((prev) => prev.filter((gc) => gc.code !== code))
  }

  return (
    <div className="w-full bg-white flex flex-col">
      <div className="txt-medium">
        <form action={(a) => addGiftCard(a)} className="w-full mb-5">
          <Label className="flex gap-x-1 my-2 items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="add-gift-card-button"
            >
              Apply Gift Card
            </button>
          </Label>

          {isOpen && (
            <>
              <div className="flex w-full gap-x-2">
                <Input
                  className="size-full"
                  id="gift-card-input"
                  name="gift_card_code"
                  type="text"
                  autoFocus={false}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  data-testid="gift-card-input"
                />
                <SubmitButton
                  variant="secondary"
                  data-testid="gift-card-apply-button"
                >
                  Apply
                </SubmitButton>
              </div>

              <ErrorMessage
                error={errorMessage}
                data-testid="gift-card-error-message"
              />
            </>
          )}
        </form>

        {appliedCards.length > 0 && (
          <div className="w-full flex items-center">
            <div className="flex flex-col w-full">
              <Heading className="txt-medium mb-2">
                Gift card(s) applied:
              </Heading>

              {appliedCards.map((gc) => (
                <div
                  key={gc.code}
                  className="flex items-center justify-between w-full max-w-full mb-2"
                  data-testid="gift-card-row"
                >
                  <Text className="flex gap-x-1 items-baseline txt-small-plus w-4/5 pr-1">
                    <span className="truncate" data-testid="gift-card-code">
                      <Badge color="purple" size="small">
                        {gc.code}
                      </Badge>{" "}
                      (Balance:{" "}
                      {convertToLocale({
                        amount: gc.balance,
                        currency_code: gc.currency_code,
                      })}
                      )
                    </span>
                  </Text>
                  <button
                    className="flex items-center"
                    onClick={() => removeGiftCard(gc.code)}
                    data-testid="remove-gift-card-button"
                  >
                    <Trash size={14} />
                    <span className="sr-only">
                      Remove gift card from order
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GiftCardCode
