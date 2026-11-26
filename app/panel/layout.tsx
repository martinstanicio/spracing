import { PanelShell } from "@/components/panel/panel-shell"
import { requireMechanicSession } from "@/lib/auth-session"

export const dynamic = "force-dynamic"

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireMechanicSession()

  return (
    <PanelShell
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    >
      {children}
    </PanelShell>
  )
}
