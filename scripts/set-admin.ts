import { readFileSync } from 'fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

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
if (phone.length !== 8) {
  console.error('Usage: pnpm set-admin 99112233')
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

async function main() {
  const db = getFirestore()
  const auth = getAuth()
  const snap = await db.collection('users').where('phone', '==', phone).get()
  if (snap.empty) {
    console.error(`No user with phone ${phone}. Sign in once, then rerun.`)
    process.exit(1)
  }
  for (const docSnap of snap.docs) {
    await docSnap.ref.set({ role: 'admin', updatedAt: new Date().toISOString() }, { merge: true })
    await auth.setCustomUserClaims(docSnap.id, { phone, admin: true })
    console.log(`Granted admin: ${docSnap.id}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
