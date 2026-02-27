import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CategoryTree } from "@lib/data/categories"

/**
 * Palette of harmonious gradient pairs for health concern cards.
 * Designed to complement the turquoise/sand/gold brand palette.
 * Auto-assigned by category index; can be overridden via category metadata.color.
 */
const GRADIENT_PALETTE = [
  { from: "#72E8D8", to: "#1F8A7E" },   // turquoise
  { from: "#A8D8EA", to: "#3A7CA5" },   // ocean blue
  { from: "#B5E8C3", to: "#3A7D44" },   // sage green
  { from: "#F5D0A9", to: "#C07830" },   // warm amber
  { from: "#D4B8E0", to: "#7B4A8E" },   // lavender
  { from: "#F7C6C7", to: "#C45B5B" },   // rose
  { from: "#C9E4CA", to: "#548C5A" },   // forest
  { from: "#FFE0B2", to: "#D4A853" },   // gold
  { from: "#B2DFDB", to: "#00897B" },   // teal
  { from: "#D1C4E9", to: "#5E35B1" },   // deep purple
  { from: "#FFCCBC", to: "#BF360C" },   // terracotta
  { from: "#C5CAE9", to: "#3949AB" },   // indigo
] as const

function getGradient(
  category: CategoryTree,
  index: number
): { from: string; to: string } {
  // Allow manual override via metadata.color (e.g., "turquoise" or "#72E8D8,#1F8A7E")
  const colorOverride = category.metadata?.color as string | undefined
  if (colorOverride && colorOverride.includes(",")) {
    const [from, to] = colorOverride.split(",").map((s) => s.trim())
    if (from && to) return { from, to }
  }

  return GRADIENT_PALETTE[index % GRADIENT_PALETTE.length]
}

type CategoryArrayProps = {
  healthConcerns: CategoryTree[]
}

const CategoryArray = ({ healthConcerns }: CategoryArrayProps) => {
  if (healthConcerns.length === 0) return null

  return (
    <div className="w-full py-12 bg-white">
      <div className="content-container">
        <h2 className="font-serif text-2xl small:text-3xl font-medium text-brand-text mb-6">
          Shop by Health Concern
        </h2>

        {/* Mobile: horizontal scroll with snap. Desktop: grid */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {healthConcerns.map((category, index) => {
            const gradient = getGradient(category, index)

            return (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className="flex-shrink-0 snap-start w-[200px] lg:w-auto rounded-lg overflow-hidden group transition-transform duration-200 hover:scale-[1.02]"
              >
                <div
                  className="relative h-32 lg:h-36 p-4 flex flex-col justify-end"
                  style={{
                    background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                  }}
                >
                  <h3 className="text-white font-medium text-base lg:text-lg leading-tight drop-shadow-sm">
                    {category.name}
                  </h3>
                  {category.productCount > 0 && (
                    <p className="text-white/80 text-xs mt-1">
                      {category.productCount}{" "}
                      {category.productCount === 1 ? "product" : "products"}
                    </p>
                  )}
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CategoryArray
