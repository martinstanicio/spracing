"use client"

import { IconAlertCircle } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import {
  createPersonAction,
  updatePersonAction,
} from "@/app/panel/personas/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import type { OwnerSummary } from "@/lib/queries/panel"

export function PersonFormDialog({
  trigger,
  person,
  onSuccess,
}: {
  trigger: React.ReactElement
  person?: {
    id: string
    fullName: string
    phone: string | null
    email: string | null
    notes: string | null
  }
  onSuccess?: (person: OwnerSummary) => void
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [fullName, setFullName] = React.useState(person?.fullName ?? "")
  const [phone, setPhone] = React.useState(person?.phone ?? "")
  const [email, setEmail] = React.useState(person?.email ?? "")
  const [notes, setNotes] = React.useState(person?.notes ?? "")

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setFullName(person?.fullName ?? "")
      setPhone(person?.phone ?? "")
      setEmail(person?.email ?? "")
      setNotes(person?.notes ?? "")
      setError(null)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()
    setPending(true)
    setError(null)

    const payload = {
      fullName,
      phone,
      email,
      notes,
    }

    const result = person
      ? await updatePersonAction(person.id, payload)
      : await createPersonAction(payload)

    setPending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    toast.add({
      title: person ? "Persona actualizada" : "Persona creada",
      description: `${result.data.fullName} se guardó correctamente.`,
      type: "success",
    })

    setOpen(false)
    onSuccess?.(result.data)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {person ? "Editar persona" : "Nueva persona / dueño"}
          </DialogTitle>
          <DialogDescription>
            Datos internos de contacto para uso exclusivo del taller.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle />
              <AlertTitle>Revisá los datos</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="person-full-name">
                Nombre completo *
              </FieldLabel>
              <Input
                id="person-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="person-phone">
                Teléfono / WhatsApp
              </FieldLabel>
              <Input
                id="person-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +54 9 11 5555-0000"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="person-email">Email</FieldLabel>
              <Input
                id="person-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="person-notes">Notas internas</FieldLabel>
              <Textarea
                id="person-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones internas sobre el cliente..."
                rows={3}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner data-icon="inline-start" />}
              {pending
                ? "Guardando..."
                : person
                  ? "Guardar cambios"
                  : "Crear persona"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
