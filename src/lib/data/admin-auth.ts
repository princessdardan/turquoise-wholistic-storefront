/**
 * Admin JWT authentication utilities for the storefront blog editor.
 *
 * Flow: admin logs in via email/password → JWT stored in localStorage →
 * subsequent admin API calls include JWT in Authorization header.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const ADMIN_JWT_KEY = "tw_admin_jwt"

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ADMIN_JWT_KEY)
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_JWT_KEY, token)
}

export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_JWT_KEY)
}

export async function adminLogin(
  email: string,
  password: string
): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw new Error("Invalid credentials")
  }

  const data = await res.json()
  const token = data.token
  setAdminToken(token)
  return token
}

export async function validateAdminToken(): Promise<boolean> {
  const token = getAdminToken()
  if (!token) return false

  try {
    const res = await fetch(`${BACKEND_URL}/admin/blog?limit=1&offset=0`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok
  } catch {
    return false
  }
}

export async function adminFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminToken()
  if (!token) throw new Error("Not authenticated")

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  })

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || `Request failed: ${res.status}`)
  }

  return res.json()
}
