'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { StarIcon } from './icons'
import { FPP_DATE } from '@/lib/calendar'

type AdminVote = {
  id: string
  name: string
  email: string
  date: string
  hour: number
  createdAt: string
  updatedAt: string
}

type AdminData = {
  votes: AdminVote[]
  actualDate: string | null
  actualHour: number | null
  total: number
}

type Winner = {
  vote: { id: string; name: string; date: string; hour: number; createdAt: string }
  distanceHours: number
  email: string
}

type ResultData = {
  winner: Winner | null
  ranking: Array<{ vote: Winner['vote']; distanceHours: number; email?: string }>
  actualDate: string
  actualHour: number
  totalVoters: number
} | {
  winner: null
  message: string
}

function formatDateLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`
}

// Lista de fechas válidas para el nacimiento (16 nov - 26 dic 2026)
const VALID_BIRTH_DATES: string[] = (() => {
  const dates: string[] = []
  const start = new Date('2026-11-16T00:00:00Z')
  const end = new Date('2026-12-26T00:00:00Z')
  const cur = new Date(start)
  while (cur <= end) {
    const y = cur.getUTCFullYear()
    const m = String(cur.getUTCMonth() + 1).padStart(2, '0')
    const d = String(cur.getUTCDate()).padStart(2, '0')
    dates.push(`${y}-${m}-${d}`)
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return dates
})()

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00 hs`
}

