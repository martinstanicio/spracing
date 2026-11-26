# SP Racing — Taller Mecánico

Aplicación web para gestión de taller mecánico e historial trazable de mantenimiento vehicular por patente.

## Funcionalidades

- **Landing pública (`/`)**: presentación de SP Racing, servicios, ubicación, horarios, contacto y acceso directo a la consulta por patente.
- **Consulta pública por patente (`/historial` y `/historial/[patente]`)**: cualquier cliente puede consultar el historial de trabajos realizados, el kilometraje registrado y los próximos mantenimientos recomendados sin iniciar sesión, con opción de imprimir / guardar PDF. Nunca expone datos de dueños ni notas internas.
- **Panel privado del mecánico (`/login` y `/panel/**`)**:
  - Autenticación con Better Auth (email y contraseña, sin registro público).
  - Gestión de **vehículos** (datos técnicos, notas internas y 0..N dueños asociados).
  - Gestión de **personas / dueños** (directorio interno N:M con vehículos).
  - Registro de **trabajos realizados** (`jobs`) con carga individual o múltiple, kilometraje y programación opcional de próximo mantenimiento por km y/o meses.

## Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Base de datos**: Neon (PostgreSQL serverless)
- **ORM**: Drizzle ORM (`drizzle-orm/neon-serverless`)
- **Autenticación**: Better Auth
- **UI**: Tailwind CSS v4 + shadcn/ui (`base-vega` / `@base-ui/react`)

## Configuración inicial

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env.local` y completar las variables de entorno:

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL`: URL de conexión pooled de tu base de datos en [Neon](https://neon.tech).
   - `BETTER_AUTH_SECRET`: clave secreta aleatoria de al menos 32 bytes (podés generarla con `openssl rand -base64 32`).
   - `BETTER_AUTH_URL`: URL base de la app (ej. `http://localhost:3000`).

3. Aplicar las migraciones SQL en Neon:

   ```bash
   npm run db:migrate
   ```

4. Crear el primer usuario mecánico (el registro público está deshabilitado):

   ```bash
   MECHANIC_NAME="Mecánico Principal" MECHANIC_EMAIL="mecanico@spracing.com" MECHANIC_PASSWORD="tu-clave-segura" npm run db:seed:mechanic
   ```

5. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Datos del taller

Los textos, dirección, horarios, teléfonos y servicios mostrados en la landing y en el pie de impresión están centralizados en `lib/workshop-config.ts`.

## Scripts útiles

- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción
- `npm run typecheck` — Chequeo de tipos TypeScript
- `npm run lint` — ESLint + `@shadcn/lint`
- `npm run format` — Prettier
- `npm run test` — Tests unitarios de lógica de dominio
- `npm run db:generate` — Generar migraciones Drizzle
- `npm run db:migrate` — Aplicar migraciones en la DB
- `npm run db:studio` — Abrir Drizzle Studio
- `npm run db:seed:mechanic` — Crear un usuario mecánico
