import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/require-admin'
import { mangaFromRecord, type Manga } from '@/data/manga'

function slugify(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .slice(0, 48)
  return slug || `manga-${Date.now()}`
}

function payloadFromBody(body: Record<string, unknown>, id: string) {
  const manga = mangaFromRecord(id, body)
  return {
    title: manga.title,
    author: manga.author,
    artist: manga.artist,
    genres: manga.genres,
    status: manga.status,
    rating: manga.rating,
    ratingCount: manga.ratingCount,
    chapterCount: manga.chapterCount,
    synopsis: manga.synopsis,
    coverColor: manga.coverColor,
    coverImage: manga.coverImage,
    year: manga.year,
    tags: manga.tags || [],
    updatedAt: new Date().toISOString(),
  }
}

export async function GET(req: NextRequest) {
  const authz = await requireAdmin(req)
  if ('response' in authz) return authz.response

  const snap = await adminDb().collection('manga').get()
  const list: Manga[] = snap.docs.map((docSnap) => mangaFromRecord(docSnap.id, docSnap.data()))
  list.sort((a, b) => a.title.localeCompare(b.title, 'mn'))
  return NextResponse.json({ list })
}

export async function POST(req: NextRequest) {
  const authz = await requireAdmin(req)
  if ('response' in authz) return authz.response

  const body = (await req.json()) as Record<string, unknown>
  const title = String(body.title || '').trim()
  if (!title) return NextResponse.json({ error: 'Гарчиг оруулна уу' }, { status: 400 })

  const requestedId = String(body.id || '').trim()
  const id = requestedId || slugify(title)
  const ref = adminDb().collection('manga').doc(id)
  const existing = await ref.get()
  const payload = payloadFromBody(body, id)
  if (!existing.exists) {
    await ref.set({ ...payload, createdAt: new Date().toISOString() })
  } else {
    await ref.set(payload, { merge: true })
  }
  return NextResponse.json({ ok: true, id })
}

export async function DELETE(req: NextRequest) {
  const authz = await requireAdmin(req)
  if ('response' in authz) return authz.response

  const id = req.nextUrl.searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'ID дутуу' }, { status: 400 })
  await adminDb().collection('manga').doc(id).delete()
  return NextResponse.json({ ok: true })
}
