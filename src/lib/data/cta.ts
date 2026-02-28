import { sdk } from "@lib/config"

export type CtaProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  variants?: {
    calculated_price?: {
      calculated_amount: number
      currency_code: string
    }
  }[]
}

export type CtaComponent = {
  id: string
  title: string
  heading: string | null
  description: string | null
  product_id: string
  image_url: string | null
  image_orientation: "left" | "right"
  cta_text: string
  cta_url: string | null
  background_color: string
  is_active: boolean
  placement: string
  sort_order: number
  product?: CtaProduct | null
  product_unavailable?: boolean
}

type CtaSingleResponse = {
  cta: CtaComponent
}

export async function getCta(id: string): Promise<CtaComponent | null> {
  "use server"
  try {
    const { cta } = await sdk.client.fetch<CtaSingleResponse>(
      `/store/cta/${id}`,
      {
        method: "GET",
        next: { revalidate: 60 },
        cache: "force-cache",
      }
    )
    if (!cta.is_active || cta.product_unavailable) {
      return null
    }
    return cta
  } catch {
    return null
  }
}
