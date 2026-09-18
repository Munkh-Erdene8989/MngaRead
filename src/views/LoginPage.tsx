'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { animate, spring } from 'animejs'
import Layout from '@/components/Layout'
import AnimateIn from '@/components/motion/AnimateIn'
import { useAuth } from '@/contexts/AuthContext'
import { MOTION, prefersReducedMotion } from '@/lib/motion'
import { useNavigate } from '@/lib/nav'

export default function LoginPage() {
  const navigate = useNavigate()
  const params = useSearchParams()
  const next = params?.get('next') || '/'
  const { signInWithToken, user, loading } = useAuth()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const logoRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!logoRef.current || prefersReducedMotion()) return
    const anim = animate(logoRef.current, {
      scale: [0.82, 1],
      opacity: [0, 1],
      duration: MOTION.duration.hero,
      ease: spring({ bounce: 0.35, duration: 520 }),
    })
    return () => { anim.revert() }
  }, [])

  useEffect(() => {
    if (!loading && user) navigate(next)
  }, [loading, user, next, navigate])

  const sendOtp = async () => {
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'SMS илгээж чадсангүй')
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setBusy(false)
    }
  }

  const verifyOtp = async () => {
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Баталгаажуулалт амжилтгүй')
      await signInWithToken(data.token)
      navigate(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout>
      <AnimateIn className="max-w-[420px] mx-auto px-4 mt-16 pb-16">
        <div className="text-center mb-8">
          <div
            ref={logoRef}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
          >
            <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="12" rx="1.5" fill="white"/>
              <rect x="8" y="1" width="5" height="7" rx="1.5" fill="white" opacity="0.55"/>
            </svg>
          </div>
          <h1 className="text-[#F5F7FA] font-extrabold text-2xl mb-2">Нэвтрэх</h1>
          <p className="text-[#9CA3AF] text-sm leading-relaxed">
            Монгол утасны дугаараараа нэвтэрнэ үү. Баталгаажуулах код SMS-ээр ирнэ.
          </p>
        </div>

        <AnimateIn key={step} y={10}>
        <div className="rounded-2xl border p-5" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.08)' }}>
          {step === 'phone' ? (
            <>
              <label className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest">Утасны дугаар</label>
              <div className="flex items-center gap-2 mt-2 mb-4">
                <span className="text-[#F5F7FA] text-sm font-semibold px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>+976</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="99112233"
                  inputMode="numeric"
                  className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-3 text-[#F5F7FA] outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <button
                onClick={sendOtp}
                disabled={busy || phone.length !== 8}
                className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
              >
                {busy ? 'Илгээж байна…' : 'Код авах'}
              </button>
            </>
          ) : (
            <>
              <p className="text-[#9CA3AF] text-sm mb-3">+976 {phone} дугаар руу код илгээлээ.</p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-3 text-[#F5F7FA] text-center tracking-[0.4em] font-bold outline-none focus:border-[#8B5CF6] mb-4"
              />
              <button
                onClick={verifyOtp}
                disabled={busy || code.length < 4}
                className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50 mb-3"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
              >
                {busy ? 'Шалгаж байна…' : 'Баталгаажуулах'}
              </button>
              <button
                onClick={() => { setStep('phone'); setCode('') }}
                className="w-full text-sm text-[#4B5563] hover:text-[#9CA3AF]"
              >
                Дугаар солих
              </button>
            </>
          )}
          {error && <p className="text-[#F87171] text-sm mt-4">{error}</p>}
        </div>
        </AnimateIn>
      </AnimateIn>
    </Layout>
  )
}
