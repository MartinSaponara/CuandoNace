'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { StarIcon } from './icons'
import { FPP_DATE, type PublicVote } from '@/lib/calendar'

type Props = {
  /** ISO date string (YYYY-MM-DD) */
  startDate: string
  endDate: string
  /** Map de fecha → lista de votos (con nombres y horas) */
  votesByDate?: Map<string, PublicVote[]>
  /** Callback al hacer click en una celda para votar */
  onDayClick: (date: string) => void
}

const DOW_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function parseISO(s: string): Date {
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
  const monthNames: Record<number, string> = {
    10: 'nov',
    11: 'dic',
  }
  return { day, month: monthNames[d.getUTCMonth()] ?? '' }
}

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`
}

export function CalendarGrid({
  startDate,
  endDate,
  votesByDate,
  onDayClick,
}: Props) {
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
        const curDow = cur.getUTCDay() === 0 ? 6 : cur.getUTCDay() - 1
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

        return (
          <DayCell
            key={dateStr}
            dateStr={dateStr}
            idx={idx}
            votes={votesByDate?.get(dateStr) ?? []}
            onDayClick={onDayClick}
          />
        )
      })}
    </div>
  )
}

type DayCellProps = {
  dateStr: string
  idx: number
  votes: PublicVote[]
  onDayClick: (date: string) => void
}

function DayCell({ dateStr, idx, votes, onDayClick }: DayCellProps) {
  const { day, month } = formatDisplay(dateStr)
  const isWeekend = idx % 7 >= 5
  const isFpp = dateStr === FPP_DATE
  const voteCount = votes.length
  const hasVotes = voteCount > 0

  // Estado para mostrar/ocultar el popover con nombres
  const [showVoters, setShowVoters] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLButtonElement>(null)

  // Cerrar popover al hacer click fuera o al presionar Escape
  useEffect(() => {
    if (!showVoters) return
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        badgeRef.current &&
        !badgeRef.current.contains(e.target as Node)
      ) {
        setShowVoters(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowVoters(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showVoters])

  function handleBadgeClick(e: React.MouseEvent) {
    e.stopPropagation()
    setShowVoters((v) => !v)
  }

  function handleVoteButtonClick() {
    setShowVoters(false)
    onDayClick(dateStr)
  }

  return (
    <div
      className={`
        relative aspect-[3/4] p-2 sm:p-3 rounded-lg sm:rounded-xl border-2
        flex flex-col items-start justify-between
        transition-all hover:scale-[1.04] hover:shadow-lg hover:z-10
        ${isFpp
          ? 'bg-emerald-400 border-emerald-500 text-white shadow-md'
          : isWeekend
            ? 'bg-sky-50 border-slate-200 hover:bg-sky-100'
            : 'bg-white border-slate-200 hover:bg-slate-50'
        }
      `}
      style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}
    >
      {/* Botón transparente que cubre toda la celda para abrir el modal */}
      <button
        type="button"
        onClick={() => onDayClick(dateStr)}
        aria-label={`Votar por el ${day} de ${month}`}
        className="absolute inset-0 w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg sm:rounded-xl"
        tabIndex={hasVotes ? -1 : 0}
      />

      {/* Estrella para el día FPP */}
      {isFpp && (
        <StarIcon className="absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none z-10" />
      )}

      {/* Número del día */}
      <div className={`relative z-10 pointer-events-none flex items-baseline gap-1 ${isFpp ? 'pl-5 sm:pl-6' : ''}`}>
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold leading-none">
          {day}
        </span>
        <span className="text-[10px] sm:text-xs font-medium opacity-70">
          {month}
        </span>
      </div>

      {/* Badge con cantidad de votos — clickable para abrir popover */}
      {hasVotes && (
        <>
          <button
            ref={badgeRef}
            type="button"
            onClick={handleBadgeClick}
            aria-label={`${voteCount} ${voteCount === 1 ? 'persona votó' : 'personas votaron'} este día. Ver nombres.`}
            aria-expanded={showVoters}
            className={`
              relative z-20 self-end text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full
              transition-transform hover:scale-110 cursor-pointer
              ${isFpp
                ? 'bg-white/25 text-white hover:bg-white/40'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }
            `}
          >
            👥 {voteCount}
          </button>

          {/* Popover con los nombres de quienes votaron */}
          {showVoters && (
            <div
              ref={popoverRef}
              role="tooltip"
              className={`
                absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2
                w-48 sm:w-56 p-3 rounded-xl shadow-xl border-2
                bg-white ${isFpp ? 'border-emerald-300' : 'border-sky-200'}
              `}
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {/* Flechita del popover */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white ${isFpp ? 'border-r-2 border-b-2 border-emerald-300' : 'border-r-2 border-b-2 border-sky-200'}`}
                style={{ marginTop: '-6px' }}
              />

              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span>👥 {voteCount} {voteCount === 1 ? 'voto' : 'votos'}</span>
                <button
                  type="button"
                  onClick={() => setShowVoters(false)}
                  className="text-slate-400 hover:text-slate-600 leading-none text-sm"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {votes.map((v) => (
                  <li key={v.id} className="text-xs flex items-baseline justify-between gap-2">
                    <span className="font-medium text-slate-700 truncate">{v.name}</span>
                    <span className="text-slate-400 flex-shrink-0">{formatHour(v.hour)} hs</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={handleVoteButtonClick}
                className="mt-2 w-full text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-md transition-colors"
                style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}
              >
                Votar este día
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