function formatDistance(hours: number): string {
  if (hours < 1) return '¡Justo en el momento!'
  if (hours < 24) return `${Math.round(hours)} hora${Math.round(hours) === 1 ? '' : 's'} de diferencia`
  const days = Math.round(hours / 24)
  return `${days} día${days === 1 ? '' : 's'} de diferencia`
}

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  const [data, setData] = useState<AdminData | null>(null)
  const [result, setResult] = useState<ResultData | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [loadingResult, setLoadingResult] = useState(false)

  // Mark Santiago's birth form
  const [birthDate, setBirthDate] = useState('')
  const [birthHour, setBirthHour] = useState<number>(12)
  const [savingBirth, setSavingBirth] = useState(false)
  const [birthError, setBirthError] = useState<string | null>(null)

  async function handleLogin() {
    setLoggingIn(true)
    setLoginError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.ok) {
        setToken(data.token)
      } else {
        setLoginError(data.error ?? 'Error al iniciar sesión')
      }
    } catch {
      setLoginError('No se pudo conectar con el servidor')
    } finally {
      setLoggingIn(false)
    }
  }

  // Cargar datos cuando hay token
  useEffect(() => {
    if (!token) return
    setLoadingData(true)
    fetch('/api/admin/votes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.votes) {
          setData(d)
          if (d.actualDate) {
            setBirthDate(d.actualDate)
          }
          if (d.actualHour !== null && d.actualHour !== undefined) {
            setBirthHour(d.actualHour)
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingData(false))
  }, [token])

  async function handleLoadResult() {
    if (!token) return
    setLoadingResult(true)
    try {
      const res = await fetch('/api/admin/result', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const d: ResultData = await res.json()
      setResult(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingResult(false)
    }
  }

  async function handleSaveBirth(clear = false) {
    if (!token) return
    setSavingBirth(true)
    setBirthError(null)
    try {
      const body = clear
        ? { actualDate: null, actualHour: null }
        : { actualDate: birthDate, actualHour: birthHour }
      const res = await fetch('/api/admin/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (d.ok) {
        // Recargar datos
        const res2 = await fetch('/api/admin/votes', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const d2 = await res2.json()
        if (d2.votes) setData(d2)
        setResult(null)
      } else {
        setBirthError(d.error ?? 'Error al guardar')
      }
    } catch {
      setBirthError('No se pudo conectar con el servidor')
    } finally {
      setSavingBirth(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {!token ? (
          // Login
          <>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }} className="text-xl">
                🔒 Panel de los papás
              </DialogTitle>
              <DialogDescription>
                Ingresá el password para ver todas las apuestas y gestionar el resultado final.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="admin-pwd">Password</Label>
                <Input
                  id="admin-pwd"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  disabled={loggingIn}
                  autoFocus
                  placeholder="Password de los papás"
                />
              </div>
              {loginError && (
                <p className="text-sm text-rose-600">{loginError}</p>
              )}
              <p className="text-xs text-slate-500">
                Password por defecto: <code className="bg-slate-100 px-1 rounded">santiago2026</code> (cambialo en producción)
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose} disabled={loggingIn}>Cancelar</Button>
              <Button onClick={handleLogin} disabled={loggingIn || !password}>
                {loggingIn ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Panel admin
          <>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }} className="text-xl">
                📊 Panel de los papás
              </DialogTitle>
              <DialogDescription>
                {data ? `${data.total} apuestas registradas` : 'Cargando...'}
              </DialogDescription>
            </DialogHeader>

            {loadingData || !data ? (
              <div className="py-8 text-center text-slate-500">Cargando apuestas...</div>
            ) : (
              <div className="space-y-4">
                {/* Sección: Marcar nacimiento */}
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                  <h4 className="font-semibold text-emerald-800 mb-2" style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}>
                    🍼 ¿Santiago ya nació?
                  </h4>
                  <p className="text-xs text-emerald-700 mb-3">
                    Marcá la fecha y hora real. Esto habilita el cálculo del ganador y los muestra a todos.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <Label className="text-xs">Fecha</Label>
                      <select
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-md text-sm bg-white"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        disabled={savingBirth}
                      >
                        <option value="">Elegir fecha</option>
                        {VALID_BIRTH_DATES.map((d) => {
                          const dt = new Date(`${d}T00:00:00`)
                          const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
                          const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
                          return (
                            <option key={d} value={d}>
                              {dias[dt.getDay()]} {dt.getDate()} {meses[dt.getMonth()]}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Hora</Label>
                      <select
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-md text-sm"
                        value={birthHour}
                        onChange={(e) => setBirthHour(Number(e.target.value))}
                        disabled={savingBirth}
                      >
                        {Array.from({ length: 24 }, (_, h) => (
                          <option key={h} value={h}>{String(h).padStart(2, '0')}:00 hs</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {birthError && <p className="text-xs text-rose-600 mb-2">{birthError}</p>}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => handleSaveBirth(false)}
                      disabled={savingBirth || !birthDate}
                    >
                      {savingBirth ? 'Guardando...' : '✓ Marcar nacimiento'}
                    </Button>
                    {(data.actualDate || data.actualHour !== null) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveBirth(true)}
                        disabled={savingBirth}
                      >
                        Borrar
                      </Button>
                    )}
                  </div>
                  {data.actualDate && (
                    <p className="text-xs text-emerald-700 mt-2">
                      ✓ Marcado: <strong>{formatDateLong(data.actualDate)}</strong> a las <strong>{formatHour(data.actualHour!)}</strong>
                    </p>
                  )}
                </div>

                {/* Botón ver resultado */}
                {data.actualDate && (
                  <Button
                    className="w-full bg-amber-400 hover:bg-amber-500 text-slate-800"
                    onClick={handleLoadResult}
                    disabled={loadingResult}
                  >
                    {loadingResult ? 'Calculando...' : '🏆 Ver ranking final y ganador'}
                  </Button>
                )}

                {/* Resultado del cálculo */}
                {result && 'ranking' in result && result.winner && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <StarIcon className="w-6 h-6" />
                      <h4 className="font-bold text-amber-800" style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}>
                        ¡Ganador/a!
                      </h4>
                    </div>
                    <div className="bg-white rounded-lg p-3 mb-2">
                      <div className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}>
                        🎉 {result.winner.vote.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        Apostó: {formatDateLong(result.winner.vote.date)} a las {formatHour(result.winner.vote.hour)}
                      </div>
                      <div className="text-xs text-amber-700 mt-1">
                        {formatDistance(result.winner.distanceHours)} · {result.winner.email}
                      </div>
                    </div>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-slate-600">Ver ranking completo ({result.ranking.length})</summary>
                      <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                        {result.ranking.map((r, i) => (
                          <div key={r.vote.id} className="flex items-center justify-between bg-white/60 px-2 py-1 rounded">
                            <span>{i + 1}. <strong>{r.vote.name}</strong></span>
                            <span className="text-slate-500">{formatDistance(r.distanceHours)}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
                {result && !('ranking' in result) && (
                  <p className="text-sm text-slate-500 text-center py-4">{result.message}</p>
                )}

                {/* Lista de todas las apuestas */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}>
                    Todas las apuestas
                  </h4>
                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                    {data.votes.map((v) => {
                      const isFpp = v.date === FPP_DATE
                      return (
                        <div
                          key={v.id}
                          className="flex items-center justify-between bg-white border border-slate-200 rounded-md px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate flex items-center gap-1">
                              {v.name}
                              {isFpp && <StarIcon className="w-3 h-3 flex-shrink-0" />}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{v.email}</div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="text-xs font-medium text-slate-700">
                              {formatDateLong(v.date).split(' de ')[0]} {v.date.slice(8, 10)}/{v.date.slice(5, 7)}
                            </div>
                            <div className="text-xs text-slate-500">{formatHour(v.hour)}</div>
                          </div>
                        </div>
                      )
                    })}
                    {data.votes.length === 0 && (
                      <p className="text-center text-slate-500 py-4">Todavía no hay apuestas.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setToken(null)}>Cerrar sesión</Button>
              <Button variant="ghost" onClick={onClose}>Cerrar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
