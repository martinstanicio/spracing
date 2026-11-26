import assert from "node:assert/strict"
import test from "node:test"

import { createJobsBatchSchema, personSchema, vehicleSchema } from "./schemas"

test("vehicleSchema normaliza patente y acepta vehículo sin dueños", () => {
  const parsed = vehicleSchema.parse({
    licensePlate: "ab 123 cd",
    make: "Volkswagen",
    model: "Golf GTI",
    year: 2020,
    ownerIds: [],
  })

  assert.equal(parsed.licensePlate, "AB123CD")
  assert.deepEqual(parsed.ownerIds, [])
  assert.equal(parsed.engine, null)
})

test("personSchema valida email opcional", () => {
  const valid = personSchema.parse({
    fullName: "Juan Pérez",
    phone: "11 5555-0000",
    email: "",
    notes: "",
  })
  assert.equal(valid.email, null)

  assert.throws(() =>
    personSchema.parse({
      fullName: "Juan Pérez",
      email: "no-es-email",
    })
  )
})

test("createJobsBatchSchema permite trabajos con y sin repetición", () => {
  const parsed = createJobsBatchSchema.parse({
    performedAt: "2026-11-25",
    mileageKm: 85_000,
    jobs: [
      {
        title: "Cambio de aceite y filtro",
        repeatEveryKm: 10_000,
        nextDueKm: 95_000,
        repeatEveryMonths: 12,
        nextDueDate: "2027-11-25",
      },
      {
        title: "Cambio de lámpara baja izquierda",
      },
    ],
  })

  assert.equal(parsed.jobs.length, 2)
  assert.equal(parsed.jobs[1].nextDueKm, null)
  assert.equal(parsed.jobs[1].nextDueDate, null)
})
