'use client'

import { Suspense } from 'react'
import AdminLoginPage from '@/views/AdminLoginPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#0B0D12' }} />}>
      <AdminLoginPage />
    </Suspense>
  )
}
