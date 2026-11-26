import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { EditJobForm } from "@/components/panel/edit-job-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getJobById, getVehicleDetail } from "@/lib/queries/panel"

export const metadata: Metadata = {
  title: "Editar trabajo",
}

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string; jobId: string }>
}) {
  const { id, jobId } = await params
  const [vehicle, job] = await Promise.all([
    getVehicleDetail(id),
    getJobById(id, jobId),
  ])

  if (!vehicle || !job) {
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
            <BreadcrumbPage>Editar trabajo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EditJobForm
        vehicleId={vehicle.id}
        formattedPlate={vehicle.formattedPlate}
        vehicleLabel={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
        job={job}
      />
    </div>
  )
}
