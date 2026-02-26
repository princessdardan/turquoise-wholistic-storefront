import { Heading, Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-32 px-4 flex flex-col justify-center items-center text-center"
      data-testid="empty-cart-message"
    >
      <div className="w-20 h-20 rounded-full bg-sand-100 flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 text-turquoise-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      </div>
      <Heading
        level="h1"
        className="text-2xl font-semibold text-ui-fg-base mb-2"
      >
        Your cart is empty
      </Heading>
      <Text className="text-base text-ui-fg-subtle mb-8 max-w-md">
        Looks like you haven&apos;t added any products yet. Browse our
        collection of wellness products to get started.
      </Text>
      <LocalizedClientLink
        href="/store"
        className="inline-flex items-center justify-center px-6 py-3 bg-turquoise-600 hover:bg-turquoise-700 text-white font-medium rounded-md transition-colors"
      >
        Browse Products
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
