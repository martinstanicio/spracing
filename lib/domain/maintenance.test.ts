import assert from "node:assert/strict"
import test from "node:test"

import {
  computeNextDueDate,
  computeNextDueKm,
  evaluateReminderStatus,
  formatIsoDateEs,
} from "./maintenance"

test("computeNextDueKm suma kilómetros cuando hay intervalo válido", () => {
  assert.equal(computeNextDueKm(80_000, 10_000), 90_000)
  assert.equal(computeNextDueKm(80_000, null), null)
  assert.equal(computeNextDueKm(80_000, 0), null)
})

test("computeNextDueDate respeta fin de mes y años bisiestos sin desfase de timezone", () => {
  assert.equal(computeNextDueDate("2026-01-31", 1), "2026-02-28")
  assert.equal(computeNextDueDate("2024-01-31", 1), "2024-02-29")
  assert.equal(computeNextDueDate("2026-05-15", 12), "2027-05-15")
  assert.equal(computeNextDueDate("2026-05-15", null), null)
})

test("formatIsoDateEs formatea DD/MM/AAAA", () => {
  assert.equal(formatIsoDateEs("2026-11-25"), "25/11/2026")
})

test("evaluateReminderStatus detecta vencido, próximo y al día", () => {
  const overdueByDate = evaluateReminderStatus({
    nextDueKm: 100_000,
    nextDueDate: "2026-11-20",
    latestMileageKm: 92_000,
    todayIso: "2026-11-25",
  })
  assert.equal(overdueByDate.status, "overdue")

  const overdueByKm = evaluateReminderStatus({
    nextDueKm: 90_000,
    nextDueDate: "2027-05-01",
    latestMileageKm: 90_500,
    todayIso: "2026-11-25",
  })
  assert.equal(overdueByKm.status, "overdue")

  const upcomingByKm = evaluateReminderStatus({
    nextDueKm: 90_000,
    nextDueDate: "2027-05-01",
    latestMileageKm: 89_300,
    todayIso: "2026-11-25",
  })
  assert.equal(upcomingByKm.status, "upcoming")

  const ok = evaluateReminderStatus({
    nextDueKm: 100_000,
    nextDueDate: "2027-05-01",
    latestMileageKm: 92_000,
    todayIso: "2026-11-25",
  })
  assert.equal(ok.status, "ok")
})
