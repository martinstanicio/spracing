"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { assertDatabaseConfigured, db } from "@/db"
import { people } from "@/db/schema"
import { assertMechanicSession } from "@/lib/auth-session"
import { type PersonInput, personSchema } from "@/lib/domain/schemas"
import type { OwnerSummary } from "@/lib/queries/panel"

export type ActionResult<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string }

export async function createPersonAction(
  input: PersonInput
): Promise<ActionResult<OwnerSummary>> {
  await assertMechanicSession()
  assertDatabaseConfigured()

  const parsed = personSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos de persona inválidos.",
    }
  }

  const [created] = await db
    .insert(people)
    .values({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      notes: parsed.data.notes,
    })
    .returning({
      id: people.id,
      fullName: people.fullName,
      phone: people.phone,
      email: people.email,
    })

  revalidatePath("/panel")
  revalidatePath("/panel/personas")
  revalidatePath("/panel/vehiculos")

  return { ok: true, data: created }
}

export async function updatePersonAction(
  personId: string,
  input: PersonInput
): Promise<ActionResult<OwnerSummary>> {
  await assertMechanicSession()
  assertDatabaseConfigured()

  const parsed = personSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos de persona inválidos.",
    }
  }

  const [updated] = await db
    .update(people)
    .set({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      notes: parsed.data.notes,
    })
    .where(eq(people.id, personId))
    .returning({
      id: people.id,
      fullName: people.fullName,
      phone: people.phone,
      email: people.email,
    })

  if (!updated) {
    return { ok: false, error: "No se encontró la persona." }
  }

  revalidatePath("/panel")
  revalidatePath("/panel/personas")
  revalidatePath(`/panel/personas/${personId}`)
  revalidatePath("/panel/vehiculos")

  return { ok: true, data: updated }
}

export async function deletePersonAction(
  personId: string
): Promise<ActionResult> {
  await assertMechanicSession()
  assertDatabaseConfigured()

  const deleted = await db
    .delete(people)
    .where(eq(people.id, personId))
    .returning({ id: people.id })

  if (deleted.length === 0) {
    return { ok: false, error: "No se encontró la persona." }
  }

  revalidatePath("/panel")
  revalidatePath("/panel/personas")
  revalidatePath("/panel/vehiculos")

  return { ok: true, data: undefined }
}
