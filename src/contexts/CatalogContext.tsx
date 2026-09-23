'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { getClientDb } from '@/lib/firebase/client'
import {
  MANGA_LIST,
  getRelatedFrom,
  mangaFromRecord,
  type Manga,
} from '@/data/manga'

interface CatalogContextValue {
  list: Manga[]
  loading: boolean
  getManga: (id: string) => Manga | undefined
  related: (id: string) => Manga[]
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Manga[]>(MANGA_LIST)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(getClientDb(), 'manga'),
      (snap) => {
        if (!snap.empty) {
          const remote = snap.docs.map((docSnap) => mangaFromRecord(docSnap.id, docSnap.data()))
          const remoteIds = new Set(remote.map((item) => item.id))
          const localOnly = MANGA_LIST.filter((item) => !remoteIds.has(item.id))
          setList([...localOnly, ...remote])
        }
        setLoading(false)
      },
      () => setLoading(false)
    )
    return () => unsub()
  }, [])

  const getManga = useCallback(
    (id: string) => list.find((item) => item.id === id) || MANGA_LIST.find((item) => item.id === id),
    [list]
  )

  const related = useCallback((id: string) => getRelatedFrom(list, id), [list])

  const value = useMemo(
    () => ({ list, loading, getManga, related }),
    [list, loading, getManga, related]
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider')
  return ctx
}
