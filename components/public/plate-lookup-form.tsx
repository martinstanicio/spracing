"use client"

import { IconSearch } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  isValidLicensePlate,
  normalizeLicensePlate,
} from "@/lib/domain/license-plate"

export function PlateLookupForm({
  initialPlate = "",
  label = "Patente del vehículo",
  description = "Ingresá la patente sin importar espacios ni guiones (ej. AB 123 CD o ABC 123).",
  buttonLabel = "Consultar historial",
}: {
  initialPlate?: string
  label?: string
  description?: string
  buttonLabel?: string
}) {
  const router = useRouter()
  const [plate, setPlate] = React.useState(initialPlate)
  const [error, setError] = React.useState<string | null>(null)
  const inputId = React.useId()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeLicensePlate(plate)

    if (!isValidLicensePlate(normalized)) {
      setError("Ingresá una patente válida de 3 a 10 caracteres alfanuméricos.")
      return
    }

    setError(null)
    router.push(`/historial/${encodeURIComponent(normalized)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field data-invalid={Boolean(error) || undefined}>
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
        <div className="flex flex-col gap-2 sm:flex-row">
          <InputGroup className="flex-1">
            <InputGroupAddon>
              <IconSearch />
            </InputGroupAddon>
            <InputGroupInput
              id={inputId}
              name="patente"
              value={plate}
              onChange={(event) => {
                setPlate(event.target.value.toUpperCase())
                if (error) setError(null)
              }}
              placeholder="Ej: AB 123 CD"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(error) || undefined}
            />
          </InputGroup>
          <Button type="submit">{buttonLabel}</Button>
        </div>
        {error ? (
          <FieldError>{error}</FieldError>
        ) : (
          <FieldDescription>{description}</FieldDescription>
        )}
      </Field>
    </form>
  )
}
