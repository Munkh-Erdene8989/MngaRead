'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from '@/lib/nav'
import { getClientAuth } from '@/lib/firebase/client'
import { GENRES, type Manga } from '@/data/manga'
import { formatMnDate } from '@/lib/constants'

type Tab = 'overview' | 'manga' | 'users' | 'payments'

interface Stats {
  mangaCount: number
  userCount: number
  invoiceCount: number
  paidCount: number
  pendingCount: number
  revenue: number
  subscribers: number
}

interface AdminUser {
  uid: string
  name: string
  phone: string
  plan: string
  planExpiresAt: string | null
  role: string
  joinedAt: string
}

interface AdminInvoice {
  id: string
  uid: string
  type: string
  plan: string | null
  mangaId: string | null
  chapterNum: number | null
  amount: number
  description: string
  status: string
  createdAt: string
  paidAt: string | null
}

interface MangaForm {
  id: string
  title: string
  author: string
  artist: string
  genres: string
  status: 'Үргэлжилж буй' | 'Дууссан'
  chapterCount: string
  year: string
  rating: string
  coverImage: string
  coverColor: string
  synopsis: string
  tags: string
}

const EMPTY_FORM: MangaForm = {
  id: '',
  title: '',
  author: '',
  artist: '',
  genres: '',
  status: 'Үргэлжилж буй',
  chapterCount: '1',
  year: String(new Date().getFullYear()),
  rating: '4.5',
  coverImage: '',
  coverColor: '#0d0a1e',
  synopsis: '',
  tags: '',
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Ерөнхий' },
  { id: 'manga', label: 'Манга' },
  { id: 'users', label: 'Хэрэглэгч' },
  { id: 'payments', label: 'Төлбөр' },
]

function money(n: number) {
  return `₮${n.toLocaleString()}`
}

async function adminFetch(path: string, init?: RequestInit) {
  const token = await getClientAuth().currentUser?.getIdToken()
  if (!token) throw new Error('Нэвтэрнэ үү')
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Алдаа гарлаа')
  return data
}

function formFromManga(manga: Manga): MangaForm {
  return {
    id: manga.id,
    title: manga.title,
    author: manga.author,
    artist: manga.artist,
    genres: manga.genres.join(', '),
    status: manga.status,
    chapterCount: String(manga.chapterCount),
    year: String(manga.year),
    rating: String(manga.rating),
    coverImage: manga.coverImage,
    coverColor: manga.coverColor,
    synopsis: manga.synopsis,
    tags: (manga.tags || []).join(', '),
  }
}

