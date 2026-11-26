"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/app/panel/personas/actions"
import { assertDatabaseConfigured, db } from "@/db"
import { jobs, vehicles } from "@/db/schema"
import { assertMechanicSession } from "@/lib/auth-session"
import {
  type CreateJobsBatchInput,
  createJobsBatchSchema,
  type UpdateJobInput,
  updateJobSchema,
} from "@/lib/domain/schemas"

export async function createJobsBatchAction(
  vehicleId: string,
  input: CreateJobsBatchInput
): Promise<ActionResult<{ count: number }>> {
  const session = await assertMechanicSession()
  assertDatabaseConfigured()

  const parsed = createJobsBatchSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ??
        "Verificá los datos de los trabajos ingresados.",
    }
  }

  const [vehicle] = await db
    .select({ id: vehicles.id, licensePlate: vehicles.licensePlate })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1)

  if (!vehicle) {
    return { ok: false, error: "No se encontró el vehículo." }
  }

  await db.transaction(async (tx) => {
    await tx.insert(jobs).values(
      parsed.data.jobs.map((job) => ({
        vehicleId: vehicle.id,
        performedAt: parsed.data.performedAt,
        mileageKm: parsed.data.mileageKm,
        title: job.title,
        description: job.description,
        internalNotes: job.internalNotes,
        repeatEveryKm: job.repeatEveryKm,
        nextDueKm: job.nextDueKm,
        repeatEveryMonths: job.repeatEveryMonths,
        nextDueDate: job.nextDueDate,
        createdByUserId: session.user.id,
      }))
    )
  })

  revalidatePath("/panel")
  revalidatePath("/panel/vehiculos")
  revalidatePath(`/panel/vehiculos/${vehicleId}`)
  revalidatePath(`/historial/${vehicle.licensePlate}`)

  return { ok: true, data: { count: parsed.data.jobs.length } }
}

export async function updateJobAction(
  vehicleId: string,
  jobId: string,
  input: UpdateJobInput
): Promise<ActionResult> {
  await assertMechanicSession()
  assertDatabaseConfigured()

  const parsed = updateJobSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ??
        "Verificá los datos del trabajo ingresado.",
    }
  }

  const [vehicle] = await db
    .select({ id: vehicles.id, licensePlate: vehicles.licensePlate })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1)

  if (!vehicle) {
    return { ok: false, error: "No se encontró el vehículo." }
  }

  const [updated] = await db
    .update(jobs)
    .set({
      performedAt: parsed.data.performedAt,
      mileageKm: parsed.data.mileageKm,
      title: parsed.data.title,
      description: parsed.data.description,
      internalNotes: parsed.data.internalNotes,
      repeatEveryKm: parsed.data.repeatEveryKm,
      nextDueKm: parsed.data.nextDueKm,
      repeatEveryMonths: parsed.data.repeatEveryMonths,
      nextDueDate: parsed.data.nextDueDate,
    })
    .where(and(eq(jobs.id, jobId), eq(jobs.vehicleId, vehicleId)))
    .returning({ id: jobs.id })

  if (!updated) {
    return { ok: false, error: "No se encontró el trabajo." }
  }

  revalidatePath("/panel")
  revalidatePath("/panel/vehiculos")
  revalidatePath(`/panel/vehiculos/${vehicleId}`)
  revalidatePath(`/historial/${vehicle.licensePlate}`)

  return { ok: true, data: undefined }
}

export async function deleteJobAction(
  vehicleId: string,
  jobId: string
): Promise<ActionResult> {
  await assertMechanicSession()
  assertDatabaseConfigured()

  const [vehicle] = await db
    .select({ id: vehicles.id, licensePlate: vehicles.licensePlate })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1)

  if (!vehicle) {
    return { ok: false, error: "No se encontró el vehículo." }
  }

  const [deleted] = await db
    .delete(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.vehicleId, vehicleId)))
    .returning({ id: jobs.id })

  if (!deleted) {
    return { ok: false, error: "No se encontró el trabajo." }
  }

  revalidatePath("/panel")
  revalidatePath("/panel/vehiculos")
  revalidatePath(`/panel/vehiculos/${vehicleId}`)
  revalidatePath(`/historial/${vehicle.licensePlate}`)

  return { ok: true, data: undefined }
}
