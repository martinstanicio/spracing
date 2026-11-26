import { IconCar, IconLogin, IconTool } from "@tabler/icons-react"
import Link from "next/link"

import { ThemeToggle } from "@/components/public/theme-toggle"
import { Button } from "@/components/ui/button"
import { WORKSHOP_CONFIG } from "@/lib/workshop-config"

export function SiteHeader({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconTool className="size-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              {WORKSHOP_CONFIG.name}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Taller Mecánico
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link
            href="/#servicios"
            className="transition-colors hover:text-foreground"
          >
            Servicios
          </Link>
          <Link
            href="/#historial"
            className="transition-colors hover:text-foreground"
          >
            Historial trazable
          </Link>
          <Link
            href="/#contacto"
            className="transition-colors hover:text-foreground"
          >
            Ubicación y contacto
          </Link>
          <Link
            href="/historial"
            className="transition-colors hover:text-foreground"
          >
            Consultar patente
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/historial" />}
            nativeButton={false}
          >
            <IconCar data-icon="inline-start" />
            Mi historial
          </Button>
          <Button
            size="sm"
            render={<Link href={isAuthenticated ? "/panel" : "/login"} />}
            nativeButton={false}
          >
            <IconLogin data-icon="inline-start" />
            {isAuthenticated ? "Ir al panel" : "Acceso taller"}
          </Button>
        </div>
      </div>
    </header>
  )
}
