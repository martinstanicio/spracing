import {
  IconArrowLeft,
  IconCalendar,
  IconCar,
  IconDatabaseOff,
  IconGauge,
  IconTool,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PlateLookupForm } from "@/components/public/plate-lookup-form"
import { PrintHistoryButton } from "@/components/public/print-history-button"
import { SiteFooter } from "@/components/public/site-footer"
import { SiteHeader } from "@/components/public/site-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { getMechanicSession } from "@/lib/auth-session"
import { formatLicensePlate } from "@/lib/domain/license-plate"
import {
  formatIsoDateEs,
  formatKilometers,
  type ReminderStatus,
} from "@/lib/domain/maintenance"
import { getPublicVehicleHistoryByPlate } from "@/lib/queries/public-history"
import { WORKSHOP_CONFIG } from "@/lib/workshop-config"

export const dynamic = "force-dynamic"

const REMINDER_BADGE_MAP: Record<
  ReminderStatus,
  { label: string; variant: "destructive" | "default" | "secondary" }
> = {
  overdue: { label: "Vencido", variant: "destructive" },
  upcoming: { label: "Próximo", variant: "default" },
  ok: { label: "Al día", variant: "secondary" },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ patente: string }>
}): Promise<Metadata> {
  const { patente } = await params
  const decoded = decodeURIComponent(patente)
  const formatted = formatLicensePlate(decoded)

  return {
    title: `Historial ${formatted}`,
    description: `Historial de mantenimiento y trabajos realizados para la patente ${formatted} en ${WORKSHOP_CONFIG.name}.`,
  }
}

