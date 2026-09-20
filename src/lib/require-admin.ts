import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { normalizeMnPhone } from '@/lib/constants'

export function adminPhoneList(): string[] {
  return (process.env.ADMIN_PHONES || '')
    .split(/[,;\s]+/)
    .map((value) => normalizeMnPhone(value) || '')
    .filter((phone) => phone.length === 8)
}

export async function requireAdmin(
  req: NextRequest
): Promise<{ uid: string; phone: string } | { response: NextResponse }> {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    return { response: NextResponse.json({ error: 'Нэвтэрнэ үү' }, { status: 401 }) }
  }

  try {
    const decoded = await adminAuth().verifyIdToken(token)
    const ref = adminDb().collection('users').doc(decoded.uid)
    const snap = await ref.get()
    const phone = String(snap.data()?.phone || decoded.phone || '')
    const listed = adminPhoneList().includes(phone)
    const isAdmin =
      decoded.admin === true || snap.data()?.role === 'admin' || listed

    if (!isAdmin) {
      return { response: NextResponse.json({ error: 'Админ эрхгүй' }, { status: 403 }) }
    }

    if (listed && snap.exists && snap.data()?.role !== 'admin') {
      await ref.set({ role: 'admin', updatedAt: new Date().toISOString() }, { merge: true })
    }

    return { uid: decoded.uid, phone }
  } catch {
    return { response: NextResponse.json({ error: 'Нэвтэрнэ үү' }, { status: 401 }) }
  }
}
