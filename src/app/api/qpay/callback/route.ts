import { NextRequest, NextResponse } from 'next/server'
import { checkQpayPayment } from '@/lib/qpay'
import { fulfillInvoice } from '@/lib/billing'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { invoice_id?: string; invoiceId?: string }
    const invoiceId = body.invoice_id || body.invoiceId
    if (!invoiceId) {
      return new NextResponse('SUCCESS', { status: 200 })
    }

    const check = await checkQpayPayment(invoiceId)
    if (check.paid) {
      await fulfillInvoice(invoiceId)
    }

    return new NextResponse('SUCCESS', { status: 200 })
  } catch {
    return new NextResponse('SUCCESS', { status: 200 })
  }
}

export async function GET(req: NextRequest) {
  const invoiceId = req.nextUrl.searchParams.get('invoice_id') || req.nextUrl.searchParams.get('qpay_payment_id')
  if (invoiceId) {
    try {
      const check = await checkQpayPayment(invoiceId)
      if (check.paid) await fulfillInvoice(invoiceId)
    } catch {
      // acknowledge anyway
    }
  }
  return new NextResponse('SUCCESS', { status: 200 })
}
