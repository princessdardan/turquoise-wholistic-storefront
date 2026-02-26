/**
 * Renders a value from store settings, or a visually distinct placeholder
 * marker when the data is not yet configured. Placeholder markers have an
 * amber/yellow background so they are easy to spot before launch.
 */
export default function PlaceholderMarker({
  value,
  placeholder,
}: {
  value: string | null | undefined
  placeholder: string
}) {
  if (value) {
    return <>{value}</>
  }

  return (
    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-sm font-mono">
      {placeholder}
    </span>
  )
}
