import { Metadata } from "next"
import ResetPasswordForm from "@modules/account/components/reset-password"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Turquoise Wholistic account.",
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>
}) {
  const { token, email } = await searchParams

  return (
    <div className="w-full flex justify-start px-8 py-8">
      <ResetPasswordForm token={token ?? null} email={email ?? null} />
    </div>
  )
}
