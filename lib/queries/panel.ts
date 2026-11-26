import "server-only"

import { desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { db } from "@/db"
import { jobs, people, vehicleOwners, vehicles } from "@/db/schema"
import {
  formatLicensePlate,
  normalizeLicensePlate,
} from "@/lib/domain/license-plate"
import {
  evaluateReminderStatus,
  getTodayIsoDate,
  type ReminderStatus,
} from "@/lib/domain/maintenance"

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface OwnerSummary {
  id: string
  fullName: string
  phone: string | null
  email: string | null
}

export interface VehicleListItem {
  id: string
  licensePlate: string
  formattedPlate: string
  make: string
  model: string
  year: number
  engine: string | null
  owners: OwnerSummary[]
  latestMileageKm: number | null
  lastServiceDate: string | null
  jobsCount: number
}

export interface PanelJobItem {
  id: string
  vehicleId: string
  performedAt: string
  mileageKm: number
  title: string
  description: string | null
  internalNotes: string | null
  repeatEveryKm: number | null
  nextDueKm: number | null
  repeatEveryMonths: number | null
  nextDueDate: string | null
  createdAt: Date
}

export interface VehicleDetail {
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
  vin: string | null
  internalNotes: string | null
  owners: OwnerSummary[]
  latestMileageKm: number | null
  jobs: PanelJobItem[]
}

export interface PersonListItem {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  notes: string | null
  vehiclesCount: number
}

export interface PersonDetail {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  notes: string | null
  vehicles: {
    id: string
    licensePlate: string
    formattedPlate: string
    make: string
    model: string
    year: number
  }[]
}

export interface DashboardReminderItem {
  jobId: string
  vehicleId: string
  licensePlate: string
  formattedPlate: string
  vehicleLabel: string
  title: string
  performedAt: string
  nextDueKm: number | null
  nextDueDate: string | null
  latestMileageKm: number | null
  status: ReminderStatus
  reasons: string[]
  owners: OwnerSummary[]
}

export interface DashboardSummary {
  counts: {
    vehicles: number
    jobs: number
    people: number
    scheduledJobs: number
  }
  recentJobs: {
    id: string
    vehicleId: string
    formattedPlate: string
    vehicleLabel: string
    title: string
    performedAt: string
    mileageKm: number
  }[]
  reminders: DashboardReminderItem[]
}

async function getOwnersByVehicleIds(
  vehicleIds: string[]
): Promise<Map<string, OwnerSummary[]>> {
  const map = new Map<string, OwnerSummary[]>()
  if (vehicleIds.length === 0) return map

  const rows = await db
    .select({
      vehicleId: vehicleOwners.vehicleId,
      id: people.id,
      fullName: people.fullName,
      phone: people.phone,
      email: people.email,
    })
    .from(vehicleOwners)
    .innerJoin(people, eq(vehicleOwners.personId, people.id))
    .where(inArray(vehicleOwners.vehicleId, vehicleIds))
    .orderBy(people.fullName)

  for (const row of rows) {
    const list = map.get(row.vehicleId) ?? []
    list.push({
      id: row.id,
      fullName: row.fullName,
      phone: row.phone,
      email: row.email,
    })
    map.set(row.vehicleId, list)
  }

  return map
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [
    [vehiclesCountRow],
    [jobsCountRow],
    [peopleCountRow],
    recentJobsRows,
    scheduledRows,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(vehicles),
    db.select({ count: sql<number>`count(*)::int` }).from(jobs),
    db.select({ count: sql<number>`count(*)::int` }).from(people),
    db
      .select({
        id: jobs.id,
        vehicleId: vehicles.id,
        licensePlate: vehicles.licensePlate,
        make: vehicles.make,
        model: vehicles.model,
        year: vehicles.year,
        title: jobs.title,
        performedAt: jobs.performedAt,
        mileageKm: jobs.mileageKm,
      })
      .from(jobs)
      .innerJoin(vehicles, eq(jobs.vehicleId, vehicles.id))
      .orderBy(desc(jobs.performedAt), desc(jobs.createdAt))
      .limit(8),
    db
      .select({
        jobId: jobs.id,
        vehicleId: vehicles.id,
        licensePlate: vehicles.licensePlate,
        make: vehicles.make,
        model: vehicles.model,
        year: vehicles.year,
        title: jobs.title,
        performedAt: jobs.performedAt,
        nextDueKm: jobs.nextDueKm,
        nextDueDate: jobs.nextDueDate,
      })
      .from(jobs)
      .innerJoin(vehicles, eq(jobs.vehicleId, vehicles.id))
      .where(or(isNotNull(jobs.nextDueKm), isNotNull(jobs.nextDueDate)))
      .orderBy(desc(jobs.performedAt))
      .limit(50),
  ])

  const scheduledVehicleIds = Array.from(
    new Set(scheduledRows.map((row) => row.vehicleId))
  )

  const [ownersMap, maxMileageRows] = await Promise.all([
    getOwnersByVehicleIds(scheduledVehicleIds),
    scheduledVehicleIds.length > 0
      ? db
          .select({
            vehicleId: jobs.vehicleId,
            maxKm: sql<number>`max(${jobs.mileageKm})::int`,
          })
          .from(jobs)
          .where(inArray(jobs.vehicleId, scheduledVehicleIds))
          .groupBy(jobs.vehicleId)
      : Promise.resolve([]),
  ])

  const maxKmByVehicle = new Map<string, number>()
  for (const row of maxMileageRows) {
    maxKmByVehicle.set(row.vehicleId, row.maxKm)
  }

  const todayIso = getTodayIsoDate()
  const priorityOrder: Record<ReminderStatus, number> = {
    overdue: 0,
    upcoming: 1,
    ok: 2,
  }

  const reminders: DashboardReminderItem[] = scheduledRows
    .map((row) => {
      const latestMileageKm = maxKmByVehicle.get(row.vehicleId) ?? null
      const evaluation = evaluateReminderStatus({
        nextDueKm: row.nextDueKm,
        nextDueDate: row.nextDueDate,
        latestMileageKm,
        todayIso,
      })

      return {
        jobId: row.jobId,
        vehicleId: row.vehicleId,
        licensePlate: row.licensePlate,
        formattedPlate: formatLicensePlate(row.licensePlate),
        vehicleLabel: `${row.make} ${row.model} (${row.year})`,
        title: row.title,
        performedAt: row.performedAt,
        nextDueKm: row.nextDueKm,
        nextDueDate: row.nextDueDate,
        latestMileageKm,
        status: evaluation.status,
        reasons: evaluation.reasons,
        owners: ownersMap.get(row.vehicleId) ?? [],
      }
    })
    .sort((a, b) => priorityOrder[a.status] - priorityOrder[b.status])
    .slice(0, 12)

  return {
    counts: {
      vehicles: vehiclesCountRow?.count ?? 0,
      jobs: jobsCountRow?.count ?? 0,
      people: peopleCountRow?.count ?? 0,
      scheduledJobs: scheduledRows.length,
    },
    recentJobs: recentJobsRows.map((row) => ({
      id: row.id,
      vehicleId: row.vehicleId,
      formattedPlate: formatLicensePlate(row.licensePlate),
      vehicleLabel: `${row.make} ${row.model} (${row.year})`,
      title: row.title,
      performedAt: row.performedAt,
      mileageKm: row.mileageKm,
    })),
    reminders,
  }
}

