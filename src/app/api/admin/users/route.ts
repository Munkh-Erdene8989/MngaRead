import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/require-admin'

export async function GET(req: NextRequest) {
  const authz = await requireAdmin(req)
  if ('response' in authz) return authz.response

  const snap = await adminDb().collection('users').get()
  const list = snap.docs.map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>
    let planExpiresAt: string | null = null
    const expires = data.planExpiresAt as { toDate?: () => Date } | string | null | undefined
    if (expires && typeof expires === 'object' && typeof expires.toDate === 'function') {
      planExpiresAt = expires.toDate().toISOString()
    } else if (typeof expires === 'string') {
      planExpiresAt = expires
    }
    return {
      uid: docSnap.id,
      name: String(data.name || ''),
      phone: String(data.phone || ''),
      plan: String(data.plan || 'none'),
      planExpiresAt,
      role: data.role === 'admin' ? 'admin' : 'user',
      joinedAt: String(data.joinedAt || data.createdAt || ''),
    }
  })
  list.sort((a, b) => (b.joinedAt || '').localeCompare(a.joinedAt || ''))
  return NextResponse.json({ list })
}