export default function AdminPage() {
  const navigate = useNavigate()
  const { isGuest, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [manga, setManga] = useState<Manga[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [invoices, setInvoices] = useState<AdminInvoice[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<MangaForm>(EMPTY_FORM)
  const [editing, setEditing] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const load = useCallback(async () => {
    setError('')
    setBusy(true)
    try {
      const [s, m, u, i] = await Promise.all([
        adminFetch('/api/admin/stats'),
        adminFetch('/api/admin/manga'),
        adminFetch('/api/admin/users'),
        adminFetch('/api/admin/invoices'),
      ])
      setStats(s)
      setManga(m.list || [])
      setUsers(u.list || [])
      setInvoices(i.list || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (loading) return
    if (isGuest) {
      navigate('/login?next=/admin')
      return
    }
    load()
  }, [loading, isGuest, navigate, load])

  const filteredManga = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return manga
    return manga.filter((item) =>
      [item.title, item.author, item.id].some((v) => v.toLowerCase().includes(q))
    )
  }, [manga, query])

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((item) =>
      [item.name, item.phone, item.uid].some((v) => v.toLowerCase().includes(q))
    )
  }, [users, query])

  const filteredInvoices = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return invoices
    return invoices.filter((item) =>
      [item.description, item.status, item.uid, item.id].some((v) => v.toLowerCase().includes(q))
    )
  }, [invoices, query])

  const saveManga = async () => {
    setError('')
    setBusy(true)
    try {
      await adminFetch('/api/admin/manga', {
        method: 'POST',
        body: JSON.stringify({
          id: form.id,
          title: form.title,
          author: form.author,
          artist: form.artist,
          genres: form.genres.split(',').map((g) => g.trim()).filter(Boolean),
          status: form.status,
          chapterCount: Number(form.chapterCount) || 1,
          year: Number(form.year) || new Date().getFullYear(),
          rating: Number(form.rating) || 0,
          coverImage: form.coverImage,
          coverColor: form.coverColor,
          synopsis: form.synopsis,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      setFormOpen(false)
      setForm(EMPTY_FORM)
      setEditing(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалж чадсангүй')
    } finally {
      setBusy(false)
    }
  }

  const deleteManga = async (id: string, title: string) => {
    if (!window.confirm(`«${title}»-г устгах уу?`)) return
    setBusy(true)
    try {
      await adminFetch(`/api/admin/manga?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Устгаж чадсангүй')
    } finally {
      setBusy(false)
    }
  }

  if (loading || isGuest) {
    return (
      <Layout hideBottomNav>
        <div className="flex items-center justify-center min-h-[50vh] text-[#9CA3AF] text-sm">Ачааллаж байна…</div>
      </Layout>
    )
  }

  if (error === 'Админ эрхгүй' && !stats) {
    return (
      <Layout hideBottomNav>
        <div className="max-w-[480px] mx-auto px-4 mt-24 text-center">
          <h1 className="text-[#F5F7FA] font-extrabold text-2xl mb-2">Админ эрхгүй</h1>
          <p className="text-[#9CA3AF] text-sm mb-6">
            Энэ хэсэг зөвхөн админд нээлттэй. Утасны дугаараа <span className="text-[#A78BFA]">ADMIN_PHONES</span> орчинд нэмээд дахин нэвтэрнэ үү.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: '#8B5CF6' }}
          >
            Нүүр хуудас
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout hideBottomNav>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 mt-6 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[#A78BFA] text-xs font-bold uppercase tracking-widest mb-1">Хяналтын самбар</p>
            <h1 className="text-[#F5F7FA] font-extrabold text-2xl">Админ</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Хайх…"
              className="px-3 py-2 rounded-xl text-sm bg-[#151923] text-[#F5F7FA] outline-none border w-44 md:w-56"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            />
            <button
              onClick={load}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-[#9CA3AF] border hover:text-white"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              Шинэчлэх
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto hide-scrollbar">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
                tab === item.id ? 'text-white' : 'text-[#9CA3AF] hover:text-white'
              }`}
              style={{ background: tab === item.id ? '#8B5CF6' : 'rgba(255,255,255,0.04)' }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-[#F87171]" style={{ background: 'rgba(248,113,113,0.08)' }}>
            {error}
          </div>
        )}

        {tab === 'overview' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Манга', value: stats.mangaCount },
              { label: 'Хэрэглэгч', value: stats.userCount },
              { label: 'Захиалагч', value: stats.subscribers },
              { label: 'Орлого', value: money(stats.revenue) },
              { label: 'Төлсөн', value: stats.paidCount },
              { label: 'Хүлээгдэж буй', value: stats.pendingCount },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border p-4" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-[#6B7280] text-xs font-bold uppercase tracking-widest mb-2">{card.label}</p>
                <p className="text-[#F5F7FA] font-extrabold text-xl">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'manga' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setForm(EMPTY_FORM)
                  setEditing(false)
                  setFormOpen(true)
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: '#8B5CF6' }}
              >
                Манга нэмэх
              </button>
            </div>

            {formOpen && (
              <div className="rounded-2xl border p-4 mb-5 grid grid-cols-1 md:grid-cols-2 gap-3" style={{ background: '#151923', borderColor: 'rgba(139,92,246,0.25)' }}>
                {[
                  { key: 'title', label: 'Гарчиг' },
                  { key: 'id', label: 'ID (хоосон бол автомат)', disabled: editing },
                  { key: 'author', label: 'Зохиогч' },
                  { key: 'artist', label: 'Зураач' },
                  { key: 'genres', label: `Төрөл (${GENRES.slice(0, 4).join(', ')}…)` },
                  { key: 'coverImage', label: 'Ковер URL' },
                ].map((field) => (
                  <label key={field.key} className="text-xs text-[#9CA3AF]">
                    {field.label}
                    <input
                      disabled={field.disabled}
                      value={form[field.key as keyof MangaForm]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-xl text-sm bg-[#0B0D12] text-[#F5F7FA] outline-none border"
                      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    />
                  </label>
                ))}
                <label className="text-xs text-[#9CA3AF]">
                  Төлөв
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as MangaForm['status'] }))}
                    className="mt-1 w-full px-3 py-2 rounded-xl text-sm bg-[#0B0D12] text-[#F5F7FA] outline-none border"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <option>Үргэлжилж буй</option>
                    <option>Дууссан</option>
                  </select>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="text-xs text-[#9CA3AF]">
                    Бүлэг
                    <input value={form.chapterCount} onChange={(e) => setForm((prev) => ({ ...prev, chapterCount: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-xl text-sm bg-[#0B0D12] text-[#F5F7FA] outline-none border" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                  </label>
                  <label className="text-xs text-[#9CA3AF]">
                    Он
                    <input value={form.year} onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-xl text-sm bg-[#0B0D12] text-[#F5F7FA] outline-none border" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                  </label>
                  <label className="text-xs text-[#9CA3AF]">
                    Үнэлгээ
                    <input value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-xl text-sm bg-[#0B0D12] text-[#F5F7FA] outline-none border" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                  </label>
                </div>
                <label className="text-xs text-[#9CA3AF] md:col-span-2">
                  Товч агуулга
                  <textarea
                    rows={3}
                    value={form.synopsis}
                    onChange={(e) => setForm((prev) => ({ ...prev, synopsis: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-xl text-sm bg-[#0B0D12] text-[#F5F7FA] outline-none border"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                  />
                </label>
                <div className="md:col-span-2 flex gap-2 justify-end">
                  <button onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl text-sm text-[#9CA3AF]">Цуцлах</button>
                  <button disabled={busy} onClick={saveManga} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#8B5CF6' }}>
                    Хадгалах
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border overflow-hidden" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}>
              {filteredManga.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t' : ''}`}
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="w-10 h-[56px] rounded-lg overflow-hidden flex-shrink-0" style={{ background: item.coverColor }}>
                    {item.coverImage ? <img src={item.coverImage} alt="" className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F5F7FA] text-sm font-semibold truncate">{item.title}</p>
                    <p className="text-[#6B7280] text-xs truncate">{item.author} · {item.chapterCount} бүлэг</p>
                  </div>
                  <button
                    onClick={() => {
                      setForm(formFromManga(item))
                      setEditing(true)
                      setFormOpen(true)
                    }}
                    className="text-xs font-semibold text-[#A78BFA]"
                  >
                    Засах
                  </button>
                  <button onClick={() => deleteManga(item.id, item.title)} className="text-xs font-semibold text-[#F87171]">
                    Устгах
                  </button>
                </div>
              ))}
              {filteredManga.length === 0 && (
                <p className="px-4 py-8 text-center text-[#6B7280] text-sm">Манга байхгүй</p>
              )}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}>
            {filteredUsers.map((item, i) => (
              <div key={item.uid} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F7FA] text-sm font-semibold truncate">{item.name || 'Хэрэглэгч'}</p>
                  <p className="text-[#6B7280] text-xs">{item.phone || '—'} · {item.uid.slice(0, 8)}</p>
                </div>
                <span className="text-xs font-semibold text-[#A78BFA]">{item.plan === 'none' ? 'Үнэгүй' : item.plan === 'yearly' ? 'Жил' : 'Сар'}</span>
                {item.role === 'admin' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#C4B5FD' }}>Админ</span>
                )}
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="px-4 py-8 text-center text-[#6B7280] text-sm">Хэрэглэгч байхгүй</p>
            )}
          </div>
        )}

        {tab === 'payments' && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: '#151923', borderColor: 'rgba(255,255,255,0.07)' }}>
            {filteredInvoices.map((item, i) => (
              <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F7FA] text-sm font-semibold truncate">{item.description || item.id}</p>
                  <p className="text-[#6B7280] text-xs truncate">
                    {item.createdAt ? formatMnDate(new Date(item.createdAt)) : '—'} · {item.status}
                  </p>
                </div>
                <span className={`text-xs font-bold ${item.status === 'paid' ? 'text-[#34D399]' : 'text-[#FBBF24]'}`}>
                  {money(item.amount)}
                </span>
              </div>
            ))}
            {filteredInvoices.length === 0 && (
              <p className="px-4 py-8 text-center text-[#6B7280] text-sm">Нэхэмжлэл байхгүй</p>
            )}
          </div>
        )}

        {busy && !stats && (
          <p className="text-[#6B7280] text-sm mt-6">Ачааллаж байна…</p>
        )}
      </div>
    </Layout>
  )
}
