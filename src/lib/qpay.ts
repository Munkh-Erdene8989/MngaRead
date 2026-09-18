const TOKEN_TTL_MS = 50 * 60 * 1000

let cachedToken: { value: string; expiresAt: number } | null = null

function getConfig() {
  const baseUrl = process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn'
  const clientId = process.env.QPAY_CLIENT_ID
  const clientSecret = process.env.QPAY_CLIENT_SECRET
  const invoiceCode = process.env.QPAY_INVOICE_CODE
  if (!clientId || !clientSecret || !invoiceCode) {
    throw new Error('QPay credentials are not configured')
  }
  return { baseUrl, clientId, clientSecret, invoiceCode }
}

export async function getQpayToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value
  }

  const { baseUrl, clientId, clientSecret } = getConfig()
  const res = await fetch(`${baseUrl}/v2/auth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QPay auth failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error('QPay auth returned no access_token')

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ? data.expires_in * 1000 : TOKEN_TTL_MS),
  }
  return data.access_token
}

export interface QpayInvoiceResult {
  invoice_id: string
  qr_text?: string
  qr_image?: string
  qPay_shortUrl?: string
  urls?: { name: string; description?: string; logo?: string; link: string }[]
}

export async function createQpayInvoice(params: {
  senderInvoiceNo: string
  amount: number
  description: string
  callbackUrl: string
}): Promise<QpayInvoiceResult> {
  const { baseUrl, invoiceCode } = getConfig()
  const token = await getQpayToken()
  const res = await fetch(`${baseUrl}/v2/invoice`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      invoice_code: invoiceCode,
      sender_invoice_no: params.senderInvoiceNo,
      invoice_receiver_code: 'terminal',
      invoice_description: params.description.slice(0, 255),
      amount: params.amount,
      callback_url: params.callbackUrl,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QPay invoice failed: ${res.status} ${text}`)
  }

  return (await res.json()) as QpayInvoiceResult
}

export async function checkQpayPayment(invoiceId: string): Promise<{ paid: boolean; count: number }> {
  const { baseUrl } = getConfig()
  const token = await getQpayToken()
  const res = await fetch(`${baseUrl}/v2/payment/check`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      object_type: 'INVOICE',
      object_id: invoiceId,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QPay check failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { count?: number; rows?: unknown[] }
  const count = data.count ?? data.rows?.length ?? 0
  return { paid: count > 0, count }
}
