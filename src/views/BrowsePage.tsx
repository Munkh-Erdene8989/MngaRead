'use client'

import { useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import MangaCard from '@/components/MangaCard'
import GenreChip from '@/components/GenreChip'
import AnimateIn from '@/components/motion/AnimateIn'
import Stagger from '@/components/motion/Stagger'
import { GENRES } from '@/data/manga'
import { useNavigate } from '@/lib/nav'
import { useCatalog } from '@/contexts/CatalogContext'

const STATUSES = ['Үргэлжилж буй', 'Дууссан']
const SORTS = [
  { id: 'popular', label: 'Эрэлттэй' },
  { id: 'new', label: 'Шинэ' },
  { id: 'updated', label: 'Шинэчлэгдсэн' },
]
const YEARS = ['2024', '2023', '2022', '2021', '2020', '2019', '2018']

export default function BrowsePage() {
  const navigate = useNavigate()
  const { list } = useCatalog()
  const searchParams = useSearchParams()
  const initialQ = searchParams?.get('q') || ''
  const initialGenre = searchParams?.get('genre')

  const [query, setQuery] = useState(initialQ)
  const [inputVal, setInputVal] = useState(initialQ)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenre ? [initialGenre] : [])
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [sort, setSort] = useState('popular')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = inputVal.length > 0
    ? list.filter((m) =>
        m.title.toLowerCase().includes(inputVal.toLowerCase()) ||
        m.author.toLowerCase().includes(inputVal.toLowerCase())
      ).slice(0, 6)
    : []

  const filtered = list.filter((m) => {
    if (query && !m.title.toLowerCase().includes(query.toLowerCase()) && !m.author.toLowerCase().includes(query.toLowerCase())) return false
    if (selectedGenres.length > 0 && !selectedGenres.some((g) => m.genres.includes(g))) return false
    if (selectedStatus && m.status !== selectedStatus) return false
    if (selectedYear && m.year.toString() !== selectedYear) return false
    return true
  }).sort((a, b) => {
    if (sort === 'popular') return b.ratingCount - a.ratingCount
    if (sort === 'new') return b.year - a.year
    return b.chapterCount - a.chapterCount
  })

  const hasFilters = selectedGenres.length > 0 || selectedStatus !== null || selectedYear !== null || query !== ''

  const clearAll = () => {
    setSelectedGenres([])
    setSelectedStatus(null)
    setSelectedYear(null)
    setQuery('')
    setInputVal('')
  }

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])

  const FilterContent = () => (
    <div className="space-y-5">
      <div>
        <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest mb-3">Төрөл</p>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <GenreChip key={g} label={g} active={selectedGenres.includes(g)} onClick={() => toggleGenre(g)} size="sm" />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest mb-3">Статус</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <GenreChip key={s} label={s} active={selectedStatus === s} onClick={() => setSelectedStatus(selectedStatus === s ? null : s)} size="sm" />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest mb-3">Гарсан он</p>
        <div className="flex flex-wrap gap-2">
          {YEARS.map((y) => (
            <GenreChip key={y} label={y} active={selectedYear === y} onClick={() => setSelectedYear(selectedYear === y ? null : y)} size="sm" />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest mb-3">Эрэмбэлэх</p>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <GenreChip key={s.id} label={s.label} active={sort === s.id} onClick={() => setSort(s.id)} size="sm" />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 mt-6">

        {/* Page header */}
        <AnimateIn className="mb-6">
          <h1 className="text-[#F5F7FA] text-2xl font-extrabold tracking-tight mb-1">Манга</h1>
          <p className="text-[#9CA3AF] text-sm">{list.length} манга байна</p>
        </AnimateIn>

        {/* Search */}
        <div className="relative mb-5">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors focus-within:border-[rgba(139,92,246,0.4)]"
            style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.09)' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" className="flex-shrink-0">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              value={inputVal}
              onChange={(e) => { setInputVal(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { setQuery(inputVal); setShowSuggestions(false) }
                if (e.key === 'Escape') { setInputVal(''); setQuery(''); setShowSuggestions(false) }
              }}
              placeholder="Манга, зохиолч хайх…"
              className="flex-1 bg-transparent text-[#F5F7FA] text-sm outline-none placeholder:text-[#4B5563]"
            />
            {inputVal && (
              <button
                onClick={() => { setInputVal(''); setQuery('') }}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-[#4B5563] hover:text-[#9CA3AF] flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
            <button
              onClick={() => setFilterOpen(true)}
              className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 ${hasFilters ? 'text-[#A78BFA]' : 'text-[#9CA3AF]'}`}
              style={{ background: hasFilters ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.05)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              {hasFilters ? `Шүүлтүүр (${selectedGenres.length + (selectedStatus ? 1 : 0) + (selectedYear ? 1 : 0)})` : 'Шүүлтүүр'}
            </button>
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-2xl border overflow-hidden z-20 shadow-2xl fade-in"
              style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              {suggestions.map((m) => (
                <button
                  key={m.id}
                  onMouseDown={() => { navigate(`/manga/${m.id}`); setShowSuggestions(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                >
                  <div className="w-10 h-[60px] rounded-xl overflow-hidden flex-shrink-0" style={{ background: m.coverColor }}>
                    <img src={m.coverImage} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F5F7FA] text-sm font-semibold truncate">{m.title}</p>
                    <p className="text-[#4B5563] text-xs mt-0.5">{m.author}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {m.genres.slice(0,2).map((g) => <span key={g} className="text-[10px] text-[#6B7280]">{g}</span>)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-0.5 justify-end">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#8B5CF6">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-[#9CA3AF] text-xs">{m.rating}</span>
                    </div>
                    <p className="text-[#4B5563] text-[10px] mt-0.5">Б.{m.chapterCount}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-52 flex-shrink-0">
            <div
              className="sticky top-24 rounded-2xl border p-4 space-y-1"
              style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#F5F7FA] text-sm font-bold">Шүүлтүүр</p>
                {hasFilters && (
                  <button onClick={clearAll} className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors">
                    Цэвэрлэх
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters + count row */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-[#4B5563] text-sm">
                <span className="text-[#F5F7FA] font-semibold">{filtered.length}</span> манга
              </p>
              {hasFilters && (
                <button onClick={clearAll} className="text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] transition-colors flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Шүүлтүүр цэвэрлэх
                </button>
              )}
            </div>

            {/* Active filter pills */}
            {(selectedGenres.length > 0 || selectedStatus || selectedYear) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedGenres.map((g) => (
                  <GenreChip key={g} label={g} active onRemove={() => toggleGenre(g)} size="sm" />
                ))}
                {selectedStatus && <GenreChip label={selectedStatus} active onRemove={() => setSelectedStatus(null)} size="sm" />}
                {selectedYear && <GenreChip label={selectedYear} active onRemove={() => setSelectedYear(null)} size="sm" />}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center fade-in">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5" style={{ background: '#151923' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <p className="text-[#F5F7FA] font-bold text-lg mb-2">Манга олдсонгүй</p>
                <p className="text-[#4B5563] text-sm mb-6">Хайлт эсвэл шүүлтүүрийг өөрчилнэ үү</p>
                <button
                  onClick={clearAll}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
                  style={{ background: '#8B5CF6' }}
                >
                  Шүүлтүүр цэвэрлэх
                </button>
              </div>
            ) : (
              <Stagger
                key={`${query}-${selectedGenres.join(',')}-${selectedStatus}-${selectedYear}-${sort}`}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
              >
                {filtered.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} />
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {filterOpen && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setFilterOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-y-auto slide-up"
            style={{ background: '#111827', maxHeight: '88vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>
            <div className="flex items-center justify-between px-5 pb-4">
              <h2 className="text-[#F5F7FA] font-bold text-lg">Шүүлтүүр</h2>
              <button onClick={() => setFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9CA3AF]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="px-5 pb-3">
              <FilterContent />
            </div>
            <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <button
                onClick={clearAll}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-[#9CA3AF] border border-[rgba(255,255,255,0.1)]"
              >
                Цэвэрлэх
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: '#8B5CF6' }}
              >
                Хэрэглэх ({filtered.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
