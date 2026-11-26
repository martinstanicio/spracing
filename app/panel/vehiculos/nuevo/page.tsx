import type { Metadata } from "next"
import Link from "next/link"

import { VehicleForm } from "@/components/panel/vehicle-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { listAllPeopleMinimal } from "@/lib/queries/panel"

export const metadata: Metadata = {
  title: "Nuevo vehículo",
}

export default async function NewVehiclePage() {
  const allPeople = await listAllPeopleMinimal()

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
            <BreadcrumbPage>Nuevo vehículo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <VehicleForm allPeople={allPeople} />
    </div>
  )
}
