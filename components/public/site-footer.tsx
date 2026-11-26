import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { WORKSHOP_CONFIG } from "@/lib/workshop-config"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-base font-semibold">
              {WORKSHOP_CONFIG.name}
            </span>
            <p className="text-sm text-muted-foreground">
              {WORKSHOP_CONFIG.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Ubicación y horarios</span>
            <span className="text-muted-foreground">
              {WORKSHOP_CONFIG.address}
            </span>
            <span className="text-muted-foreground">
              {WORKSHOP_CONFIG.city}
            </span>
            <span className="text-muted-foreground">
              {WORKSHOP_CONFIG.hours[0]}
            </span>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Accesos</span>
            <div className="flex flex-col gap-1.5 text-muted-foreground">
              <Link href="/historial" className="hover:text-foreground">
                Consultar historial por patente
              </Link>
              <Link href="/#servicios" className="hover:text-foreground">
                Servicios del taller
              </Link>
              <Link href="/login" className="hover:text-foreground">
                Acceso para mecánicos
              </Link>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col justify-between gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>
            {WORKSHOP_CONFIG.name} — Registro digital de mantenimiento
            vehicular.
          </span>
          <span>{WORKSHOP_CONFIG.email}</span>
        </div>
      </div>
    </footer>
  )
}
