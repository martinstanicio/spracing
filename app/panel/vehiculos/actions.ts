"use server"

import { and, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/app/panel/personas/actions"
import { assertDatabaseConfigured, db } from "@/db"
import { vehicleOwners, vehicles } from "@/db/schema"
import { assertMechanicSession } from "@/lib/auth-session"
import { type VehicleInput, vehicleSchema } from "@/lib/domain/schemas"

export async function createVehicleAction(
  input: VehicleInput
): Promise<ActionResult<{ id: string; licensePlate: string }>> {
  await assertMechanicSession()
  assertDatabaseConfigured()

  const parsed = vehicleSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos del vehículo inválidos.",
    }
  }

  const existing = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(eq(vehicles.licensePlate, parsed.data.licensePlate))
    .limit(1)

  if (existing.length > 0) {
    return {
      ok: false,
      error: `Ya existe un vehículo registrado con la patente ${parsed.data.licensePlate}.`,
    }
  }

  const uniqueOwnerIds = Array.from(new Set(parsed.data.ownerIds))

  const created = await db.transaction(async (tx) => {
    const [vehicle] = await tx
      .insert(vehicles)
      .values({
        licensePlate: parsed.data.licensePlate,
        make: parsed.data.make,
        model: parsed.data.model,
        year: parsed.data.year,
        engine: parsed.data.engine,
        fuelType: parsed.data.fuelType,
        transmission: parsed.data.transmission,
        color: parsed.data.color,
        vin: parsed.data.vin,
        internalNotes: parsed.data.internalNotes,
      })
      .returning({
        id: vehicles.id,
        licensePlate: vehicles.licensePlate,
      })

    if (uniqueOwnerIds.length > 0) {
      await tx.insert(vehicleOwners).values(
        uniqueOwnerIds.map((personId) => ({
          vehicleId: vehicle.id,
          personId,
        }))
      )
    }

    return vehicle
  })

  revalidatePath("/panel")
  revalidatePath("/panel/vehiculos")
  revalidatePath("/panel/personas")
  revalidatePath(`/historial/${created.licensePlate}`)

  return { ok: true, data: created }
}

export async function updateVehicleAction(
  vehicleId: string,
  input: VehicleInput
): Promise<ActionResult<{ id: string; licensePlate: string }>> {
  await assertMechanicSession()
  assertDatabaseConfigured()

  const parsed = vehicleSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos del vehículo inválidos.",
    }
  }

  const [currentVehicle] = await db
    .select({ id: vehicles.id, licensePlate: vehicles.licensePlate })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1)

  if (!currentVehicle) {
    return { ok: false, error: "No se encontró el vehículo." }
  }

  const duplicate = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(
      and(
        eq(vehicles.licensePlate, parsed.data.licensePlate),
        ne(vehicles.id, vehicleId)
      )
    )
    .limit(1)

  if (duplicate.length > 0) {
    return {
      ok: false,
      error: `Ya existe otro vehículo registrado con la patente ${parsed.data.licensePlate}.`,
    }
  }

  const uniqueOwnerIds = Array.from(new Set(parsed.data.ownerIds))

  const updated = await db.transaction(async (tx) => {
    const [vehicle] = await tx
      .update(vehicles)
      .set({
        licensePlate: parsed.data.licensePlate,
        make: parsed.data.make,
        model: parsed.data.model,
        year: parsed.data.year,
        engine: parsed.data.engine,
        fuelType: parsed.data.fuelType,
        transmission: parsed.data.transmission,
        color: parsed.data.color,
        vin: parsed.data.vin,
        internalNotes: parsed.data.internalNotes,
      })
      .where(eq(vehicles.id, vehicleId))
      .returning({
        id: vehicles.id,
        licensePlate: vehicles.licensePlate,
      })

    await tx.delete(vehicleOwners).where(eq(vehicleOwners.vehicleId, vehicleId))

    if (uniqueOwnerIds.length > 0) {
      await tx.insert(vehicleOwners).values(
        uniqueOwnerIds.map((personId) => ({
          vehicleId,
          personId,
        }))
      )
    }

    return vehicle
  })

  revalidatePath("/panel")
  revalidatePath("/panel/vehiculos")
  revalidatePath(`/panel/vehiculos/${vehicleId}`)
  revalidatePath("/panel/personas")
  revalidatePath(`/historial/${currentVehicle.licensePlate}`)
  revalidatePath(`/historial/${updated.licensePlate}`)

  return { ok: true, data: updated }
}

export async function deleteVehicleAction(
  vehicleId: string
): Promise<ActionResult> {
  await assertMechanicSession()
  assertDatabaseConfigured()

  const [deleted] = await db
    .delete(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .returning({ id: vehicles.id, licensePlate: vehicles.licensePlate })

  if (!deleted) {
    return { ok: false, error: "No se encontró el vehículo." }
  }

  revalidatePath("/panel")
  revalidatePath("/panel/vehiculos")
  revalidatePath("/panel/personas")
  revalidatePath(`/historial/${deleted.licensePlate}`)

  return { ok: true, data: undefined }
}
