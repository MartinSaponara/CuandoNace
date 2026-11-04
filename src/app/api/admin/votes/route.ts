import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Verifica el token de admin. No es seguro production-grade pero suficiente
 * para este caso de uso donde los "datos sensibles" son solo emails.
 */
async function verifyAdminToken(req: Request): Promise<boolean> {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return false
  const token = auth.slice('Bearer '.length)
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [pwd] = decoded.split(':')
    const setting = await db.setting.findUnique({ where: { id: 'global' } })
    if (!setting) return false
    return pwd === setting.adminPassword
  } catch {
    return false
  }
}

/**
 * GET /api/admin/votes
 * Devuelve TODOS los votos (con email incluido) para que los papás vean
 * la lista completa. Requiere auth de admin.
 */
export async function GET(req: Request) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const votes = await db.vote.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const setting = await db.setting.findUnique({ where: { id: 'global' } })

    return NextResponse.json({
      votes: votes.map((v) => ({
        id: v.id,
        name: v.name,
        email: v.email,
        date: v.date,
        hour: v.hour,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      })),
      actualDate: setting?.actualDate ?? null,
      actualHour: setting?.actualHour ?? null,
      total: votes.length,
    })
  } catch (e) {
    console.error('GET /api/admin/votes error:', e)
    return NextResponse.json({ error: 'Error al obtener votos' }, { status: 500 })
  }
}

/**
 * POST /api/admin/votes
 * Permite a los papás marcar la fecha real de nacimiento de Santiago.
 * Esto habilita el cálculo del ganador.
 *
 * Body: { actualDate: string|null, actualHour: number|null }
 */
export async function POST(req: Request) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { actualDate, actualHour } = body ?? {}

    // Validar: o ambos null (reset) o ambos con valor válido
    if (actualDate !== null || actualHour !== null) {
      if (typeof actualDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(actualDate)) {
        return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 })
      }
      if (!Number.isInteger(actualHour) || actualHour < 0 || actualHour > 23) {
        return NextResponse.json({ error: 'Hora inválida' }, { status: 400 })
      }
    }

    await db.setting.update({
      where: { id: 'global' },
      data: {
        actualDate: actualDate ?? null,
        actualHour: actualHour ?? null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('POST /api/admin/votes error:', e)
    return NextResponse.json({ error: 'Error al guardar la fecha' }, { status: 500 })
  }
}
