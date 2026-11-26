import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PlateLookupForm } from "@/components/public/plate-lookup-form"
import { SiteFooter } from "@/components/public/site-footer"
import { SiteHeader } from "@/components/public/site-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getMechanicSession } from "@/lib/auth-session"
import {
  isValidLicensePlate,
  normalizeLicensePlate,
} from "@/lib/domain/license-plate"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Consultar historial por patente",
  description:
    "Ingresá la patente de tu vehículo para ver los trabajos realizados y próximos mantenimientos en SP Racing.",
}

export default async function HistorialLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ patente?: string }>
}) {
  const { patente } = await searchParams
  if (patente && isValidLicensePlate(patente)) {
    redirect(`/historial/${encodeURIComponent(normalizeLicensePlate(patente))}`)
  }

  const session = await getMechanicSession()

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader isAuthenticated={Boolean(session?.user)} />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultar historial del vehículo</CardTitle>
            <CardDescription>
              No necesitás iniciar sesión. Ingresá la patente del auto para
              acceder al registro trazable de trabajos y próximos
              mantenimientos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <PlateLookupForm initialPlate={patente ?? ""} />
              <p className="text-xs text-muted-foreground">
                Formatos aceptados: Mercosur (ej. AB123CD / AB 123 CD), patente
                clásica (ej. ABC123 / ABC 123) u otras patentes alfanuméricas.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  )
}
