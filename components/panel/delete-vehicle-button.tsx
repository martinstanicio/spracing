"use client"

import { IconTrash } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { deleteVehicleAction } from "@/app/panel/vehiculos/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

export function DeleteVehicleButton({
  vehicleId,
  formattedPlate,
}: {
  vehicleId: string
  formattedPlate: string
}) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  async function handleDelete() {
    setPending(true)
    const result = await deleteVehicleAction(vehicleId)
    setPending(false)

    if (!result.ok) {
      toast.add({
        title: "No se pudo eliminar",
        description: result.error,
        type: "error",
      })
      return
    }

    toast.add({
      title: "Vehículo eliminado",
      description: `Se eliminó la ficha de ${formattedPlate} y sus trabajos.`,
      type: "success",
    })
    router.push("/panel/vehiculos")
    router.refresh()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <IconTrash data-icon="inline-start" />
            Eliminar
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar el vehículo {formattedPlate}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción elimina permanentemente el vehículo y todo su historial
            de trabajos realizados. No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={handleDelete}
          >
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Eliminando..." : "Sí, eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
