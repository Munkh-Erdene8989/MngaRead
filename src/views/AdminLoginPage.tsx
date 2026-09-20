'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { animate, spring } from 'animejs'
import Layout from '@/components/Layout'
import AnimateIn from '@/components/motion/AnimateIn'
import { useAuth } from '@/contexts/AuthContext'
import { MOTION, prefersReducedMotion } from '@/lib/motion'
import { useNavigate } from '@/lib/nav'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const params = useSearchParams()
  const next = params?.get('next') || '/admin'
  const { signInWithToken, user, isAdmin, loading } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
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
    if (!loading && user && isAdmin) navigate(next)
  }, [loading, user, isAdmin, next, navigate])

  const submit = async () => {
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Нэвтрэлт амжилтгүй')
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
          <h1 className="text-[#F5F7FA] font-extrabold text-2xl mb-2">Админ нэвтрэх</h1>
          <p className="text-[#9CA3AF] text-sm leading-relaxed">
            Утасны дугаар болон нууц үгээр нэвтэрнэ үү. SMS код ашиглахгүй.
          </p>
        </div>

        <AnimateIn y={10}>
          <div className="rounded-2xl border p-5" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.08)' }}>
            <label className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest">Утасны дугаар</label>
            <div className="flex items-center gap-2 mt-2 mb-4">
              <span className="text-[#F5F7FA] text-sm font-semibold px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>+976</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="89897803"
                inputMode="numeric"
                className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-3 text-[#F5F7FA] outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <label className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest">Нууц үг</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && phone.length === 8 && password.length >= 6) submit()
              }}
              placeholder="Нууц үг"
              className="w-full mt-2 mb-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-3 text-[#F5F7FA] outline-none focus:border-[#8B5CF6]"
            />
            <button
              onClick={submit}
              disabled={busy || phone.length !== 8 || password.length < 6}
              className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
            >
              {busy ? 'Нэвтэрч байна…' : 'Нэвтрэх'}
            </button>
            {error && <p className="text-[#F87171] text-sm mt-4">{error}</p>}
          </div>
        </AnimateIn>

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-4 text-sm text-[#4B5563] hover:text-[#9CA3AF]"
        >
          Хэрэглэгчээр нэвтрэх
        </button>
      </AnimateIn>
    </Layout>
  )
}
