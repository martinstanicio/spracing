import { IconCar, IconEdit, IconMail, IconPhone } from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { DeletePersonButton } from "@/components/panel/delete-person-button"
import { PersonFormDialog } from "@/components/panel/person-form-dialog"
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
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getPersonDetail } from "@/lib/queries/panel"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const person = await getPersonDetail(id)
  if (!person) {
    return { title: "Persona no encontrada" }
  }
  return { title: person.fullName }
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const person = await getPersonDetail(id)

  if (!person) {
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
            <BreadcrumbLink render={<Link href="/panel/personas" />}>
              Personas
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{person.fullName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {person.fullName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Ficha interna de propietario
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <PersonFormDialog
            person={person}
            trigger={
              <Button variant="outline" size="sm">
                <IconEdit data-icon="inline-start" />
                Editar datos
              </Button>
            }
          />
          <DeletePersonButton
            personId={person.id}
            fullName={person.fullName}
            redirectToList
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Datos de contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <IconPhone className="size-4 text-muted-foreground" />
                <span>{person.phone ?? "Sin teléfono"}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconMail className="size-4 text-muted-foreground" />
                <span>{person.email ?? "Sin email"}</span>
              </div>
              {person.notes && (
                <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                  {person.notes}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Vehículos asociados ({person.vehicles.length})
            </CardTitle>
            <CardDescription>
              Vehículos en los que figura como dueño.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {person.vehicles.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconCar />
                  </EmptyMedia>
                  <EmptyTitle>Sin vehículos asociados</EmptyTitle>
                  <EmptyDescription>
                    Podés vincular esta persona desde la ficha de cualquier
                    vehículo.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {person.vehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/panel/vehiculos/${vehicle.id}`}
                    className="flex flex-col gap-1.5 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                  >
                    <Badge variant="outline">{vehicle.formattedPlate}</Badge>
                    <span className="text-sm font-medium">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </span>
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
