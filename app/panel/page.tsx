import {
  IconCalendar,
  IconCar,
  IconGauge,
  IconPlus,
  IconSearch,
  IconTool,
  IconUsers,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  formatIsoDateEs,
  formatKilometers,
  type ReminderStatus,
} from "@/lib/domain/maintenance"
import { getDashboardSummary } from "@/lib/queries/panel"

export const metadata: Metadata = {
  title: "Resumen del taller",
}

const REMINDER_BADGE_MAP: Record<
  ReminderStatus,
  { label: string; variant: "destructive" | "default" | "secondary" }
> = {
  overdue: { label: "Vencido", variant: "destructive" },
  upcoming: { label: "Próximo", variant: "default" },
  ok: { label: "Al día", variant: "secondary" },
}

export default async function PanelDashboardPage() {
  const summary = await getDashboardSummary()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Resumen del taller
          </h1>
          <p className="text-sm text-muted-foreground">
            Buscá un vehículo por patente o dueño y revisá los próximos
            mantenimientos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={<Link href="/panel/personas" />}
            nativeButton={false}
          >
            <IconUsers data-icon="inline-start" />
            Personas
          </Button>
          <Button
            render={<Link href="/panel/vehiculos/nuevo" />}
            nativeButton={false}
          >
            <IconPlus data-icon="inline-start" />
            Nuevo vehículo
          </Button>
        </div>
      </div>

      {/* Buscador rápido */}
      <Card>
        <CardContent>
          <form
            action="/panel/vehiculos"
            method="get"
            className="flex flex-col gap-2 sm:flex-row"
          >
            <InputGroup className="flex-1">
              <InputGroupAddon>
                <IconSearch />
              </InputGroupAddon>
              <InputGroupInput
                name="q"
                placeholder="Buscar vehículo por patente, marca, modelo o dueño..."
              />
            </InputGroup>
            <Button type="submit">Buscar</Button>
          </form>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Vehículos registrados</CardDescription>
            <CardTitle>{summary.counts.vehicles}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Trabajos realizados</CardDescription>
            <CardTitle>{summary.counts.jobs}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Personas / Dueños</CardDescription>
            <CardTitle>{summary.counts.people}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Trabajos con próximo control</CardDescription>
            <CardTitle>{summary.counts.scheduledJobs}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos mantenimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos mantenimientos</CardTitle>
            <CardDescription>
              Trabajos con retorno programado por km o tiempo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.reminders.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconCalendar />
                  </EmptyMedia>
                  <EmptyTitle>Sin mantenimientos programados</EmptyTitle>
                  <EmptyDescription>
                    Cuando cargues un trabajo con repetición por km o meses,
                    aparecerá aquí.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-3">
                {summary.reminders.map((item) => {
                  const badge = REMINDER_BADGE_MAP[item.status]
                  return (
                    <Link
                      key={item.jobId}
                      href={`/panel/vehiculos/${item.vehicleId}`}
                      className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.formattedPlate}</Badge>
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>{item.vehicleLabel}</span>
                        {item.nextDueKm !== null && (
                          <span>Meta: {formatKilometers(item.nextDueKm)}</span>
                        )}
                        {item.nextDueDate !== null && (
                          <span>
                            Fecha: {formatIsoDateEs(item.nextDueDate)}
                          </span>
                        )}
                        {item.owners.length > 0 && (
                          <span>
                            Dueño:{" "}
                            {item.owners
                              .map((o) =>
                                o.phone
                                  ? `${o.fullName} (${o.phone})`
                                  : o.fullName
                              )
                              .join(", ")}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trabajos recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos trabajos cargados</CardTitle>
            <CardDescription>
              Actividad reciente registrada en el taller.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recentJobs.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconTool />
                  </EmptyMedia>
                  <EmptyTitle>Todavía no hay trabajos</EmptyTitle>
                  <EmptyDescription>
                    Creá un vehículo para comenzar a registrar sus trabajos.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    size="sm"
                    render={<Link href="/panel/vehiculos/nuevo" />}
                    nativeButton={false}
                  >
                    <IconCar data-icon="inline-start" />
                    Nuevo vehículo
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="flex flex-col gap-3">
                {summary.recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/panel/vehiculos/${job.vehicleId}`}
                    className="flex flex-col gap-1.5 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{job.formattedPlate}</Badge>
                        <span className="text-sm font-medium">{job.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatIsoDateEs(job.performedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{job.vehicleLabel}</span>
                      <span className="flex items-center gap-1">
                        <IconGauge className="size-3.5" />
                        {formatKilometers(job.mileageKm)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
