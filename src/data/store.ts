// Global app state — subscription, purchases, notifications, profile

export type SubPlan = 'none' | 'monthly' | 'yearly'

export interface PurchasedChapter {
  mangaId: string
  chapterNum: number
  purchasedAt: string
}

export interface Notification {
  id: string
  type: 'new_chapter' | 'system' | 'promo'
  mangaId?: string
  mangaTitle?: string
  chapterNum?: number
  title: string
  body: string
  time: string
  read: boolean
  coverImage?: string
}

export interface UserProfile {
  name: string
  username: string
  avatar: string
  avatarColor: string
  joinedAt: string
  bio: string
}

// Simulated app state (in a real app this would use context/zustand)
export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'new_chapter',
    mangaId: 'har-nar',
    mangaTitle: 'Хар Нар',
    chapterNum: 113,
    title: 'Шинэ бүлэг нэмэгдлээ!',
    body: 'Хар Нар — Бүлэг 113: Сүүдрийн тулаан',
    time: '10 мин өмнө',
    read: false,
    coverImage: 'https://images.unsplash.com/photo-1653368653487-f55b96d90853?w=80&h=80&fit=crop',
  },
  {
    id: 'n2',
    type: 'new_chapter',
    mangaId: 'undes',
    mangaTitle: 'Үндэс',
    chapterNum: 95,
    title: 'Шинэ бүлэг нэмэгдлээ!',
    body: 'Үндэс — Бүлэг 95: Хоёр ертөнцийн хаалга',
    time: '2 цаг өмнө',
    read: false,
    coverImage: 'https://images.unsplash.com/photo-1769221909918-8d40bf8c2459?w=80&h=80&fit=crop',
  },
  {
    id: 'n3',
    type: 'promo',
    title: 'Тусгай санал!',
    body: 'Сарын захиалга авбал эхний 30 хоног үнэ төлбөргүй. Хугацаа дуусахаас өмнө ашиглаарай.',
    time: '1 өдөр өмнө',
    read: false,
  },
  {
    id: 'n4',
    type: 'new_chapter',
    mangaId: 'mongon-sum',
    mangaTitle: 'Мөнгөн Сум',
    chapterNum: 69,
    title: 'Шинэ бүлэг нэмэгдлээ!',
    body: 'Мөнгөн Сум — Бүлэг 69: Хар нуман дор',
    time: '3 өдөр өмнө',
    read: true,
    coverImage: 'https://images.unsplash.com/photo-1776557819088-b8da598348c8?w=80&h=80&fit=crop',
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Тавтай морилно уу!',
    body: 'MANGA.MN платформд тавтай морилно уу. Уншихдаа таатай байгаарай.',
    time: '1 долоо хоног өмнө',
    read: true,
  },
]

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Болд-Эрдэнэ',
  username: '@bolderdene',
  avatar: 'https://images.unsplash.com/photo-1644417089758-54153e3a7a6b?w=200&h=200&fit=crop',
  avatarColor: '#8B5CF6',
  joinedAt: '2024 оны 3-р сар',
  bio: 'Манга уншдаг, аниме үздэг. Дуртай жанр: Фантази, Тулаан.',
}

export const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1644417089758-54153e3a7a6b?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1600251527636-6e5eacbf07e3?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1653368653487-f55b96d90853?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1579451997086-01078cd9b98a?w=120&h=120&fit=crop',
]

// Chapters newer than this threshold require purchase or subscription
export const FREE_CHAPTER_THRESHOLD = 3 // last N chapters are premium

export function isChapterFree(chapterNum: number, totalChapters: number): boolean {
  return chapterNum <= totalChapters - FREE_CHAPTER_THRESHOLD
}

export function isChapterAccessible(
  chapterNum: number,
  totalChapters: number,
  plan: SubPlan,
  purchases: PurchasedChapter[],
  mangaId: string
): boolean {
  if (isChapterFree(chapterNum, totalChapters)) return true
  if (plan === 'monthly' || plan === 'yearly') return true
  return purchases.some((p) => p.mangaId === mangaId && p.chapterNum === chapterNum)
}
