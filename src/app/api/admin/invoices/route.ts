import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/require-admin'

export async function GET(req: NextRequest) {
  const authz = await requireAdmin(req)
  if ('response' in authz) return authz.response

  const snap = await adminDb().collection('invoices').get()
  const list = snap.docs.map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>
    return {
      id: docSnap.id,
      uid: String(data.uid || ''),
      type: String(data.type || ''),
      plan: data.plan ? String(data.plan) : null,
      mangaId: data.mangaId ? String(data.mangaId) : null,
      chapterNum: data.chapterNum == null ? null : Number(data.chapterNum),
      amount: Number(data.amount) || 0,
      description: String(data.description || ''),
      status: String(data.status || 'pending'),
      createdAt: String(data.createdAt || ''),
      paidAt: data.paidAt
        ? typeof data.paidAt === 'object' && data.paidAt && 'toDate' in (data.paidAt as object)
          ? (data.paidAt as { toDate: () => Date }).toDate().toISOString()
          : String(data.paidAt)
        : null,
    }
  })
  list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  return NextResponse.json({ list })
}
