import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { isDatabaseConfigured } from "@/db"
import { auth } from "@/lib/auth"

export async function getMechanicSession() {
  if (!isDatabaseConfigured) {
    return null
  }

  try {
    return await auth.api.getSession({
      headers: await headers(),
    })
  } catch {
    return null
  }
}

export async function requireMechanicSession() {
  const session = await getMechanicSession()
  if (!session?.user) {
    redirect("/login")
  }
  return session
}

export async function assertMechanicSession() {
  const session = await getMechanicSession()
  if (!session?.user) {
    throw new Error("No autorizado")
  }
  return session
}
