"use client"

import { CheckCircleMiniSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const getMetadataString = (
  product: HttpTypes.StoreProduct,
  key: string
): string | null => {
  const value = product.metadata?.[key]
  return typeof value === "string" ? value : null
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const ingredients = getMetadataString(product, "ingredients")
  const benefits = getMetadataString(product, "benefits")

  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    ...(ingredients
      ? [
          {
            label: "Ingredients",
            component: <IngredientsTab ingredients={ingredients} />,
          },
        ]
      : []),
    ...(benefits
      ? [
          {
            label: "Benefits",
            component: <BenefitsTab benefits={benefits} />,
          },
        ]
      : []),
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Country of origin</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Weight</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const IngredientsTab = ({ ingredients }: { ingredients: string }) => {
  const items = ingredients.split(",").map((item) => item.trim()).filter(Boolean)

  return (
    <div className="text-small-regular py-8">
      <ul className="flex flex-col gap-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-x-2">
            <span className="text-turquoise-500 mt-0.5">&#8226;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const BenefitsTab = ({ benefits }: { benefits: string }) => {
  const items = benefits.split(",").map((item) => item.trim()).filter(Boolean)

  return (
    <div className="text-small-regular py-8">
      <ul className="flex flex-col gap-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-x-2">
            <CheckCircleMiniSolid className="w-4 h-4 text-turquoise-500 mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Fast delivery</span>
            <p className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
