'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import MangaCard from '@/components/MangaCard'
import GenreChip from '@/components/GenreChip'
import { getManga, getRelated } from '@/data/manga'
import { isChapterAccessible, isChapterFree } from '@/data/store'
import { useNavigate } from '@/lib/nav'
import { useAuth } from '@/contexts/AuthContext'

interface DetailPageProps { id: string }

export default function DetailPage({ id }: DetailPageProps) {
  const navigate = useNavigate()
  const manga = getManga(id)
  const { isGuest, isSaved, toggleSave, plan, purchases, library, profile } = useAuth()
  const saved = isSaved(id)
  const [synopsisExpanded, setSynopsisExpanded] = useState(false)
  const [chapterSearch, setChapterSearch] = useState('')
  const [chapterSortAsc, setChapterSortAsc] = useState(false)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  if (!manga) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: '#151923' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <p className="text-[#F5F7FA] font-bold text-xl mb-2">Манга олдсонгүй</p>
          <p className="text-[#9CA3AF] text-sm mb-6">Хайсан манга байхгүй байна</p>
          <button onClick={() => navigate('/manga')} className="px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ background: '#8B5CF6' }}>
            Манга үзэх
          </button>
        </div>
      </Layout>
    )
  }

  const related = getRelated(id)
  const libItem = library.find((item) => item.mangaId === id)
  const readChapterNum = libItem?.progress?.chapter ?? manga.readProgress?.chapter ?? 0

  const filteredChapters = manga.chapters
    .filter((c) => {
      if (!chapterSearch) return true
      return c.number.toString().includes(chapterSearch) || c.title.toLowerCase().includes(chapterSearch.toLowerCase())
    })
    .slice()
    .sort((a, b) => chapterSortAsc ? a.number - b.number : b.number - a.number)

  const COMMENTS = [
    { id: 'c1', user: 'Б. Нарантуяа', avatar: 'Н', color: '#7C3AED', text: 'Энэ бүлэг маш гайхалтай байсан! Зохиогч нь хэзээ ч гэсэн уншигчдыг бууруулдаггүй. Тулааны дүр зургууд маш хурц, тод байлаа.', time: '2 цаг өмнө', likes: 48 },
    { id: 'c2', user: 'Д. Батжаргал', avatar: 'Д', color: '#0891B2', text: 'Уран зургийн чанар өмнөхтэй харьцуулахад маш их сайжирсан. Дараагийн бүлгийг тэсэн ядан хүлээж байна! 🔥', time: '5 цаг өмнө', likes: 32 },
    { id: 'c3', user: 'Э. Мөнхзул', avatar: 'М', color: '#059669', text: 'Гол дүрийн хөгжил надад их таалагдаж байна. Монгол мангад ийм гүнзгий дүр байх нь ховор. Зохиогчид баяр хүргэе!', time: '1 өдөр өмнө', likes: 71 },
  ]

  const toggleLike = (cid: string) =>
    setLikedComments((prev) => { const n = new Set(prev); if (n.has(cid)) n.delete(cid); else n.add(cid); return n })

  const readPct = readChapterNum > 0 ? Math.round((readChapterNum / manga.chapterCount) * 100) : 0

  return (
    <Layout>
      {/* ── Backdrop ── */}
      <div className="fixed top-0 left-0 right-0 h-[500px] pointer-events-none z-0" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${manga.coverImage})`, filter: 'blur(32px) saturate(1.2) brightness(0.25)', transform: 'scale(1.1)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(11,13,18,0.3) 0%,#0B0D12 100%)' }} />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-6" style={{ zIndex: 1 }}>

        {/* ── Back ── */}
        <button
          onClick={() => navigate('/manga')}
          className="flex items-center gap-2 mt-5 text-[#9CA3AF] hover:text-[#F5F7FA] transition-colors text-sm font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Буцах
        </button>

        {/* ── Hero ── */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mt-6">

          {/* Cover */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div
              className="relative w-[160px] md:w-[220px] rounded-2xl overflow-hidden"
              style={{ aspectRatio: '2/3', boxShadow: '0 32px 64px rgba(0,0,0,0.8)', background: manga.coverColor }}
            >
              <img src={manga.coverImage} alt={manga.title} className="w-full h-full object-cover" />
              {/* Status tag on cover */}
              <div
                className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center text-xs font-bold"
                style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.85),transparent)' }}
              >
                <span className={manga.status === 'Үргэлжилж буй' ? 'text-[#A78BFA]' : 'text-[#9CA3AF]'}>
                  {manga.status}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">

            {/* Tags row */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3 flex-wrap">
              {manga.tags?.map((tag) => (
                <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.2)', color: '#C4B5FD' }}>
                  {tag}
                </span>
              ))}
              <span className="text-xs text-[#9CA3AF]">{manga.year} он</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-[#F5F7FA] leading-tight tracking-tight">{manga.title}</h1>

            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-sm">
              <span className="text-[#9CA3AF]">Зохиогч:</span>
              <span className="text-[#F5F7FA] font-medium">{manga.author}</span>
              <span className="text-[#374151]">·</span>
              <span className="text-[#9CA3AF]">Зураач:</span>
              <span className="text-[#F5F7FA] font-medium">{manga.artist}</span>
            </div>

            {/* Rating row */}
            <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.floor(manga.rating) ? '#8B5CF6' : s - 0.5 <= manga.rating ? '#8B5CF6' : '#1F2937'} opacity={s <= Math.floor(manga.rating) ? 1 : s - 0.5 <= manga.rating ? 0.6 : 1}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span className="text-[#F5F7FA] font-bold">{manga.rating}</span>
              <span className="text-[#9CA3AF] text-xs">{manga.ratingCount.toLocaleString()} үнэлгээ</span>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center md:justify-start gap-0 mt-4 rounded-2xl overflow-hidden border w-fit mx-auto md:mx-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {[
                { label: 'Бүлэг', value: manga.chapterCount },
                { label: 'Уншигч', value: `${(manga.ratingCount / 1000).toFixed(0)}к` },
                { label: 'Жил', value: manga.year },
              ].map((s, i) => (
                <div key={s.label} className={`px-5 py-3 text-center ${i > 0 ? 'border-l' : ''}`} style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-[#F5F7FA] font-bold text-base leading-none">{s.value}</p>
                  <p className="text-[#9CA3AF] text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              {manga.genres.map((g) => <GenreChip key={g} label={g} />)}
            </div>

            {/* Synopsis */}
            <div className="mt-4 max-w-[560px] mx-auto md:mx-0">
              <p className={`text-sm text-[#9CA3AF] leading-relaxed ${synopsisExpanded ? '' : 'line-clamp-3'}`}>
                {manga.synopsis}
              </p>
              <button
                onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                className="text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] mt-1.5 transition-colors"
              >
                {synopsisExpanded ? '↑ Хураангуйлах' : '↓ Дэлгэрэнгүй'}
              </button>
            </div>

            {/* Read progress bar */}
            {readChapterNum > 0 && (
              <div className="mt-4 max-w-[320px] mx-auto md:mx-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#9CA3AF]">Бүлэг {readChapterNum}/{manga.chapterCount} уншсан</span>
                  <span className="text-xs font-semibold text-[#8B5CF6]">{readPct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="h-full rounded-full" style={{ width: `${readPct}%`, background: 'linear-gradient(90deg,#8B5CF6,#6D28D9)' }} />
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
              <button
                onClick={() => navigate(`/manga/${manga.id}/read/1`)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', boxShadow: '0 4px 16px rgba(139,92,246,0.4)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Эхнээс нь унших
              </button>
              {libItem?.progress && (
                <button
                  onClick={() => navigate(`/manga/${manga.id}/read/${libItem.progress!.chapter}`)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-[#8B5CF6] border transition-all hover:bg-[rgba(139,92,246,0.1)]"
                  style={{ borderColor: '#8B5CF6' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                    <line x1="19" y1="3" x2="19" y2="21"/>
                  </svg>
                  Үргэлжлүүлэх
                </button>
              )}
              <button
                onClick={() => {
                  if (isGuest) navigate(`/login?next=/manga/${manga.id}`)
                  else toggleSave(manga.id)
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border ${
                  saved ? 'text-[#8B5CF6] border-[#8B5CF6] bg-[rgba(139,92,246,0.08)]'
                        : 'text-[#9CA3AF] border-[rgba(255,255,255,0.1)] hover:border-white/20 hover:text-white'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? '#8B5CF6' : 'none'} stroke={saved ? '#8B5CF6' : 'currentColor'} strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
                {saved ? 'Хадгалсан' : 'Санд хадгалах'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Chapter List ── */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full" style={{ background: '#8B5CF6' }} />
              <h2 className="text-[#F5F7FA] font-bold text-lg">{manga.chapterCount} бүлэг</h2>
            </div>
            <button
              onClick={() => setChapterSortAsc(!chapterSortAsc)}
              className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-[#F5F7FA] transition-colors px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.14)]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {chapterSortAsc
                  ? <><path d="M7 15l5-5 5 5"/></>
                  : <><path d="M7 9l5 5 5-5"/></>
                }
              </svg>
              {chapterSortAsc ? 'Эхнээс' : 'Сүүлээс'}
            </button>
          </div>

          {/* Chapter search */}
          <div className="relative mb-3">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              placeholder="Бүлэг хайх…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-[#F5F7FA] border outline-none placeholder:text-[#4B5563]"
              style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.08)' }}
            />
          </div>

          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {filteredChapters.slice(0, 30).map((chapter, i) => {
              const isCurrent = chapter.number === readChapterNum
              const isRead = chapter.read
              const isPremiumLocked = !isChapterAccessible(chapter.number, manga.chapterCount, plan, purchases, manga.id)
              const isPremium = isPremiumLocked
              return (
                <button
                  key={chapter.id}
                  onClick={() => {
                    if (isPremiumLocked) {
                      if (isGuest) {
                        navigate(`/login?next=/payment?manga=${manga.id}&chapter=${chapter.number}&mode=buy`)
                        return
                      }
                      navigate(`/payment?manga=${manga.id}&chapter=${chapter.number}&mode=buy`)
                    } else {
                      navigate(`/manga/${manga.id}/read/${chapter.number}`)
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors group ${i > 0 ? 'border-t' : ''} ${
                    isCurrent ? 'bg-[rgba(139,92,246,0.07)]' : 'bg-[#151923] hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  {/* Chapter number */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    isCurrent ? 'text-white' : isPremium ? 'text-[#6B7280]' : isRead ? 'text-[#4B5563]' : 'text-[#9CA3AF]'
                  }`} style={{ background: isCurrent ? 'linear-gradient(135deg,#8B5CF6,#6D28D9)' : isPremium ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.04)' }}>
                    {isPremium ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    ) : chapter.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${isCurrent ? 'text-[#A78BFA]' : isPremium ? 'text-[#4B5563]' : isRead ? 'text-[#4B5563]' : 'text-[#F5F7FA]'} group-hover:text-[#A78BFA] transition-colors`}>
                        {chapter.title}
                      </p>
                      {isCurrent && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.2)', color: '#A78BFA' }}>
                          ОДОО
                        </span>
                      )}
                      {isPremium && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                          ₮990
                        </span>
                      )}
                    </div>
                    <p className="text-[#4B5563] text-xs mt-0.5">{chapter.pages} хуудас · {chapter.uploadedAt}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isRead && !isCurrent && !isPremium && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D4A38" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {isPremium ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl text-[#A78BFA]" style={{ background: 'rgba(139,92,246,0.12)' }}>
                        Авах
                      </span>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2" className="group-hover:stroke-[#8B5CF6] transition-colors">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
            {filteredChapters.length > 30 && (
              <div className="px-4 py-4 text-center border-t" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.05)' }}>
                <button className="text-sm text-[#8B5CF6] hover:text-[#A78BFA] transition-colors font-medium">
                  Үлдсэн {filteredChapters.length - 30} бүлгийг харах
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Related ── */}
        {related.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: '#8B5CF6' }} />
              <h2 className="text-[#F5F7FA] font-bold text-lg">Төстэй манга</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {related.map((m) => <MangaCard key={m.id} manga={m} />)}
            </div>
          </section>
        )}

        {/* ── Comments ── */}
        <section className="mt-12 mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full" style={{ background: '#8B5CF6' }} />
              <h2 className="text-[#F5F7FA] font-bold text-lg">Сэтгэгдэл</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
                {COMMENTS.length}
              </span>
            </div>
          </div>

          {/* Comment composer */}
          <div className="flex gap-3 mb-5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}>
              {profile?.name?.[0] || 'М'}
            </div>
            <div className="flex-1 rounded-2xl border px-4 py-3 text-sm" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.08)' }}>
              <input
                placeholder="Сэтгэгдлээ бичнэ үү…"
                className="w-full bg-transparent text-[#F5F7FA] outline-none placeholder:text-[#4B5563] text-sm"
              />
              <div className="flex items-center justify-end mt-3 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#8B5CF6' }}>
                  Илгээх
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {COMMENTS.map((c) => {
              const liked = likedComments.has(c.id)
              return (
                <div key={c.id} className="flex gap-3 p-4 rounded-2xl border transition-colors hover:border-[rgba(255,255,255,0.1)]" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: c.color }}>
                    {c.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#F5F7FA] text-sm font-bold">{c.user}</span>
                      <span className="text-[#4B5563] text-xs">{c.time}</span>
                    </div>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed">{c.text}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => toggleLike(c.id)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? 'text-[#8B5CF6]' : 'text-[#4B5563] hover:text-[#9CA3AF]'}`}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? '#8B5CF6' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
                          <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                        </svg>
                        {c.likes + (liked ? 1 : 0)}
                      </button>
                      <button className="text-xs text-[#4B5563] hover:text-[#9CA3AF] transition-colors font-medium">
                        Хариулах
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </Layout>
  )
}
