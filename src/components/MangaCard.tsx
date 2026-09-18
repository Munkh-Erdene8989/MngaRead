'use client'

import { useNavigate } from '@/lib/nav'
import type { Manga } from '@/data/manga'
import ProgressBar from './ProgressBar'

interface MangaCardProps {
  manga: Manga
  showProgress?: boolean
  rank?: number
  size?: 'sm' | 'md' | 'lg'
}

const TAG_COLORS: Record<string, string> = {
  'Шилдэг': 'bg-amber-500/20 text-amber-400',
  'Халуун': 'bg-rose-500/20 text-rose-400',
  'Шинэ': 'bg-emerald-500/20 text-emerald-400',
  '№1 Эрэлттэй': 'bg-violet-500/20 text-violet-300',
  'Дууссан': 'bg-zinc-500/20 text-zinc-400',
}

export default function MangaCard({ manga, showProgress, rank, size = 'md' }: MangaCardProps) {
  const navigate = useNavigate()
  const progress = manga.readProgress
    ? Math.round((manga.readProgress.chapter / manga.chapterCount) * 100)
    : 0
  const tag = manga.tags?.[0]

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/manga/${manga.id}`)}
    >
      {/* Cover */}
      <div
        className="relative overflow-hidden rounded-xl neon-border"
        style={{ aspectRatio: '2/3', background: manga.coverColor }}
      >
        <img
          src={manga.coverImage}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Permanent bottom gradient for readability */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, transparent 100%)',
          }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#8B5CF6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rank badge */}
        {rank !== undefined && (
          <div
            className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg"
            style={{ background: rank <= 3 ? '#8B5CF6' : 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          >
            {rank}
          </div>
        )}

        {/* Tag */}
        {tag && !rank && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${TAG_COLORS[tag] ?? 'bg-zinc-500/20 text-zinc-300'}`}
            style={{ backdropFilter: 'blur(4px)' }}
          >
            {tag}
          </div>
        )}

        {/* Status badge */}
        {manga.status === 'Дууссан' && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium text-zinc-300"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          >
            Дууссан
          </div>
        )}

        {/* Quick read button on hover */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/manga/${manga.id}/read/1`) }}
            className="w-full py-1.5 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5"
            style={{ background: 'rgba(139,92,246,0.85)', backdropFilter: 'blur(4px)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Унших
          </button>
        </div>
      </div>

      {/* Info below cover */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-[#F5F7FA] text-sm font-semibold leading-snug line-clamp-2 group-hover:text-[#A78BFA] transition-colors duration-200">
          {manga.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[#9CA3AF] text-xs truncate">{manga.genres[0]}</p>
          <p className="text-[#9CA3AF] text-xs flex-shrink-0 ml-1">Б.{manga.chapterCount}</p>
        </div>

        {/* Star rating tiny */}
        <div className="flex items-center gap-1 mt-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#8B5CF6">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-[#9CA3AF] text-[10px]">{manga.rating}</span>
          <span className="text-[#374151] text-[10px]">·</span>
          <span className="text-[#9CA3AF] text-[10px]">{(manga.ratingCount / 1000).toFixed(1)}к</span>
        </div>

        {showProgress && manga.readProgress && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#9CA3AF] text-[10px]">Б.{manga.readProgress.chapter}/{manga.chapterCount}</span>
              <span className="text-[#8B5CF6] text-[10px] font-medium">{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        )}
      </div>
    </div>
  )
}
