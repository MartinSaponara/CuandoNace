'use client'

import { StarIcon } from './icons'
import { FPP_DATE } from '@/lib/calendar'

type RankingEntry = {
  date: string
  count: number
}

type Props = {
  ranking: RankingEntry[]
  totalVotes: number
}

function formatShort(iso: string): { day: string; month: string; weekday: string } {
  const d = new Date(`${iso}T00:00:00`)
  const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
  const meses = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: meses[d.getMonth() + 1],
    weekday: dias[d.getDay()],
  }
}

export function RankingPanel({ ranking, totalVotes }: Props) {
  const maxCount = ranking.length > 0 ? ranking[0].count : 1

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-3">
        <h3
          className="text-lg sm:text-xl font-bold text-slate-800"
          style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}
        >
          🔥 Apuestas hasta ahora
        </h3>
        <span className="text-sm text-slate-500">
          {totalVotes} {totalVotes === 1 ? 'persona' : 'personas'}
        </span>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <div className="text-3xl mb-2">🍼</div>
          <p className="text-sm">
            Todavía no hay apuestas.
            <br />
            ¡Sé la primera persona en sumarte!
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {ranking.slice(0, 10).map((entry, i) => {
            const { day, month, weekday } = formatShort(entry.date)
            const isFpp = entry.date === FPP_DATE
            const widthPct = (entry.count / maxCount) * 100

            return (
              <div key={entry.date} className="flex items-center gap-3">
                <div className="w-6 text-center text-xs font-bold text-slate-400">
                  {i + 1}.
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      {isFpp && <StarIcon className="w-3.5 h-3.5" />}
                      <span className="capitalize">{weekday}</span>{' '}
                      <strong>{day}</strong> {month}
                      {isFpp && <span className="text-[10px] text-emerald-600 font-semibold">FPP</span>}
                    </span>
                    <span className="text-xs font-bold text-slate-600 ml-2">
                      {entry.count}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isFpp ? 'bg-emerald-400' : 'bg-sky-300'}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
