"use client"

import { IconTrash } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { deletePersonAction } from "@/app/panel/personas/actions"
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

export function DeletePersonButton({
  personId,
  fullName,
  redirectToList = false,
}: {
  personId: string
  fullName: string
  redirectToList?: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  async function handleDelete() {
    setPending(true)
    const result = await deletePersonAction(personId)
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
      title: "Persona eliminada",
      description: `${fullName} fue eliminada. Los vehículos asociados permanecen intactos.`,
      type: "success",
    })

    if (redirectToList) {
      router.push("/panel/personas")
    }
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
          <AlertDialogTitle>¿Eliminar a {fullName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Se quitará a esta persona como dueña de sus vehículos asociados,
            pero los vehículos y su historial de trabajos no se borrarán.
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
            {pending ? "Eliminando..." : "Eliminar persona"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
