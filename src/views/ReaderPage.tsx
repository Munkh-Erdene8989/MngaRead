'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { READER_PAGES } from '@/data/manga'
import { isChapterAccessible } from '@/data/store'
import { useNavigate } from '@/lib/nav'
import { useAuth } from '@/contexts/AuthContext'
import { useCatalog } from '@/contexts/CatalogContext'

interface ReaderPageProps { id: string; chapter: string }

type ReadMode = 'vertical' | 'paginated'
type BgColor = 'black' | 'white' | 'sepia'
type Direction = 'rtl' | 'ltr'

const BG: Record<BgColor, { page: string; ui: string; text: string }> = {
  black: { page: '#0a0a0a', ui: 'rgba(0,0,0,0.92)', text: '#F5F7FA' },
  white: { page: '#F5F5F5', ui: 'rgba(245,245,245,0.95)', text: '#1a1a1a' },
  sepia: { page: '#F4ECD8', ui: 'rgba(244,236,216,0.95)', text: '#2C1A00' },
}

export default function ReaderPage({ id, chapter }: ReaderPageProps) {
  const navigate = useNavigate()
  const { getManga } = useCatalog()
  const manga = getManga(id)
  const chapterNum = parseInt(chapter, 10) || 1
  const { isGuest, plan, purchases, updateProgress, loading } = useAuth()

  const [controlsVisible, setControlsVisible] = useState(true)
  const [readMode, setReadMode] = useState<ReadMode>('vertical')
  const [bgColor, setBgColor] = useState<BgColor>('black')
  const [direction, setDirection] = useState<Direction>('rtl')
  const [imageWidth, setImageWidth] = useState(80)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [chapterSelectorOpen, setChapterSelectorOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [brokenPages, setBrokenPages] = useState<Set<number>>(new Set())
  const [fullscreen, setFullscreen] = useState(false)
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set())
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pages = READER_PAGES
  const totalPages = pages.length
  const hasNext = chapterNum < (manga?.chapterCount ?? 1)
  const hasPrev = chapterNum > 1

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setControlsVisible(false), 4000)
  }, [])

  useEffect(() => {
    if (controlsVisible) scheduleHide()
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current) }
  }, [controlsVisible, scheduleHide])

  const goNext = useCallback(() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1)), [totalPages])
  const goPrev = useCallback(() => setCurrentPage((p) => Math.max(p - 1, 0)), [])

  const handleAreaClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if (readMode === 'paginated') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left
      const third = rect.width / 3
      if (x < third) { direction === 'rtl' ? goNext() : goPrev() }
      else if (x > third * 2) { direction === 'rtl' ? goPrev() : goNext() }
      else { setControlsVisible((v) => !v) }
    } else {
      setControlsVisible((v) => !v)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {})
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (readMode !== 'paginated') return
      if (e.key === 'ArrowRight') direction === 'rtl' ? goPrev() : goNext()
      if (e.key === 'ArrowLeft') direction === 'rtl' ? goNext() : goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [readMode, direction, goNext, goPrev])

  useEffect(() => {
    if (!manga || loading) return
    const allowed = isChapterAccessible(chapterNum, manga.chapterCount, plan, purchases, manga.id)
    if (!allowed) {
      if (isGuest) {
        navigate(`/login?next=/payment?manga=${manga.id}&chapter=${chapterNum}&mode=buy`)
      } else {
        navigate(`/payment?manga=${manga.id}&chapter=${chapterNum}&mode=buy`)
      }
      return
    }
    const pagesCount = manga.chapters.find((c) => c.number === chapterNum)?.pages ?? 18
    updateProgress(manga.id, chapterNum, 1, pagesCount, manga.chapterCount)
  }, [manga, chapterNum, plan, purchases, isGuest, loading, navigate, updateProgress])

  if (!manga) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0D12' }}>
        <div className="text-center">
          <p className="text-[#F5F7FA] font-bold text-xl mb-4">Манга олдсонгүй</p>
          <button onClick={() => navigate('/manga')} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#8B5CF6' }}>
            Буцах
          </button>
        </div>
      </div>
    )
  }

  const chapterData = manga.chapters.find((c) => c.number === chapterNum)
  const theme = BG[bgColor]
  const uiBorderColor = bgColor === 'black' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const uiTextMuted = bgColor === 'black' ? '#9CA3AF' : '#6B7280'
  const uiAccent = '#8B5CF6'

  const maxWidthStyle = readMode === 'paginated'
    ? { maxWidth: `min(${imageWidth}vw, 900px)` }
    : { width: `min(${imageWidth}%, 900px)`, maxWidth: '100%' }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.page, color: theme.text, userSelect: 'none' }}>

      {/* ── Top bar ── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-3 gap-2 transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${uiBorderColor}` }}
      >
        {/* Back */}
        <button
          onClick={() => navigate(`/manga/${manga.id}`)}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors flex-shrink-0"
          style={{ color: '#9CA3AF' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {/* Title + Chapter */}
        <div className="flex-1 min-w-0 ml-1">
          <p className="text-[#F5F7FA] text-sm font-bold truncate leading-tight">{manga.title}</p>
          <p className="text-xs leading-tight mt-0.5" style={{ color: uiTextMuted }}>
            Бүлэг {chapterNum}
            {chapterData && <span> · {chapterData.pages} хуудас</span>}
          </p>
        </div>

        {/* Chapter selector */}
        <div className="relative">
          <button
            onClick={() => { setChapterSelectorOpen(!chapterSelectorOpen); setSettingsOpen(false) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ color: chapterSelectorOpen ? '#A78BFA' : '#9CA3AF', background: chapterSelectorOpen ? 'rgba(139,92,246,0.15)' : 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            Бүлэг
          </button>
          {chapterSelectorOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-2xl border overflow-hidden z-50 shadow-2xl"
              style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.1)', maxHeight: '60vh', overflowY: 'auto' }}
            >
              <div className="px-3 py-2 border-b sticky top-0" style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[#9CA3AF] text-xs font-semibold">Бүлэг сонгох</p>
              </div>
              {manga.chapters.slice(0, 30).map((c) => (
                <button
                  key={c.id}
                  onClick={() => { navigate(`/manga/${manga.id}/read/${c.number}`); setChapterSelectorOpen(false) }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-[rgba(255,255,255,0.05)] ${c.number === chapterNum ? 'text-[#A78BFA]' : c.read ? 'text-[#4B5563]' : 'text-[#F5F7FA]'}`}
                >
                  <span>Бүлэг {c.number}</span>
                  <div className="flex items-center gap-1.5">
                    {c.read && c.number !== chapterNum && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2D4A38" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {c.number === chapterNum && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8B5CF6' }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => { setSettingsOpen(!settingsOpen); setChapterSelectorOpen(false) }}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors flex-shrink-0"
          style={{ color: settingsOpen ? '#A78BFA' : '#9CA3AF', background: settingsOpen ? 'rgba(139,92,246,0.15)' : 'transparent' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* ── Settings Panel ── */}
      {settingsOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} />
          <div
            className="absolute top-14 right-0 bottom-0 w-80 overflow-y-auto slide-right"
            style={{ background: '#0E1017', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-6">
              <div>
                <h3 className="text-[#F5F7FA] font-bold text-base mb-1">Тохиргоо</h3>
                <p className="text-[#4B5563] text-xs">Унших тохиргоог өөрчлөх</p>
              </div>

              {/* Read Mode */}
              <div>
                <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest mb-3">Унших горим</p>
                <div className="grid grid-cols-2 gap-2">
                  {([['vertical','↕','Босоо гүйлгэх'],['paginated','⇔','Хуудасчлан']] as const).map(([m, icon, label]) => (
                    <button
                      key={m}
                      onClick={() => setReadMode(m)}
                      className={`py-3 rounded-xl text-sm font-semibold flex flex-col items-center gap-1 transition-all border ${readMode === m ? 'border-[#8B5CF6] text-[#A78BFA]' : 'border-[rgba(255,255,255,0.08)] text-[#9CA3AF] hover:border-[rgba(255,255,255,0.15)]'}`}
                      style={{ background: readMode === m ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)' }}
                    >
                      <span className="text-lg">{icon}</span>
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direction (paginated only) */}
              {readMode === 'paginated' && (
                <div>
                  <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest mb-3">Чиглэл</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([['rtl','→←','Баруун ← Зүүн'],['ltr','←→','Зүүн → Баруун']] as const).map(([d, icon, label]) => (
                      <button
                        key={d}
                        onClick={() => setDirection(d)}
                        className={`py-3 rounded-xl text-xs font-semibold transition-all border ${direction === d ? 'border-[#8B5CF6] text-[#A78BFA]' : 'border-[rgba(255,255,255,0.08)] text-[#9CA3AF] hover:border-[rgba(255,255,255,0.15)]'}`}
                        style={{ background: direction === d ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)' }}
                      >
                        <div className="text-base mb-0.5">{icon}</div>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Background */}
              <div>
                <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest mb-3">Арын өнгө</p>
                <div className="flex gap-2">
                  {([['black','#0a0a0a','Хар'],['white','#F5F5F5','Цагаан'],['sepia','#F4ECD8','Сепиа']] as const).map(([c, hex, label]) => (
                    <button
                      key={c}
                      onClick={() => setBgColor(c)}
                      className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center gap-1 ${bgColor === c ? 'border-[#8B5CF6]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]'}`}
                      style={{ background: hex, color: c === 'black' ? '#F5F7FA' : '#1a1a1a' }}
                    >
                      {bgColor === c && <div className="w-3 h-3 rounded-full" style={{ background: '#8B5CF6' }} />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image width */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest">Зургийн өргөн</p>
                  <span className="text-[#8B5CF6] text-sm font-bold">{imageWidth}%</span>
                </div>
                <input
                  type="range" min={40} max={100} step={5} value={imageWidth}
                  onChange={(e) => setImageWidth(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: '#8B5CF6' }}
                />
                <div className="flex justify-between text-[#4B5563] text-xs mt-1.5">
                  <span>Жижиг</span><span>Бүтэн</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reading Area ── */}
      <div className="flex-1 pt-14 pb-14" onClick={handleAreaClick} style={{ cursor: readMode === 'paginated' ? 'pointer' : 'default' }}>

        {readMode === 'vertical' ? (
          /* Vertical scroll */
          <div className="flex flex-col items-center py-4" style={{ gap: '2px' }}>
            {pages.map((src, i) => (
              <div key={i} className="relative" style={maxWidthStyle}>
                {brokenPages.has(i) ? (
                  <div
                    className="w-full flex flex-col items-center justify-center gap-3 py-20"
                    style={{ background: 'rgba(255,255,255,0.03)', aspectRatio: '3/4' }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <p className="text-[#4B5563] text-sm">Зураг ачааллагдсангүй</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setBrokenPages((prev) => { const n = new Set(prev); n.delete(i); return n }) }}
                      className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                      style={{ background: '#8B5CF6' }}
                    >
                      Дахин оролдох
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {!loadedPages.has(i) && (
                      <div className="absolute inset-0 skeleton" style={{ aspectRatio: '3/4' }} />
                    )}
                    <img
                      src={src}
                      alt={`Хуудас ${i + 1}`}
                      className="w-full block"
                      loading={i < 3 ? 'eager' : 'lazy'}
                      draggable={false}
                      onLoad={() => setLoadedPages((prev) => new Set([...prev, i]))}
                      onError={() => setBrokenPages((prev) => new Set([...prev, i]))}
                      style={{ display: loadedPages.has(i) ? 'block' : 'block', opacity: loadedPages.has(i) ? 1 : 0, transition: 'opacity 0.3s' }}
                    />
                    {/* Page number badge */}
                    <div
                      className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{ background: 'rgba(0,0,0,0.55)', color: '#9CA3AF', backdropFilter: 'blur(4px)' }}
                    >
                      {i + 1}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* End of chapter */}
            <div className="py-12 px-4 w-full max-w-[560px] mx-auto mt-4" onClick={(e) => e.stopPropagation()}>
              <div
                className="rounded-3xl border p-8 text-center"
                style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </div>
                <p className="text-[#F5F7FA] font-extrabold text-xl mb-1">Бүлэг {chapterNum} дууслаа!</p>
                <p className="text-[#9CA3AF] text-sm mb-1">{manga.title}</p>
                <p className="text-[#4B5563] text-xs mb-6">{totalPages} хуудас уншлаа</p>
                {hasNext ? (
                  <button
                    onClick={() => navigate(`/manga/${manga.id}/read/${chapterNum + 1}`)}
                    className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white mb-3 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', boxShadow: '0 8px 24px rgba(139,92,246,0.4)' }}
                  >
                    Дараагийн бүлэг
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ) : (
                  <div className="mb-3 py-3 rounded-2xl text-sm text-[#4B5563] border border-[rgba(255,255,255,0.06)]">
                    Энэ бол сүүлийн бүлэг
                  </div>
                )}
                <button
                  onClick={() => navigate(`/manga/${manga.id}`)}
                  className="w-full py-3 rounded-2xl text-sm font-semibold text-[#9CA3AF] border border-[rgba(255,255,255,0.08)] hover:text-[#F5F7FA] transition-colors"
                >
                  Манга хуудас руу буцах
                </button>
              </div>
            </div>
          </div>

        ) : (
          /* Paginated */
          <div className="h-full flex items-center justify-center" style={{ minHeight: 'calc(100vh - 112px)' }}>
            {currentPage < totalPages && (
              <div className="relative flex items-center justify-center" style={maxWidthStyle}>
                {brokenPages.has(currentPage) ? (
                  <div
                    className="w-full flex flex-col items-center justify-center gap-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', aspectRatio: '3/4' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-[#4B5563] text-sm">Зураг ачааллагдсангүй</p>
                    <button
                      onClick={() => setBrokenPages((prev) => { const n = new Set(prev); n.delete(currentPage); return n })}
                      className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                      style={{ background: '#8B5CF6' }}
                    >
                      Дахин оролдох
                    </button>
                  </div>
                ) : (
                  <img
                    key={currentPage}
                    src={pages[currentPage]}
                    alt={`Хуудас ${currentPage + 1}`}
                    className="block fade-in"
                    draggable={false}
                    style={{ maxHeight: 'calc(100vh - 112px)', width: '100%', objectFit: 'contain' }}
                    onError={() => setBrokenPages((prev) => new Set([...prev, currentPage]))}
                  />
                )}
              </div>
            )}

            {/* End overlay in paginated mode */}
            {currentPage >= totalPages - 1 && (
              <div
                className="fixed inset-0 flex items-center justify-center z-30 fade-in"
                style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="rounded-3xl border p-8 text-center max-w-sm mx-4" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                  </div>
                  <p className="text-[#F5F7FA] font-extrabold text-xl mb-1">Бүлэг {chapterNum} дууслаа!</p>
                  <p className="text-[#9CA3AF] text-sm mb-6">{manga.title}</p>
                  {hasNext && (
                    <button
                      onClick={() => navigate(`/manga/${manga.id}/read/${chapterNum + 1}`)}
                      className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white mb-3"
                      style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
                    >
                      Дараагийн бүлэг →
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/manga/${manga.id}`)}
                    className="w-full py-3 rounded-2xl text-sm font-semibold text-[#9CA3AF] border border-[rgba(255,255,255,0.1)]"
                  >
                    Буцах
                  </button>
                </div>
              </div>
            )}

            {/* Side tap arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); direction === 'rtl' ? goNext() : goPrev() }}
              className={`fixed left-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${controlsVisible ? 'opacity-60 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); direction === 'rtl' ? goPrev() : goNext() }}
              className={`fixed right-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${controlsVisible ? 'opacity-60 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 flex items-center h-14 px-3 gap-2 transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${uiBorderColor}` }}
      >
        {/* Prev chapter */}
        <button
          onClick={() => hasPrev && navigate(`/manga/${manga.id}/read/${chapterNum - 1}`)}
          disabled={!hasPrev}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-25"
          style={{ color: '#9CA3AF' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span className="hidden sm:inline">Өмнөх</span>
        </button>

        {/* Progress */}
        <div className="flex-1 flex items-center gap-2.5">
          {readMode === 'paginated' ? (
            <>
              <span className="text-xs flex-shrink-0" style={{ color: uiTextMuted }}>{currentPage + 1}</span>
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${((currentPage + 1) / totalPages) * 100}%`, background: uiAccent }}
                />
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: uiTextMuted }}>{totalPages}</span>
            </>
          ) : (
            <div className="flex-1 text-center text-xs font-medium" style={{ color: uiTextMuted }}>
              Б.{chapterNum} · {chapterData?.pages ?? totalPages} хуудас
            </div>
          )}
        </div>

        {/* Next chapter */}
        <button
          onClick={() => hasNext && navigate(`/manga/${manga.id}/read/${chapterNum + 1}`)}
          disabled={!hasNext}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-25"
          style={{ color: hasNext ? uiAccent : '#9CA3AF' }}
        >
          <span className="hidden sm:inline">Дараагийн</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors flex-shrink-0"
          style={{ color: '#9CA3AF' }}
        >
          {fullscreen
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
          }
        </button>
      </div>
    </div>
  )
}
