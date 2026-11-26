import { config as loadEnv } from "dotenv"
import { eq } from "drizzle-orm"

import { assertDatabaseConfigured, db } from "../db"
import { user } from "../db/schema"
import { auth } from "../lib/auth"

loadEnv({ path: ".env.local" })
loadEnv({ path: ".env" })

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith("--")) continue
    const key = token.slice(2)
    const value = argv[i + 1]
    if (value && !value.startsWith("--")) {
      args[key] = value
      i += 1
    }
  }
  return args
}

async function main() {
  assertDatabaseConfigured()

  const cliArgs = parseArgs(process.argv.slice(2))
  const name = (cliArgs.name ?? process.env.MECHANIC_NAME ?? "").trim()
  const email = (cliArgs.email ?? process.env.MECHANIC_EMAIL ?? "")
    .trim()
    .toLowerCase()
  const password = cliArgs.password ?? process.env.MECHANIC_PASSWORD ?? ""

  if (!name || !email || !password) {
    console.error(
      "Uso: MECHANIC_NAME='...' MECHANIC_EMAIL='...' MECHANIC_PASSWORD='...' npm run db:seed:mechanic"
    )
    process.exit(1)
  }

  if (password.length < 8) {
    console.error("La contraseña debe tener al menos 8 caracteres.")
    process.exit(1)
  }

  const existing = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  if (existing.length > 0) {
    console.log(`El mecánico ${email} ya existe (id: ${existing[0].id}).`)
    process.exit(0)
  }

  const result = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  })

  console.log(`Mecánico creado correctamente: ${result.user.email}`)
  process.exit(0)
}

main().catch((error) => {
  console.error("Error al crear el mecánico:", error)
  process.exit(1)
})
