"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@lib/data/wishlist"

type WishlistContextValue = {
  isLoggedIn: boolean
  isLoading: boolean
  isInWishlist: (productId: string) => boolean
  getItemId: (productId: string) => string | undefined
  toggleWishlist: (productId: string) => Promise<void>
}

const WishlistContext = createContext<WishlistContextValue>({
  isLoggedIn: false,
  isLoading: false,
  isInWishlist: () => false,
  getItemId: () => undefined,
  toggleWishlist: async () => {},
})

export const useWishlist = () => useContext(WishlistContext)

export function WishlistProvider({
  isLoggedIn,
  children,
}: {
  isLoggedIn: boolean
  children: React.ReactNode
}) {
  // Map of productId -> wishlistItemId
  const [items, setItems] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(isLoggedIn)

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false)
      return
    }

    getWishlist().then((wishlistItems) => {
      const map = new Map<string, string>()
      wishlistItems.forEach((item) => map.set(item.product_id, item.id))
      setItems(map)
      setIsLoading(false)
    })
  }, [isLoggedIn])

  const isInWishlist = useCallback(
    (productId: string) => items.has(productId),
    [items]
  )

  const getItemId = useCallback(
    (productId: string) => items.get(productId),
    [items]
  )

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const existingItemId = items.get(productId)

      if (existingItemId) {
        // Optimistic remove
        setItems((prev) => {
          const next = new Map(prev)
          next.delete(productId)
          return next
        })

        const result = await removeFromWishlist(existingItemId)
        if (!result.success) {
          // Revert on failure
          setItems((prev) => new Map(prev).set(productId, existingItemId))
        }
      } else {
        // Optimistic add with temp ID
        const tempId = `temp-${productId}`
        setItems((prev) => new Map(prev).set(productId, tempId))

        const result = await addToWishlist(productId)
        if (result.success && result.itemId) {
          // Replace temp ID with real ID
          setItems((prev) => new Map(prev).set(productId, result.itemId!))
        } else if (!result.success) {
          // Revert on failure
          setItems((prev) => {
            const next = new Map(prev)
            next.delete(productId)
            return next
          })
        }
      }
    },
    [items]
  )

  return (
    <WishlistContext.Provider
      value={{ isLoggedIn, isLoading, isInWishlist, getItemId, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  )
}
