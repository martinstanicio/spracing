"use client"

import { IconAlertCircle } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import {
  createVehicleAction,
  updateVehicleAction,
} from "@/app/panel/vehiculos/actions"
import { OwnerPicker } from "@/components/panel/owner-picker"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import type { OwnerSummary } from "@/lib/queries/panel"
import { FUEL_TYPE_OPTIONS, TRANSMISSION_OPTIONS } from "@/lib/workshop-config"

export function VehicleForm({
  allPeople,
  initialVehicle,
}: {
  allPeople: OwnerSummary[]
  initialVehicle?: {
    id: string
    licensePlate: string
    make: string
    model: string
    year: number
    engine: string | null
    fuelType: string | null
    transmission: string | null
    color: string | null
    vin: string | null
    internalNotes: string | null
    ownerIds: string[]
  }
}) {
  const router = useRouter()
  const isEditing = Boolean(initialVehicle)

  const [licensePlate, setLicensePlate] = React.useState(
    initialVehicle?.licensePlate ?? ""
  )
  const [make, setMake] = React.useState(initialVehicle?.make ?? "")
  const [model, setModel] = React.useState(initialVehicle?.model ?? "")
  const [year, setYear] = React.useState(
    initialVehicle?.year ? String(initialVehicle.year) : ""
  )
  const [engine, setEngine] = React.useState(initialVehicle?.engine ?? "")
  const [fuelType, setFuelType] = React.useState<string | null>(
    initialVehicle?.fuelType ?? null
  )
  const [transmission, setTransmission] = React.useState<string | null>(
    initialVehicle?.transmission ?? null
  )
  const [color, setColor] = React.useState(initialVehicle?.color ?? "")
  const [vin, setVin] = React.useState(initialVehicle?.vin ?? "")
  const [internalNotes, setInternalNotes] = React.useState(
    initialVehicle?.internalNotes ?? ""
  )
  const [ownerIds, setOwnerIds] = React.useState<string[]>(
    initialVehicle?.ownerIds ?? []
  )

  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const payload = {
      licensePlate,
      make,
      model,
      year: Number(year),
      engine,
      fuelType: fuelType ?? "",
      transmission: transmission ?? "",
      color,
      vin,
      internalNotes,
      ownerIds,
    }

    const result = initialVehicle
      ? await updateVehicleAction(initialVehicle.id, payload)
      : await createVehicleAction(payload)

    setPending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    toast.add({
      title: isEditing ? "Vehículo actualizado" : "Vehículo registrado",
      description: `Patente ${result.data.licensePlate} guardada correctamente.`,
      type: "success",
    })

    router.push(`/panel/vehiculos/${result.data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Editar vehículo" : "Registrar nuevo vehículo"}
          </CardTitle>
          <CardDescription>
            Cargá los datos técnicos del vehículo y asociá opcionalmente uno o
            más dueños.
          </CardDescription>
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
                  <FieldLabel htmlFor="licensePlate">Patente *</FieldLabel>
                  <Input
                    id="licensePlate"
                    value={licensePlate}
                    onChange={(e) =>
                      setLicensePlate(e.target.value.toUpperCase())
                    }
                    placeholder="Ej: AB123CD"
                    required
                  />
                  <FieldDescription>
                    Se normaliza automáticamente en mayúsculas sin espacios.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="year">Año *</FieldLabel>
                  <Input
                    id="year"
                    type="number"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Ej: 2021"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="make">Marca *</FieldLabel>
                  <Input
                    id="make"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="Ej: Volkswagen"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="model">Modelo *</FieldLabel>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ej: Golf GTI"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="engine">Motor</FieldLabel>
                  <Input
                    id="engine"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    placeholder="Ej: 2.0 TSI / 1.6 16v"
                  />
                </Field>

                <Field>
                  <FieldLabel>Combustible</FieldLabel>
                  <Select
                    items={FUEL_TYPE_OPTIONS}
                    value={fuelType}
                    onValueChange={setFuelType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {FUEL_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.label} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Transmisión</FieldLabel>
                  <Select
                    items={TRANSMISSION_OPTIONS}
                    value={transmission}
                    onValueChange={setTransmission}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TRANSMISSION_OPTIONS.map((option) => (
                          <SelectItem key={option.label} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="color">Color</FieldLabel>
                  <Input
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ej: Gris plata"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="vin">
                    Nro. de chasis / VIN (privado)
                  </FieldLabel>
                  <Input
                    id="vin"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="Opcional — visible solo en el panel"
                  />
                </Field>
              </div>

              <OwnerPicker
                initialPeople={allPeople}
                selectedIds={ownerIds}
                onChange={setOwnerIds}
              />

              <Field>
                <FieldLabel htmlFor="internalNotes">
                  Notas internas del vehículo (privadas)
                </FieldLabel>
                <Textarea
                  id="internalNotes"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Detalles técnicos internos, códigos de repuesto o aclaraciones (no se muestran al cliente)..."
                  rows={3}
                />
              </Field>
            </FieldGroup>
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-2 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            render={
              <Link
                href={
                  initialVehicle
                    ? `/panel/vehiculos/${initialVehicle.id}`
                    : "/panel/vehiculos"
                }
              />
            }
            nativeButton={false}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {pending
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear vehículo"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
