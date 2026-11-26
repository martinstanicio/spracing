"use client"

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { createJobsBatchAction } from "@/app/panel/vehiculos/[id]/trabajos/actions"
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
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  computeNextDueDate,
  computeNextDueKm,
  formatKilometers,
  getTodayIsoDate,
} from "@/lib/domain/maintenance"
import { COMMON_JOB_PRESETS } from "@/lib/workshop-config"

interface DraftJob {
  key: string
  title: string
  description: string
  internalNotes: string
  scheduleReminder: boolean
  repeatEveryKm: string
  nextDueKm: string
  repeatEveryMonths: string
  nextDueDate: string
}

function createEmptyDraftJob(): DraftJob {
  return {
    key: crypto.randomUUID(),
    title: "",
    description: "",
    internalNotes: "",
    scheduleReminder: false,
    repeatEveryKm: "",
    nextDueKm: "",
    repeatEveryMonths: "",
    nextDueDate: "",
  }
}

export function CreateJobsForm({
  vehicleId,
  formattedPlate,
  vehicleLabel,
  latestMileageKm,
}: {
  vehicleId: string
  formattedPlate: string
  vehicleLabel: string
  latestMileageKm: number | null
}) {
  const router = useRouter()
  const [performedAt, setPerformedAt] = React.useState(() => getTodayIsoDate())
  const [mileageKm, setMileageKm] = React.useState(
    latestMileageKm !== null ? String(latestMileageKm) : ""
  )
  const [jobsList, setJobsList] = React.useState<DraftJob[]>(() => [
    createEmptyDraftJob(),
  ])
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const parsedMileage = mileageKm.trim() === "" ? null : Number(mileageKm)
  const isLowerThanLatest =
    latestMileageKm !== null &&
    parsedMileage !== null &&
    Number.isFinite(parsedMileage) &&
    parsedMileage < latestMileageKm

  function handlePerformedAtChange(nextDate: string) {
    setPerformedAt(nextDate)
    setJobsList((prev) =>
      prev.map((job) => {
        if (!job.scheduleReminder || !job.repeatEveryMonths) return job
        const months = Number(job.repeatEveryMonths)
        if (!Number.isInteger(months) || months <= 0) return job
        const computed = computeNextDueDate(nextDate, months)
        return computed ? { ...job, nextDueDate: computed } : job
      })
    )
  }

  function handleMileageChange(nextMileage: string) {
    setMileageKm(nextMileage)
    const mileageNum = nextMileage.trim() === "" ? null : Number(nextMileage)
    if (mileageNum === null || !Number.isFinite(mileageNum) || mileageNum < 0) {
      return
    }
    setJobsList((prev) =>
      prev.map((job) => {
        if (!job.scheduleReminder || !job.repeatEveryKm) return job
        const interval = Number(job.repeatEveryKm)
        if (!Number.isFinite(interval) || interval <= 0) return job
        const computed = computeNextDueKm(mileageNum, interval)
        return computed !== null ? { ...job, nextDueKm: String(computed) } : job
      })
    )
  }

  function updateJob(key: string, updater: (job: DraftJob) => DraftJob) {
    setJobsList((prev) =>
      prev.map((item) => (item.key === key ? updater(item) : item))
    )
  }

  function applyRepeatKm(key: string, kmInterval: string) {
    const intervalNum = Number(kmInterval)
    const computed =
      parsedMileage !== null && Number.isFinite(intervalNum) && intervalNum > 0
        ? computeNextDueKm(parsedMileage, intervalNum)
        : null

    updateJob(key, (job) => ({
      ...job,
      repeatEveryKm: kmInterval,
      nextDueKm: computed !== null ? String(computed) : job.nextDueKm,
    }))
  }

  function applyRepeatMonths(key: string, monthsInterval: string) {
    const monthsNum = Number(monthsInterval)
    const computed =
      Number.isInteger(monthsNum) && monthsNum > 0
        ? computeNextDueDate(performedAt, monthsNum)
        : null

    updateJob(key, (job) => ({
      ...job,
      repeatEveryMonths: monthsInterval,
      nextDueDate: computed ?? job.nextDueDate,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const result = await createJobsBatchAction(vehicleId, {
      performedAt,
      mileageKm: Number(mileageKm),
      jobs: jobsList.map((job) => ({
        title: job.title,
        description: job.description,
        internalNotes: job.internalNotes,
        repeatEveryKm: job.scheduleReminder ? job.repeatEveryKm : null,
        nextDueKm: job.scheduleReminder ? job.nextDueKm : null,
        repeatEveryMonths: job.scheduleReminder ? job.repeatEveryMonths : null,
        nextDueDate: job.scheduleReminder ? job.nextDueDate : null,
      })),
    })

    setPending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    toast.add({
      title:
        result.data.count === 1
          ? "Trabajo registrado"
          : `${result.data.count} trabajos registrados`,
      description: `Se guardó el historial para ${formattedPlate}.`,
      type: "success",
    })

    router.push(`/panel/vehiculos/${vehicleId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar trabajos — {formattedPlate}</CardTitle>
          <CardDescription>{vehicleLabel}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            {error && (
              <Alert variant="destructive">
                <IconAlertCircle />
                <AlertTitle>No se pudo registrar</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="performedAt">
                    Fecha del trabajo *
                  </FieldLabel>
                  <Input
                    id="performedAt"
                    type="date"
                    value={performedAt}
                    onChange={(e) => handlePerformedAtChange(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="mileageKm">
                    Kilometraje actual *
                  </FieldLabel>
                  <Input
                    id="mileageKm"
                    type="number"
                    min={0}
                    value={mileageKm}
                    onChange={(e) => handleMileageChange(e.target.value)}
                    placeholder="Ej: 85400"
                    required
                  />
                  {latestMileageKm !== null && (
                    <FieldDescription>
                      Último registrado: {formatKilometers(latestMileageKm)}
                    </FieldDescription>
                  )}
                </Field>
              </div>
            </FieldGroup>

            {isLowerThanLatest && (
              <Alert>
                <IconAlertTriangle />
                <AlertTitle>Kilometraje menor al último registrado</AlertTitle>
                <AlertDescription>
                  El último trabajo registrado tenía{" "}
                  {formatKilometers(latestMileageKm)}. Verificá si es correcto
                  antes de guardar (por ejemplo, si estás cargando un trabajo
                  retroactivo).
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">
                    Trabajos realizados ({jobsList.length})
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Podés cargar uno o varios trabajos realizados en este
                    ingreso.
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setJobsList((prev) => [...prev, createEmptyDraftJob()])
                  }
                >
                  <IconPlus data-icon="inline-start" />
                  Agregar otro trabajo
                </Button>
              </div>

              {jobsList.map((job, index) => (
                <Card key={job.key}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>Trabajo #{index + 1}</CardTitle>
                      {jobsList.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setJobsList((prev) =>
                              prev.filter((item) => item.key !== job.key)
                            )
                          }
                        >
                          <IconTrash data-icon="inline-start" />
                          Quitar
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor={`job-title-${job.key}`}>
                            Trabajo realizado *
                          </FieldLabel>
                          <Input
                            id={`job-title-${job.key}`}
                            value={job.title}
                            onChange={(e) =>
                              updateJob(job.key, (current) => ({
                                ...current,
                                title: e.target.value,
                              }))
                            }
                            placeholder="Ej: Cambio de aceite y filtro"
                            required
                          />
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {COMMON_JOB_PRESETS.map((preset) => (
                              <Button
                                key={preset}
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                  updateJob(job.key, (current) => ({
                                    ...current,
                                    title: preset,
                                  }))
                                }
                              >
                                {preset}
                              </Button>
                            ))}
                          </div>
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field>
                            <FieldLabel htmlFor={`job-desc-${job.key}`}>
                              Detalle público (visible al cliente)
                            </FieldLabel>
                            <Textarea
                              id={`job-desc-${job.key}`}
                              value={job.description}
                              onChange={(e) =>
                                updateJob(job.key, (current) => ({
                                  ...current,
                                  description: e.target.value,
                                }))
                              }
                              placeholder="Ej: Aceite sintético 5W-30 + filtro original..."
                              rows={2}
                            />
                          </Field>

                          <Field>
                            <FieldLabel htmlFor={`job-internal-${job.key}`}>
                              Nota interna (solo taller)
                            </FieldLabel>
                            <Textarea
                              id={`job-internal-${job.key}`}
                              value={job.internalNotes}
                              onChange={(e) =>
                                updateJob(job.key, (current) => ({
                                  ...current,
                                  internalNotes: e.target.value,
                                }))
                              }
                              placeholder="Observaciones privadas, costo, código de repuesto..."
                              rows={2}
                            />
                          </Field>
                        </div>

                        <Field orientation="horizontal">
                          <Switch
                            id={`job-reminder-${job.key}`}
                            checked={job.scheduleReminder}
                            onCheckedChange={(checked) =>
                              updateJob(job.key, (current) => ({
                                ...current,
                                scheduleReminder: checked,
                              }))
                            }
                          />
                          <div className="flex flex-col gap-0.5">
                            <FieldLabel htmlFor={`job-reminder-${job.key}`}>
                              Programar próximo mantenimiento (opcional)
                            </FieldLabel>
                            <FieldDescription>
                              Activalo si este trabajo requiere volver luego de
                              X kilómetros o Y meses.
                            </FieldDescription>
                          </div>
                        </Field>

                        {job.scheduleReminder && (
                          <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-3">
                              <Field>
                                <FieldLabel
                                  htmlFor={`job-repeat-km-${job.key}`}
                                >
                                  Repetir cada (km)
                                </FieldLabel>
                                <Input
                                  id={`job-repeat-km-${job.key}`}
                                  type="number"
                                  min={1}
                                  value={job.repeatEveryKm}
                                  onChange={(e) =>
                                    applyRepeatKm(job.key, e.target.value)
                                  }
                                  placeholder="Ej: 10000"
                                />
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {[5000, 10000, 15000, 60000].map((km) => (
                                    <Button
                                      key={km}
                                      type="button"
                                      variant="outline"
                                      size="xs"
                                      onClick={() =>
                                        applyRepeatKm(job.key, String(km))
                                      }
                                    >
                                      +
                                      {new Intl.NumberFormat("es-AR").format(
                                        km
                                      )}{" "}
                                      km
                                    </Button>
                                  ))}
                                </div>
                              </Field>

                              <Field>
                                <FieldLabel htmlFor={`job-due-km-${job.key}`}>
                                  Próximo control a los (km)
                                </FieldLabel>
                                <Input
                                  id={`job-due-km-${job.key}`}
                                  type="number"
                                  min={1}
                                  value={job.nextDueKm}
                                  onChange={(e) =>
                                    updateJob(job.key, (current) => ({
                                      ...current,
                                      nextDueKm: e.target.value,
                                    }))
                                  }
                                  placeholder="Se calcula automático o manual"
                                />
                              </Field>
                            </div>

                            <div className="flex flex-col gap-3">
                              <Field>
                                <FieldLabel
                                  htmlFor={`job-repeat-months-${job.key}`}
                                >
                                  Repetir en (meses)
                                </FieldLabel>
                                <Input
                                  id={`job-repeat-months-${job.key}`}
                                  type="number"
                                  min={1}
                                  value={job.repeatEveryMonths}
                                  onChange={(e) =>
                                    applyRepeatMonths(job.key, e.target.value)
                                  }
                                  placeholder="Ej: 12"
                                />
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {[6, 12, 24].map((months) => (
                                    <Button
                                      key={months}
                                      type="button"
                                      variant="outline"
                                      size="xs"
                                      onClick={() =>
                                        applyRepeatMonths(
                                          job.key,
                                          String(months)
                                        )
                                      }
                                    >
                                      {months} meses
                                    </Button>
                                  ))}
                                </div>
                              </Field>

                              <Field>
                                <FieldLabel htmlFor={`job-due-date-${job.key}`}>
                                  Próxima fecha estimada
                                </FieldLabel>
                                <Input
                                  id={`job-due-date-${job.key}`}
                                  type="date"
                                  value={job.nextDueDate}
                                  onChange={(e) =>
                                    updateJob(job.key, (current) => ({
                                      ...current,
                                      nextDueDate: e.target.value,
                                    }))
                                  }
                                />
                              </Field>
                            </div>
                          </div>
                        )}
                      </FieldGroup>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
            {pending ? "Guardando..." : "Guardar trabajos"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
