import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/require-admin'

export async function GET(req: NextRequest) {
  const authz = await requireAdmin(req)
  if ('response' in authz) return authz.response

  const db = adminDb()
  const [mangaSnap, usersSnap, invoicesSnap] = await Promise.all([
    db.collection('manga').get(),
    db.collection('users').get(),
    db.collection('invoices').get(),
  ])

  const now = Date.now()
  let revenue = 0
  let paidCount = 0
  let pendingCount = 0
  let subscribers = 0

  for (const docSnap of invoicesSnap.docs) {
    const data = docSnap.data() as { status?: string; amount?: number }
    if (data.status === 'paid') {
      paidCount += 1
      revenue += Number(data.amount) || 0
    } else {
      pendingCount += 1
    }
  }

  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data() as {
      plan?: string
      planExpiresAt?: { toDate?: () => Date } | string | null
    }
    let expires = 0
    if (data.planExpiresAt && typeof data.planExpiresAt === 'object' && data.planExpiresAt.toDate) {
      expires = data.planExpiresAt.toDate().getTime()
    } else if (typeof data.planExpiresAt === 'string') {
      expires = new Date(data.planExpiresAt).getTime()
    }
    if (data.plan && data.plan !== 'none' && expires > now) subscribers += 1
  }

  return NextResponse.json({
    mangaCount: mangaSnap.size,
    userCount: usersSnap.size,
    invoiceCount: invoicesSnap.size,
    paidCount,
    pendingCount,
    revenue,
    subscribers,
  })
}
