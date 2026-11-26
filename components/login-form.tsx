"use client"

import { IconAlertCircle } from "@tabler/icons-react"
import { cn } from "cn"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      const response = await authClient.signIn.email({
        email: email.trim(),
        password,
      })

      if (response.error) {
        setError(
          response.error.message ||
            "No pudimos iniciar sesión. Verificá tu email y contraseña."
        )
        setPending(false)
        return
      }

      router.push("/panel")
      router.refresh()
    } catch {
      setError("Ocurrió un error al conectar con el servidor.")
      setPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Acceso al taller</CardTitle>
          <CardDescription>
            Ingresá tus credenciales de mecánico para administrar SP Racing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <IconAlertCircle />
                  <AlertTitle>Error de acceso</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="mecanico@spracing.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </Field>

              <Field>
                <Button type="submit" disabled={pending}>
                  {pending && <Spinner data-icon="inline-start" />}
                  {pending ? "Ingresando..." : "Iniciar sesión"}
                </Button>
                <FieldDescription className="text-center">
                  <Link href="/" className="underline underline-offset-4">
                    Volver al sitio público
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
