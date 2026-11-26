import { IconEdit, IconPlus, IconSearch, IconUsers } from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"

import { DeletePersonButton } from "@/components/panel/delete-person-button"
import { PersonFormDialog } from "@/components/panel/person-form-dialog"
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
import { listPeople } from "@/lib/queries/panel"

export const metadata: Metadata = {
  title: "Personas / Dueños",
}

export default async function PeopleListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const peopleList = await listPeople(q)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Personas / Dueños
          </h1>
          <p className="text-sm text-muted-foreground">
            Directorio interno de propietarios. Una persona puede ser dueña de
            múltiples vehículos.
          </p>
        </div>

        <PersonFormDialog
          trigger={
            <Button>
              <IconPlus data-icon="inline-start" />
              Nueva persona
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de personas</CardTitle>
          <CardDescription>
            {peopleList.length}{" "}
            {peopleList.length === 1
              ? "persona registrada"
              : "personas registradas"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            <form
              action="/panel/personas"
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
                  placeholder="Buscar por nombre, teléfono o email..."
                />
              </InputGroup>
              <Button type="submit" variant="secondary">
                Buscar
              </Button>
              {q && (
                <Button
                  type="button"
                  variant="ghost"
                  render={<Link href="/panel/personas" />}
                  nativeButton={false}
                >
                  Limpiar
                </Button>
              )}
            </form>

            {peopleList.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconUsers />
                  </EmptyMedia>
                  <EmptyTitle>
                    {q
                      ? "No hay personas que coincidan"
                      : "Todavía no hay personas cargadas"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {q
                      ? "Probá con otro nombre o teléfono."
                      : "Podés crear personas aquí o directamente al cargar un vehículo."}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <PersonFormDialog
                    trigger={
                      <Button>
                        <IconPlus data-icon="inline-start" />
                        Nueva persona
                      </Button>
                    }
                  />
                </EmptyContent>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vehículos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peopleList.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>
                        <Link
                          href={`/panel/personas/${person.id}`}
                          className="font-medium hover:underline"
                        >
                          {person.fullName}
                        </Link>
                      </TableCell>
                      <TableCell>{person.phone ?? "—"}</TableCell>
                      <TableCell>{person.email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {person.vehiclesCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            render={
                              <Link href={`/panel/personas/${person.id}`} />
                            }
                            nativeButton={false}
                          >
                            Ver
                          </Button>
                          <PersonFormDialog
                            person={person}
                            trigger={
                              <Button variant="outline" size="sm">
                                <IconEdit data-icon="inline-start" />
                                Editar
                              </Button>
                            }
                          />
                          <DeletePersonButton
                            personId={person.id}
                            fullName={person.fullName}
                          />
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
