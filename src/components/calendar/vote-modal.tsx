'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BabyFootIcon, StarIcon } from './icons'

type ExistingVote = {
  id: string
  name: string
  date: string
  hour: number
  createdAt: string
}

type SubmitResult =
  | { ok: true; vote: { name: string; date: string; hour: number }; action: 'created' | 'updated' }
  | { ok: false; error: string; existingVote?: ExistingVote; needConfirm?: boolean }

type Props = {
  /** Fecha seleccionada (YYYY-MM-DD), null si el modal está cerrado */
  selectedDate: string | null
  /** Datos del usuario precargados (si ya votó antes) */
  existingVote?: ExistingVote | null
  /** Callback al cerrar el modal */
  onClose: () => void
  /** Callback cuando el voto se registró exitosamente */
  onVoted: (name: string, date: string, hour: number, action: 'created' | 'updated') => void
}

function formatDateLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`
}

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00 hs`
}

export function VoteModal({ selectedDate, existingVote, onClose, onVoted }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [hour, setHour] = useState<number>(12)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needConfirm, setNeedConfirm] = useState<ExistingVote | null>(null)
  const [success, setSuccess] = useState<null | { name: string; date: string; hour: number; action: 'created' | 'updated' }>(null)

  // Precargar datos si el usuario ya votó (modo "cambiar voto")
  useEffect(() => {
    if (existingVote) {
      setName(existingVote.name)
      // No precargamos email para no filtrar info de quién votó
      setHour(existingVote.hour)
    }
  }, [existingVote])

  // Reset al cambiar la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      setError(null)
      setNeedConfirm(null)
      setSuccess(null)
      if (!existingVote) {
        setHour(12)
      }
    }
  }, [selectedDate, existingVote])

  if (!selectedDate) return null

  const dateLong = formatDateLong(selectedDate)
  const isFpp = selectedDate === '2026-12-16'

  async function handleSubmit(confirmChange = false) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, date: selectedDate, hour, confirmChange }),
      })
      const data: SubmitResult = await res.json()
      if (data.ok) {
        setSuccess({
          name: data.vote.name,
          date: data.vote.date,
          hour: data.vote.hour,
          action: data.action,
        })
        onVoted(data.vote.name, data.vote.date, data.vote.hour, data.action)
      } else if (data.needConfirm && data.existingVote) {
        setNeedConfirm(data.existingVote)
      } else {
        setError(data.error ?? 'Error desconocido')
      }
    } catch (e) {
      setError('No se pudo conectar con el servidor. Probá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setName('')
    setEmail('')
    setHour(12)
    setError(null)
    setNeedConfirm(null)
    setSuccess(null)
    onClose()
  }

  return (
    <Dialog open={!!selectedDate} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          // Pantalla de éxito
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <BabyFootIcon className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}>
                ¡Apuesta registrada!
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {success.action === 'created' ? 'Gracias por sumarte' : 'Cambiaste tu apuesta'}
              </p>
            </div>
            <div className="bg-sky-50 border-2 border-sky-100 rounded-xl px-4 py-3 w-full">
              <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Tu apuesta</div>
              <div className="text-lg font-bold text-slate-800 mt-0.5" style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}>
                {formatDateLong(success.date)}
              </div>
              <div className="text-sm text-sky-600 font-medium">{formatHour(success.hour)}</div>
            </div>
            <Button onClick={handleClose} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
              ¡Listo!
            </Button>
          </div>
        ) : needConfirm ? (
          // Pantalla de confirmación de cambio de voto
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
              🤔
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }}>
                Ya tenés una apuesta registrada
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Habías votado el <strong>{formatDateLong(needConfirm.date)}</strong> a las <strong>{formatHour(needConfirm.hour)}</strong>
              </p>
              <p className="text-sm text-slate-600 mt-2">
                ¿La cambiás por <strong>{formatDateLong(selectedDate)}</strong> a las <strong>{formatHour(hour)}</strong>?
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={loading}
              >
                No, mantener
              </Button>
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Sí, cambiar'}
              </Button>
            </div>
          </div>
        ) : (
          // Pantalla principal del formulario
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                {isFpp && <StarIcon className="w-6 h-6 flex-shrink-0" />}
                <div>
                  <DialogTitle style={{ fontFamily: 'Fredoka, "Baloo 2", sans-serif' }} className="text-xl">
                    ¿Elegir este día?
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    {isFpp && <span className="block text-xs text-emerald-600 font-medium mb-0.5">📅 Fecha probable de parto del médico</span>}
                    {dateLong}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="vote-name" className="text-sm font-medium">
                  Tu nombre
                </Label>
                <Input
                  id="vote-name"
                  type="text"
                  placeholder="Ej: María González"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vote-email" className="text-sm font-medium">
                  Tu email
                </Label>
                <Input
                  id="vote-email"
                  type="email"
                  placeholder="maria@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-slate-500">
                  🔒 Tu email identifica tu apuesta. Solo vos podés cambiarla.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vote-hour" className="text-sm font-medium">
                  ¿A qué hora creés que nacerá?
                </Label>
                <Select value={String(hour)} onValueChange={(v) => setHour(Number(v))} disabled={loading}>
                  <SelectTrigger id="vote-hour" className="w-full">
                    <SelectValue placeholder="Elegí una hora" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {Array.from({ length: 24 }, (_, h) => (
                      <SelectItem key={h} value={String(h)}>
                        {String(h).padStart(2, '0')}:00 hs
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={loading || !name.trim() || !email.trim()}
                className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {loading ? 'Enviando...' : 'Confirmar apuesta'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