export default async function VehiclePublicHistoryPage({
  params,
}: {
  params: Promise<{ patente: string }>
}) {
  const { patente } = await params
  const decodedPlate = decodeURIComponent(patente)
  const [result, session] = await Promise.all([
    getPublicVehicleHistoryByPlate(decodedPlate),
    getMechanicSession(),
  ])

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader isAuthenticated={Boolean(session?.user)} />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/historial" />}
            nativeButton={false}
          >
            <IconArrowLeft data-icon="inline-start" />
            Buscar otra patente
          </Button>
          {result.status === "ok" && <PrintHistoryButton />}
        </div>

        {result.status === "db_unconfigured" && (
          <Alert>
            <IconDatabaseOff />
            <AlertTitle>Base de datos no conectada</AlertTitle>
            <AlertDescription>
              Todavía no se configuró la variable <code>DATABASE_URL</code>.
              Configurá Neon en <code>.env.local</code> para consultar vehículos
              registrados.
            </AlertDescription>
          </Alert>
        )}

        {(result.status === "not_found" ||
          result.status === "invalid_plate") && (
          <Card>
            <CardContent>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconCar />
                  </EmptyMedia>
                  <EmptyTitle>
                    {result.status === "invalid_plate"
                      ? "Formato de patente inválido"
                      : `No encontramos registros para ${formatLicensePlate(result.normalizedPlate)}`}
                  </EmptyTitle>
                  <EmptyDescription>
                    {result.status === "invalid_plate"
                      ? "Verificá que la patente tenga entre 3 y 10 caracteres alfanuméricos."
                      : "Es posible que el vehículo todavía no haya sido cargado en el sistema de SP Racing o que la patente tenga un error de tipeo."}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <PlateLookupForm
                    initialPlate={decodedPlate}
                    buttonLabel="Volver a buscar"
                  />
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        )}

        {result.status === "ok" && (
          <>
            {/* Encabezado imprimible */}
            <div className="hidden border-b pb-4 print:block">
              <p className="text-lg font-bold">{WORKSHOP_CONFIG.name}</p>
              <p className="text-xs text-muted-foreground">
                {WORKSHOP_CONFIG.address} — {WORKSHOP_CONFIG.phone}
              </p>
            </div>

            {/* Ficha técnica pública del vehículo */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline">
                      Patente {result.data.vehicle.formattedPlate}
                    </Badge>
                    <CardTitle>
                      {result.data.vehicle.make} {result.data.vehicle.model} (
                      {result.data.vehicle.year})
                    </CardTitle>
                    <CardDescription>
                      Ficha pública de mantenimiento — {WORKSHOP_CONFIG.name}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {result.data.jobs.length}{" "}
                    {result.data.jobs.length === 1
                      ? "trabajo registrado"
                      : "trabajos registrados"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Último kilometraje
                    </span>
                    <span className="text-sm font-medium">
                      {result.data.latestMileageKm !== null
                        ? formatKilometers(result.data.latestMileageKm)
                        : "Sin registros"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Último trabajo
                    </span>
                    <span className="text-sm font-medium">
                      {result.data.lastServiceDate
                        ? formatIsoDateEs(result.data.lastServiceDate)
                        : "Sin registros"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Motor</span>
                    <span className="text-sm font-medium">
                      {result.data.vehicle.engine ?? "No especificado"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Combustible / Caja
                    </span>
                    <span className="text-sm font-medium">
                      {[
                        result.data.vehicle.fuelType,
                        result.data.vehicle.transmission,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "No especificado"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Próximos mantenimientos programados */}
            {result.data.scheduledReminders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Próximos mantenimientos</CardTitle>
                  <CardDescription>
                    Referencias cargadas por el taller según kilometraje o
                    tiempo transcurrido.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {result.data.scheduledReminders.map((reminder) => {
                      const badgeConfig = REMINDER_BADGE_MAP[reminder.status]
                      return (
                        <div
                          key={reminder.jobId}
                          className="flex flex-col justify-between gap-2 rounded-lg border p-3 sm:flex-row sm:items-center"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">
                              {reminder.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Realizado el{" "}
                              {formatIsoDateEs(reminder.performedAt)}
                              {reminder.reasons.length > 0
                                ? ` · ${reminder.reasons.join(" · ")}`
                                : ""}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {reminder.nextDueKm !== null && (
                              <Badge variant="outline">
                                <IconGauge data-icon="inline-start" />
                                {formatKilometers(reminder.nextDueKm)}
                              </Badge>
                            )}
                            {reminder.nextDueDate !== null && (
                              <Badge variant="outline">
                                <IconCalendar data-icon="inline-start" />
                                {formatIsoDateEs(reminder.nextDueDate)}
                              </Badge>
                            )}
                            <Badge variant={badgeConfig.variant}>
                              {badgeConfig.label}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historial completo de trabajos */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de trabajos realizados</CardTitle>
                <CardDescription>
                  Ordenado del trabajo más reciente al más antiguo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.data.jobs.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <IconTool />
                      </EmptyMedia>
                      <EmptyTitle>Todavía no hay trabajos cargados</EmptyTitle>
                      <EmptyDescription>
                        El vehículo está registrado en el sistema, pero aún no
                        tiene intervenciones asentadas.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <div className="flex flex-col gap-4">
                    {result.data.jobs.map((job, index) => (
                      <div key={job.id} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-base font-semibold">
                              {job.title}
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">
                                <IconCalendar data-icon="inline-start" />
                                {formatIsoDateEs(job.performedAt)}
                              </Badge>
                              <Badge variant="outline">
                                <IconGauge data-icon="inline-start" />
                                {formatKilometers(job.mileageKm)}
                              </Badge>
                            </div>
                          </div>

                          {job.description && (
                            <p className="text-sm text-muted-foreground">
                              {job.description}
                            </p>
                          )}

                          {(job.nextDueKm !== null ||
                            job.nextDueDate !== null) && (
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>Próximo control recomendado:</span>
                              {job.nextDueKm !== null && (
                                <Badge variant="outline">
                                  {formatKilometers(job.nextDueKm)}
                                </Badge>
                              )}
                              {job.nextDueDate !== null && (
                                <Badge variant="outline">
                                  {formatIsoDateEs(job.nextDueDate)}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {index < result.data.jobs.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
