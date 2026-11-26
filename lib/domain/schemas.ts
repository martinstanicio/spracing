import { z } from "zod"

import { isValidLicensePlate, normalizeLicensePlate } from "./license-plate"

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null))

const optionalPositiveInt = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .optional()
  .transform((val) => {
    if (val === null || val === undefined || val === "") return null
    const parsed = typeof val === "number" ? val : Number(val)
    return parsed
  })
  .refine(
    (val) => val === null || (Number.isInteger(val) && val > 0),
    "Debe ser un número entero mayor a 0."
  )

const optionalIsoDate = z
  .union([z.string(), z.null(), z.undefined()])
  .optional()
  .transform((val) => {
    const trimmed = val?.trim() ?? ""
    return trimmed === "" ? null : trimmed
  })
  .refine(
    (val) => val === null || ISO_DATE_REGEX.test(val),
    "La fecha debe tener formato AAAA-MM-DD."
  )

export const personSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ingresá el nombre completo (mínimo 2 caracteres).")
    .max(120, "Máximo 120 caracteres."),
  phone: optionalTrimmedString(40),
  email: z
    .string()
    .trim()
    .max(120, "Máximo 120 caracteres.")
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      "Ingresá un email válido."
    )
    .transform((value) => (value ? value.toLowerCase() : null)),
  notes: optionalTrimmedString(1000),
})

export const vehicleSchema = z.object({
  licensePlate: z
    .string()
    .trim()
    .refine(
      isValidLicensePlate,
      "Ingresá una patente válida (3 a 10 caracteres alfanuméricos)."
    )
    .transform(normalizeLicensePlate),
  make: z
    .string()
    .trim()
    .min(1, "La marca es obligatoria.")
    .max(60, "Máximo 60 caracteres."),
  model: z
    .string()
    .trim()
    .min(1, "El modelo es obligatorio.")
    .max(80, "Máximo 80 caracteres."),
  year: z.coerce
    .number()
    .int("El año debe ser un número entero.")
    .min(1900, "Año inválido (mínimo 1900).")
    .max(
      new Date().getFullYear() + 1,
      "El año no puede superar al próximo año."
    ),
  engine: optionalTrimmedString(80),
  fuelType: optionalTrimmedString(40),
  transmission: optionalTrimmedString(40),
  color: optionalTrimmedString(40),
  vin: optionalTrimmedString(40),
  internalNotes: optionalTrimmedString(2000),
  ownerIds: z.array(z.string().uuid("ID de dueño inválido.")).default([]),
})

export const jobItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Ingresá el nombre del trabajo realizado.")
    .max(140, "Máximo 140 caracteres."),
  description: optionalTrimmedString(1500),
  internalNotes: optionalTrimmedString(1500),
  repeatEveryKm: optionalPositiveInt,
  nextDueKm: optionalPositiveInt,
  repeatEveryMonths: optionalPositiveInt,
  nextDueDate: optionalIsoDate,
})

export const createJobsBatchSchema = z.object({
  performedAt: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, "Seleccioná una fecha válida."),
  mileageKm: z.coerce
    .number()
    .int("El kilometraje debe ser un número entero.")
    .min(0, "El kilometraje no puede ser negativo.")
    .max(9_999_999, "Kilometraje fuera de rango."),
  jobs: z.array(jobItemSchema).min(1, "Agregá al menos un trabajo realizado."),
})

export const updateJobSchema = jobItemSchema.extend({
  performedAt: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, "Seleccioná una fecha válida."),
  mileageKm: z.coerce
    .number()
    .int("El kilometraje debe ser un número entero.")
    .min(0, "El kilometraje no puede ser negativo.")
    .max(9_999_999, "Kilometraje fuera de rango."),
})

export type PersonInput = z.input<typeof personSchema>
export type VehicleInput = z.input<typeof vehicleSchema>
export type CreateJobsBatchInput = z.input<typeof createJobsBatchSchema>
export type UpdateJobInput = z.input<typeof updateJobSchema>
