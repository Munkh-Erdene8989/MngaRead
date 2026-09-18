import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { createQpayInvoice } from '@/lib/qpay'
import { CHAPTER_PRICE, MONTHLY_PRICE, YEARLY_PRICE } from '@/lib/constants'
import { getManga } from '@/data/manga'

async function getUid(req: NextRequest): Promise<string | null> {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  try {
    const decoded = await adminAuth().verifyIdToken(token)
    return decoded.uid
  } catch {
    return null
  }
}

function callbackUrl(req: NextRequest): string {
  if (process.env.QPAY_CALLBACK_URL) return process.env.QPAY_CALLBACK_URL
  const origin = req.nextUrl.origin
  return `${origin}/api/qpay/callback`
}

export async function POST(req: NextRequest) {
  try {
    const uid = await getUid(req)
    if (!uid) return NextResponse.json({ error: 'Нэвтэрнэ үү' }, { status: 401 })

    const body = (await req.json()) as {
      type?: 'sub' | 'chapter'
      plan?: 'monthly' | 'yearly'
      mangaId?: string
      chapterNum?: number
    }

    let amount = 0
    let description = 'MANGA.MN'
    if (body.type === 'chapter') {
      if (!body.mangaId || body.chapterNum == null) {
        return NextResponse.json({ error: 'Бүлгийн мэдээлэл дутуу' }, { status: 400 })
      }
      const manga = getManga(body.mangaId)
      if (!manga) return NextResponse.json({ error: 'Манга олдсонгүй' }, { status: 404 })
      amount = CHAPTER_PRICE
      description = `${manga.title} — Бүлэг ${body.chapterNum}`
    } else {
      const plan = body.plan === 'yearly' ? 'yearly' : 'monthly'
      amount = plan === 'yearly' ? YEARLY_PRICE : MONTHLY_PRICE
      description = plan === 'yearly' ? 'MANGA.MN жилийн захиалга' : 'MANGA.MN сарын захиалга'
      body.plan = plan
      body.type = 'sub'
    }

    const senderInvoiceNo = `${uid.slice(0, 8)}-${Date.now()}`
    const invoice = await createQpayInvoice({
      senderInvoiceNo,
      amount,
      description,
      callbackUrl: callbackUrl(req),
    })

    await adminDb().collection('invoices').doc(invoice.invoice_id).set({
      invoiceId: invoice.invoice_id,
      senderInvoiceNo,
      uid,
      type: body.type,
      plan: body.plan || null,
      mangaId: body.mangaId || null,
      chapterNum: body.chapterNum ?? null,
      amount,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      invoiceId: invoice.invoice_id,
      qrText: invoice.qr_text,
      qrImage: invoice.qr_image,
      shortUrl: invoice.qPay_shortUrl,
      urls: invoice.urls || [],
      amount,
      description,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
