"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type PractitionerStatus = "pending" | "approved" | "suspended"

export type Practitioner = {
  id: string
  customer_id: string
  business_name: string
  license_number: string | null
  status: PractitionerStatus
  approved_at: string | null
  suspended_at: string | null
  created_at: string
  updated_at: string
}

export type PractitionerCode = {
  id: string
  code: string
  allowed_product_ids: string[]
  max_redemptions: number | null
  redemption_count: number
  is_active: boolean
  expires_at: string | null
  practitioner_id: string
  created_at: string
  updated_at: string
}

export type PractitionerStats = {
  total_codes: number
  active_codes: number
  total_redemptions: number
}

export async function registerPractitioner(input: {
  business_name: string
  license_number?: string
}): Promise<{ success: boolean; practitioner?: Practitioner; error?: string }> {
  try {
    const headers = { ...(await getAuthHeaders()) }

    const data = await sdk.client.fetch<{ practitioner: Practitioner }>(
      `/store/practitioners/register`,
      {
        method: "POST",
        body: input,
        headers,
      }
    )

    return { success: true, practitioner: data.practitioner }
  } catch (error: any) {
    if (error?.status === 401) {
      return { success: false, error: "login_required" }
    }
    if (error?.status === 409 || error?.message?.includes("already")) {
      return { success: false, error: "already_registered" }
    }
    return {
      success: false,
      error: error?.message || "Failed to register as practitioner",
    }
  }
}

export async function getMyPractitionerProfile(): Promise<{
  success: boolean
  practitioner?: Practitioner
  error?: string
}> {
  try {
    const headers = { ...(await getAuthHeaders()) }

    const data = await sdk.client.fetch<{ practitioner: Practitioner }>(
      `/store/practitioners/me`,
      {
        method: "GET",
        headers,
      }
    )

    return { success: true, practitioner: data.practitioner }
  } catch (error: any) {
    if (error?.status === 401) {
      return { success: false, error: "login_required" }
    }
    if (error?.status === 404) {
      return { success: false, error: "not_registered" }
    }
    return {
      success: false,
      error: error?.message || "Failed to fetch practitioner profile",
    }
  }
}

export async function getMyPractitionerCodes(
  limit = 20,
  offset = 0
): Promise<{
  codes: PractitionerCode[]
  count: number
}> {
  try {
    const headers = { ...(await getAuthHeaders()) }

    const data = await sdk.client.fetch<{
      codes: PractitionerCode[]
      count: number
    }>(`/store/practitioners/me/codes?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers,
    })

    return { codes: data.codes, count: data.count }
  } catch {
    return { codes: [], count: 0 }
  }
}

export async function createPractitionerCode(input: {
  code?: string
  allowed_product_ids: string[]
  max_redemptions?: number
  expires_at?: string
}): Promise<{ success: boolean; code?: PractitionerCode; error?: string }> {
  try {
    const headers = { ...(await getAuthHeaders()) }

    const data = await sdk.client.fetch<{ code: PractitionerCode }>(
      `/store/practitioners/me/codes`,
      {
        method: "POST",
        body: input,
        headers,
      }
    )

    return { success: true, code: data.code }
  } catch (error: any) {
    if (error?.status === 401) {
      return { success: false, error: "login_required" }
    }
    if (error?.status === 403) {
      return { success: false, error: "not_approved" }
    }
    return {
      success: false,
      error: error?.message || "Failed to create code",
    }
  }
}

export async function deactivatePractitionerCode(
  codeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = { ...(await getAuthHeaders()) }

    await sdk.client.fetch(`/store/practitioners/me/codes/${codeId}`, {
      method: "DELETE",
      headers,
    })

    return { success: true }
  } catch (error: any) {
    if (error?.status === 403) {
      return { success: false, error: "not_allowed" }
    }
    return {
      success: false,
      error: error?.message || "Failed to deactivate code",
    }
  }
}

export async function getMyPractitionerStats(): Promise<PractitionerStats> {
  try {
    const headers = { ...(await getAuthHeaders()) }

    const data = await sdk.client.fetch<PractitionerStats>(
      `/store/practitioners/me/stats`,
      {
        method: "GET",
        headers,
      }
    )

    return data
  } catch {
    return { total_codes: 0, active_codes: 0, total_redemptions: 0 }
  }
}
