import { retrieveCustomer } from "@lib/data/customer"
import { Toaster } from "@medusajs/ui"
import AccountLayout from "@modules/account/templates/account-layout"

export default async function AccountPageLayout({
  dashboard,
  login,
  children,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
  children?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  // Parallel route slots render for /account; children renders for sub-pages
  // like /account/forgot-password and /account/reset-password
  const slotContent = customer ? dashboard : login

  return (
    <AccountLayout customer={customer}>
      {slotContent || children}
      <Toaster />
    </AccountLayout>
  )
}
