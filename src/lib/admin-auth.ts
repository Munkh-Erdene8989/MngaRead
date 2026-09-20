import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { AVATAR_OPTIONS } from '@/data/store'
import { normalizeMnPhone, toE164 } from '@/lib/constants'
import { adminPhoneList } from '@/lib/require-admin'
import { hashPassword } from '@/lib/password'

export const ADMIN_CREDENTIALS = 'admin_credentials'
const LOGIN_LOCK_MS = 5 * 60 * 1000
export const ADMIN_LOGIN_MAX_ATTEMPTS = 5

export function credentialsRef(phone: string) {
  return adminDb().collection(ADMIN_CREDENTIALS).doc(phone)
}

export async function isAdminPhone(phone: string): Promise<boolean> {
  if (adminPhoneList().includes(phone)) return true
  const snap = await credentialsRef(phone).get()
  return snap.exists
}

export async function ensureBootstrapAdmin(): Promise<void> {
  const phone = normalizeMnPhone(process.env.ADMIN_BOOTSTRAP_PHONE || '')
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || ''
  if (!phone || !password) return

  const snap = await credentialsRef(phone).get()
  if (snap.exists) return

  await upsertAdminAccount(phone, password)
}

export async function upsertAdminAccount(phone: string, password: string): Promise<string> {
  const uid = await ensureAdminAuthUser(phone)
  const hash = await hashPassword(password)
  const now = new Date().toISOString()
  const cred = credentialsRef(phone)
  const existing = await cred.get()
  if (existing.exists) {
    await cred.set({ hash, updatedAt: now, loginAttempts: 0 }, { merge: true })
  } else {
    await cred.set({
      hash,
      createdAt: now,
      updatedAt: now,
      loginAttempts: 0,
    })
  }
  return uid
}

export async function ensureAdminAuthUser(phone: string): Promise<string> {
  const e164 = toE164(phone)
  const auth = adminAuth()
  let uid: string
  try {
    const existing = await auth.getUserByPhoneNumber(e164)
    uid = existing.uid
  } catch {
    const created = await auth.createUser({
      phoneNumber: e164,
      displayName: `Админ ${phone.slice(-4)}`,
    })
    uid = created.uid
  }

  const userRef = adminDb().collection('users').doc(uid)
  const userSnap = await userRef.get()
  const now = new Date().toISOString()
  if (!userSnap.exists) {
    await userRef.set({
      name: `Админ ${phone.slice(-4)}`,
      username: `@${phone}`,
      avatar: AVATAR_OPTIONS[0],
      avatarColor: '#8B5CF6',
      joinedAt: now,
      bio: '',
      phone,
      plan: 'none',
      planExpiresAt: null,
      role: 'admin',
      createdAt: now,
    })
  } else if (userSnap.data()?.role !== 'admin' || userSnap.data()?.phone !== phone) {
    await userRef.set({ role: 'admin', phone, updatedAt: now }, { merge: true })
  }

  await auth.setCustomUserClaims(uid, { phone, admin: true })
  return uid
}

export function isLoginLocked(data: { loginAttempts?: number; lastFailedAt?: number } | undefined): boolean {
  const attempts = data?.loginAttempts || 0
  const lastFailedAt = data?.lastFailedAt || 0
  if (attempts < ADMIN_LOGIN_MAX_ATTEMPTS) return false
  return Date.now() - lastFailedAt < LOGIN_LOCK_MS
}

export async function recordLoginFailure(phone: string, currentAttempts: number): Promise<void> {
  await credentialsRef(phone).set(
    {
      loginAttempts: currentAttempts + 1,
      lastFailedAt: Date.now(),
    },
    { merge: true }
  )
}

export async function resetLoginFailures(phone: string): Promise<void> {
  await credentialsRef(phone).set({ loginAttempts: 0, lastFailedAt: 0 }, { merge: true })
}