export async function listVehicles(query?: string): Promise<VehicleListItem[]> {
  const allVehicles = await db
    .select({
      id: vehicles.id,
      licensePlate: vehicles.licensePlate,
      make: vehicles.make,
      model: vehicles.model,
      year: vehicles.year,
      engine: vehicles.engine,
    })
    .from(vehicles)
    .orderBy(desc(vehicles.updatedAt), vehicles.licensePlate)

  if (allVehicles.length === 0) return []

  const vehicleIds = allVehicles.map((v) => v.id)
  const [ownersMap, jobStatsRows] = await Promise.all([
    getOwnersByVehicleIds(vehicleIds),
    db
      .select({
        vehicleId: jobs.vehicleId,
        maxKm: sql<number>`max(${jobs.mileageKm})::int`,
        lastDate: sql<string>`max(${jobs.performedAt})`,
        count: sql<number>`count(*)::int`,
      })
      .from(jobs)
      .where(inArray(jobs.vehicleId, vehicleIds))
      .groupBy(jobs.vehicleId),
  ])

  const statsMap = new Map<
    string,
    { maxKm: number; lastDate: string; count: number }
  >()
  for (const row of jobStatsRows) {
    statsMap.set(row.vehicleId, {
      maxKm: row.maxKm,
      lastDate: row.lastDate,
      count: row.count,
    })
  }

  const enriched: VehicleListItem[] = allVehicles.map((vehicle) => {
    const stats = statsMap.get(vehicle.id)
    return {
      ...vehicle,
      formattedPlate: formatLicensePlate(vehicle.licensePlate),
      owners: ownersMap.get(vehicle.id) ?? [],
      latestMileageKm: stats?.maxKm ?? null,
      lastServiceDate: stats?.lastDate ?? null,
      jobsCount: stats?.count ?? 0,
    }
  })

  const rawQuery = query?.trim() ?? ""
  if (!rawQuery) return enriched

  const lowerQuery = rawQuery.toLowerCase()
  const normalizedQueryPlate = normalizeLicensePlate(rawQuery)

  return enriched.filter((item) => {
    if (
      normalizedQueryPlate &&
      item.licensePlate.includes(normalizedQueryPlate)
    ) {
      return true
    }
    if (
      item.make.toLowerCase().includes(lowerQuery) ||
      item.model.toLowerCase().includes(lowerQuery) ||
      String(item.year).includes(lowerQuery)
    ) {
      return true
    }
    return item.owners.some((owner) =>
      owner.fullName.toLowerCase().includes(lowerQuery)
    )
  })
}

