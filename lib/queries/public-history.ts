import "server-only"

import { desc, eq } from "drizzle-orm"

import { db, isDatabaseConfigured } from "@/db"
import { jobs, vehicles } from "@/db/schema"
import {
  formatLicensePlate,
  isValidLicensePlate,
  normalizeLicensePlate,
} from "@/lib/domain/license-plate"
import {
  evaluateReminderStatus,
  getTodayIsoDate,
  type ReminderStatus,
} from "@/lib/domain/maintenance"

export interface PublicJobRecord {
  id: string
  performedAt: string
  mileageKm: number
  title: string
  description: string | null
  repeatEveryKm: number | null
  nextDueKm: number | null
  repeatEveryMonths: number | null
  nextDueDate: string | null
}

export interface PublicReminderItem {
  jobId: string
  title: string
  performedAt: string
  nextDueKm: number | null
  nextDueDate: string | null
  status: ReminderStatus
  reasons: string[]
}

export interface PublicVehicleHistory {
  vehicle: {
    id: string
    licensePlate: string
    formattedPlate: string
    make: string
    model: string
    year: number
    engine: string | null
    fuelType: string | null
    transmission: string | null
    color: string | null
  }
  latestMileageKm: number | null
  lastServiceDate: string | null
  jobs: PublicJobRecord[]
  scheduledReminders: PublicReminderItem[]
}

export type PublicHistoryLookupResult =
  | { status: "ok"; data: PublicVehicleHistory }
  | { status: "invalid_plate"; normalizedPlate: string }
  | { status: "not_found"; normalizedPlate: string }
  | { status: "db_unconfigured"; normalizedPlate: string }

export async function getPublicVehicleHistoryByPlate(
  rawPlate: string
): Promise<PublicHistoryLookupResult> {
  const normalizedPlate = normalizeLicensePlate(rawPlate)
  if (!isValidLicensePlate(normalizedPlate)) {
    return { status: "invalid_plate", normalizedPlate }
  }

  if (!isDatabaseConfigured) {
    return { status: "db_unconfigured", normalizedPlate }
  }

  // Aislamiento estricto: seleccionamos únicamente campos públicos del vehículo.
  const [vehicle] = await db
    .select({
      id: vehicles.id,
      licensePlate: vehicles.licensePlate,
      make: vehicles.make,
      model: vehicles.model,
      year: vehicles.year,
      engine: vehicles.engine,
      fuelType: vehicles.fuelType,
      transmission: vehicles.transmission,
      color: vehicles.color,
    })
    .from(vehicles)
    .where(eq(vehicles.licensePlate, normalizedPlate))
    .limit(1)

  if (!vehicle) {
    return { status: "not_found", normalizedPlate }
  }

  // Seleccionamos únicamente campos públicos de trabajos (nunca internalNotes ni createdByUserId).
  const vehicleJobs = await db
    .select({
      id: jobs.id,
      performedAt: jobs.performedAt,
      mileageKm: jobs.mileageKm,
      title: jobs.title,
      description: jobs.description,
      repeatEveryKm: jobs.repeatEveryKm,
      nextDueKm: jobs.nextDueKm,
      repeatEveryMonths: jobs.repeatEveryMonths,
      nextDueDate: jobs.nextDueDate,
    })
    .from(jobs)
    .where(eq(jobs.vehicleId, vehicle.id))
    .orderBy(desc(jobs.performedAt), desc(jobs.createdAt))

  const latestMileageKm =
    vehicleJobs.length > 0
      ? vehicleJobs.reduce(
          (max, item) => (item.mileageKm > max ? item.mileageKm : max),
          0
        )
      : null

  const lastServiceDate =
    vehicleJobs.length > 0 ? vehicleJobs[0].performedAt : null

  const todayIso = getTodayIsoDate()
  const scheduledReminders: PublicReminderItem[] = vehicleJobs
    .filter((job) => job.nextDueKm !== null || job.nextDueDate !== null)
    .map((job) => {
      const evaluation = evaluateReminderStatus({
        nextDueKm: job.nextDueKm,
        nextDueDate: job.nextDueDate,
        latestMileageKm,
        todayIso,
      })

      return {
        jobId: job.id,
        title: job.title,
        performedAt: job.performedAt,
        nextDueKm: job.nextDueKm,
        nextDueDate: job.nextDueDate,
        status: evaluation.status,
        reasons: evaluation.reasons,
      }
    })

  return {
    status: "ok",
    data: {
      vehicle: {
        ...vehicle,
        formattedPlate: formatLicensePlate(vehicle.licensePlate),
      },
      latestMileageKm,
      lastServiceDate,
      jobs: vehicleJobs,
      scheduledReminders,
    },
  }
}
