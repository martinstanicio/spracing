import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { VehicleForm } from "@/components/panel/vehicle-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getVehicleDetail, listAllPeopleMinimal } from "@/lib/queries/panel"

export const metadata: Metadata = {
  title: "Editar vehículo",
}

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [vehicle, allPeople] = await Promise.all([
    getVehicleDetail(id),
    listAllPeopleMinimal(),
  ])

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
            <BreadcrumbPage>Editar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <VehicleForm
        allPeople={allPeople}
        initialVehicle={{
          id: vehicle.id,
          licensePlate: vehicle.licensePlate,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          engine: vehicle.engine,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          color: vehicle.color,
          vin: vehicle.vin,
          internalNotes: vehicle.internalNotes,
          ownerIds: vehicle.owners.map((o) => o.id),
        }}
      />
    </div>
  )
}
