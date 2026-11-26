import { neonConfig, Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"

import * as schema from "./schema"

neonConfig.webSocketConstructor = ws

const rawDatabaseUrl = process.env.DATABASE_URL?.trim()

export const isDatabaseConfigured = Boolean(rawDatabaseUrl)

const connectionString =
  rawDatabaseUrl ||
  "postgresql://placeholder:placeholder@localhost:5432/spracing"

const globalForDb = globalThis as unknown as {
  neonPool?: Pool
}

const pool =
  globalForDb.neonPool ??
  new Pool({
    connectionString,
  })

if (process.env.NODE_ENV !== "production") {
  globalForDb.neonPool = pool
}

export const db = drizzle(pool, { schema })

export function assertDatabaseConfigured() {
  if (!isDatabaseConfigured) {
    throw new Error(
      "DATABASE_URL no está configurada. Copiá .env.example a .env.local y agregá tu URL de Neon."
    )
  }
}
