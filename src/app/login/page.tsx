'use client'

import { Suspense } from 'react'
import LoginPage from '@/views/LoginPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#0B0D12' }} />}>
      <LoginPage />
    </Suspense>
  )
}
