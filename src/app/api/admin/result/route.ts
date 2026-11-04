import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { toPublicVote } from '@/lib/calendar'

/**
 * GET /api/admin/result
 * Calcula el ganador (quién estuvo más cerca de la fecha real de nacimiento).
 * Requiere que los papás hayan marcado la fecha real primero.
 *
 * La distancia se calcula en horas: |voto - realidad| en horas.
 * El voto con menor distancia gana.
 */
export async function GET(req: Request) {
  const setting = await db.setting.findUnique({ where: { id: 'global' } })
  if (!setting || !setting.actualDate || setting.actualHour === null) {
    return NextResponse.json({
      winner: null,
      message: 'Los papás aún no marcaron la fecha real de nacimiento.',
    })
  }

  // Auth: el resultado completo solo lo ven los papás autenticados.
  // Pero el nombre del ganador podría ser público. Por ahora exigimos auth.
  const auth = req.headers.get('authorization')
  let isAdmin = false
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = Buffer.from(auth.slice('Bearer '.length), 'base64').toString('utf-8')
      const [pwd] = decoded.split(':')
      isAdmin = pwd === setting.adminPassword
    } catch {}
  }

  const actualDateStr = setting.actualDate
  const actualHour = setting.actualHour as number

  // Convertir fecha real a un timestamp comparable
  const actualTs = new Date(`${actualDateStr}T00:00:00Z`).getTime() + actualHour * 3600_000

  const votes = await db.vote.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Calcular distancia en horas para cada voto
  const scored = votes.map((v) => {
    const voteTs = new Date(`${v.date}T00:00:00Z`).getTime() + v.hour * 3600_000
    const distanceHours = Math.abs(voteTs - actualTs) / 3600_000
    return {
      vote: toPublicVote(v),
      distanceHours,
      ...(isAdmin ? { email: v.email } : {}),
    }
  })

  scored.sort((a, b) => a.distanceHours - b.distanceHours)

  return NextResponse.json({
    winner: scored.length > 0 ? scored[0] : null,
    ranking: scored,
    actualDate: actualDateStr,
    actualHour,
    totalVoters: votes.length,
  })
}
