'use client'

import Layout from '@/components/Layout'
import AnimateIn from '@/components/motion/AnimateIn'
import Stagger from '@/components/motion/Stagger'
import { GENRES } from '@/data/manga'
import { useNavigate } from '@/lib/nav'
import { useCatalog } from '@/contexts/CatalogContext'

const GENRE_META: Record<string, { color: string; accent: string; icon: React.ReactNode }> = {
  'Фантази': {
    color: '#1a1040',
    accent: '#8B5CF6',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  },
  'Тулаан': {
    color: '#1a0a0a',
    accent: '#EF4444',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M2 22l7.5-7.5"/></svg>,
  },
  'Адал явдал': {
    color: '#0a1a0a',
    accent: '#10B981',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  },
  'Романтик': {
    color: '#1a0a10',
    accent: '#F43F5E',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  },
  'Аниме': {
    color: '#0a0a1a',
    accent: '#3B82F6',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="3" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21" y2="12"/></svg>,
  },
  'Шинжлэх ухаан': {
    color: '#0a1218',
    accent: '#06B6D4',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
  },
  'Хошин': {
    color: '#1a1400',
    accent: '#F59E0B',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  },
  'Аймшиг': {
    color: '#0e0a12',
    accent: '#7C3AED',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
}

function getGenreMeta(genre: string) {
  return GENRE_META[genre] || { color: '#111827', accent: '#8B5CF6', icon: null }
}

export default function GenresPage() {
  const navigate = useNavigate()
  const { list } = useCatalog()

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 mt-6 pb-10">

        {/* Header */}
        <AnimateIn className="mb-8">
          <h1 className="text-[#F5F7FA] text-3xl font-extrabold tracking-tight mb-2">Төрлүүд</h1>
          <p className="text-[#9CA3AF] text-sm">{GENRES.length} төрөл байна — дуртай жанраа сонгоорой</p>
        </AnimateIn>

        {/* Genre grid */}
        <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {GENRES.map((genre) => {
            const meta = getGenreMeta(genre)
            const count = list.filter((m) => m.genres.includes(genre)).length
            const topManga = list.filter((m) => m.genres.includes(genre))[0]

            return (
              <button
                key={genre}
                onClick={() => {
                  navigate(`/manga?genre=${encodeURIComponent(genre)}`)
                }}
                className="group relative rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.03] hover:shadow-2xl"
                style={{ background: meta.color, border: '1px solid rgba(255,255,255,0.07)', minHeight: 140 }}
              >
                {/* Cover image bg */}
                {topManga && (
                  <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity">
                    <img src={topManga.coverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, ${meta.color}dd 0%, ${meta.color}88 100%)` }}
                />

                {/* Decorative accent orb */}
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30 blur-2xl transition-all group-hover:opacity-50"
                  style={{ background: meta.accent }}
                />

                {/* Content */}
                <div className="relative p-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ background: `${meta.accent}22`, color: meta.accent }}
                  >
                    {meta.icon}
                  </div>
                  <h3 className="text-[#F5F7FA] font-extrabold text-base">{genre}</h3>
                  <p className="text-[#6B7280] text-xs mt-1">{count} манга</p>

                  <div
                    className="inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-xl text-xs font-bold transition-all group-hover:translate-x-0.5"
                    style={{ background: `${meta.accent}22`, color: meta.accent }}
                  >
                    Харах
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              </button>
            )
          })}
        </Stagger>

        {/* Featured per genre */}
        <h2 className="text-[#F5F7FA] font-extrabold text-xl mb-5">Төрлөөр онцлох мангууд</h2>
        <div className="space-y-8">
          {GENRES.slice(0, 4).map((genre) => {
            const meta = getGenreMeta(genre)
            const mangaInGenre = list.filter((m) => m.genres.includes(genre)).slice(0, 4)
            if (mangaInGenre.length === 0) return null

            return (
              <div key={genre}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{ background: `${meta.accent}20`, color: meta.accent }}
                    >
                      {meta.icon && (
                        <div style={{ transform: 'scale(0.65)' }}>{meta.icon}</div>
                      )}
                    </div>
                    <h3 className="text-[#F5F7FA] font-bold">{genre}</h3>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${meta.accent}18`, color: meta.accent }}
                    >
                      {list.filter((m) => m.genres.includes(genre)).length} манга
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigate(`/manga?genre=${encodeURIComponent(genre)}`)
                    }}
                    className="text-sm font-semibold text-[#4B5563] hover:text-[#9CA3AF] transition-colors flex items-center gap-1"
                  >
                    Бүгдийг харах
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                  {mangaInGenre.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => navigate(`/manga/${m.id}`)}
                      className="flex-shrink-0 group text-left"
                      style={{ width: 130 }}
                    >
                      <div
                        className="rounded-2xl overflow-hidden transition-transform group-hover:scale-[1.03]"
                        style={{ aspectRatio: '2/3', background: m.coverColor }}
                      >
                        <img src={m.coverImage} alt={m.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[#F5F7FA] text-xs font-semibold mt-2 truncate group-hover:text-[#A78BFA] transition-colors">
                        {m.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="#8B5CF6">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="text-[#4B5563] text-[10px]">{m.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
