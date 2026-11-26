export interface WorkshopServiceItem {
  title: string
  description: string
  category: string
}

export const WORKSHOP_CONFIG = {
  name: "SP Racing",
  tagline: "Mecánica integral y mantenimiento trazable",
  description:
    "Taller mecánico especializado en mantenimiento preventivo, diagnóstico computarizado y mecánica general. Cada trabajo queda registrado para que sepas exactamente cuándo volver y puedas demostrar el cuidado de tu vehículo.",
  address: "Av. Ejemplo 1234 (Reemplazar por dirección real)",
  city: "Buenos Aires, Argentina",
  hours: [
    "Lunes a Viernes: 8:30 a 18:00 hs",
    "Sábados: 9:00 a 13:00 hs",
    "Domingos y feriados: Cerrado",
  ],
  phone: "+54 11 0000-0000",
  whatsappNumber: "5491100000000",
  whatsappDisplay: "+54 9 11 0000-0000",
  email: "contacto@spracing.example.com",
  instagramHandle: "@spracing.taller",
  instagramUrl: "https://instagram.com",
  googleMapsUrl: "https://maps.google.com/?q=Buenos+Aires+Argentina",
  services: [
    {
      category: "Preventivo",
      title: "Service completo de aceite y filtros",
      description:
        "Cambio de lubricante sintético o semisintético, filtro de aceite, aire, combustible y habitáculo con control multipunto.",
    },
    {
      category: "Motor",
      title: "Distribución y correas",
      description:
        "Reemplazo de kit de distribución, bomba de agua, tensores y correas poli-V con registro exacto de próximo cambio.",
    },
    {
      category: "Seguridad",
      title: "Frenos, tren delantero y suspensión",
      description:
        "Pastillas, discos, líquido de frenos, amortiguadores, bujes, parrillas y alineación de componentes críticos.",
    },
    {
      category: "Electrónica",
      title: "Diagnóstico computarizado",
      description:
        "Lectura de fallas por scanner OBD-II, borrado de códigos, chequeo de sensores e inspección de batería y carga.",
    },
    {
      category: "Alimentación",
      title: "Inyección y encendido",
      description:
        "Limpieza de inyectores, cambio de bujías, bobinas y puesta a punto para recuperar respuesta y consumo óptimo.",
    },
    {
      category: "Transmisión",
      title: "Embrague y cajas",
      description:
        "Cambio de kit de embrague, rulemán de empuje, fluidos de caja manual o automática y semiejes.",
    },
  ] satisfies WorkshopServiceItem[],
} as const

export const FUEL_TYPE_OPTIONS = [
  { label: "Seleccionar combustible", value: null },
  { label: "Nafta", value: "Nafta" },
  { label: "Diésel", value: "Diésel" },
  { label: "Nafta / GNC", value: "Nafta / GNC" },
  { label: "Híbrido", value: "Híbrido" },
  { label: "Eléctrico", value: "Eléctrico" },
] as const

export const TRANSMISSION_OPTIONS = [
  { label: "Seleccionar transmisión", value: null },
  { label: "Manual", value: "Manual" },
  { label: "Automática", value: "Automática" },
  { label: "CVT", value: "CVT" },
  { label: "Doble embrague", value: "Doble embrague" },
] as const

export const COMMON_JOB_PRESETS = [
  "Cambio de aceite y filtro",
  "Service completo (aceite y filtros)",
  "Kit de distribución y bomba de agua",
  "Cambio de pastillas y discos de freno",
  "Alineación y balanceo",
  "Diagnóstico computarizado",
  "Cambio de batería",
  "Revisión de tren delantero",
] as const
