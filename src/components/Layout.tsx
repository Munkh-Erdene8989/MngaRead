'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import NotificationPanel from './NotificationPanel'
import { NOTIFICATIONS as INITIAL_NOTIFS, type Notification } from '@/data/store'
import { useAuth } from '@/contexts/AuthContext'

const NAV_LINKS = [
  { href: '/', label: 'Нүүр' },
  { href: '/manga', label: 'Манга' },
  { href: '/genres', label: 'Төрөл' },
  { href: '/library', label: 'Миний сан' },
]

const BOTTOM_NAV = [
  {
    href: '/',
    label: 'Нүүр',
    icon: (a: boolean) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill={a ? '#8B5CF6' : 'none'} stroke={a ? '#8B5CF6' : '#4B5563'} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/manga',
    label: 'Хайх',
    icon: (a: boolean) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a ? '#8B5CF6' : '#4B5563'} strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: '/library',
    label: 'Миний сан',
    icon: (a: boolean) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill={a ? '#8B5CF6' : 'none'} stroke={a ? '#8B5CF6' : '#4B5563'} strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Профайл',
    icon: (a: boolean) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill={a ? '#8B5CF6' : 'none'} stroke={a ? '#8B5CF6' : '#4B5563'} strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

interface LayoutProps {
  children: React.ReactNode
  hideBottomNav?: boolean
}

export default function Layout({ children, hideBottomNav }: LayoutProps) {
  const path = usePathname() || '/'
  const router = useRouter()
  const { profile, isGuest, isAdmin } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFS)

  const unreadCount = notifications.filter((n) => !n.read).length
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const isReader = path.includes('/read/')
  const initial = profile?.name?.[0] || (isGuest ? '?' : 'М')

  return (
    <div className="min-h-screen" style={{ background: '#0B0D12' }}>
      <header
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center h-16 border-b"
        style={{ background: 'rgba(11,13,18,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-8 w-full max-w-[1280px] mx-auto px-6">
          <button onClick={() => router.push('/')} className="flex items-center gap-2.5 flex-shrink-0 group">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="12" rx="1.5" fill="white"/>
                <rect x="8" y="1" width="5" height="7" rx="1.5" fill="white" opacity="0.55"/>
              </svg>
            </div>
            <span className="text-[#F5F7FA] font-extrabold text-lg tracking-tight">MANGA<span style={{ color: '#8B5CF6' }}>.MN</span></span>
          </button>

          <nav className="flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/' ? path === '/' : path.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'text-[#F5F7FA] bg-[rgba(255,255,255,0.07)]'
                      : 'text-[#4B5563] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.04)]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  path.startsWith('/admin')
                    ? 'text-[#F5F7FA] bg-[rgba(255,255,255,0.07)]'
                    : 'text-[#4B5563] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.04)]'
                }`}
              >
                Админ
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            {searchOpen ? (
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2 border"
                style={{ background: 'rgba(21,25,35,0.8)', borderColor: 'rgba(139,92,246,0.3)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      router.push(`/manga?q=${encodeURIComponent(searchQuery.trim())}`)
                      setSearchOpen(false)
                      setSearchQuery('')
                    }
                    if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery('') }
                  }}
                  placeholder="Манга, зохиолч хайх…"
                  className="bg-transparent text-[#F5F7FA] text-sm outline-none w-56 placeholder:text-[#4B5563]"
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                  className="text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#4B5563] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.06)] transition-all"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#4B5563] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.06)] transition-all relative"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} />
                )}
              </button>
              {notifOpen && (
                <NotificationPanel
                  notifications={notifications}
                  onClose={() => setNotifOpen(false)}
                  onMarkRead={markRead}
                  onMarkAllRead={markAllRead}
                />
              )}
            </div>

            <button
              onClick={() => router.push(isGuest ? '/login' : '/profile')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white transition-all hover:scale-105 overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
            >
              {profile?.avatar && !isGuest ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : initial}
            </button>
          </div>
        </div>
      </header>

      <header
        className="flex md:hidden fixed top-0 left-0 right-0 z-50 items-center h-14 px-4 border-b"
        style={{ background: 'rgba(11,13,18,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <button onClick={() => router.push('/')} className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
          >
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="12" rx="1.5" fill="white"/>
              <rect x="8" y="1" width="5" height="7" rx="1.5" fill="white" opacity="0.55"/>
            </svg>
          </div>
          <span className="text-[#F5F7FA] font-extrabold text-base tracking-tight">MANGA<span style={{ color: '#8B5CF6' }}>.MN</span></span>
        </button>

        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => router.push('/manga')} className="w-10 h-10 flex items-center justify-center text-[#4B5563] hover:text-[#F5F7FA]">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button
            onClick={() => router.push(isGuest ? '/login' : '/profile')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
          >
            {profile?.avatar && !isGuest ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : initial}
          </button>
        </div>
      </header>

      <main className="pt-14 md:pt-16 pb-16 md:pb-0">
        {children}
      </main>

      {!hideBottomNav && !isReader && (
        <nav
          className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 items-stretch border-t"
          style={{ background: 'rgba(8,10,15,0.97)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          {BOTTOM_NAV.map((item) => {
            const active = item.href === '/' ? path === '/' : path.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px]"
              >
                {item.icon(active)}
                <span className={`text-[10px] font-semibold leading-none ${active ? 'text-[#8B5CF6]' : 'text-[#4B5563]'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}
