"use client"

import { IconPlus, IconSearch, IconX } from "@tabler/icons-react"
import * as React from "react"

import { PersonFormDialog } from "@/components/panel/person-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { OwnerSummary } from "@/lib/queries/panel"

export function OwnerPicker({
  initialPeople,
  selectedIds,
  onChange,
}: {
  initialPeople: OwnerSummary[]
  selectedIds: string[]
  onChange: (nextIds: string[]) => void
}) {
  const [peopleList, setPeopleList] =
    React.useState<OwnerSummary[]>(initialPeople)
  const [search, setSearch] = React.useState("")

  const selectedPeople = React.useMemo(
    () => peopleList.filter((person) => selectedIds.includes(person.id)),
    [peopleList, selectedIds]
  )

  const filteredPeople = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return peopleList
    return peopleList.filter(
      (person) =>
        person.fullName.toLowerCase().includes(query) ||
        (person.phone?.toLowerCase().includes(query) ?? false) ||
        (person.email?.toLowerCase().includes(query) ?? false)
    )
  }, [peopleList, search])

  function togglePerson(personId: string) {
    if (selectedIds.includes(personId)) {
      onChange(selectedIds.filter((id) => id !== personId))
    } else {
      onChange([...selectedIds, personId])
    }
  }

  function handlePersonCreated(newPerson: OwnerSummary) {
    setPeopleList((prev) =>
      [...prev, newPerson].sort((a, b) => a.fullName.localeCompare(b.fullName))
    )
    if (!selectedIds.includes(newPerson.id)) {
      onChange([...selectedIds, newPerson.id])
    }
  }

  return (
    <Field>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FieldLabel>Dueños asociados (opcional)</FieldLabel>
        <PersonFormDialog
          trigger={
            <Button type="button" variant="outline" size="sm">
              <IconPlus data-icon="inline-start" />
              Nueva persona
            </Button>
          }
          onSuccess={handlePersonCreated}
        />
      </div>

      <FieldDescription>
        Podés dejar la lista vacía si no conocés al dueño o asociar uno o más
        titulares. Estos datos nunca se muestran en la consulta pública.
      </FieldDescription>

      {selectedPeople.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedPeople.map((person) => (
            <Badge key={person.id} variant="secondary">
              <span>{person.fullName}</span>
              <button
                type="button"
                aria-label={`Quitar a ${person.fullName}`}
                onClick={() => togglePerson(person.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
              >
                <IconX className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-lg border p-3">
        <InputGroup>
          <InputGroupAddon>
            <IconSearch />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar persona por nombre o teléfono..."
          />
        </InputGroup>

        {filteredPeople.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No hay personas que coincidan. Usá &quot;Nueva persona&quot; para
            crear una.
          </p>
        ) : (
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {filteredPeople.map((person) => {
              const checked = selectedIds.includes(person.id)
              return (
                <label
                  key={person.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => togglePerson(person.id)}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">
                      {person.fullName}
                    </span>
                    {(person.phone || person.email) && (
                      <span className="truncate text-xs text-muted-foreground">
                        {[person.phone, person.email]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </Field>
  )
}
