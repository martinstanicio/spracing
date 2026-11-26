"use client"

import { IconPrinter } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export function PrintHistoryButton() {
  return (
    <div className="print:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => window.print()}
      >
        <IconPrinter data-icon="inline-start" />
        Imprimir / Guardar PDF
      </Button>
    </div>
  )
}
