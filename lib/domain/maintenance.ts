const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const MS_PER_DAY = 86_400_000
const UPCOMING_DAYS_THRESHOLD = 30
const UPCOMING_KM_THRESHOLD = 1_000

export type ReminderStatus = "overdue" | "upcoming" | "ok"

export interface ReminderEvaluation {
  status: ReminderStatus
  reasons: string[]
}

function parseIsoDateParts(isoDate: string): {
  year: number
  month: number
  day: number
} | null {
  const match = isoDate.match(ISO_DATE_PATTERN)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  const utcDate = new Date(Date.UTC(year, month - 1, day))
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return null
  }

  return { year, month, day }
}

function isoDateToUtcMs(isoDate: string): number | null {
  const parts = parseIsoDateParts(isoDate)
  if (!parts) return null
  return Date.UTC(parts.year, parts.month - 1, parts.day)
}

export function getTodayIsoDate(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatIsoDateEs(isoDate: string): string {
  const parts = parseIsoDateParts(isoDate)
  if (!parts) return isoDate
  const day = String(parts.day).padStart(2, "0")
  const month = String(parts.month).padStart(2, "0")
  return `${day}/${month}/${parts.year}`
}

export function formatKilometers(km: number): string {
  return `${new Intl.NumberFormat("es-AR").format(km)} km`
}

export function computeNextDueKm(
  mileageKm: number,
  repeatEveryKm: number | null | undefined
): number | null {
  if (
    typeof mileageKm !== "number" ||
    !Number.isFinite(mileageKm) ||
    mileageKm < 0
  ) {
    return null
  }
  if (
    typeof repeatEveryKm !== "number" ||
    !Number.isFinite(repeatEveryKm) ||
    repeatEveryKm <= 0
  ) {
    return null
  }
  return Math.round(mileageKm + repeatEveryKm)
}

export function computeNextDueDate(
  performedAtIso: string,
  repeatEveryMonths: number | null | undefined
): string | null {
  const parts = parseIsoDateParts(performedAtIso)
  if (!parts) return null

  if (
    typeof repeatEveryMonths !== "number" ||
    !Number.isInteger(repeatEveryMonths) ||
    repeatEveryMonths <= 0
  ) {
    return null
  }

  const totalMonths = parts.year * 12 + (parts.month - 1) + repeatEveryMonths
  const targetYear = Math.floor(totalMonths / 12)
  const targetMonthIndex = totalMonths % 12
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetYear, targetMonthIndex + 1, 0)
  ).getUTCDate()
  const targetDay = Math.min(parts.day, lastDayOfTargetMonth)

  const monthStr = String(targetMonthIndex + 1).padStart(2, "0")
  const dayStr = String(targetDay).padStart(2, "0")
  return `${targetYear}-${monthStr}-${dayStr}`
}

export function evaluateReminderStatus(params: {
  nextDueKm: number | null | undefined
  nextDueDate: string | null | undefined
  latestMileageKm: number | null | undefined
  todayIso?: string
}): ReminderEvaluation {
  const todayIso = params.todayIso ?? getTodayIsoDate()
  const todayMs = isoDateToUtcMs(todayIso)
  const dueDateMs = params.nextDueDate
    ? isoDateToUtcMs(params.nextDueDate)
    : null

  const reasons: string[] = []
  let isOverdue = false
  let isUpcoming = false

  if (
    typeof params.nextDueKm === "number" &&
    typeof params.latestMileageKm === "number"
  ) {
    const remainingKm = params.nextDueKm - params.latestMileageKm
    if (remainingKm <= 0) {
      isOverdue = true
      reasons.push(
        remainingKm === 0
          ? "Alcanzó el kilometraje límite"
          : `Pasado por ${formatKilometers(Math.abs(remainingKm))}`
      )
    } else if (remainingKm <= UPCOMING_KM_THRESHOLD) {
      isUpcoming = true
      reasons.push(`Faltan ${formatKilometers(remainingKm)}`)
    }
  }

  if (todayMs !== null && dueDateMs !== null) {
    const diffDays = Math.round((dueDateMs - todayMs) / MS_PER_DAY)
    if (diffDays < 0) {
      isOverdue = true
      const absDays = Math.abs(diffDays)
      reasons.push(
        absDays === 1 ? "Vencido hace 1 día" : `Vencido hace ${absDays} días`
      )
    } else if (diffDays === 0) {
      isUpcoming = true
      reasons.push("Vence hoy")
    } else if (diffDays <= UPCOMING_DAYS_THRESHOLD) {
      isUpcoming = true
      reasons.push(diffDays === 1 ? "Vence mañana" : `En ${diffDays} días`)
    }
  }

  if (isOverdue) {
    return { status: "overdue", reasons }
  }

  if (isUpcoming) {
    return { status: "upcoming", reasons }
  }

  return { status: "ok", reasons }
}
