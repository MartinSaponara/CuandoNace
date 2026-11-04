'use client'

import { useMemo } from 'react'
import { StarIcon } from './icons'
import { FPP_DATE } from '@/lib/calendar'

type Props = {
  /** ISO date string (YYYY-MM-DD) */
  startDate: string
  endDate: string
  /** Map de fecha → cantidad de votos (para mostrar badge) */
  votesByDate?: Map<string, number>
  /** Conjunto de fechas ya votadas por alguien (para mostrar ilustración) */
  votedDates?: Set<string>
  /** Callback al hacer click en una celda */
  onDayClick: (date: string) => void
}

const DOW_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function parseISO(s: string): Date {
  // Usar constructor UTC para evitar offset de zona
  return new Date(`${s}T00:00:00Z`)
}

function formatISO(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDisplay(s: string): { day: number; month: string } {
  const d = parseISO(s)
  const day = d.getUTCDate()
  // getUTCMonth() es 0-indexed: enero=0, ..., noviembre=10, diciembre=11
  const monthNames: Record<number, string> = {
    10: 'nov',
    11: 'dic',
  }
  return { day, month: monthNames[d.getUTCMonth()] ?? '' }
}

export function CalendarGrid({
  startDate,
  endDate,
  votesByDate,
  votedDates,
  onDayClick,
}: Props) {
  // Construir las semanas (filas de 7 celdas)
  const weeks = useMemo(() => {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    if (start.getUTCDay() !== 1) {
      console.warn('CalendarGrid: startDate no es lunes', startDate)
    }

    const rows: (string | null)[][] = []
    let cur = new Date(start)
    while (cur <= end) {
      const row: (string | null)[] = []
      for (let dow = 0; dow < 7; dow++) {
        const curDow = cur.getUTCDay() === 0 ? 6 : cur.getUTCDay() - 1 // Lun=0 ... Dom=6
        if (curDow !== dow || cur > end) {
          row.push(null)
        } else {
          row.push(formatISO(cur))
          cur = new Date(cur.getTime() + 24 * 3600_000)
        }
      }
      rows.push(row)
    }
    return rows
  }, [startDate, endDate])

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="grid">
      {/* Encabezado de días de la semana */}
      {DOW_ES.map((d, i) => (
        <div
          key={d}
          className={`text-center font-semibold text-sm py-1 ${i >= 5 ? 'text-sky-600' : 'text-slate-500/70'}`}
          style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}
        >
          {d}
        </div>
      ))}

      {/* Celdas de días */}
      {weeks.flat().map((dateStr, idx) => {
        if (dateStr === null) {
          return <div key={`empty-${idx}`} className="aspect-[3/4] sm:aspect-[3/4]" />
        }

        const { day, month } = formatDisplay(dateStr)
        const isWeekend = idx % 7 >= 5
        const isFpp = dateStr === FPP_DATE
        const voteCount = votesByDate?.get(dateStr) ?? 0
        const isVoted = votedDates?.has(dateStr) ?? false

        return (
          <button
            key={dateStr}
            type="button"
            onClick={() => onDayClick(dateStr)}
            aria-label={`Elegir ${day} de ${month}`}
            className={`
              relative aspect-[3/4] p-2 sm:p-3 rounded-lg sm:rounded-xl border-2
              flex flex-col items-start justify-between
              transition-all hover:scale-[1.04] hover:shadow-lg hover:z-10
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
              ${isFpp
                ? 'bg-emerald-400 border-emerald-500 text-white shadow-md'
                : isWeekend
                  ? 'bg-sky-50 border-slate-200 hover:bg-sky-100'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }
            `}
            style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}
          >
            {/* Estrella para el día FPP */}
            {isFpp && (
              <StarIcon className="absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5" />
            )}

            {/* Número del día */}
            <div className={`flex items-baseline gap-1 ${isFpp ? 'pl-5 sm:pl-6' : ''}`}>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold leading-none">
                {day}
              </span>
              <span className="text-[10px] sm:text-xs font-medium opacity-70">
                {month}
              </span>
            </div>

            {/* Badge con cantidad de votos */}
            {voteCount > 0 && (
              <div
                className={`
                  self-end text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full
                  ${isFpp
                    ? 'bg-white/25 text-white'
                    : 'bg-emerald-100 text-emerald-700'
                  }
                `}
                title={`${voteCount} ${voteCount === 1 ? 'persona votó' : 'personas votaron'} este día`}
              >
                {voteCount}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
