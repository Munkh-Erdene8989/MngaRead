export const CHAPTER_PRICE = 990
export const MONTHLY_PRICE = 9900
export const YEARLY_PRICE = 89900

export const PLAN_PRICES = {
  monthly: MONTHLY_PRICE,
  yearly: YEARLY_PRICE,
} as const

export function normalizeMnPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 8) return digits
  if (digits.length === 11 && digits.startsWith('976')) return digits.slice(3)
  if (digits.length === 12 && digits.startsWith('976')) return digits.slice(-8)
  return null
}

export function toE164(phone8: string): string {
  return `+976${phone8}`
}

export function formatMnDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}
