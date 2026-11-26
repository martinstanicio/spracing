import {
  IconBrandWhatsapp,
  IconCalendarStats,
  IconCheck,
  IconClock,
  IconFileCertificate,
  IconGauge,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
} from "@tabler/icons-react"
import Link from "next/link"

import { PlateLookupForm } from "@/components/public/plate-lookup-form"
import { SiteFooter } from "@/components/public/site-footer"
import { SiteHeader } from "@/components/public/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getMechanicSession } from "@/lib/auth-session"
import { WORKSHOP_CONFIG } from "@/lib/workshop-config"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const session = await getMechanicSession()

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader isAuthenticated={Boolean(session?.user)} />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:py-20">
            <div className="flex flex-col gap-6 lg:col-span-7">
              <Badge variant="outline">
                <IconShieldCheck data-icon="inline-start" />
                Mantenimiento trazable por patente
              </Badge>

              <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {WORKSHOP_CONFIG.name}: {WORKSHOP_CONFIG.tagline}
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  {WORKSHOP_CONFIG.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  render={
                    <a
                      href={`https://wa.me/${WORKSHOP_CONFIG.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  nativeButton={false}
                >
                  <IconBrandWhatsapp data-icon="inline-start" />
                  Turnos por WhatsApp
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  render={<Link href="/#servicios" />}
                  nativeButton={false}
                >
                  Ver servicios
                </Button>
              </div>

              <div className="grid gap-3 pt-2 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <IconCheck className="size-4 text-primary" />
                  <span>Registro por kilometraje</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCheck className="size-4 text-primary" />
                  <span>Alertas de próximo service</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCheck className="size-4 text-primary" />
                  <span>Consulta sin registro</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle>Consultá el historial de tu auto</CardTitle>
                  <CardDescription>
                    Ingresá la patente para ver los trabajos realizados, el
                    kilometraje registrado y cuándo corresponde el próximo
                    mantenimiento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <PlateLookupForm />
                    <Separator />
                    <p className="text-xs text-muted-foreground">
                      Acceso público y gratuito. Por privacidad, nunca mostramos
                      datos personales del titular ni notas internas del taller.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section
          id="servicios"
          className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Badge variant="secondary">Especialidades del taller</Badge>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Servicios mecánicos integrales
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                Trabajamos con repuestos de primera línea y dejamos asentado
                cada trabajo realizado en la ficha de tu vehículo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WORKSHOP_CONFIG.services.map((service) => (
                <Card key={service.title}>
                  <CardHeader>
                    <Badge variant="outline">{service.category}</Badge>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios del historial trazable */}
        <section id="historial" className="border-y bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <Badge variant="secondary">Transparencia total</Badge>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  ¿Para qué sirve el historial por patente?
                </h2>
                <p className="max-w-2xl text-muted-foreground">
                  Un libro de mantenimiento digital siempre disponible desde tu
                  celular, sin contraseñas ni trámites.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <IconGauge className="size-6 text-primary" />
                    <CardTitle>Control exacto por km y fecha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Cada trabajo registra el kilometraje real del ingreso y,
                      si aplica, cuándo conviene volver por kilómetros o meses.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <IconCalendarStats className="size-6 text-primary" />
                    <CardTitle>Evitá olvidos y roturas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Consultá en segundos cuándo fue el último cambio de
                      aceite, correa de distribución o revisión de frenos.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <IconFileCertificate className="size-6 text-primary" />
                    <CardTitle>Valor de reventa comprobable</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Al momento de vender tu vehículo, compartí el enlace o
                      imprimí el historial completo para demostrar su cuidado.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Ubicación, horarios y contacto */}
        <section id="contacto" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Badge variant="secondary">Dónde estamos</Badge>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Ubicación, horarios y contacto
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                Coordiná tu turno o acercate al taller para realizar el próximo
                control de tu vehículo.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <IconMapPin className="size-6 text-primary" />
                  <CardTitle>Dirección</CardTitle>
                  <CardDescription>{WORKSHOP_CONFIG.city}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                      {WORKSHOP_CONFIG.address}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <a
                          href={WORKSHOP_CONFIG.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                      nativeButton={false}
                    >
                      Abrir en Google Maps
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <IconClock className="size-6 text-primary" />
                  <CardTitle>Horarios de atención</CardTitle>
                  <CardDescription>Atención con turno previo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {WORKSHOP_CONFIG.hours.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <IconPhone className="size-6 text-primary" />
                  <CardTitle>Contacto directo</CardTitle>
                  <CardDescription>Consultas y presupuestos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconBrandWhatsapp className="size-4 text-primary" />
                      <span>{WORKSHOP_CONFIG.whatsappDisplay}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconPhone className="size-4 text-primary" />
                      <span>{WORKSHOP_CONFIG.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconMail className="size-4 text-primary" />
                      <span>{WORKSHOP_CONFIG.email}</span>
                    </div>
                    <Button
                      size="sm"
                      render={
                        <a
                          href={`https://wa.me/${WORKSHOP_CONFIG.whatsappNumber}`}
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                      nativeButton={false}
                    >
                      <IconBrandWhatsapp data-icon="inline-start" />
                      Escribir por WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
