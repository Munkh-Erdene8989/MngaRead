'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useNavigate() {
  const router = useRouter()
  return useCallback((to: string) => {
    router.push(to)
  }, [router])
}

export function useBack() {
  const router = useRouter()
  return useCallback(() => router.back(), [router])
}
