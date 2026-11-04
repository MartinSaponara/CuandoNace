'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarGrid } from '@/components/calendar/calendar-grid'
import { VoteModal } from '@/components/calendar/vote-modal'
import { RankingPanel } from '@/components/calendar/ranking-panel'
import { AdminPanel } from '@/components/calendar/admin-panel'
import { PacifierIcon, CloudIcon, RattleIcon, DuckIcon, BabyFootIcon } from '@/components/calendar/icons'
import { CALENDAR_RANGES, FPP_DATE, type PublicVote } from '@/lib/calendar'

type RankingEntry = { date: string; count: number }
type VotesResponse = {
  votes: PublicVote[]
  ranking: RankingEntry[]
  total: number
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [data, setData] = useState<VotesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminOpen, setAdminOpen] = useState(false)
  const [lastVoteName, setLastVoteName] = useState<string | null>(null)

  // Cargar votos del servidor
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/votes')
      const d: VotesResponse = await res.json()
      setData(d)
    } catch (e) {
      console.error('Error al cargar votos:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Recargar votos cuando se registra uno nuevo (para refrescar ranking)
  const handleVoted = useCallback(
    (name: string, date: string, hour: number, action: 'created' | 'updated') => {
      setLastVoteName(name)
      // Cerrar el modal después de un pequeño delay para que se vea la confirmación
      // (el modal maneja su propio cierre)
      refresh()
    },
    [refresh]
  )

  // Map de fecha → count
  const votesByDate = new Map<string, number>()
  const votedDates = new Set<string>()
  if (data) {
    for (const v of data.votes) {
      votesByDate.set(v.date, (votesByDate.get(v.date) ?? 0) + 1)
      votedDates.add(v.date)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background:
          'linear-gradient(135deg, #F4FAFE 0%, #EAF4FB 50%, #F4FAFE 100%)',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      {/* Ilustraciones decorativas de fondo */}
      <div className="absolute top-4 left-4 w-20 h-20 opacity-30 pointer-events-none" aria-hidden="true">
        <CloudIcon className="w-full h-full" />
      </div>
      <div className="absolute top-4 right-4 w-20 h-20 opacity-30 pointer-events-none" aria-hidden="true">
        <DuckIcon className="w-full h-full" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8 relative">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ fontFamily: 'var(--font-fredoka), "Baloo 2", sans-serif' }}
          >
            <span>🍼</span> Calendario interactivo
          </div>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <PacifierIcon className="hidden sm:block w-12 h-12 flex-shrink-0" />
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight"
              style={{ fontFamily: 'var(--font-fredoka), "Baloo 2", sans-serif' }}
            >
              ¿Cuándo nacerá Santiago?
            </h1>
            <RattleIcon className="hidden sm:block w-14 h-14 flex-shrink-0" />
          </div>
          <p className="text-slate-600 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Elegí el día y la hora en que creés que va a nacer Santiago.
            Cada persona puede hacer una apuesta, identificada por su email.
          </p>
        </header>

        {/* Grid principal: calendario + ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Calendarios */}
          <div className="space-y-6">
            {CALENDAR_RANGES.map((range, idx) => (
              <section
                key={range.start}
                className="bg-white/70 backdrop-blur border-2 border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm"
              >
                <div className="flex items-baseline justify-between mb-3">
                  <h2
                    className="text-lg sm:text-xl font-bold text-slate-800"
                    style={{ fontFamily: 'var(--font-fredoka), "Baloo 2", sans-serif' }}
                  >
                    {range.label}
                  </h2>
                  <span className="text-xs text-slate-500">Hoja {idx + 1} de {CALENDAR_RANGES.length}</span>
                </div>
                <CalendarGrid
                  startDate={range.start}
                  endDate={range.end}
                  votesByDate={votesByDate}
                  votedDates={votedDates}
                  onDayClick={(d) => setSelectedDate(d)}
                />
              </section>
            ))}

            {/* Instrucciones */}
            <div className="bg-white border-2 border-sky-200 rounded-xl p-4 flex items-start gap-3">
              <BabyFootIcon className="w-10 h-10 flex-shrink-0" />
              <div className="text-sm text-slate-700">
                <strong style={{ fontFamily: 'var(--font-fredoka), "Baloo 2", sans-serif' }} className="text-emerald-600">
                  Cómo jugar:
                </strong>{' '}
                Tocá un día del calendario, dejá tu nombre y email, y elegí la hora.
                Si ya habías votado, te vamos a preguntar si querés cambiar tu apuesta.
                El día con la estrella ⭐ es la fecha probable de parto indicada por el médico (16 dic).
              </div>
            </div>
          </div>

          {/* Sidebar: ranking */}
          <aside className="lg:sticky lg:top-4 self-start">
            {loading ? (
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 text-center text-slate-400">
                Cargando apuestas...
              </div>
            ) : (
              <RankingPanel
                ranking={data?.ranking ?? []}
                totalVotes={data?.total ?? 0}
              />
            )}

            {/* Botón admin (sutil) */}
            <button
              onClick={() => setAdminOpen(true)}
              className="mt-4 w-full text-xs text-slate-400 hover:text-slate-600 py-2 transition-colors"
              aria-label="Acceder al panel de los papás"
            >
              🔒 Panel de los papás
            </button>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-400">
          <div className="mb-2 opacity-60">
            Hecho con 💛 para esperar a Santiago · 2026
          </div>
        </footer>
      </div>

      {/* Modal de voto */}
      <VoteModal
        selectedDate={selectedDate}
        onClose={() => setSelectedDate(null)}
        onVoted={handleVoted}
      />

      {/* Modal admin */}
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </main>
  )
}
