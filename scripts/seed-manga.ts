import { readFileSync } from 'fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { MANGA_LIST } from '../src/data/manga'

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
  const batch = db.batch()
  for (const manga of MANGA_LIST) {
    const { chapters, ...rest } = manga
    batch.set(db.collection('manga').doc(manga.id), {
      ...rest,
      chapterTitles: chapters.slice(0, 20).map((c) => ({ number: c.number, title: c.title, pages: c.pages })),
      seededAt: new Date().toISOString(),
    })
  }
  await batch.commit()
  console.log(`Seeded ${MANGA_LIST.length} manga`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
