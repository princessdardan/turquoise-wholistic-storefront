import { getProductMetadata, ProductMetadata } from "@lib/data/products"

type WellnessMetadataProps = {
  productId: string
}

export default async function WellnessMetadata({
  productId,
}: WellnessMetadataProps) {
  const metadata = await getProductMetadata(productId)

  if (!metadata) return null

  const { ingredients_list, dosage_instructions, warnings, certifications } =
    metadata

  const hasContent =
    (ingredients_list && ingredients_list.length > 0) ||
    dosage_instructions ||
    warnings ||
    (certifications && certifications.length > 0)

  if (!hasContent) return null

  return (
    <div className="flex flex-col gap-y-4">
      {certifications && certifications.length > 0 && (
        <CertificationBadges certifications={certifications} />
      )}

      {ingredients_list && ingredients_list.length > 0 && (
        <IngredientsSection ingredients={ingredients_list} />
      )}

      {dosage_instructions && (
        <DosageSection instructions={dosage_instructions} />
      )}

      {warnings && <WarningsSection warnings={warnings} />}
    </div>
  )
}

function CertificationBadges({
  certifications,
}: {
  certifications: string[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {certifications.map((cert) => (
        <span
          key={cert}
          className="inline-flex items-center rounded-full bg-turquoise-50 px-3 py-1 text-xs font-medium text-turquoise-700 ring-1 ring-inset ring-turquoise-200"
        >
          {cert}
        </span>
      ))}
    </div>
  )
}

function IngredientsSection({ ingredients }: { ingredients: string[] }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-sand-50 px-4 py-3">
      <h4 className="text-small-semi mb-2 text-brand-text">Ingredients</h4>
      <ul className="flex flex-col gap-y-1 text-xs text-ui-fg-subtle">
        {ingredients.map((item, i) => (
          <li key={i} className="flex items-start gap-x-2">
            <span className="mt-0.5 text-turquoise-500">&#8226;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DosageSection({ instructions }: { instructions: string }) {
  return (
    <div className="rounded-lg border border-turquoise-100 bg-turquoise-50 px-4 py-3">
      <h4 className="text-small-semi mb-1 text-turquoise-700">
        Dosage Instructions
      </h4>
      <p className="text-xs text-turquoise-800 whitespace-pre-line">
        {instructions}
      </p>
    </div>
  )
}

function WarningsSection({ warnings }: { warnings: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <h4 className="text-small-semi mb-1 text-amber-800">Warnings</h4>
      <p className="text-xs text-amber-700 whitespace-pre-line">{warnings}</p>
    </div>
  )
}
