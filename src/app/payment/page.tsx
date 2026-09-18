'use client'

import { Suspense } from 'react'
import PaymentPage from '@/views/PaymentPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#0B0D12' }} />}>
      <PaymentPage />
    </Suspense>
  )
}
