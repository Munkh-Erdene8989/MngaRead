'use client'

import { Suspense } from 'react'
import BrowsePage from '@/views/BrowsePage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#0B0D12' }} />}>
      <BrowsePage />
    </Suspense>
  )
}
