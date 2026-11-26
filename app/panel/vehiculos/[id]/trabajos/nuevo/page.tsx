import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CreateJobsForm } from "@/components/panel/create-jobs-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getVehicleDetail } from "@/lib/queries/panel"

export const metadata: Metadata = {
  title: "Registrar trabajos",
}

export default async function NewJobsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const vehicle = await getVehicleDetail(id)

  if (!vehicle) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/panel" />}>
              Resumen
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/panel/vehiculos" />}>
              Vehículos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link href={`/panel/vehiculos/${vehicle.id}`} />}
            >
              {vehicle.formattedPlate}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Registrar trabajos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CreateJobsForm
        vehicleId={vehicle.id}
        formattedPlate={vehicle.formattedPlate}
        vehicleLabel={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
        latestMileageKm={vehicle.latestMileageKm}
      />
    </div>
  )
}
