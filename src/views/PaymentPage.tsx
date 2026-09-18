'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { animate, spring } from 'animejs'
import Layout from '@/components/Layout'
import AnimateIn from '@/components/motion/AnimateIn'
import Stagger from '@/components/motion/Stagger'
import { type SubPlan } from '@/data/store'
import { useNavigate, useBack } from '@/lib/nav'
import { useAuth } from '@/contexts/AuthContext'
import { useCatalog } from '@/contexts/CatalogContext'
import { getClientAuth } from '@/lib/firebase/client'
import { formatMnDate, addMonths, CHAPTER_PRICE, MONTHLY_PRICE, YEARLY_PRICE } from '@/lib/constants'
import { MOTION, prefersReducedMotion } from '@/lib/motion'

const PLANS: { id: SubPlan; label: string; price: string; priceNum: string; period: string; badge?: string; features: string[] }[] = [
  {
    id: 'monthly',
    label: 'Сарын',
    price: `₮${MONTHLY_PRICE.toLocaleString()}`,
    priceNum: String(MONTHLY_PRICE),
    period: '/ сар',
    features: [
      'Бүх хуучин бүлгүүд',
      'Шинэ бүлгүүд (гарсны 7 хоногийн дараа)',
      'Зар сурталчилгаагүй',
      'Хяналтын самбар',
    ],
  },
  {
    id: 'yearly',
    label: 'Жилийн',
    price: `₮${YEARLY_PRICE.toLocaleString()}`,
    priceNum: String(YEARLY_PRICE),
    period: '/ жил',
    badge: '24% хямдрал',
    features: [
      'Бүх хуучин бүлгүүд',
      'Шинэ бүлгүүд (гарсны 3 хоногийн дараа)',
      'Зар сурталчилгаагүй',
      'Хяналтын самбар',
      'Үнэгүй бүлгийн эрх сар бүр +2',
    ],
  },
]

interface InvoicePayload {
  invoiceId: string
  qrImage?: string
  qrText?: string
  urls?: { name: string; description?: string; logo?: string; link: string }[]
  amount: number
  description: string
}

