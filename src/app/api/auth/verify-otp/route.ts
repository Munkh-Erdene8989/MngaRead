import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { hashOtp, safeEqual } from '@/lib/billing'
import { AVATAR_OPTIONS } from '@/data/store'
import { normalizeMnPhone, toE164 } from '@/lib/constants'
import { adminPhoneList } from '@/lib/require-admin'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { phone?: string; code?: string }
    const phone = normalizeMnPhone(body.phone || '')
    const code = (body.code || '').trim()
    if (!phone || !/^\d{4,8}$/.test(code)) {
      return NextResponse.json({ error: 'Код буруу байна' }, { status: 400 })
    }

    const db = adminDb()
    const ref = db.collection('otps').doc(phone)
    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Код илгээгээгүй байна' }, { status: 400 })
    }

    const data = snap.data() as { hash: string; expiresAt: number; attempts: number }
    if (Date.now() > data.expiresAt) {
      await ref.delete()
      return NextResponse.json({ error: 'Кодын хугацаа дууссан' }, { status: 400 })
    }
    if ((data.attempts || 0) >= 5) {
      await ref.delete()
      return NextResponse.json({ error: 'Хэт олон буруу оролдлого' }, { status: 429 })
    }

    const incoming = hashOtp(phone, code)
    if (!safeEqual(incoming, data.hash)) {
      await ref.update({ attempts: (data.attempts || 0) + 1 })
      return NextResponse.json({ error: 'Код буруу байна' }, { status: 400 })
    }

    await ref.delete()

    const e164 = toE164(phone)
    const auth = adminAuth()
    let uid: string
    try {
      const existing = await auth.getUserByPhoneNumber(e164)
      uid = existing.uid
    } catch {
      const created = await auth.createUser({
        phoneNumber: e164,
        displayName: `Хэрэглэгч ${phone.slice(-4)}`,
      })
      uid = created.uid
    }

    const userRef = db.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const isAdmin = adminPhoneList().includes(phone) || userSnap.data()?.role === 'admin'
    if (!userSnap.exists) {
      await userRef.set({
        name: `Хэрэглэгч ${phone.slice(-4)}`,
        username: `@${phone}`,
        avatar: AVATAR_OPTIONS[0],
        avatarColor: '#8B5CF6',
        joinedAt: new Date().toISOString(),
        bio: '',
        phone,
        plan: 'none',
        planExpiresAt: null,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      })
    } else if (isAdmin && userSnap.data()?.role !== 'admin') {
      await userRef.set({ role: 'admin', updatedAt: new Date().toISOString() }, { merge: true })
    }

    await auth.setCustomUserClaims(uid, { phone, admin: isAdmin })
    const token = await auth.createCustomToken(uid, { phone, admin: isAdmin })
    return NextResponse.json({ ok: true, token })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
