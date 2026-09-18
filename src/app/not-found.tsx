'use client'

import Link from 'next/link'
import AnimateIn from '@/components/motion/AnimateIn'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0B0D12' }}>
      <AnimateIn className="text-center" y={18}>
        <p className="text-[#8B5CF6] text-6xl font-extrabold mb-3">404</p>
        <p className="text-[#F5F7FA] text-xl font-bold mb-4">Хуудас олдсонгүй</p>
        <Link href="/" className="text-[#8B5CF6] text-sm hover:underline">Нүүр хуудас руу буцах</Link>
      </AnimateIn>
    </div>
  )
}
