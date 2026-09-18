import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { generateOtp, hashOtp } from '@/lib/billing'
import { normalizeMnPhone } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { phone?: string }
    const phone = normalizeMnPhone(body.phone || '')
    if (!phone) {
      return NextResponse.json({ error: 'Утасны дугаар буруу байна' }, { status: 400 })
    }

    const db = adminDb()
    const ref = db.collection('otps').doc(phone)
    const existing = await ref.get()
    const now = Date.now()
    if (existing.exists) {
      const data = existing.data() as { lastSentAt?: number }
      if (data.lastSentAt && now - data.lastSentAt < 45_000) {
        return NextResponse.json({ error: 'Дахин илгээхээс өмнө түр хүлээнэ үү' }, { status: 429 })
      }
    }

    const length = Number(process.env.OTP_LENGTH || 6)
    const ttl = Number(process.env.OTP_TTL_SECONDS || 300)
    const code = generateOtp(length)
    await ref.set({
      hash: hashOtp(phone, code),
      expiresAt: now + ttl * 1000,
      attempts: 0,
      lastSentAt: now,
    })

    if (process.env.CALLPRO_OTP_ENABLED === 'true') {
      const base = process.env.CALLPRO_BASE_URL || 'https://api-text.callpro.mn/v1/sms'
      const res = await fetch(`${base.replace(/\/$/, '')}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CALLPRO_API_KEY || '',
        },
        body: JSON.stringify({
          from: process.env.CALLPRO_FROM,
          to: phone,
          text: `Таны баталгаажуулах код: ${code}. ${Math.floor(ttl / 60)} минутын хугацаанд хүчинтэй.`,
        }),
      })
      if (!res.ok) {
        const text = await res.text()
        return NextResponse.json({ error: 'SMS илгээж чадсангүй', detail: text }, { status: 502 })
      }
    }

    return NextResponse.json({ ok: true, ttl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
