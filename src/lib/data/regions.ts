"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

let cachedDefaultRegion: HttpTypes.StoreRegion | null = null

/**
 * Returns the single (Canada) region. Canada-only store — no country code needed.
 */
export const getDefaultRegion = async (): Promise<HttpTypes.StoreRegion> => {
  if (cachedDefaultRegion) return cachedDefaultRegion

  const regions = await listRegions()

  if (!regions || regions.length === 0) {
    throw new Error("No regions found. Please set up regions in Medusa Admin.")
  }

  cachedDefaultRegion = regions[0]
  return cachedDefaultRegion
}
