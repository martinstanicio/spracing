const PLATE_CLEAN_PATTERN = /[\s.-]+/g
const PLATE_VALID_PATTERN = /^[A-Z0-9]{3,10}$/
const OLD_AR_PLATE_PATTERN = /^([A-Z]{3})(\d{3})$/
const MERCOSUR_AR_PLATE_PATTERN = /^([A-Z]{2})(\d{3})([A-Z]{2})$/

export function normalizeLicensePlate(raw: string): string {
  return raw.trim().toUpperCase().replace(PLATE_CLEAN_PATTERN, "")
}

export function isValidLicensePlate(raw: string): boolean {
  const normalized = normalizeLicensePlate(raw)
  return PLATE_VALID_PATTERN.test(normalized)
}

export function formatLicensePlate(raw: string): string {
  const normalized = normalizeLicensePlate(raw)

  const mercosurMatch = normalized.match(MERCOSUR_AR_PLATE_PATTERN)
  if (mercosurMatch) {
    return `${mercosurMatch[1]} ${mercosurMatch[2]} ${mercosurMatch[3]}`
  }

  const oldMatch = normalized.match(OLD_AR_PLATE_PATTERN)
  if (oldMatch) {
    return `${oldMatch[1]} ${oldMatch[2]}`
  }

  return normalized
}
