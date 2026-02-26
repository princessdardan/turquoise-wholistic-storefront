"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type StoreSettings = {
  name: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  province: string | null
  country: string | null
  hours: { day: string; time: string }[] | null
}

type StoreSettingsResponse = {
  settings: {
    name: string
    metadata: Record<string, any>
  }
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const next = {
      ...(await getCacheOptions("store-settings")),
    }

    const { settings } = await sdk.client.fetch<StoreSettingsResponse>(
      `/store/settings`,
      {
        method: "GET",
        next,
        cache: "force-cache",
      }
    )

    const m = settings.metadata ?? {}

    return {
      name: settings.name || "Turquoise Wholistic",
      phone: m.phone || null,
      email: m.email || null,
      address: m.address || null,
      city: m.city || null,
      province: m.province || m.state || null,
      country: m.country || null,
      hours: Array.isArray(m.hours) ? m.hours : null,
    }
  } catch {
    return {
      name: "Turquoise Wholistic",
      phone: null,
      email: null,
      address: null,
      city: null,
      province: null,
      country: null,
      hours: null,
    }
  }
}

/**
 * Renders the value if present, otherwise returns a placeholder string.
 * Use this for inline text where you need the raw string.
 */
export function settingOrPlaceholder(
  value: string | null | undefined,
  placeholder: string
): string {
  return value || placeholder
}

/**
 * Formats the full address from store settings.
 * Returns null if no address parts are available.
 */
export function formatAddress(settings: StoreSettings): string | null {
  const parts = [
    settings.address,
    settings.city,
    settings.province,
    settings.country,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : null
}
