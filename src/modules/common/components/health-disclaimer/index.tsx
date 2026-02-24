interface HealthDisclaimerProps {
  npn?: string | null
}

export default function HealthDisclaimer({ npn }: HealthDisclaimerProps) {
  return (
    <div className="rounded-lg border border-turquoise-100 bg-turquoise-50 px-4 py-3 text-xs text-gray-600">
      {npn && (
        <p className="mb-1 font-medium text-turquoise-700">NPN: {npn}</p>
      )}
      <p>
        This product is not intended to diagnose, treat, cure, or prevent any
        disease. Please consult a healthcare professional before use. Natural
        health products are regulated by Health Canada.
      </p>
    </div>
  )
}
