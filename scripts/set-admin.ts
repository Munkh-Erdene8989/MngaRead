import { readFileSync } from 'fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const raw = readFileSync(file, 'utf8')
      for (const line of raw.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq < 0) continue
        const key = trimmed.slice(0, eq)
        const value = trimmed.slice(eq + 1)
        if (!process.env[key]) process.env[key] = value
      }
    } catch {
      // ignore missing file
    }
  }
}

loadEnv()

const phone = (process.argv[2] || '').replace(/\D/g, '').slice(-8)
const password = process.argv[3] || ''
if (phone.length !== 8) {
  console.error('Usage: pnpm set-admin 99112233 [password]')
  process.exit(1)
}

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
initializeApp({
  credential: cert({
    projectId: sa.project_id,
    clientEmail: sa.client_email,
    privateKey: String(sa.private_key || '').replace(/\\n/g, '\n'),
  }),
})

async function hashPassword(value: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = (await scryptAsync(value, salt, 64)) as Buffer
  return `${salt.toString('hex')}:${derived.toString('hex')}`
}

async function main() {
  const db = getFirestore()
  const auth = getAuth()
  const e164 = `+976${phone}`

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

  const userRef = db.collection('users').doc(uid)
  const now = new Date().toISOString()
  await userRef.set(
    {
      name: `Админ ${phone.slice(-4)}`,
      username: `@${phone}`,
      phone,
      role: 'admin',
      updatedAt: now,
      createdAt: now,
    },
    { merge: true }
  )
  await auth.setCustomUserClaims(uid, { phone, admin: true })

  if (password) {
    if (password.length < 6) {
      console.error('Password must be at least 6 characters')
      process.exit(1)
    }
    const hash = await hashPassword(password)
    await db.collection('admin_credentials').doc(phone).set({
      hash,
      createdAt: now,
      updatedAt: now,
      loginAttempts: 0,
    }, { merge: true })
    console.log(`Granted admin with password: ${uid}`)
  } else {
    console.log(`Granted admin: ${uid}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
