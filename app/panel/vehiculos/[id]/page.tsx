import {
  IconCalendar,
  IconEdit,
  IconExternalLink,
  IconGauge,
  IconLock,
  IconPlus,
  IconTool,
  IconUser,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { DeleteJobButton } from "@/components/panel/delete-job-button"
import { DeleteVehicleButton } from "@/components/panel/delete-vehicle-button"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import {
  evaluateReminderStatus,
  formatIsoDateEs,
  formatKilometers,
  type ReminderStatus,
} from "@/lib/domain/maintenance"
import { getVehicleDetail } from "@/lib/queries/panel"

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
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const vehicle = await getVehicleDetail(id)

  if (!vehicle) {
    return { title: "Vehículo no encontrado" }
  }

  return {
    title: `${vehicle.formattedPlate} — ${vehicle.make} ${vehicle.model}`,
  }
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const vehicle = await getVehicleDetail(id)

  if (!vehicle) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/panel" />}>
              Resumen
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/panel/vehiculos" />}>
              Vehículos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{vehicle.formattedPlate}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{vehicle.formattedPlate}</Badge>
            {vehicle.latestMileageKm !== null && (
              <Badge variant="secondary">
                <IconGauge data-icon="inline-start" />
                {formatKilometers(vehicle.latestMileageKm)}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/historial/${vehicle.licensePlate}`} />}
            nativeButton={false}
          >
            <IconExternalLink data-icon="inline-start" />
            Historial público
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/panel/vehiculos/${vehicle.id}/editar`} />}
            nativeButton={false}
          >
            <IconEdit data-icon="inline-start" />
            Editar vehículo
          </Button>
          <DeleteVehicleButton
            vehicleId={vehicle.id}
            formattedPlate={vehicle.formattedPlate}
          />
          <Button
            size="sm"
            render={
              <Link href={`/panel/vehiculos/${vehicle.id}/trabajos/nuevo`} />
            }
            nativeButton={false}
          >
            <IconPlus data-icon="inline-start" />
            Registrar trabajo
          </Button>
        </div>
      </div>

      {/* Datos técnicos y dueños */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Datos técnicos del vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Motor</span>
                  <span className="text-sm font-medium">
                    {vehicle.engine ?? "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    Combustible
                  </span>
                  <span className="text-sm font-medium">
                    {vehicle.fuelType ?? "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    Transmisión
                  </span>
                  <span className="text-sm font-medium">
                    {vehicle.transmission ?? "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Color</span>
                  <span className="text-sm font-medium">
                    {vehicle.color ?? "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">
                    Chasis / VIN (privado)
                  </span>
                  <span className="text-sm font-medium">
                    {vehicle.vin ?? "—"}
                  </span>
                </div>
              </div>

              {vehicle.internalNotes && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <IconLock className="size-3.5" />
                      Notas internas del vehículo
                    </span>
                    <p className="text-sm">{vehicle.internalNotes}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dueños asociados</CardTitle>
            <CardDescription>
              Información interna. Nunca visible en la búsqueda pública.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vehicle.owners.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este vehículo no tiene dueños asignados. Podés asociarlos desde
                &quot;Editar vehículo&quot;.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {vehicle.owners.map((owner) => (
                  <Link
                    key={owner.id}
                    href={`/panel/personas/${owner.id}`}
                    className="flex flex-col gap-1 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <IconUser className="size-4 text-muted-foreground" />
                      {owner.fullName}
                    </span>
                    {owner.phone && (
                      <span className="text-xs text-muted-foreground">
                        {owner.phone}
                      </span>
                    )}
                    {owner.email && (
                      <span className="text-xs text-muted-foreground">
                        {owner.email}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trabajos realizados */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Trabajos realizados ({vehicle.jobs.length})</CardTitle>
              <CardDescription>
                Historial completo ordenado del más reciente al más antiguo.
              </CardDescription>
            </div>
            <Button
              size="sm"
              render={
                <Link href={`/panel/vehiculos/${vehicle.id}/trabajos/nuevo`} />
              }
              nativeButton={false}
            >
              <IconPlus data-icon="inline-start" />
              Registrar trabajo
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {vehicle.jobs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconTool />
                </EmptyMedia>
                <EmptyTitle>Sin trabajos registrados</EmptyTitle>
                <EmptyDescription>
                  Cargá el primer mantenimiento o reparación de este vehículo.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  render={
                    <Link
                      href={`/panel/vehiculos/${vehicle.id}/trabajos/nuevo`}
                    />
                  }
                  nativeButton={false}
                >
                  <IconPlus data-icon="inline-start" />
                  Registrar trabajo
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="flex flex-col gap-4">
              {vehicle.jobs.map((job) => {
                const hasSchedule =
                  job.nextDueKm !== null || job.nextDueDate !== null
                const reminderEval = hasSchedule
                  ? evaluateReminderStatus({
                      nextDueKm: job.nextDueKm,
                      nextDueDate: job.nextDueDate,
                      latestMileageKm: vehicle.latestMileageKm,
                    })
                  : null

                return (
                  <div
                    key={job.id}
                    className="flex flex-col gap-3 rounded-lg border p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold">
                            {job.title}
                          </span>
                          <Badge variant="secondary">
                            <IconCalendar data-icon="inline-start" />
                            {formatIsoDateEs(job.performedAt)}
                          </Badge>
                          <Badge variant="outline">
                            <IconGauge data-icon="inline-start" />
                            {formatKilometers(job.mileageKm)}
                          </Badge>
                        </div>

                        {job.description && (
                          <p className="text-sm text-muted-foreground">
                            {job.description}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          render={
                            <Link
                              href={`/panel/vehiculos/${vehicle.id}/trabajos/${job.id}/editar`}
                            />
                          }
                          nativeButton={false}
                        >
                          <IconEdit data-icon="inline-start" />
                          Editar
                        </Button>
                        <DeleteJobButton
                          vehicleId={vehicle.id}
                          jobId={job.id}
                          jobTitle={job.title}
                        />
                      </div>
                    </div>

                    {job.internalNotes && (
                      <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Nota interna:
                        </span>{" "}
                        {job.internalNotes}
                      </div>
                    )}

                    {hasSchedule && reminderEval && (
                      <div className="flex flex-wrap items-center gap-2 border-t pt-2 text-xs text-muted-foreground">
                        <span>Próximo control:</span>
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
                        <Badge
                          variant={
                            REMINDER_BADGE_MAP[reminderEval.status].variant
                          }
                        >
                          {REMINDER_BADGE_MAP[reminderEval.status].label}
                        </Badge>
                        {reminderEval.reasons.length > 0 && (
                          <span>({reminderEval.reasons.join(" · ")})</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
