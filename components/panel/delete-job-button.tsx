"use client"

import { IconTrash } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { deleteJobAction } from "@/app/panel/vehiculos/[id]/trabajos/actions"
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

export function DeleteJobButton({
  vehicleId,
  jobId,
  jobTitle,
}: {
  vehicleId: string
  jobId: string
  jobTitle: string
}) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  async function handleDelete() {
    setPending(true)
    const result = await deleteJobAction(vehicleId, jobId)
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
      title: "Trabajo eliminado",
      description: `"${jobTitle}" fue eliminado del historial.`,
      type: "success",
    })
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
          <AlertDialogTitle>¿Eliminar este trabajo?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará &quot;{jobTitle}&quot; del historial público e interno
            del vehículo.
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
            {pending ? "Eliminando..." : "Eliminar trabajo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
