import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { checkQpayPayment } from '@/lib/qpay'
import { fulfillInvoice } from '@/lib/billing'

export async function POST(req: NextRequest) {
  try {
    const header = req.headers.get('authorization') || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return NextResponse.json({ error: 'Нэвтэрнэ үү' }, { status: 401 })
    const decoded = await adminAuth().verifyIdToken(token)

    const body = (await req.json()) as { invoiceId?: string }
    if (!body.invoiceId) return NextResponse.json({ error: 'invoiceId дутуу' }, { status: 400 })

    const snap = await adminDb().collection('invoices').doc(body.invoiceId).get()
    if (!snap.exists) return NextResponse.json({ error: 'Нэхэмжлэл олдсонгүй' }, { status: 404 })
    const invoice = snap.data() as { uid: string; status: string }
    if (invoice.uid !== decoded.uid) {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 403 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ paid: true, status: 'paid' })
    }

    const check = await checkQpayPayment(body.invoiceId)
    if (check.paid) {
      await fulfillInvoice(body.invoiceId)
      return NextResponse.json({ paid: true, status: 'paid' })
    }

    return NextResponse.json({ paid: false, status: invoice.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
