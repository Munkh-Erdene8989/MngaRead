'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ProgressBar from '@/components/ProgressBar'
import { MANGA_LIST } from '@/data/manga'
import { useNavigate } from '@/lib/nav'
import { useAuth } from '@/contexts/AuthContext'

type Tab = 'reading' | 'saved' | 'completed'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'reading', label: 'Уншиж байгаа',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  },
  {
    id: 'saved', label: 'Хадгалсан',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  },
  {
    id: 'completed', label: 'Дуусгасан',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  },
]

export default function LibraryPage() {
  const navigate = useNavigate()
  const { isGuest, library, profile, removeFromLibrary, markCompleted } = useAuth()
  const [tab, setTab] = useState<Tab>('reading')
  const [contextMenu, setContextMenu] = useState<string | null>(null)

  const withManga = (status: Tab) =>
    library
      .filter((item) => item.status === status)
      .map((item) => {
        const manga = MANGA_LIST.find((m) => m.id === item.mangaId)
        if (!manga) return null
        return { ...manga, readProgress: item.progress }
      })
      .filter((m): m is NonNullable<typeof m> => Boolean(m))

  const readingList = withManga('reading')
  const savedList = withManga('saved')
  const completedList = withManga('completed')
  const currentList = tab === 'reading' ? readingList : tab === 'saved' ? savedList : completedList

  const counts = { reading: readingList.length, saved: savedList.length, completed: completedList.length }

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 mt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[#F5F7FA] text-2xl font-extrabold tracking-tight">Миний сан</h1>
            <p className="text-[#4B5563] text-sm mt-0.5">{readingList.length + savedList.length + completedList.length} манга</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white overflow-hidden" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}>
            {profile?.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" /> : (profile?.name?.[0] || 'М')}
          </div>
        </div>

        {/* Guest banner */}
        {isGuest && (
          <div
            className="flex items-start gap-4 p-4 rounded-2xl border mb-6"
            style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.15)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F5F7FA] text-sm font-bold mb-0.5">Зочин горимд байна</p>
              <p className="text-[#9CA3AF] text-xs leading-relaxed">
                Нэвтэрч орсноор таны уншилтын явц болон хадгалсан мангууд автоматаар хадгалагдана.
              </p>
            </div>
            <button
              onClick={() => navigate(`/login?next=/library`)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: '#8B5CF6' }}
            >
              Нэвтрэх
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6 w-fit" style={{ background: '#151923' }}>
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? 'text-[#F5F7FA]' : 'text-[#4B5563] hover:text-[#9CA3AF]'}`}
                style={active ? { background: '#1c2333' } : {}}
              >
                <span className={active ? 'text-[#8B5CF6]' : 'text-[#4B5563]'}>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? 'text-[#8B5CF6]' : 'text-[#4B5563]'}`}
                  style={{ background: active ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)' }}
                >
                  {counts[t.id]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Empty state */}
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center fade-in">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5" style={{ background: '#151923' }}>
              {tab === 'reading'
                ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                : tab === 'saved'
                ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
              }
            </div>
            <p className="text-[#F5F7FA] font-bold text-lg mb-2">
              {tab === 'reading' ? 'Одоо уншиж буй манга байхгүй' : tab === 'saved' ? 'Хадгалсан манга байхгүй' : 'Дуусгасан манга байхгүй'}
            </p>
            <p className="text-[#4B5563] text-sm mb-6 max-w-xs">
              {tab === 'reading' ? 'Манга унших үед явц автоматаар хадгалагдана' : tab === 'saved' ? 'Дуртай мангаагаа нэмэх товч дарна уу' : 'Манга дуусгаснаар энд харагдана'}
            </p>
            <button
              onClick={() => navigate('/manga')}
              className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: '#8B5CF6' }}
            >
              Манга үзэх
            </button>
          </div>
        ) : (
          <div className="space-y-2.5" onClick={() => setContextMenu(null)}>
            {currentList.map((manga) => {
              const pct = manga.readProgress
                ? Math.round((manga.readProgress.chapter / manga.chapterCount) * 100)
                : tab === 'completed' ? 100 : 0
              const isMenuOpen = contextMenu === manga.id

              return (
                <div
                  key={manga.id}
                  className="relative flex items-center gap-4 p-3.5 rounded-2xl border transition-all hover:border-[rgba(255,255,255,0.12)]"
                  style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}
                  onClick={(e) => { if (isMenuOpen) { e.stopPropagation(); setContextMenu(null) } }}
                >
                  {/* Cover */}
                  <div
                    onClick={(e) => { e.stopPropagation(); navigate(`/manga/${manga.id}`) }}
                    className="w-[52px] flex-shrink-0 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ aspectRatio: '2/3', background: manga.coverColor }}
                  >
                    <img src={manga.coverImage} alt={manga.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={(e) => { e.stopPropagation(); navigate(`/manga/${manga.id}`) }}
                      className="text-[#F5F7FA] font-bold text-sm cursor-pointer hover:text-[#A78BFA] transition-colors truncate"
                    >
                      {manga.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[#4B5563] text-xs">{manga.genres[0]}</span>
                      <span className="text-[#1F2937] text-xs">·</span>
                      {tab === 'reading' && manga.readProgress && (
                        <span className="text-[#4B5563] text-xs">
                          Б.<span className="text-[#9CA3AF]">{manga.readProgress.chapter}</span>/{manga.chapterCount}
                        </span>
                      )}
                      {tab === 'saved' && (
                        <span className="text-[#4B5563] text-xs">{manga.chapterCount} бүлэг</span>
                      )}
                      {tab === 'completed' && (
                        <span className="text-emerald-600 text-xs font-semibold">Дууссан</span>
                      )}
                    </div>
                    {tab !== 'saved' && (
                      <div className="mt-2 max-w-[220px]">
                        <ProgressBar value={pct} />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {tab === 'reading' && manga.readProgress && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/manga/${manga.id}/read/${manga.readProgress!.chapter}`) }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#A78BFA] transition-colors"
                        style={{ background: 'rgba(139,92,246,0.12)' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Үргэлжлүүлэх
                      </button>
                    )}
                    {tab === 'saved' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/manga/${manga.id}/read/1`) }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                        style={{ background: '#8B5CF6' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Унших
                      </button>
                    )}
                    {tab === 'completed' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/manga/${manga.id}/read/1`) }}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] border border-[rgba(255,255,255,0.08)] hover:text-[#F5F7FA] transition-colors"
                      >
                        Дахин
                      </button>
                    )}

                    {/* 3-dot menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setContextMenu(isMenuOpen ? null : manga.id) }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-[#4B5563] hover:text-[#9CA3AF] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                        </svg>
                      </button>
                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-full mt-1 w-44 rounded-2xl border overflow-hidden z-20 shadow-2xl fade-in"
                          style={{ background: '#1c2333', borderColor: 'rgba(255,255,255,0.1)' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => { navigate(`/manga/${manga.id}`); setContextMenu(null) }}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#F5F7FA] text-left hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            Дэлгэрэнгүй
                          </button>
                          {tab === 'reading' && (
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#4B5563] text-left hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                              onClick={() => { markCompleted(manga.id); setContextMenu(null) }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                              Дуусгасан болгох
                            </button>
                          )}
                          <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                          <button
                            onClick={() => { removeFromLibrary(manga.id); setContextMenu(null) }}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left hover:bg-[rgba(255,0,0,0.05)] transition-colors"
                            style={{ color: '#F87171' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                            Устгах
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
