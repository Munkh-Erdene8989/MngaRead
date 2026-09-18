'use client'

import { use } from 'react'
import ReaderPage from '@/views/ReaderPage'

export default function Page({ params }: { params: Promise<{ id: string; chapter: string }> }) {
  const { id, chapter } = use(params)
  return <ReaderPage id={id} chapter={chapter} />
}
