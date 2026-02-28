import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getCta, CtaComponent } from "@lib/data/cta"
import ImageCta from "./image-cta"

const CTA_PATTERN = /\[cta:([^\]]+)\]/

/**
 * Server component that renders blog post body content with embedded CTA components.
 *
 * Parses [cta:ID] placeholders from the body, fetches CTA data server-side,
 * and renders ImageCta components in place of the placeholders.
 * Invalid or inactive CTAs are silently removed (no broken UI).
 */
export default async function BlogBodyRenderer({ body }: { body: string }) {
  const segments = body.split(CTA_PATTERN)

  // If no CTA placeholders found, render body directly
  if (segments.length === 1) {
    return <BodyContent content={body} />
  }

  // Collect unique CTA IDs (odd indices in segments array)
  const ctaIds = new Set<string>()
  for (let i = 1; i < segments.length; i += 2) {
    ctaIds.add(segments[i])
  }

  // Fetch all CTAs in parallel
  const ctaEntries = await Promise.all(
    Array.from(ctaIds).map(async (id) => [id, await getCta(id)] as const)
  )
  const ctaMap = new Map<string, CtaComponent>(
    ctaEntries.filter((entry): entry is [string, CtaComponent] => entry[1] !== null)
  )

  return (
    <>
      {segments.map((segment, i) => {
        if (i % 2 === 0) {
          // Text content segment
          if (!segment.trim()) return null
          return <BodyContent key={i} content={segment} />
        }
        // CTA ID segment
        const cta = ctaMap.get(segment)
        if (!cta) return null
        return <ImageCta key={`cta-${segment}`} cta={cta} />
      })}
    </>
  )
}

function BodyContent({ content }: { content: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content)

  if (isHtml) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />
  }

  return <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
}
