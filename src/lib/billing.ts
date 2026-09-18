import { Timestamp } from 'firebase-admin/firestore'
import { createHash, randomInt, timingSafeEqual } from 'crypto'
import type { SubPlan } from '@/data/store'
import { adminDb } from '@/lib/firebase/admin'
import { addMonths } from '@/lib/constants'

export function hashOtp(phone: string, code: string): string {
  return createHash('sha256').update(`${phone}:${code}`).digest('hex')
}

export function generateOtp(length = 6): string {
  const max = 10 ** length
  return String(randomInt(0, max)).padStart(length, '0')
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export async function fulfillInvoice(invoiceId: string): Promise<{ ok: boolean; already?: boolean }> {
  const db = adminDb()
  const ref = db.collection('invoices').doc(invoiceId)
  const snap = await ref.get()
  if (!snap.exists) return { ok: false }
  const invoice = snap.data() as {
    status: string
    uid: string
    type: 'sub' | 'chapter'
    plan?: 'monthly' | 'yearly'
    mangaId?: string
    chapterNum?: number
    amount: number
  }

  if (invoice.status === 'paid') return { ok: true, already: true }

  const userRef = db.collection('users').doc(invoice.uid)
  const now = new Date()

  await db.runTransaction(async (tx) => {
    const fresh = await tx.get(ref)
    const data = fresh.data()
    if (!data || data.status === 'paid') return

    if (invoice.type === 'sub' && invoice.plan) {
      const userSnap = await tx.get(userRef)
      const current = userSnap.data() as { plan?: SubPlan; planExpiresAt?: Timestamp } | undefined
      const base =
        current?.planExpiresAt?.toDate && current.planExpiresAt.toDate() > now
          ? current.planExpiresAt.toDate()
          : now
      const expires = invoice.plan === 'yearly' ? addMonths(base, 12) : addMonths(base, 1)
      tx.set(
        userRef,
        {
          plan: invoice.plan,
          planExpiresAt: expires,
          updatedAt: now,
        },
        { merge: true }
      )
    }

    if (invoice.type === 'chapter' && invoice.mangaId && invoice.chapterNum != null) {
      const purchaseId = `${invoice.mangaId}_${invoice.chapterNum}`
      tx.set(userRef.collection('purchases').doc(purchaseId), {
        mangaId: invoice.mangaId,
        chapterNum: invoice.chapterNum,
        purchasedAt: now.toISOString(),
        invoiceId,
        amount: invoice.amount,
      })
    }

    tx.update(ref, { status: 'paid', paidAt: now })
  })

  return { ok: true }
}
