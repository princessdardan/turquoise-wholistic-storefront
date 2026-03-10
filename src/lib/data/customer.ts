"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { verifyTurnstileToken, isHoneypotFilled } from "@lib/util/turnstile"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  removeAuthToken,
  setAuthToken,
} from "./cookies"

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  // Bot protection: honeypot + Turnstile
  if (isHoneypotFilled(formData)) return "Registration failed. Please try again."
  const turnstileToken = formData.get("cf-turnstile-response") as string | null
  const turnstileValid = await verifyTurnstileToken(turnstileToken)
  if (!turnstileValid) return "CAPTCHA verification failed. Please try again."

  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export async function requestPasswordToken(
  _currentState: unknown,
  formData: FormData
) {
  // Bot protection: honeypot + Turnstile
  if (isHoneypotFilled(formData)) return { success: true, error: null }
  const turnstileToken = formData.get("cf-turnstile-response") as string | null
  const turnstileValid = await verifyTurnstileToken(turnstileToken)
  if (!turnstileValid) return { success: true, error: null }

  const email = formData.get("email") as string

  try {
    await sdk.client.fetch("/store/customers/password-token", {
      method: "POST",
      body: { email },
    })
    return { success: true, error: null }
  } catch {
    // Always show success to prevent email enumeration
    return { success: true, error: null }
  }
}

export async function resetPassword(
  _currentState: unknown,
  formData: FormData
) {
  const token = formData.get("token") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.client.fetch("/store/customers/password-reset", {
      method: "POST",
      body: { token, email, password },
    })
    return { success: true, error: null }
  } catch (error: any) {
    const message =
      error?.message || error?.toString() || "Failed to reset password"
    if (message.includes("expired") || message.includes("Invalid")) {
      return {
        success: false,
        error:
          "This reset link has expired or is invalid. Please request a new one.",
      }
    }
    return { success: false, error: "Failed to reset password. Please try again." }
  }
}

export async function createAccountAfterOrder(
  _currentState: { success: boolean; error: string | null },
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("first_name") as string
  const lastName = formData.get("last_name") as string

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email,
      password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.store.customer.create(
      {
        email,
        first_name: firstName,
        last_name: lastName,
      },
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    return { success: true, error: null }
  } catch (error: any) {
    const message = error?.message || error?.toString() || ""
    if (message.includes("exists") || message.includes("already")) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in instead.",
      }
    }
    return {
      success: false,
      error: "Failed to create account. Please try again.",
    }
  }
}

export async function changeEmail(
  newEmail: string,
  currentPassword: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.client.fetch("/store/customers/change-email", {
      method: "POST",
      body: { new_email: newEmail, current_password: currentPassword },
      headers,
    })

    const cacheTag = await getCacheTag("customers")
    revalidateTag(cacheTag)

    return { success: true, error: null }
  } catch (error: any) {
    const message = error?.message || error?.toString() || ""
    if (message.includes("incorrect") || message.includes("password")) {
      return { success: false, error: "Current password is incorrect" }
    }
    if (message.includes("already associated") || message.includes("duplicate")) {
      return { success: false, error: "This email is already associated with another account" }
    }
    return { success: false, error: "Failed to update email. Please try again." }
  }
}

export async function deleteAccount(
  currentPassword: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.client.fetch("/store/customers/delete-account", {
      method: "POST",
      body: { current_password: currentPassword },
      headers,
    })

    // Clean up local session
    await sdk.auth.logout()
    await removeAuthToken()
    await removeCartId()

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    return { success: true, error: null }
  } catch (error: any) {
    const message = error?.message || error?.toString() || ""
    if (message.includes("incorrect") || message.includes("password")) {
      return { success: false, error: "Current password is incorrect" }
    }
    return { success: false, error: "Failed to delete account. Please try again." }
  }
}

export async function checkEmailExists(
  email: string
): Promise<boolean> {
  try {
    const result = await sdk.client.fetch<{ exists: boolean }>(
      "/store/customers/exists",
      {
        method: "POST",
        body: { email },
      }
    )
    return result.exists
  } catch {
    return false
  }
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