export default function PaymentPage() {
  const navigate = useNavigate()
  const back = useBack()
  const searchParams = useSearchParams()
  const { user, isGuest, refresh, loading } = useAuth()
  const { getManga } = useCatalog()
  const qs = searchParams?.toString() || ''
  const mangaId = searchParams?.get('manga')
  const chapterParam = searchParams?.get('chapter')
  const mode = searchParams?.get('mode') || 'sub'

  const manga = mangaId ? getManga(mangaId) : null
  const chapterNum = chapterParam ? parseInt(chapterParam, 10) : null

  const [selectedPlan, setSelectedPlan] = useState<SubPlan>('yearly')
  const [step, setStep] = useState<'choose' | 'confirm' | 'pay' | 'success'>('choose')
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState('')
  const [invoice, setInvoice] = useState<InvoicePayload | null>(null)

  const startDate = useMemo(() => new Date(), [])
  const nextBill = selectedPlan === 'yearly' ? addMonths(startDate, 12) : addMonths(startDate, 1)

  useEffect(() => {
    if (loading) return
    if (isGuest) navigate(`/login?next=${encodeURIComponent(`/payment?${qs}`)}`)
  }, [isGuest, loading, navigate, qs])

  useEffect(() => {
    if (step !== 'pay' || !invoice) return
    let cancelled = false
    const tick = async () => {
      try {
        const token = await getClientAuth().currentUser?.getIdToken()
        if (!token) return
        const res = await fetch('/api/qpay/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ invoiceId: invoice.invoiceId }),
        })
        const data = await res.json()
        if (!cancelled && data.paid) {
          await refresh()
          setStep('success')
        }
      } catch {
        // keep polling
      }
    }
    const id = setInterval(tick, 3000)
    tick()
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [step, invoice, refresh])

  const createInvoice = async (payload: Record<string, unknown>) => {
    setError('')
    setBuying(true)
    try {
      const token = await getClientAuth().currentUser?.getIdToken()
      if (!token) {
        navigate(`/login?next=/payment?${qs}`)
        return
      }
      const res = await fetch('/api/qpay/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Нэхэмжлэл үүсгэж чадсангүй')
      setInvoice(data)
      setStep('pay')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setBuying(false)
    }
  }

  const handleSubscribe = () => {
    if (step === 'choose') { setStep('confirm'); return }
    createInvoice({ type: 'sub', plan: selectedPlan })
  }

  const handleBuyChapter = () => {
    createInvoice({ type: 'chapter', mangaId, chapterNum })
  }

  if (loading || isGuest) {
    return (
      <Layout>
        <div className="max-w-[480px] mx-auto px-4 mt-24 text-center text-[#9CA3AF] text-sm">
          Ачааллаж байна…
        </div>
      </Layout>
    )
  }

  if (step === 'success') {
    return (
      <Layout>
        <SuccessPanel
          title={mode === 'buy' ? 'Амжилттай худалдан авлаа!' : 'Захиалга амжилттай!'}
          body={
            mode === 'buy'
              ? `${manga?.title} — Бүлэг ${chapterNum} уншихад бэлэн боллоо.`
              : `${selectedPlan === 'yearly' ? 'Жилийн' : 'Сарын'} захиалга идэвхжилээ. Бүх агуулга нээлттэй боллоо!`
          }
          primary={manga ? { label: 'Унших', onClick: () => navigate(`/manga/${manga.id}/read/${chapterNum || 1}`) } : undefined}
          secondary={{ label: 'Нүүр хуудас', onClick: () => navigate('/') }}
        />
      </Layout>
    )
  }

  if (step === 'pay' && invoice) {
    const qrSrc = invoice.qrImage
      ? (invoice.qrImage.startsWith('data:') ? invoice.qrImage : `data:image/png;base64,${invoice.qrImage}`)
      : null
    return (
      <Layout>
        <div className="max-w-[480px] mx-auto px-4 mt-10 pb-16 text-center fade-in">
          <h1 className="text-[#F5F7FA] font-extrabold text-2xl mb-2">QPay-ээр төлөх</h1>
          <p className="text-[#9CA3AF] text-sm mb-6">{invoice.description} — ₮{invoice.amount.toLocaleString()}</p>
          {qrSrc && (
            <div className="rounded-2xl p-4 inline-block mb-4" style={{ background: '#fff' }}>
              <img src={qrSrc} alt="QPay QR" className="w-56 h-56" />
            </div>
          )}
          <p className="text-[#9CA3AF] text-sm mb-4">Банкны апп-аараа QR уншуулна уу. Төлбөр амжилттай болвол автоматаар үргэлжилнэ.</p>
          {invoice.urls && invoice.urls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {invoice.urls.slice(0, 8).map((url) => (
                <a
                  key={url.name}
                  href={url.link}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#F5F7FA] border border-[rgba(255,255,255,0.08)]"
                  style={{ background: '#151923' }}
                >
                  {url.name}
                </a>
              ))}
            </div>
          )}
          {error && <p className="text-[#F87171] text-sm mb-3">{error}</p>}
          <button
            onClick={() => setStep(mode === 'buy' ? 'choose' : 'confirm')}
            className="text-sm text-[#4B5563] hover:text-[#9CA3AF]"
          >
            Буцах
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 mt-6 pb-16">
        <button
          onClick={back}
          className="flex items-center gap-2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span className="text-sm">Буцах</span>
        </button>

        {mode === 'buy' && manga && chapterNum !== null ? (
          <div className="max-w-[480px] mx-auto fade-in">
            <h1 className="text-[#F5F7FA] font-extrabold text-2xl mb-1">Бүлэг худалдан авах</h1>
            <p className="text-[#9CA3AF] text-sm mb-6">Нэг удаагийн худалдан авалт</p>

            <div
              className="flex items-center gap-4 p-4 rounded-2xl border mb-6"
              style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className="w-16 h-[88px] rounded-xl overflow-hidden flex-shrink-0" style={{ background: manga.coverColor }}>
                <img src={manga.coverImage} alt={manga.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[#F5F7FA] font-bold">{manga.title}</p>
                <p className="text-[#9CA3AF] text-sm mt-0.5">Бүлэг {chapterNum}</p>
                <p className="text-[#A78BFA] font-extrabold text-xl mt-2">₮{CHAPTER_PRICE.toLocaleString()}</p>
              </div>
            </div>

            <div
              className="flex items-start gap-3 p-4 rounded-2xl border mb-6"
              style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-[#9CA3AF] text-sm leading-relaxed">
                Сарын захиалга авбал <span className="text-[#A78BFA] font-semibold">бүх бүлгийг</span> нэг бүрийг нь тус тусад нь худалдан авахаас хямд үнэтэй.{' '}
                <button
                  onClick={() => navigate('/payment?mode=sub')}
                  className="text-[#8B5CF6] underline hover:text-[#A78BFA]"
                >
                  Захиалга үзэх
                </button>
              </p>
            </div>

            {error && <p className="text-[#F87171] text-sm mb-3">{error}</p>}
            <button
              onClick={handleBuyChapter}
              disabled={buying || !user}
              className="w-full py-4 rounded-2xl text-base font-extrabold text-white transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
            >
              {buying ? 'Боловсруулж байна…' : `₮${CHAPTER_PRICE.toLocaleString()} — QPay-ээр төлөх`}
            </button>
          </div>
        ) : (
          <div className="fade-in">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-[#A78BFA] mb-4"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#8B5CF6">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Нэг сар үнэгүй туршаарай
              </div>
              <h1 className="text-[#F5F7FA] font-extrabold text-3xl md:text-4xl tracking-tight mb-3">
                Хязгааргүй унших
              </h1>
              <p className="text-[#9CA3AF] text-base max-w-sm mx-auto leading-relaxed">
                Нэг захиалгаар бүх мангаг хязгааргүй уншаарай. Хуучин бүлэг бүгд нэн даруй нээгдэнэ.
              </p>
            </div>

            {step === 'choose' ? (
              <Stagger className="grid md:grid-cols-2 gap-5 max-w-[640px] mx-auto mb-8" y={12}>
                {PLANS.map((plan) => {
                  const active = selectedPlan === plan.id
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className="relative text-left p-6 rounded-2xl border transition-all"
                      style={{
                        background: active ? 'rgba(139,92,246,0.08)' : '#151923',
                        borderColor: active ? '#8B5CF6' : 'rgba(255,255,255,0.08)',
                        boxShadow: active ? '0 0 0 1px #8B5CF6' : undefined,
                      }}
                    >
                      {plan.badge && (
                        <div
                          className="absolute -top-3 left-5 px-3 py-1 rounded-full text-xs font-extrabold text-white"
                          style={{ background: 'linear-gradient(90deg,#8B5CF6,#6D28D9)' }}
                        >
                          {plan.badge}
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[#9CA3AF] text-sm font-semibold">{plan.label} захиалга</p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-[#F5F7FA] font-extrabold text-3xl">{plan.price}</span>
                            <span className="text-[#4B5563] text-sm">{plan.period}</span>
                          </div>
                        </div>
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all"
                          style={{ borderColor: active ? '#8B5CF6' : 'rgba(255,255,255,0.2)', background: active ? '#8B5CF6' : 'transparent' }}
                        >
                          {active && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  )
                })}
              </Stagger>
            ) : (
              <div className="max-w-[420px] mx-auto mb-8 fade-in">
                <div className="rounded-2xl border p-5 mb-4" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <h3 className="text-[#F5F7FA] font-bold mb-4">Захиалгын мэдээлэл</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Захиалгын төрөл', value: selectedPlan === 'yearly' ? 'Жилийн' : 'Сарын' },
                      { label: 'Үнэ', value: selectedPlan === 'yearly' ? `₮${YEARLY_PRICE.toLocaleString()} / жил` : `₮${MONTHLY_PRICE.toLocaleString()} / сар` },
                      { label: 'Эхлэх огноо', value: formatMnDate(startDate) },
                      { label: 'Дараагийн төлбөр', value: formatMnDate(nextBill) },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-[#4B5563] text-sm">{row.label}</span>
                        <span className="text-[#F5F7FA] text-sm font-semibold">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setStep('choose')}
                  className="flex items-center gap-1 text-sm text-[#4B5563] hover:text-[#9CA3AF] transition-colors mb-4"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Төлөвлөгөө солих
                </button>
              </div>
            )}

            {error && <p className="text-center text-[#F87171] text-sm mb-3">{error}</p>}
            <div className="flex justify-center">
              <button
                onClick={handleSubscribe}
                disabled={buying}
                className="px-10 py-4 rounded-2xl text-base font-extrabold text-white transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', minWidth: 280 }}
              >
                {buying ? 'Боловсруулж байна…' : step === 'choose' ? 'Үргэлжлүүлэх' : 'QPay-ээр төлөх'}
              </button>
            </div>
            <p className="text-center text-[#4B5563] text-xs mt-4">
              Захиалгыг хэдийд ч цуцалж болно. Нэрийн хуудасны мэдээлэл хадгалагдахгүй.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

function SuccessPanel({
  title,
  body,
  primary,
  secondary,
}: {
  title: string
  body: string
  primary?: { label: string; onClick: () => void }
  secondary: { label: string; onClick: () => void }
}) {
  const iconRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!iconRef.current || prefersReducedMotion()) return
    const anim = animate(iconRef.current, {
      scale: [0.7, 1],
      opacity: [0, 1],
      duration: MOTION.duration.hero,
      ease: spring({ bounce: 0.4, duration: 560 }),
    })
    return () => { anim.revert() }
  }, [])

  return (
    <AnimateIn className="max-w-[480px] mx-auto px-4 mt-16 text-center">
      <div
        ref={iconRef}
        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
        style={{ background: 'rgba(139,92,246,0.15)' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h2 className="text-[#F5F7FA] font-extrabold text-2xl mb-2">{title}</h2>
      <p className="text-[#9CA3AF] text-sm leading-relaxed mb-8">{body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {primary && (
          <button
            onClick={primary.onClick}
            className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: '#8B5CF6' }}
          >
            {primary.label}
          </button>
        )}
        <button
          onClick={secondary.onClick}
          className="px-6 py-3 rounded-2xl text-sm font-semibold text-[#9CA3AF] border border-[rgba(255,255,255,0.12)]"
        >
          {secondary.label}
        </button>
      </div>
    </AnimateIn>
  )
}
