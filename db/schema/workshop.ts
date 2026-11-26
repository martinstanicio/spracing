import { relations } from "drizzle-orm"
import {
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { user } from "./auth"

export const people = pgTable(
  "people",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    phone: text("phone"),
    email: text("email"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("people_full_name_idx").on(table.fullName)]
)

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  licensePlate: text("license_plate").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  engine: text("engine"),
  fuelType: text("fuel_type"),
  transmission: text("transmission"),
  color: text("color"),
  vin: text("vin"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const vehicleOwners = pgTable(
  "vehicle_owners",
  {
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.vehicleId, table.personId] }),
    index("vehicle_owners_person_id_idx").on(table.personId),
  ]
)

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    performedAt: date("performed_at", { mode: "string" }).notNull(),
    mileageKm: integer("mileage_km").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    internalNotes: text("internal_notes"),
    repeatEveryKm: integer("repeat_every_km"),
    nextDueKm: integer("next_due_km"),
    repeatEveryMonths: integer("repeat_every_months"),
    nextDueDate: date("next_due_date", { mode: "string" }),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("jobs_vehicle_performed_idx").on(
      table.vehicleId,
      table.performedAt,
      table.createdAt
    ),
    index("jobs_next_due_date_idx").on(table.nextDueDate),
  ]
)

export const peopleRelations = relations(people, ({ many }) => ({
  vehicleOwners: many(vehicleOwners),
}))

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  owners: many(vehicleOwners),
  jobs: many(jobs),
}))

export const vehicleOwnersRelations = relations(vehicleOwners, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleOwners.vehicleId],
    references: [vehicles.id],
  }),
  person: one(people, {
    fields: [vehicleOwners.personId],
    references: [people.id],
  }),
}))

export const jobsRelations = relations(jobs, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [jobs.vehicleId],
    references: [vehicles.id],
  }),
  createdBy: one(user, {
    fields: [jobs.createdByUserId],
    references: [user.id],
  }),
}))
