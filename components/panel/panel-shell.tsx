"use client"

import {
  IconCar,
  IconChevronDown,
  IconExternalLink,
  IconLayoutDashboard,
  IconLogout,
  IconMenu2,
  IconTool,
  IconUsers,
} from "@tabler/icons-react"
import { cn } from "cn"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { ThemeToggle } from "@/components/public/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import { WORKSHOP_CONFIG } from "@/lib/workshop-config"

const NAV_ITEMS = [
  { href: "/panel", label: "Resumen", icon: IconLayoutDashboard, exact: true },
  {
    href: "/panel/vehiculos",
    label: "Vehículos",
    icon: IconCar,
    exact: false,
  },
  {
    href: "/panel/personas",
    label: "Personas / Dueños",
    icon: IconUsers,
    exact: false,
  },
] as const

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)

        return (
          <Button
            key={item.href}
            variant={isActive ? "secondary" : "ghost"}
            className="justify-start"
            onClick={onNavigate}
            render={<Link href={item.href} />}
            nativeButton={false}
          >
            <Icon data-icon="inline-start" />
            {item.label}
          </Button>
        )
      })}
    </nav>
  )
}

export function PanelShell({
  user,
  children,
}: {
  user: { name: string; email: string }
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [signingOut, setSigningOut] = React.useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await authClient.signOut()
      router.push("/login")
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/20 lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b px-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <IconTool className="size-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {WORKSHOP_CONFIG.name}
            </span>
            <span className="text-xs text-muted-foreground">Panel taller</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 p-3">
          <NavLinks />

          <div className="flex flex-col gap-1 border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              render={<Link href="/historial" />}
              nativeButton={false}
            >
              <IconExternalLink data-icon="inline-start" />
              Consulta pública
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              render={<Link href="/" />}
              nativeButton={false}
            >
              <IconExternalLink data-icon="inline-start" />
              Sitio web
            </Button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Abrir menú"
                  />
                }
              >
                <IconMenu2 />
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>{WORKSHOP_CONFIG.name}</SheetTitle>
                  <SheetDescription>
                    Panel de gestión del taller
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 px-4">
                  <NavLinks onNavigate={() => setSheetOpen(false)} />
                  <div className="flex flex-col gap-1 border-t pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setSheetOpen(false)}
                      render={<Link href="/historial" />}
                      nativeButton={false}
                    >
                      <IconExternalLink data-icon="inline-start" />
                      Consulta pública
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setSheetOpen(false)}
                      render={<Link href="/" />}
                      nativeButton={false}
                    >
                      <IconExternalLink data-icon="inline-start" />
                      Sitio web
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <span className={cn("text-sm font-semibold lg:hidden")}>
              {WORKSHOP_CONFIG.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" />}
              >
                <span className="max-w-36 truncate">{user.name}</span>
                <IconChevronDown data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={signingOut}
                    onClick={handleSignOut}
                  >
                    <IconLogout />
                    {signingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
