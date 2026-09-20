import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { normalizeMnPhone } from '@/lib/constants'
import { MIN_PASSWORD_LENGTH, verifyPassword } from '@/lib/password'
import {
  ADMIN_LOGIN_MAX_ATTEMPTS,
  credentialsRef,
  ensureAdminAuthUser,
  ensureBootstrapAdmin,
  isLoginLocked,
  recordLoginFailure,
  resetLoginFailures,
} from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    await ensureBootstrapAdmin()

    const body = (await req.json()) as { phone?: string; password?: string }
    const phone = normalizeMnPhone(body.phone || '')
    const password = String(body.password || '')
    if (!phone || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: 'Утас эсвэл нууц үг буруу' }, { status: 400 })
    }

    const credSnap = await credentialsRef(phone).get()
    if (!credSnap.exists) {
      return NextResponse.json({ error: 'Утас эсвэл нууц үг буруу' }, { status: 401 })
    }

    const cred = credSnap.data() as {
      hash?: string
      loginAttempts?: number
      lastFailedAt?: number
    }

    if (isLoginLocked(cred)) {
      return NextResponse.json(
        { error: 'Хэт олон буруу оролдлого. Түр хүлээнэ үү' },
        { status: 429 }
      )
    }

    const attempts = cred.loginAttempts || 0
    const unlocked =
      attempts >= ADMIN_LOGIN_MAX_ATTEMPTS && !isLoginLocked(cred) ? 0 : attempts

    if (!cred.hash || !(await verifyPassword(password, cred.hash))) {
      await recordLoginFailure(phone, unlocked)
      return NextResponse.json({ error: 'Утас эсвэл нууц үг буруу' }, { status: 401 })
    }

    await resetLoginFailures(phone)
    const uid = await ensureAdminAuthUser(phone)
    const token = await adminAuth().createCustomToken(uid, { phone, admin: true })
    return NextResponse.json({ ok: true, token })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
