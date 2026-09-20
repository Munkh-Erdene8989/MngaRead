import { NextRequest, NextResponse } from 'next/server'
import { MIN_PASSWORD_LENGTH, verifyPassword } from '@/lib/password'
import { credentialsRef, upsertAdminAccount } from '@/lib/admin-auth'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(req: NextRequest) {
  const authz = await requireAdmin(req)
  if ('response' in authz) return authz.response

  try {
    const body = (await req.json()) as { currentPassword?: string; newPassword?: string }
    const currentPassword = String(body.currentPassword || '')
    const newPassword = String(body.newPassword || '')
    if (!authz.phone) {
      return NextResponse.json({ error: 'Админ бүртгэл олдсонгүй' }, { status: 400 })
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Нууц үг хамгийн багадаа ${MIN_PASSWORD_LENGTH} тэмдэгт байх ёстой` },
        { status: 400 }
      )
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: 'Шинэ нууц үг өмнөхтэй ижил байна' }, { status: 400 })
    }

    const credSnap = await credentialsRef(authz.phone).get()
    const hash = String(credSnap.data()?.hash || '')
    if (!hash || !(await verifyPassword(currentPassword, hash))) {
      return NextResponse.json({ error: 'Одоогийн нууц үг буруу байна' }, { status: 401 })
    }

    await upsertAdminAccount(authz.phone, newPassword)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
