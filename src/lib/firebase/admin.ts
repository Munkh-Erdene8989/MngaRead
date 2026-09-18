import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

function getAdminApp(): App {
  const existing = getApps()[0]
  if (existing) return existing

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured')
  }

  const serviceAccount = JSON.parse(raw) as {
    project_id: string
    client_email: string
    private_key: string
  }

  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
    projectId: serviceAccount.project_id,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp())
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp())
}