export async function getVehicleDetail(
  id: string
): Promise<VehicleDetail | null> {
  if (!UUID_REGEX.test(id)) return null

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, id))
    .limit(1)

  if (!vehicle) return null

  const [ownersMap, vehicleJobs] = await Promise.all([
    getOwnersByVehicleIds([vehicle.id]),
    db
      .select({
        id: jobs.id,
        vehicleId: jobs.vehicleId,
        performedAt: jobs.performedAt,
        mileageKm: jobs.mileageKm,
        title: jobs.title,
        description: jobs.description,
        internalNotes: jobs.internalNotes,
        repeatEveryKm: jobs.repeatEveryKm,
        nextDueKm: jobs.nextDueKm,
        repeatEveryMonths: jobs.repeatEveryMonths,
        nextDueDate: jobs.nextDueDate,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(eq(jobs.vehicleId, vehicle.id))
      .orderBy(desc(jobs.performedAt), desc(jobs.createdAt)),
  ])

  const latestMileageKm =
    vehicleJobs.length > 0
      ? vehicleJobs.reduce(
          (max, item) => (item.mileageKm > max ? item.mileageKm : max),
          0
        )
      : null

  return {
    id: vehicle.id,
    licensePlate: vehicle.licensePlate,
    formattedPlate: formatLicensePlate(vehicle.licensePlate),
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    engine: vehicle.engine,
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission,
    color: vehicle.color,
    vin: vehicle.vin,
    internalNotes: vehicle.internalNotes,
    owners: ownersMap.get(vehicle.id) ?? [],
    latestMileageKm,
    jobs: vehicleJobs,
  }
}

export async function getJobById(
  vehicleId: string,
  jobId: string
): Promise<PanelJobItem | null> {
  if (!UUID_REGEX.test(vehicleId) || !UUID_REGEX.test(jobId)) return null

  const [job] = await db
    .select({
      id: jobs.id,
      vehicleId: jobs.vehicleId,
      performedAt: jobs.performedAt,
      mileageKm: jobs.mileageKm,
      title: jobs.title,
      description: jobs.description,
      internalNotes: jobs.internalNotes,
      repeatEveryKm: jobs.repeatEveryKm,
      nextDueKm: jobs.nextDueKm,
      repeatEveryMonths: jobs.repeatEveryMonths,
      nextDueDate: jobs.nextDueDate,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1)

  if (!job || job.vehicleId !== vehicleId) return null
  return job
}

export async function listPeople(query?: string): Promise<PersonListItem[]> {
  const allPeople = await db
    .select({
      id: people.id,
      fullName: people.fullName,
      phone: people.phone,
      email: people.email,
      notes: people.notes,
    })
    .from(people)
    .orderBy(people.fullName)

  if (allPeople.length === 0) return []

  const countsRows = await db
    .select({
      personId: vehicleOwners.personId,
      count: sql<number>`count(*)::int`,
    })
    .from(vehicleOwners)
    .groupBy(vehicleOwners.personId)

  const countsMap = new Map<string, number>()
  for (const row of countsRows) {
    countsMap.set(row.personId, row.count)
  }

  const enriched: PersonListItem[] = allPeople.map((person) => ({
    ...person,
    vehiclesCount: countsMap.get(person.id) ?? 0,
  }))

  const rawQuery = query?.trim().toLowerCase() ?? ""
  if (!rawQuery) return enriched

  return enriched.filter(
    (person) =>
      person.fullName.toLowerCase().includes(rawQuery) ||
      (person.phone?.toLowerCase().includes(rawQuery) ?? false) ||
      (person.email?.toLowerCase().includes(rawQuery) ?? false)
  )
}

export async function getPersonDetail(
  id: string
): Promise<PersonDetail | null> {
  if (!UUID_REGEX.test(id)) return null

  const [person] = await db
    .select({
      id: people.id,
      fullName: people.fullName,
      phone: people.phone,
      email: people.email,
      notes: people.notes,
    })
    .from(people)
    .where(eq(people.id, id))
    .limit(1)

  if (!person) return null

  const ownedVehicles = await db
    .select({
      id: vehicles.id,
      licensePlate: vehicles.licensePlate,
      make: vehicles.make,
      model: vehicles.model,
      year: vehicles.year,
    })
    .from(vehicleOwners)
    .innerJoin(vehicles, eq(vehicleOwners.vehicleId, vehicles.id))
    .where(eq(vehicleOwners.personId, person.id))
    .orderBy(vehicles.licensePlate)

  return {
    ...person,
    vehicles: ownedVehicles.map((v) => ({
      ...v,
      formattedPlate: formatLicensePlate(v.licensePlate),
    })),
  }
}

export async function listAllPeopleMinimal(): Promise<OwnerSummary[]> {
  return db
    .select({
      id: people.id,
      fullName: people.fullName,
      phone: people.phone,
      email: people.email,
    })
    .from(people)
    .orderBy(people.fullName)
}
