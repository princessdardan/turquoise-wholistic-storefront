"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { getMyAccess } from "@lib/data/product-access"

type ProductAccessContextValue = {
  accessibleProductIds: string[]
  hasAccess: (productId: string) => boolean
  refreshAccess: () => Promise<void>
  isLoading: boolean
}

const ProductAccessContext = createContext<ProductAccessContextValue>({
  accessibleProductIds: [],
  hasAccess: () => false,
  refreshAccess: async () => {},
  isLoading: false,
})

export const useProductAccess = () => useContext(ProductAccessContext)

export function ProductAccessProvider({
  isLoggedIn,
  children,
}: {
  isLoggedIn: boolean
  children: React.ReactNode
}) {
  const [accessibleProductIds, setAccessibleProductIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(isLoggedIn)

  const fetchAccess = useCallback(async () => {
    if (!isLoggedIn) {
      setAccessibleProductIds([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const ids = await getMyAccess()
    setAccessibleProductIds(ids)
    setIsLoading(false)
  }, [isLoggedIn])

  useEffect(() => {
    fetchAccess()
  }, [fetchAccess])

  const hasAccess = useCallback(
    (productId: string) => accessibleProductIds.includes(productId),
    [accessibleProductIds]
  )

  const refreshAccess = useCallback(async () => {
    await fetchAccess()
  }, [fetchAccess])

  return (
    <ProductAccessContext.Provider
      value={{ accessibleProductIds, hasAccess, refreshAccess, isLoading }}
    >
      {children}
    </ProductAccessContext.Provider>
  )
}
