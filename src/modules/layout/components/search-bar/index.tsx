"use client"

import { MagnifyingGlassMini, XMarkMini } from "@medusajs/icons"
import { useRouter, useParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { searchProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SearchResult = Pick<
  HttpTypes.StoreProduct,
  "id" | "title" | "handle" | "thumbnail"
>

const SearchBar = () => {
  const router = useRouter()
  const { countryCode } = useParams()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchResults = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      try {
        const products = await searchProducts(q, countryCode as string)
        setResults(products)
        setIsOpen(products.length > 0)
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [countryCode]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(value)
    }, 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      inputRef.current?.blur()
      router.push(`/${countryCode}/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
      return
    }

    if (!isOpen || results.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      const product = results[selectedIndex]
      setIsOpen(false)
      setQuery("")
      router.push(`/${countryCode}/products/${product.handle}`)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-x-1 border border-ui-border-base rounded-lg px-2 py-1.5 bg-white focus-within:border-turquoise-400 focus-within:ring-1 focus-within:ring-turquoise-400 transition-colors">
          <MagnifyingGlassMini className="text-ui-fg-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0 && query.length >= 2) {
                setIsOpen(true)
              }
            }}
            placeholder="Search products..."
            className="w-28 lg:w-40 text-sm bg-transparent outline-none placeholder:text-ui-fg-muted text-ui-fg-base"
            data-testid="search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setResults([])
                setIsOpen(false)
                inputRef.current?.focus()
              }}
              className="text-ui-fg-muted hover:text-ui-fg-base flex-shrink-0"
            >
              <XMarkMini />
            </button>
          )}
        </div>
      </form>

      {isOpen && (
        <div className="absolute top-full mt-1 w-72 right-0 bg-white border border-ui-border-base rounded-lg shadow-lg z-[60] overflow-hidden">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-ui-fg-muted">
              Searching...
            </div>
          ) : (
            <ul data-testid="search-suggestions">
              {results.map((product, index) => (
                <li key={product.id}>
                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    className={`flex items-center gap-x-3 px-4 py-2.5 text-sm transition-colors ${
                      index === selectedIndex
                        ? "bg-sand-50 text-turquoise-600"
                        : "text-ui-fg-base hover:bg-sand-50"
                    }`}
                    onClick={() => {
                      setIsOpen(false)
                      setQuery("")
                    }}
                    data-testid="search-suggestion-item"
                  >
                    {product.thumbnail && (
                      <img
                        src={product.thumbnail}
                        alt=""
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <span className="truncate">{product.title}</span>
                  </LocalizedClientLink>
                </li>
              ))}
              <li className="border-t border-ui-border-base">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    router.push(
                      `/${countryCode}/search?q=${encodeURIComponent(query.trim())}`
                    )
                  }}
                  className="w-full px-4 py-2.5 text-sm text-turquoise-500 hover:bg-sand-50 text-left transition-colors"
                  data-testid="search-view-all"
                >
                  View all results for &ldquo;{query}&rdquo;
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
