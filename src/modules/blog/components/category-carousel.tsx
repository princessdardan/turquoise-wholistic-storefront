import { BlogCategory } from "@lib/data/blog"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CategoryCarouselProps = {
  categories: BlogCategory[]
  activeSlug: string | null
}

export default function CategoryCarousel({
  categories,
  activeSlug,
}: CategoryCarouselProps) {
  const totalPostCount = categories.reduce(
    (sum, cat) => sum + cat.post_count,
    0
  )

  return (
    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 min-w-max pb-1">
        {/* "All" option */}
        <LocalizedClientLink
          href="/blog"
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !activeSlug
              ? "bg-turquoise-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-turquoise-50 hover:text-turquoise-700"
          }`}
        >
          All
          <span
            className={`text-xs ${
              !activeSlug ? "text-turquoise-100" : "text-gray-400"
            }`}
          >
            {totalPostCount}
          </span>
        </LocalizedClientLink>

        {categories.map((cat) => (
          <LocalizedClientLink
            key={cat.id}
            href={`/blog?category=${cat.slug}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeSlug === cat.slug
                ? "bg-turquoise-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-turquoise-50 hover:text-turquoise-700"
            }`}
          >
            {cat.name}
            <span
              className={`text-xs ${
                activeSlug === cat.slug ? "text-turquoise-100" : "text-gray-400"
              }`}
            >
              {cat.post_count}
            </span>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
