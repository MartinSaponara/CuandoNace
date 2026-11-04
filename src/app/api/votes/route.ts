import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  normalizeEmail,
  toPublicVote,
  isValidDate,
  isValidHour,
  type PublicVote,
  type VoteResult,
} from '@/lib/calendar'

/**
 * GET /api/votes
 * Devuelve la lista pública de votos (sin emails) + ranking de fechas más votadas.
 */
export async function GET() {
  try {
    const votes = await db.vote.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, date: true, hour: true, createdAt: true },
    })

    const publicVotes: PublicVote[] = votes.map(toPublicVote)

    const byDate = new Map<string, number>()
    for (const v of publicVotes) {
      byDate.set(v.date, (byDate.get(v.date) ?? 0) + 1)
    }
    const ranking = Array.from(byDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count || a.date.localeCompare(b.date))

    return NextResponse.json({
      votes: publicVotes,
      ranking,
      total: publicVotes.length,
    })
  } catch (e) {
    console.error('GET /api/votes error:', e)
    return NextResponse.json(
      { error: 'Error al obtener votos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/votes
 * Crea o actualiza el voto de una persona (identificada por email).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, date, hour, confirmChange } = body ?? {}

    if (typeof name !== 'string' || name.trim().length < 2) {
      const r: VoteResult = { ok: false, error: 'El nombre es muy corto (mínimo 2 caracteres)' }
      return NextResponse.json(r, { status: 400 })
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const r: VoteResult = { ok: false, error: 'El email no es válido' }
      return NextResponse.json(r, { status: 400 })
    }
    if (!isValidDate(date)) {
      const r: VoteResult = { ok: false, error: 'La fecha debe estar entre el 16 nov y el 26 dic 2026' }
      return NextResponse.json(r, { status: 400 })
    }
    if (!isValidHour(Number(hour))) {
      const r: VoteResult = { ok: false, error: 'La hora debe estar entre 0 y 23' }
      return NextResponse.json(r, { status: 400 })
    }

    const normalizedEmail = normalizeEmail(email)
    const cleanName = name.trim().slice(0, 60)

    const existing = await db.vote.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (existing.date === date && existing.hour === Number(hour)) {
        const r: VoteResult = {
          ok: true,
          vote: toPublicVote(existing),
          action: 'updated',
        }
        return NextResponse.json(r)
      }

      if (!confirmChange) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Ya registraste una apuesta. ¿Querés cambiarla por esta nueva?',
            existingVote: toPublicVote(existing),
            needConfirm: true,
          },
          { status: 409 }
        )
      }

      const updated = await db.vote.update({
        where: { email: normalizedEmail },
        data: { name: cleanName, date, hour: Number(hour) },
      })
      const r: VoteResult = {
        ok: true,
        vote: toPublicVote(updated),
        action: 'updated',
      }
      return NextResponse.json(r)
    }

    const created = await db.vote.create({
      data: {
        name: cleanName,
        email: normalizedEmail,
        date,
        hour: Number(hour),
      },
    })
    const r: VoteResult = {
      ok: true,
      vote: toPublicVote(created),
      action: 'created',
    }
    return NextResponse.json(r)
  } catch (e) {
    console.error('POST /api/votes error:', e)
    return NextResponse.json(
      { ok: false, error: 'Error al registrar el voto' },
      { status: 500 }
    )
  }
}
