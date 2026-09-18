'use client'

import { useLayoutEffect, useRef } from 'react'
import { animate, cleanInlineStyles, createScope, stagger } from 'animejs'
import type { Notification } from '@/data/store'
import { MOTION, REDUCE_MQ } from '@/lib/motion'
import { useNavigate } from '@/lib/nav'

interface NotificationPanelProps {
  notifications: Notification[]
  onClose: () => void
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  new_chapter: (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    </div>
  ),
  promo: (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    </div>
  ),
  system: (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
  ),
}

export default function NotificationPanel({ notifications, onClose, onMarkRead, onMarkAllRead }: NotificationPanelProps) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter((n) => !n.read).length

  useLayoutEffect(() => {
    if (!panelRef.current) return
    const scope = createScope({
      root: panelRef,
      mediaQueries: { reduceMotion: REDUCE_MQ },
    }).add((self) => {
      if (!self || self.matches.reduceMotion || !panelRef.current) return
      animate(panelRef.current, {
        opacity: [0, 1],
        y: [-10, 0],
        scale: [0.97, 1],
        duration: MOTION.duration.base,
        ease: MOTION.ease.enter,
      })
      const items = panelRef.current.querySelectorAll('.notif-item')
      if (items.length) {
        animate(items, {
          opacity: [0, 1],
          x: [10, 0],
          delay: stagger(MOTION.staggerMs.base, { start: 80 }),
          duration: MOTION.duration.base,
          ease: MOTION.ease.out,
          onComplete: (ins) => cleanInlineStyles(ins),
        })
      }
    })
    return () => scope.revert()
  }, [])

  const handleItemClick = (n: Notification) => {
    onMarkRead(n.id)
    if (n.mangaId) {
      navigate(`/manga/${n.mangaId}`)
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-16 right-4 md:right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl overflow-hidden origin-top-right"
        style={{ background: '#0E1117', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <h3 className="text-[#F5F7FA] font-bold text-base">Мэдэгдэл</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black text-white" style={{ background: '#8B5CF6' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
              >
                Бүгдийг уншсан
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#4B5563] hover:text-[#9CA3AF]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>
              <p className="text-[#4B5563] text-sm">Мэдэгдэл байхгүй</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`notif-item w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[rgba(255,255,255,0.03)] border-b last:border-b-0 ${!n.read ? 'bg-[rgba(139,92,246,0.04)]' : ''}`}
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                {/* Icon or cover */}
                <div className="flex-shrink-0 mt-0.5">
                  {n.coverImage ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden" style={{ background: '#151923' }}>
                      <img src={n.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    TYPE_ICON[n.type]
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-snug ${n.read ? 'text-[#9CA3AF]' : 'text-[#F5F7FA]'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: '#8B5CF6' }} />
                    )}
                  </div>
                  <p className="text-[#4B5563] text-xs mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[#2D3748] text-[10px] mt-1">{n.time}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <button className="w-full text-center text-xs font-semibold text-[#4B5563] hover:text-[#9CA3AF] transition-colors py-1">
            Бүх мэдэгдлийг харах
          </button>
        </div>
      </div>
    </>
  )
}
