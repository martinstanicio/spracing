"use client"

import { IconAlertCircle } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { updateJobAction } from "@/app/panel/vehiculos/[id]/trabajos/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { computeNextDueDate, computeNextDueKm } from "@/lib/domain/maintenance"
import type { PanelJobItem } from "@/lib/queries/panel"

export function EditJobForm({
  vehicleId,
  formattedPlate,
  vehicleLabel,
  job,
}: {
  vehicleId: string
  formattedPlate: string
  vehicleLabel: string
  job: PanelJobItem
}) {
  const router = useRouter()

  const [performedAt, setPerformedAt] = React.useState(job.performedAt)
  const [mileageKm, setMileageKm] = React.useState(String(job.mileageKm))
  const [title, setTitle] = React.useState(job.title)
  const [description, setDescription] = React.useState(job.description ?? "")
  const [internalNotes, setInternalNotes] = React.useState(
    job.internalNotes ?? ""
  )
  const [scheduleReminder, setScheduleReminder] = React.useState(
    Boolean(
      job.repeatEveryKm ||
      job.nextDueKm ||
      job.repeatEveryMonths ||
      job.nextDueDate
    )
  )
  const [repeatEveryKm, setRepeatEveryKm] = React.useState(
    job.repeatEveryKm ? String(job.repeatEveryKm) : ""
  )
  const [nextDueKm, setNextDueKm] = React.useState(
    job.nextDueKm ? String(job.nextDueKm) : ""
  )
  const [repeatEveryMonths, setRepeatEveryMonths] = React.useState(
    job.repeatEveryMonths ? String(job.repeatEveryMonths) : ""
  )
  const [nextDueDate, setNextDueDate] = React.useState(job.nextDueDate ?? "")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function handleRepeatKmChange(value: string) {
    setRepeatEveryKm(value)
    const kmNum = Number(mileageKm)
    const intervalNum = Number(value)
    if (
      Number.isFinite(kmNum) &&
      Number.isFinite(intervalNum) &&
      intervalNum > 0
    ) {
      const computed = computeNextDueKm(kmNum, intervalNum)
      if (computed !== null) setNextDueKm(String(computed))
    }
  }

  function handleRepeatMonthsChange(value: string) {
    setRepeatEveryMonths(value)
    const monthsNum = Number(value)
    if (Number.isInteger(monthsNum) && monthsNum > 0) {
      const computed = computeNextDueDate(performedAt, monthsNum)
      if (computed) setNextDueDate(computed)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const result = await updateJobAction(vehicleId, job.id, {
      performedAt,
      mileageKm: Number(mileageKm),
      title,
      description,
      internalNotes,
      repeatEveryKm: scheduleReminder ? repeatEveryKm : null,
      nextDueKm: scheduleReminder ? nextDueKm : null,
      repeatEveryMonths: scheduleReminder ? repeatEveryMonths : null,
      nextDueDate: scheduleReminder ? nextDueDate : null,
    })

    setPending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    toast.add({
      title: "Trabajo actualizado",
      description: `Se actualizaron los datos del trabajo en ${formattedPlate}.`,
      type: "success",
    })

    router.push(`/panel/vehiculos/${vehicleId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Editar trabajo — {formattedPlate}</CardTitle>
          <CardDescription>{vehicleLabel}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            {error && (
              <Alert variant="destructive">
                <IconAlertCircle />
                <AlertTitle>No se pudo guardar</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="edit-performedAt">Fecha *</FieldLabel>
                  <Input
                    id="edit-performedAt"
                    type="date"
                    value={performedAt}
                    onChange={(e) => setPerformedAt(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-mileageKm">
                    Kilometraje *
                  </FieldLabel>
                  <Input
                    id="edit-mileageKm"
                    type="number"
                    min={0}
                    value={mileageKm}
                    onChange={(e) => setMileageKm(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="edit-title">
                  Trabajo realizado *
                </FieldLabel>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="edit-desc">
                    Detalle público (visible al cliente)
                  </FieldLabel>
                  <Textarea
                    id="edit-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="edit-internal">
                    Nota interna (solo taller)
                  </FieldLabel>
                  <Textarea
                    id="edit-internal"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={3}
                  />
                </Field>
              </div>

              <Field orientation="horizontal">
                <Switch
                  id="edit-reminder"
                  checked={scheduleReminder}
                  onCheckedChange={setScheduleReminder}
                />
                <div className="flex flex-col gap-0.5">
                  <FieldLabel htmlFor="edit-reminder">
                    Programar próximo mantenimiento (opcional)
                  </FieldLabel>
                  <FieldDescription>
                    Desactivalo si este trabajo no tiene vencimiento futuro.
                  </FieldDescription>
                </div>
              </Field>

              {scheduleReminder && (
                <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <Field>
                      <FieldLabel htmlFor="edit-repeat-km">
                        Repetir cada (km)
                      </FieldLabel>
                      <Input
                        id="edit-repeat-km"
                        type="number"
                        min={1}
                        value={repeatEveryKm}
                        onChange={(e) => handleRepeatKmChange(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="edit-due-km">
                        Próximo control a los (km)
                      </FieldLabel>
                      <Input
                        id="edit-due-km"
                        type="number"
                        min={1}
                        value={nextDueKm}
                        onChange={(e) => setNextDueKm(e.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Field>
                      <FieldLabel htmlFor="edit-repeat-months">
                        Repetir en (meses)
                      </FieldLabel>
                      <Input
                        id="edit-repeat-months"
                        type="number"
                        min={1}
                        value={repeatEveryMonths}
                        onChange={(e) =>
                          handleRepeatMonthsChange(e.target.value)
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="edit-due-date">
                        Próxima fecha estimada
                      </FieldLabel>
                      <Input
                        id="edit-due-date"
                        type="date"
                        value={nextDueDate}
                        onChange={(e) => setNextDueDate(e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </FieldGroup>
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-2 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            render={<Link href={`/panel/vehiculos/${vehicleId}`} />}
            nativeButton={false}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
