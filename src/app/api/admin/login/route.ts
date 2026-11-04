import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/admin/login
 * Verifica el password de admin. Si es correcto, devuelve un token simple
 * (suficiente para este caso de uso, no es producción con datos sensibles).
 *
 * Body: { password: string }
 */
export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (typeof password !== 'string' || !password) {
      return NextResponse.json({ ok: false, error: 'Password requerido' }, { status: 400 })
    }

    const setting = await db.setting.findUnique({ where: { id: 'global' } })
    if (!setting) {
      return NextResponse.json({ ok: false, error: 'Configuración no inicializada' }, { status: 500 })
    }

    if (password !== setting.adminPassword) {
      return NextResponse.json({ ok: false, error: 'Password incorrecto' }, { status: 401 })
    }

    // Token simple: hash del password + timestamp (no es seguro pero suficiente)
    const token = Buffer.from(`${setting.adminPassword}:${Date.now()}`).toString('base64')

    return NextResponse.json({ ok: true, token })
  } catch (e) {
    console.error('POST /api/admin/login error:', e)
    return NextResponse.json({ ok: false, error: 'Error al iniciar sesión' }, { status: 500 })
  }
}
