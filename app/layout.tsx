import "./globals.css"

import { cn } from "cn"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "SP Racing — Taller Mecánico",
    template: "%s | SP Racing",
  },
  description:
    "Taller mecánico integral. Consultá el historial de mantenimiento de tu vehículo por patente y conocé nuestros servicios.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable)}
    >
      <body>
        <ThemeProvider>
          <Toaster>{children}</Toaster>
        </ThemeProvider>
      </body>
    </html>
  )
}
