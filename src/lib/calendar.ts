// Constantes del calendario de Santiago.
// Compartidas entre cliente y servidor.

export const CALENDAR_RANGES = [
  {
    label: '16 nov – 6 dic',
    start: '2026-11-16',
    end: '2026-12-06',
  },
  {
    label: '7–26 dic',
    start: '2026-12-07',
    end: '2026-12-26',
  },
] as const

// Fecha probable de parto indicada por el médico
export const FPP_DATE = '2026-12-16'

// Rango válido total para votos
export const MIN_DATE = '2026-11-16'
export const MAX_DATE = '2026-12-26'

export type PublicVote = {
  id: string
  name: string
  date: string
  hour: number
  createdAt: string
}

export type VoteInput = {
  name: string
  email: string
  date: string
  hour: number
}

export type VoteResult =
  | { ok: true; vote: PublicVote; action: 'created' | 'updated' }
  | { ok: false; error: string }

/**
 * Normaliza un email: lowercase + trim.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Valida que una fecha (YYYY-MM-DD) esté dentro del rango permitido.
 */
export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  return date >= MIN_DATE && date <= MAX_DATE
}

/**
 * Valida que la hora sea un entero entre 0 y 23.
 */
export function isValidHour(hour: number): boolean {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23
}

/**
 * Convierte un voto de DB a voto público (sin email).
 */
export function toPublicVote(v: {
  id: string
  name: string
  date: string
  hour: number
  createdAt: Date
}): PublicVote {
  return {
    id: v.id,
    name: v.name,
    date: v.date,
    hour: v.hour,
    createdAt: v.createdAt.toISOString(),
  }
}
