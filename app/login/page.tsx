import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/login-form"
import { getMechanicSession } from "@/lib/auth-session"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Acceso al taller",
  description: "Inicio de sesión para mecánicos de SP Racing.",
}

export default async function LoginPage() {
  const session = await getMechanicSession()
  if (session?.user) {
    redirect("/panel")
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
