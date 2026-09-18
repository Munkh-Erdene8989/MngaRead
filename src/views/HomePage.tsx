'use client'

import Layout from '@/components/Layout'
import MangaCard from '@/components/MangaCard'
import GenreChip from '@/components/GenreChip'
import ProgressBar from '@/components/ProgressBar'
import { useAuth } from '@/contexts/AuthContext'
import { useCatalog } from '@/contexts/CatalogContext'
import { useNavigate } from '@/lib/nav'

const GENRE_CHIPS = ['Адал явдал','Тулаан','Романтик','Фантази','Инээдэм','Нууцлаг','Амьдрал','Шинжлэх ухаан']

function SectionHeader({ title, href, label = 'Бүгдийг харах' }: { title: string; href?: string; label?: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 rounded-full" style={{ background: '#8B5CF6' }} />
        <h2 className="text-[#F5F7FA] text-lg font-bold tracking-tight">{title}</h2>
      </div>
      {href && (
        <button
          onClick={() => navigate(href)}
          className="text-xs font-medium text-[#9CA3AF] hover:text-[#8B5CF6] transition-colors flex items-center gap-1"
        >
          {label}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { isSaved, toggleSave, isGuest, library } = useAuth()
  const { list, getManga } = useCatalog()
  const featured = [...list].sort((a, b) => b.rating - a.rating)[0] || list[0]
  const popular = [...list].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 8)
  const newChapters = [...list].slice(0, 5)
  const recommended = [...list].slice().reverse().slice(0, 5)
  const saved = featured ? isSaved(featured.id) : false
  const continueReading = library
    .filter((item) => item.status === 'reading' && item.progress)
    .map((item) => {
      const manga = getManga(item.mangaId)
      return manga ? { ...manga, readProgress: item.progress } : null
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m))

  if (!featured) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] text-[#9CA3AF] text-sm">Ачааллаж байна…</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">

        {/* ── Featured Hero ── */}
        <section className="relative mt-4 md:mt-6 rounded-2xl overflow-hidden" style={{ minHeight: 420 }}>
          {/* Blurred cover backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${featured.coverImage})`,
              filter: 'blur(28px) saturate(1.4) brightness(0.4)',
              transform: 'scale(1.1)',
            }}
          />
          {/* Vignette */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(11,13,18,0.85) 0%,rgba(11,13,18,0.35) 60%,rgba(11,13,18,0.8) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#0B0D12 0%,transparent 55%)' }} />
          {/* Subtle grid texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 32px)' }} />
          {/* Manga halftone dots */}
          <div className="absolute inset-0 manga-dots opacity-40" />

          <div className="relative z-10 flex flex-col md:flex-row items-end gap-6 md:gap-10 p-5 md:p-10 pt-8">
            {/* Cover card */}
            <div className="hidden md:block flex-shrink-0">
              <div
                className="w-[180px] rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.7)] border"
                style={{ aspectRatio: '2/3', background: featured.coverColor, borderColor: 'rgba(255,255,255,0.12)' }}
              >
                <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 max-w-[560px]">
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.25)', color: '#C4B5FD' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#C4B5FD"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Топ Манга
                </span>
                <span className="text-xs text-[#9CA3AF]">{featured.year} он</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
                  {featured.status}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-[#F5F7FA] leading-none tracking-tight mb-2">
                {featured.title}
              </h1>
              <p className="text-sm text-[#9CA3AF] mb-4">
                Зохиогч: <span className="text-[#D1D5DB]">{featured.author}</span>
                <span className="mx-2 text-[#374151]">·</span>
                <span className="text-[#D1D5DB]">{featured.chapterCount} бүлэг</span>
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {featured.genres.map((g) => <GenreChip key={g} label={g} size="sm" />)}
              </div>

              <p className="text-sm text-[#9CA3AF] leading-relaxed mb-6 line-clamp-3 max-w-[480px]">
                {featured.synopsis}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(featured.rating) ? '#8B5CF6' : '#1F2937'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-[#F5F7FA] font-bold text-sm">{featured.rating}</span>
                <span className="text-[#9CA3AF] text-xs">({featured.ratingCount.toLocaleString()} үнэлгээ)</span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/manga/${featured.id}/read/1`)}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', boxShadow: '0 8px 24px rgba(139,92,246,0.4)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Уншиж эхлэх
                </button>
                <button
                  onClick={() => navigate(`/manga/${featured.id}`)}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-[#F5F7FA] border transition-all hover:bg-white/5"
                  style={{ borderColor: 'rgba(255,255,255,0.18)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  Дэлгэрэнгүй
                </button>
                <button
                  onClick={() => {
                    if (isGuest) navigate('/login?next=/')
                    else toggleSave(featured.id)
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                    saved
                      ? 'text-[#8B5CF6] border-[#8B5CF6] bg-[rgba(139,92,246,0.1)]'
                      : 'text-[#9CA3AF] border-[rgba(255,255,255,0.12)] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? '#8B5CF6' : 'none'} stroke={saved ? '#8B5CF6' : 'currentColor'} strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                  {saved ? 'Хадгалсан' : 'Хадгалах'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Continue Reading ── */}
        {continueReading.length > 0 && (
          <section className="mt-10">
            <SectionHeader title="Үргэлжлүүлэн унших" href="/library" />
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
              {continueReading.map((manga) => {
                const pct = Math.round((manga.readProgress!.chapter / manga.chapterCount) * 100)
                return (
                  <div
                    key={manga.id}
                    onClick={() => navigate(`/manga/${manga.id}/read/${manga.readProgress!.chapter}`)}
                    className="flex-shrink-0 w-[300px] rounded-2xl border cursor-pointer hover:border-[rgba(255,255,255,0.14)] transition-all group overflow-hidden"
                    style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}
                  >
                    {/* Top color band from cover */}
                    <div className="relative h-[6px]" style={{ background: `linear-gradient(90deg, ${manga.coverColor}, #8B5CF6)` }} />
                    <div className="p-4">
                      <div className="flex gap-3.5">
                        <div
                          className="w-[52px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg"
                          style={{ aspectRatio: '2/3', background: manga.coverColor }}
                        >
                          <img src={manga.coverImage} alt={manga.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <h3 className="text-[#F5F7FA] text-sm font-bold truncate leading-snug">{manga.title}</h3>
                          <p className="text-[#9CA3AF] text-xs mt-1">
                            Бүлэг <span className="text-[#A78BFA] font-semibold">{manga.readProgress!.chapter}</span>
                            <span className="text-[#374151] mx-1">/</span>
                            {manga.chapterCount}
                          </p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[#9CA3AF] text-[10px]">{pct}% уншсан</span>
                            </div>
                            <ProgressBar value={pct} />
                          </div>
                        </div>
                      </div>
                      <button
                        className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-[#8B5CF6] flex items-center justify-center gap-1.5 transition-colors group-hover:bg-[rgba(139,92,246,0.15)]"
                        style={{ background: 'rgba(139,92,246,0.1)' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Үргэлжлүүлэх
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Popular ── */}
        <section className="mt-10">
          <SectionHeader title="Эрэлттэй манга" href="/manga" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {popular.map((manga, i) => (
              <MangaCard key={manga.id} manga={manga} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* ── New Chapters ── */}
        <section className="mt-10">
          <SectionHeader title="Шинээр нэмэгдсэн бүлгүүд" />
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {newChapters.map((manga, i) => {
              const latestChapter = manga.chapters[manga.chapterCount - 1]
              return (
                <div
                  key={manga.id}
                  onClick={() => navigate(`/manga/${manga.id}`)}
                  className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors group ${i > 0 ? 'border-t' : ''}`}
                  style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div className="relative w-11 h-[66px] rounded-xl overflow-hidden flex-shrink-0 shadow-md" style={{ background: manga.coverColor }}>
                    <img src={manga.coverImage} alt={manga.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#F5F7FA] text-sm font-semibold truncate group-hover:text-[#A78BFA] transition-colors">{manga.title}</h3>
                    <p className="text-[#9CA3AF] text-xs mt-0.5 truncate">
                      <span className="text-[#8B5CF6] font-medium">Бүлэг {manga.chapterCount}</span>
                      <span className="mx-1.5 text-[#374151]">—</span>
                      {latestChapter?.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {manga.genres.slice(0, 2).map((g) => (
                        <span key={g} className="text-[10px] text-[#6B7280] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }}>{g}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[#9CA3AF] text-xs block">{latestChapter?.uploadedAt}</span>
                    <svg className="mt-1.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Genre chips strip ── */}
        <section className="mt-10">
          <SectionHeader title="Төрлөөр үзэх" href="/manga" />
          <div className="flex flex-wrap gap-2">
            {GENRE_CHIPS.map((g) => (
              <button
                key={g}
                onClick={() => navigate('/manga')}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#9CA3AF] border transition-all hover:text-[#F5F7FA] hover:border-[rgba(139,92,246,0.5)] hover:bg-[rgba(139,92,246,0.08)]"
                style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* ── Recommended ── */}
        <section className="mt-10 mb-10">
          <SectionHeader title="Танд санал болгох" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {recommended.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        </section>

      </div>
    </Layout>
  )
}
