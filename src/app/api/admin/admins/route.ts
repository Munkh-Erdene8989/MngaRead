import { NextRequest, NextResponse } from 'next/server'
import { normalizeMnPhone } from '@/lib/constants'
import { MIN_PASSWORD_LENGTH } from '@/lib/password'
import { upsertAdminAccount } from '@/lib/admin-auth'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(req: NextRequest) {
  const authz = await requireAdmin(req)
  if ('response' in authz) return authz.response

  try {
    const body = (await req.json()) as { phone?: string; password?: string }
    const phone = normalizeMnPhone(body.phone || '')
    const password = String(body.password || '')
    if (!phone) {
      return NextResponse.json({ error: 'Утасны дугаар буруу байна' }, { status: 400 })
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Нууц үг хамгийн багадаа ${MIN_PASSWORD_LENGTH} тэмдэгт байх ёстой` },
        { status: 400 }
      )
    }

    const uid = await upsertAdminAccount(phone, password)
    return NextResponse.json({ ok: true, uid, phone })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
