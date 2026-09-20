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
import {
  onAuthStateChanged,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { getClientAuth, getClientDb } from '@/lib/firebase/client'
import {
  AVATAR_OPTIONS,
  type PurchasedChapter,
  type SubPlan,
  type UserProfile,
} from '@/data/store'

export type LibraryStatus = 'reading' | 'saved' | 'completed'

export interface LibraryItem {
  mangaId: string
  status: LibraryStatus
  progress?: { chapter: number; page: number; total: number }
  updatedAt: string
}

export interface AuthProfile extends UserProfile {
  phone: string
  plan: SubPlan
  planExpiresAt: string | null
  role: 'admin' | 'user'
}

interface AuthContextValue {
  user: User | null
  profile: AuthProfile | null
  plan: SubPlan
  planExpiresAt: Date | null
  purchases: PurchasedChapter[]
  library: LibraryItem[]
  loading: boolean
  isGuest: boolean
  isAdmin: boolean
  signInWithToken: (token: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (patch: Partial<Pick<UserProfile, 'name' | 'bio' | 'avatar'>>) => Promise<void>
  toggleSave: (mangaId: string) => Promise<void>
  isSaved: (mangaId: string) => boolean
  updateProgress: (mangaId: string, chapter: number, page: number, total: number, chapterCount: number) => Promise<void>
  markCompleted: (mangaId: string) => Promise<void>
  removeFromLibrary: (mangaId: string) => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function defaultNameFromPhone(phone: string): string {
  return `Хэрэглэгч ${phone.slice(-4)}`
}

function mapProfile(uid: string, phone: string, data: Record<string, unknown> | undefined): AuthProfile {
  const plan = (data?.plan as SubPlan) || 'none'
  const expires = data?.planExpiresAt as { toDate?: () => Date } | string | null | undefined
  let planExpiresAt: string | null = null
  if (expires && typeof expires === 'object' && typeof expires.toDate === 'function') {
    planExpiresAt = expires.toDate().toISOString()
  } else if (typeof expires === 'string') {
    planExpiresAt = expires
  }

  return {
    name: (data?.name as string) || defaultNameFromPhone(phone),
    username: (data?.username as string) || `@${phone}`,
    avatar: (data?.avatar as string) || AVATAR_OPTIONS[0],
    avatarColor: (data?.avatarColor as string) || '#8B5CF6',
    joinedAt: (data?.joinedAt as string) || new Date().toISOString(),
    bio: (data?.bio as string) || '',
    phone,
    plan,
    planExpiresAt,
    role: data?.role === 'admin' ? 'admin' : 'user',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [purchases, setPurchases] = useState<PurchasedChapter[]>([])
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadUserData = useCallback(async (current: User) => {
    const db = getClientDb()
    const phone = current.phoneNumber?.replace('+976', '') || ''
    const userRef = doc(db, 'users', current.uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) {
      const created: Record<string, unknown> = {
        name: defaultNameFromPhone(phone),
        username: `@${phone}`,
        avatar: AVATAR_OPTIONS[0],
        avatarColor: '#8B5CF6',
        joinedAt: new Date().toISOString(),
        bio: '',
        phone,
        plan: 'none',
        planExpiresAt: null,
        role: 'user',
        createdAt: new Date().toISOString(),
      }
      await setDoc(userRef, created)
      setProfile(mapProfile(current.uid, phone, created))
      setPurchases([])
      setLibrary([])
      return
    }
    setProfile(mapProfile(current.uid, phone, snap.data()))
  }, [])

  useEffect(() => {
    const auth = getClientAuth()
    const unsub = onAuthStateChanged(auth, async (next) => {
      setUser(next)
      if (!next) {
        setProfile(null)
        setPurchases([])
        setLibrary([])
        setLoading(false)
        return
      }
      try {
        await loadUserData(next)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [loadUserData])

  useEffect(() => {
    if (!user) return
    const db = getClientDb()
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (!snap.exists()) return
      const phone = user.phoneNumber?.replace('+976', '') || ''
      setProfile(mapProfile(user.uid, phone, snap.data()))
    })
    const unsubPurchases = onSnapshot(collection(db, 'users', user.uid, 'purchases'), (snap) => {
      setPurchases(
        snap.docs.map((d) => d.data() as PurchasedChapter)
      )
    })
    const unsubLibrary = onSnapshot(collection(db, 'users', user.uid, 'library'), (snap) => {
      setLibrary(snap.docs.map((d) => d.data() as LibraryItem))
    })
    return () => {
      unsubUser()
      unsubPurchases()
      unsubLibrary()
    }
  }, [user])

  const planExpiresAt = useMemo(() => {
    if (!profile?.planExpiresAt) return null
    const date = new Date(profile.planExpiresAt)
    return Number.isNaN(date.getTime()) ? null : date
  }, [profile?.planExpiresAt])

  const plan: SubPlan = useMemo(() => {
    if (!profile) return 'none'
    if (profile.plan === 'none') return 'none'
    if (planExpiresAt && planExpiresAt.getTime() < Date.now()) return 'none'
    return profile.plan
  }, [profile, planExpiresAt])

  const signInWithToken = useCallback(async (token: string) => {
    const cred = await signInWithCustomToken(getClientAuth(), token)
    await cred.user.getIdToken(true)
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(getClientAuth())
  }, [])

  const updateProfile = useCallback(async (patch: Partial<Pick<UserProfile, 'name' | 'bio' | 'avatar'>>) => {
    if (!user) return
    await updateDoc(doc(getClientDb(), 'users', user.uid), {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
  }, [user])

  const toggleSave = useCallback(async (mangaId: string) => {
    if (!user) return
    const ref = doc(getClientDb(), 'users', user.uid, 'library', mangaId)
    const snap = await getDoc(ref)
    if (snap.exists() && (snap.data().status === 'saved' || snap.data().status === 'reading' || snap.data().status === 'completed')) {
      const status = snap.data().status as LibraryStatus
      if (status === 'saved') {
        await deleteDoc(ref)
        return
      }
    }
    const existing = snap.data() as LibraryItem | undefined
    await setDoc(ref, {
      mangaId,
      status: existing?.status === 'reading' || existing?.status === 'completed' ? existing.status : 'saved',
      progress: existing?.progress ?? null,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  }, [user])

  const isSaved = useCallback((mangaId: string) => {
    return library.some((item) => item.mangaId === mangaId)
  }, [library])

  const updateProgress = useCallback(async (mangaId: string, chapter: number, page: number, total: number, chapterCount: number) => {
    if (!user) return
    const status: LibraryStatus = chapter >= chapterCount ? 'completed' : 'reading'
    await setDoc(
      doc(getClientDb(), 'users', user.uid, 'library', mangaId),
      {
        mangaId,
        status,
        progress: { chapter, page, total },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  }, [user])

  const markCompleted = useCallback(async (mangaId: string) => {
    if (!user) return
    await setDoc(
      doc(getClientDb(), 'users', user.uid, 'library', mangaId),
      { mangaId, status: 'completed', updatedAt: new Date().toISOString() },
      { merge: true }
    )
  }, [user])

  const removeFromLibrary = useCallback(async (mangaId: string) => {
    if (!user) return
    await deleteDoc(doc(getClientDb(), 'users', user.uid, 'library', mangaId))
  }, [user])

  const refresh = useCallback(async () => {
    if (!user) return
    await loadUserData(user)
    const db = getClientDb()
    const [p, l] = await Promise.all([
      getDocs(collection(db, 'users', user.uid, 'purchases')),
      getDocs(collection(db, 'users', user.uid, 'library')),
    ])
    setPurchases(p.docs.map((d) => d.data() as PurchasedChapter))
    setLibrary(l.docs.map((d) => d.data() as LibraryItem))
  }, [user, loadUserData])

  const value: AuthContextValue = {
    user,
    profile,
    plan,
    planExpiresAt,
    purchases,
    library,
    loading,
    isGuest: !user,
    isAdmin: profile?.role === 'admin',
    signInWithToken,
    signOut,
    updateProfile,
    toggleSave,
    isSaved,
    updateProgress,
    markCompleted,
    removeFromLibrary,
    refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
