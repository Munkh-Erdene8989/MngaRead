'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0B0D12' }}>
      <p className="text-[#F5F7FA] text-xl font-bold mb-4">404 — Хуудас олдсонгүй</p>
      <Link href="/" className="text-[#8B5CF6] text-sm hover:underline">Нүүр хуудас руу буцах</Link>
    </div>
  )
}
