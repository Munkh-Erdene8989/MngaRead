'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import AnimateIn from '@/components/motion/AnimateIn'
import { AVATAR_OPTIONS, type SubPlan } from '@/data/store'
import { useNavigate } from '@/lib/nav'
import { useAuth } from '@/contexts/AuthContext'
import { useCatalog } from '@/contexts/CatalogContext'
import { formatMnDate, MONTHLY_PRICE, YEARLY_PRICE } from '@/lib/constants'

const STAT_ITEMS = [
  { label: 'Нийт уншсан', value: '24', sub: 'манга' },
  { label: 'Нийт бүлэг', value: '1,247', sub: 'бүлэг' },
  { label: 'Уншсан цаг', value: '186', sub: 'цаг' },
  { label: 'Дуусгасан', value: '8', sub: 'манга' },
]

const PLAN_LABELS: Record<SubPlan, string> = {
  none: 'Үнэгүй',
  monthly: 'Сарын захиалга',
  yearly: 'Жилийн захиалга',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, plan, planExpiresAt, purchases, library, isGuest, isAdmin, updateProfile, signOut, loading } = useAuth()
  const { getManga } = useCatalog()
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(profile?.name || '')
  const [draftBio, setDraftBio] = useState(profile?.bio || '')
  const [draftAvatar, setDraftAvatar] = useState(profile?.avatar || AVATAR_OPTIONS[0])
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<'profile' | 'subscription' | 'settings'>('profile')
  const [notifyOn, setNotifyOn] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('manga-notify') !== 'off'
  })
  const [sleepOn, setSleepOn] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('manga-sleep') === 'on'
  })

  useEffect(() => {
    if (!loading && isGuest) navigate('/login?next=/profile')
  }, [loading, isGuest, navigate])

  const saveProfile = async () => {
    await updateProfile({ name: draftName, bio: draftBio, avatar: draftAvatar })
    setEditing(false)
    setAvatarPickerOpen(false)
  }

  const cancelEdit = () => {
    setDraftName(profile?.name || '')
    setDraftBio(profile?.bio || '')
    setDraftAvatar(profile?.avatar || AVATAR_OPTIONS[0])
    setEditing(false)
    setAvatarPickerOpen(false)
  }

  const recentManga = library
    .filter((item) => item.progress)
    .slice(0, 4)
    .map((item) => {
      const manga = getManga(item.mangaId)
      return manga ? { ...manga, readProgress: item.progress } : null
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m))

  const stats = {
    manga: library.length,
    chapters: library.reduce((sum, item) => sum + (item.progress?.chapter || 0), 0),
    hours: Math.max(1, Math.round(library.reduce((sum, item) => sum + (item.progress?.chapter || 0), 0) * 0.12)),
    completed: library.filter((item) => item.status === 'completed').length,
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] text-[#9CA3AF] text-sm">Ачааллаж байна…</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 mt-6 pb-10">

        {/* Hero banner */}
        <AnimateIn className="relative rounded-3xl overflow-hidden mb-6" y={16}>
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#1a1040 0%,#0f1628 50%,#0B0D12 100%)' }}
          >
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl" style={{ background: '#8B5CF6' }} />
          <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full opacity-10 blur-3xl" style={{ background: '#6D28D9' }} />

          <div className="relative px-6 pt-6 pb-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden cursor-pointer"
                style={{ boxShadow: '0 0 0 2px #8B5CF6' }}
                onClick={() => editing && setAvatarPickerOpen(!avatarPickerOpen)}
              >
                <img src={editing ? draftAvatar : profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              </div>
              {editing && (
                <button
                  onClick={() => setAvatarPickerOpen(!avatarPickerOpen)}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ background: '#8B5CF6' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )}

              {/* Avatar picker */}
              {avatarPickerOpen && (
                <div
                  className="absolute top-full left-0 mt-2 p-3 rounded-2xl border z-20 flex gap-2 shadow-2xl fade-in"
                  style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  {AVATAR_OPTIONS.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => { setDraftAvatar(url); setAvatarPickerOpen(false) }}
                      className="w-11 h-11 rounded-xl overflow-hidden hover:ring-2 transition-all"
                      style={{ outlineColor: draftAvatar === url ? '#8B5CF6' : 'transparent', outline: draftAvatar === url ? '2px solid #8B5CF6' : undefined }}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Name / Bio */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(139,92,246,0.3)] rounded-xl px-3 py-2 text-[#F5F7FA] font-bold text-xl outline-none focus:border-[#8B5CF6]"
                    placeholder="Нэр"
                  />
                  <textarea
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    rows={2}
                    className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-[#9CA3AF] text-sm outline-none resize-none focus:border-[rgba(139,92,246,0.3)]"
                    placeholder="Танилцуулга"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-[#F5F7FA] font-extrabold text-2xl tracking-tight">{profile.name}</h1>
                  <p className="text-[#6B7280] text-sm mt-0.5">{profile.username}</p>
                  <p className="text-[#9CA3AF] text-sm mt-1 leading-relaxed">{profile.bio}</p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-[#9CA3AF] border border-[rgba(255,255,255,0.12)] hover:text-[#F5F7FA] transition-colors"
                  >
                    Болих
                  </button>
                  <button
                    onClick={saveProfile}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: '#8B5CF6' }}
                  >
                    Хадгалах
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#A78BFA] transition-colors"
                  style={{ background: 'rgba(139,92,246,0.12)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Засах
                </button>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div
            className="grid grid-cols-4 border-t px-6 py-4"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            {STAT_ITEMS.map((s, i) => (
              <div key={s.label} className="text-center">
                <div className="text-[#F5F7FA] font-extrabold text-xl">
                  {[stats.manga, stats.chapters.toLocaleString(), stats.hours, stats.completed][i]}
                </div>
                <div className="text-[#4B5563] text-[10px] mt-0.5 leading-snug">{s.sub}</div>
              </div>
            ))}
          </div>
          </div>
        </AnimateIn>

        {/* Section tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6 w-fit" style={{ background: '#151923' }}>
          {(['profile', 'subscription', 'settings'] as const).map((s) => {
            const labels = { profile: 'Профайл', subscription: 'Захиалга', settings: 'Тохиргоо' }
            return (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeSection === s ? 'text-[#F5F7FA]' : 'text-[#4B5563] hover:text-[#9CA3AF]'}`}
                style={activeSection === s ? { background: '#1c2333' } : {}}
              >
                {labels[s]}
              </button>
            )
          })}
        </div>

        {/* Profile section */}
        {activeSection === 'profile' && (
          <div className="grid md:grid-cols-2 gap-6 fade-in">
            {/* Recent activity */}
            <div className="rounded-2xl border p-5" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}>
              <h2 className="text-[#F5F7FA] font-bold mb-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Сүүлийн идэвхжил
              </h2>
              <div className="space-y-3">
                {recentManga.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/manga/${m.id}`)}
                    className="w-full flex items-center gap-3 group"
                  >
                    <div className="w-10 h-[52px] rounded-xl overflow-hidden flex-shrink-0" style={{ background: m.coverColor }}>
                      <img src={m.coverImage} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[#F5F7FA] text-sm font-semibold group-hover:text-[#A78BFA] transition-colors truncate">{m.title}</p>
                      <p className="text-[#4B5563] text-xs mt-0.5">
                        Б.{m.readProgress?.chapter}/{m.chapterCount}
                      </p>
                      <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ background: '#8B5CF6', width: `${m.readProgress ? Math.round(m.readProgress.chapter / m.chapterCount * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite genres */}
            <div className="rounded-2xl border p-5" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}>
              <h2 className="text-[#F5F7FA] font-bold mb-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                Дуртай төрлүүд
              </h2>
              <div className="space-y-2.5">
                {[
                  { genre: 'Фантази', pct: 82, count: 11 },
                  { genre: 'Тулаан', pct: 68, count: 9 },
                  { genre: 'Адал явдал', pct: 45, count: 6 },
                  { genre: 'Романтик', pct: 22, count: 3 },
                ].map((item) => (
                  <div key={item.genre}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#9CA3AF] text-sm">{item.genre}</span>
                      <span className="text-[#4B5563] text-xs">{item.count} манга</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{ background: 'linear-gradient(90deg,#8B5CF6,#6D28D9)', width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Subscription section */}
        {activeSection === 'subscription' && (
          <div className="fade-in">
            {/* Current plan */}
            <div
              className="relative rounded-2xl border p-5 mb-6 overflow-hidden"
              style={{ background: plan !== 'none' ? 'rgba(139,92,246,0.06)' : '#151923', borderColor: plan !== 'none' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.07)' }}
            >
              {plan !== 'none' && <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: '#8B5CF6', transform: 'translate(30%,-30%)' }} />}
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest mb-1">Одоогийн төлөвлөгөө</p>
                  <h3 className="text-[#F5F7FA] font-extrabold text-xl">{PLAN_LABELS[plan]}</h3>
                  {plan !== 'none' && planExpiresAt && (
                    <p className="text-[#6B7280] text-sm mt-1">
                      Дараагийн төлбөр: {formatMnDate(planExpiresAt)} — ₮{(plan === 'yearly' ? YEARLY_PRICE : MONTHLY_PRICE).toLocaleString()}
                    </p>
                  )}
                </div>
                {plan !== 'none' && (
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                )}
              </div>
              {plan !== 'none' && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: '#8B5CF6' }}
                  >
                    Шинэчлэх
                  </button>
                  <button className="px-4 py-2 rounded-xl text-sm font-semibold text-[#F87171] border border-[rgba(248,113,113,0.2)] hover:bg-[rgba(248,113,113,0.05)] transition-colors">
                    Цуцлах
                  </button>
                </div>
              )}
              {plan === 'none' && (
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: '#8B5CF6' }}
                  >
                    Захиалга авах
                  </button>
                </div>
              )}
            </div>

            {/* Purchase history */}
            <div className="rounded-2xl border p-5" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}>
              <h3 className="text-[#F5F7FA] font-bold mb-4">Худалдан авалтын түүх</h3>
              <div className="space-y-3">
                {purchases.length === 0 ? (
                  <p className="text-[#4B5563] text-sm">Худалдан авалт байхгүй</p>
                ) : purchases.map((item, i) => {
                  const manga = getManga(item.mangaId)
                  return (
                  <div key={`${item.mangaId}-${item.chapterNum}-${i}`} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-[#F5F7FA] text-sm font-semibold">{manga?.title || item.mangaId}</p>
                      <p className="text-[#4B5563] text-xs mt-0.5">Бүлэг {item.chapterNum}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#A78BFA] text-sm font-bold">₮990</p>
                      <p className="text-[#4B5563] text-xs mt-0.5">{item.purchasedAt?.slice(0, 10).replace(/-/g, '.')}</p>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </div>
        )}

        {/* Settings section */}
        {activeSection === 'settings' && (
          <div className="rounded-2xl border overflow-hidden fade-in" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}>
            {[
              { icon: '🔔', label: 'Мэдэгдэл', sub: 'Шинэ бүлэг, тусгай санал', toggle: true, on: notifyOn, set: (v: boolean) => { setNotifyOn(v); localStorage.setItem('manga-notify', v ? 'on' : 'off') } },
              { icon: '🌙', label: 'Унтах горим', sub: 'Дэлгэцийн тод байдлыг бууруулах', toggle: true, on: sleepOn, set: (v: boolean) => { setSleepOn(v); localStorage.setItem('manga-sleep', v ? 'on' : 'off') } },
              { icon: '📖', label: 'Унших горим', sub: 'Хуудас эргүүлэх / босоо гүйлгэх', toggle: false },
              { icon: '🌐', label: 'Хэл', sub: 'Монгол', toggle: false },
            ].map((item, i, arr) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors ${i < arr.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F7FA] text-sm font-semibold">{item.label}</p>
                  {item.sub && <p className="text-[#4B5563] text-xs mt-0.5">{item.sub}</p>}
                </div>
                {item.toggle ? (
                  <button
                    onClick={() => item.set?.(!item.on)}
                    className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
                    style={{ background: item.on ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                      style={{ left: item.on ? '22px' : '2px' }}
                    />
                  </button>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2.5" className="flex-shrink-0">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                )}
              </div>
            ))}

            {/* Sign out */}
            <div className="border-t p-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white mb-3"
                  style={{ background: '#8B5CF6' }}
                >
                  Хяналтын самбар
                </button>
              )}
              <button
                onClick={async () => { await signOut(); navigate('/') }}
                className="w-full py-3 rounded-xl text-sm font-bold text-[#F87171] border border-[rgba(248,113,113,0.15)] hover:bg-[rgba(248,113,113,0.05)] transition-colors"
              >
                Гарах
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
