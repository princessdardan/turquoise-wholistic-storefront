"use client"

import { useState } from "react"
import { useChannel, Channel } from "@lib/context/channel-context"
import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

type CartTemplateProps = {
  retailCart: HttpTypes.StoreCart | null
  professionalCart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}

type TabKey = "retail" | "professional"

function getItemCount(cart: HttpTypes.StoreCart | null): number {
  return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

const CartTemplate = ({
  retailCart,
  professionalCart,
  customer,
}: CartTemplateProps) => {
  const { channel } = useChannel()
  const defaultTab: TabKey = channel === "professional" ? "professional" : "retail"
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab)

  const retailCount = getItemCount(retailCart)
  const professionalCount = getItemCount(professionalCart)

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "retail", label: "Retail Cart", count: retailCount },
    { key: "professional", label: "Professional Cart", count: professionalCount },
  ]

  const activeCart = activeTab === "professional" ? professionalCart : retailCart
  const isNonActiveChannel = activeTab !== (channel || "retail")

  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        {/* Tab bar */}
        <div className="flex border-b border-ui-border-base mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-turquoise-600 border-b-2 border-turquoise-600"
                  : "text-ui-fg-subtle hover:text-ui-fg-base"
              }`}
              data-testid={`cart-tab-${tab.key}`}
            >
              {tab.label} ({tab.count})
              {tab.key === "professional" && activeTab !== "professional" && tab.count > 0 && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-blue-600" />
              )}
              {tab.key === "retail" && activeTab !== "retail" && tab.count > 0 && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-turquoise-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeCart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_300px] medium:grid-cols-[1fr_360px] gap-x-8 medium:gap-x-16">
            <div className="flex flex-col bg-white py-6 gap-y-6">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={activeCart} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {activeCart && activeCart.region && (
                  <div className="bg-white py-6">
                    <Summary
                      cart={activeCart as any}
                      checkoutChannel={isNonActiveChannel ? activeTab : undefined}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
