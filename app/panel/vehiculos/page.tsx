import { IconCar, IconPlus, IconSearch } from "@tabler/icons-react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatIsoDateEs, formatKilometers } from "@/lib/domain/maintenance"
import { listVehicles } from "@/lib/queries/panel"

export const metadata: Metadata = {
  title: "Vehículos",
}

export default async function VehiclesListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const vehiclesList = await listVehicles(q)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Vehículos</h1>
          <p className="text-sm text-muted-foreground">
            Administrá los autos del taller, sus dueños y trabajos realizados.
          </p>
        </div>

        <Button
          render={<Link href="/panel/vehiculos/nuevo" />}
          nativeButton={false}
        >
          <IconPlus data-icon="inline-start" />
          Nuevo vehículo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de vehículos</CardTitle>
          <CardDescription>
            {vehiclesList.length}{" "}
            {vehiclesList.length === 1
              ? "vehículo encontrado"
              : "vehículos encontrados"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
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
                  defaultValue={q ?? ""}
                  placeholder="Filtrar por patente, marca, modelo o dueño..."
                />
              </InputGroup>
              <Button type="submit" variant="secondary">
                Filtrar
              </Button>
              {q && (
                <Button
                  type="button"
                  variant="ghost"
                  render={<Link href="/panel/vehiculos" />}
                  nativeButton={false}
                >
                  Limpiar
                </Button>
              )}
            </form>

            {vehiclesList.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconCar />
                  </EmptyMedia>
                  <EmptyTitle>
                    {q
                      ? "No hay vehículos que coincidan"
                      : "Todavía no hay vehículos"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {q
                      ? "Probá con otra patente, modelo o nombre de dueño."
                      : "Cargá el primer vehículo para empezar a registrar sus trabajos."}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    render={<Link href="/panel/vehiculos/nuevo" />}
                    nativeButton={false}
                  >
                    <IconPlus data-icon="inline-start" />
                    Nuevo vehículo
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patente</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Dueños</TableHead>
                    <TableHead>Último km</TableHead>
                    <TableHead>Trabajos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehiclesList.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <Link
                          href={`/panel/vehiculos/${vehicle.id}`}
                          className="font-semibold hover:underline"
                        >
                          <Badge variant="outline">
                            {vehicle.formattedPlate}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </span>
                          {vehicle.engine && (
                            <span className="text-xs text-muted-foreground">
                              Motor {vehicle.engine}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {vehicle.owners.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            Sin dueño asignado
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {vehicle.owners.map((owner) => (
                              <Badge key={owner.id} variant="secondary">
                                {owner.fullName}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {vehicle.latestMileageKm !== null
                              ? formatKilometers(vehicle.latestMileageKm)
                              : "—"}
                          </span>
                          {vehicle.lastServiceDate && (
                            <span className="text-xs text-muted-foreground">
                              {formatIsoDateEs(vehicle.lastServiceDate)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.jobsCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            render={
                              <Link
                                href={`/panel/vehiculos/${vehicle.id}/trabajos/nuevo`}
                              />
                            }
                            nativeButton={false}
                          >
                            + Trabajo
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            render={
                              <Link href={`/panel/vehiculos/${vehicle.id}`} />
                            }
                            nativeButton={false}
                          >
                            Ver ficha
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
