export interface Chapter {
  id: number
  number: number
  title: string
  pages: number
  uploadedAt: string
  read: boolean
}

export interface Manga {
  id: string
  title: string
  author: string
  artist: string
  genres: string[]
  status: 'Үргэлжилж буй' | 'Дууссан'
  rating: number
  ratingCount: number
  chapterCount: number
  synopsis: string
  coverColor: string
  coverImage: string
  year: number
  chapters: Chapter[]
  readProgress?: { chapter: number; page: number; total: number }
  tags?: string[]
}

const CHAPTER_TITLES = [
  'Эхлэл', 'Нууцлаг уулзалт', 'Хар салхи', 'Тулааны өдөр', 'Алдагдсан замнал',
  'Шинэ нум', 'Гал ба ус', 'Сүүдрийн дуудлага', 'Тэнгэрийн хаалга', 'Буцах зам',
  'Эртний тангараг', 'Мартагдсан нэр', 'Цуснаас цус', 'Харанхуй гэрэл', 'Сүүлийн тулаан',
]

export const makeChapters = (count: number, readUpTo = 0): Chapter[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    title: i === 0 ? 'Эхлэл' : CHAPTER_TITLES[i % CHAPTER_TITLES.length] + (i >= CHAPTER_TITLES.length ? ` ${Math.floor(i / CHAPTER_TITLES.length) + 1}` : ''),
    pages: 18 + (i % 7),
    uploadedAt:
      i >= count - 1 ? '2 цаг өмнө' :
      i >= count - 2 ? '1 өдөр өмнө' :
      i >= count - 3 ? '3 өдөр өмнө' :
      i >= count - 7 ? `${count - i} өдөр өмнө` :
      `${Math.ceil((count - i) / 7)} долоо хоног өмнө`,
    read: i < readUpTo,
  }))

export const MANGA_LIST: Manga[] = [
  {
    id: 'mongon-sum',
    title: 'Мөнгөн Сум',
    author: 'Б. Ганбаяр',
    artist: 'Д. Мөнхцэцэг',
    genres: ['Адал явдал', 'Тулаан', 'Фантази'],
    status: 'Үргэлжилж буй',
    rating: 4.8,
    ratingCount: 12450,
    chapterCount: 68,
    synopsis: 'Говийн тал нутагт өссөн залуу Сумьяа өөрийн гэр бүлийн нууцыг олж мэдэхийн тулд аяны морь унан зам тэглэнэ. Тэрбээр сум, нум барьж байлдах эртний урлагийг эзэмшсэн ч дайснуудын тоо өдөр ирэх тусам нэмэгдсээр байна. Тэнгэрийн хүч ба газрын эрчим хүчийг нэгтгэж чадвал ертөнцийн тэнцвэрийг сэргээж чадах уу?',
    coverColor: '#0d0a1e',
    coverImage: 'https://images.unsplash.com/photo-1776557819088-b8da598348c8?w=400&h=600&fit=crop&auto=format',
    year: 2021,
    chapters: makeChapters(68, 23),
    readProgress: { chapter: 23, page: 14, total: 24 },
    tags: ['Шилдэг', 'Халуун'],
  },
  {
    id: 'har-nar',
    title: 'Хар Нар',
    author: 'О. Энхтуяа',
    artist: 'О. Энхтуяа',
    genres: ['Нууцлаг', 'Романтик', 'Тулаан'],
    status: 'Үргэлжилж буй',
    rating: 4.9,
    ratingCount: 28900,
    chapterCount: 112,
    synopsis: 'Хоёр эртний ертөнцийн хоорондох хил дээр дайчин охин Нарантуяа хар тамхины хөдөлгөөнийг тасалдуулахаар тулалдана. Гэвч дайснуудынх нь нэг нь тэр эртний мартагдсан хайр байв. Хар нар мандах тэр өдөр хоёулаа нэг сонголт хийх ёстой болно. Хайр уу? Үнэнч байдал уу?',
    coverColor: '#0a0510',
    coverImage: 'https://images.unsplash.com/photo-1653368653487-f55b96d90853?w=400&h=600&fit=crop&auto=format',
    year: 2020,
    chapters: makeChapters(112, 45),
    readProgress: { chapter: 45, page: 8, total: 20 },
    tags: ['№1 Эрэлттэй'],
  },
  {
    id: 'tengerin-haan',
    title: 'Тэнгэрийн Хаан',
    author: 'Т. Болдбаатар',
    artist: 'Н. Сарантуяа',
    genres: ['Фантази', 'Адал явдал', 'Инээдэм'],
    status: 'Үргэлжилж буй',
    rating: 4.7,
    ratingCount: 19200,
    chapterCount: 89,
    synopsis: 'Эртний домгийн дагуу тэнгэрийн хаан буцаж ирэх цаг болжээ. Гэтэл хаанаас сонгогдсон хүн нь ердийн дунд сургуулийн сурагч Дорж болов. Удирдах ухаан огт байхгүй Дорж тэнгэрийн гурван аваргын сургалтыг даван туулж чадах уу?',
    coverColor: '#050d1a',
    coverImage: 'https://images.unsplash.com/photo-1769221909855-d1f62ef5aaa7?w=400&h=600&fit=crop&auto=format',
    year: 2022,
    chapters: makeChapters(89, 12),
    readProgress: { chapter: 12, page: 5, total: 22 },
    tags: ['Шинэ'],
  },
  {
    id: 'ulaanbaatar-oron',
    title: 'Улаанбаатар Орон',
    author: 'Г. Мөнхбат',
    artist: 'Э. Туяа',
    genres: ['Романтик', 'Инээдэм', 'Амьдрал'],
    status: 'Дууссан',
    rating: 4.6,
    ratingCount: 8750,
    chapterCount: 45,
    synopsis: 'Хотын амьдралд дасах гэж тэмцэж байгаа хөдөөний охин Солонго хотын хамгийн алдартай архитекторын туслах болно. Хоёр дэлхийн хооронд ялгаа их ч хайр дурлалын хэл нэг. Нэг жилийн турш тэд хамтдаа хот барина.',
    coverColor: '#1a0510',
    coverImage: 'https://images.unsplash.com/photo-1668608380298-00f7fbb572d3?w=400&h=600&fit=crop&auto=format',
    year: 2019,
    chapters: makeChapters(45, 45),
    tags: ['Дууссан'],
  },
  {
    id: 'dundad-zam',
    title: 'Дундад Зам',
    author: 'Ж. Эрдэнэчимэг',
    artist: 'Ж. Эрдэнэчимэг',
    genres: ['Нууцлаг', 'Адал явдал'],
    status: 'Үргэлжилж буй',
    rating: 4.5,
    ratingCount: 6300,
    chapterCount: 34,
    synopsis: 'Нууцлаг нийгэмлэгийн гишүүн болсон мөрдөгч Батаа хотын доорх нууц замын сүлжээг тайлахаар оролдоно. Гэвч энэ замын үнэн нь түүнийг ч хуурч болохуйц. Хар ба цагаан хоёрын хооронд алийг нь сонгох вэ?',
    coverColor: '#0a1205',
    coverImage: 'https://images.unsplash.com/photo-1687089693186-134e4b0cb30b?w=400&h=600&fit=crop&auto=format',
    year: 2023,
    chapters: makeChapters(34, 0),
    tags: ['Шинэ'],
  },
  {
    id: 'munguntamir',
    title: 'Мөнгөнтамир',
    author: 'Б. Нандин',
    artist: 'Х. Дөлгөөн',
    genres: ['Романтик', 'Амьдрал'],
    status: 'Дууссан',
    rating: 4.4,
    ratingCount: 4200,
    chapterCount: 28,
    synopsis: 'Гол эрэг дагуух жижиг тосгонд өссөн хоёр найз хотод сурахаар ирнэ. Амьдрал тэднийг янз бүрийн зам руу дагуулна гэвч мөнгөнтамирын ус тэднийг үргэлж нийлүүлдэг. Буцаж ирэх үе хэзээ вэ?',
    coverColor: '#050f1a',
    coverImage: 'https://images.unsplash.com/photo-1571527831441-e94409cac577?w=400&h=600&fit=crop&auto=format',
    year: 2018,
    chapters: makeChapters(28, 28),
    tags: ['Дууссан'],
  },
  {
    id: 'galiin-nud',
    title: 'Галын Нүд',
    author: 'С. Батзориг',
    artist: 'М. Цэрэнпунцаг',
    genres: ['Тулаан', 'Фантази', 'Адал явдал'],
    status: 'Үргэлжилж буй',
    rating: 4.7,
    ratingCount: 15600,
    chapterCount: 56,
    synopsis: 'Галын хүч эзэмшсэн байлдагч Сүхбаатар ертөнцийн тэнцвэрийг сэргээхийн тулд арван найман дайчны сонгонд орно. Гал унтраах ус биш, гал тамиглах гал хэрэгтэй. Сэтгэлийн гал ба биеийн гал — аль нь хүчтэй вэ?',
    coverColor: '#1a0500',
    coverImage: 'https://images.unsplash.com/photo-1629017131883-42f94a913c3f?w=400&h=600&fit=crop&auto=format',
    year: 2021,
    chapters: makeChapters(56, 30),
    readProgress: { chapter: 30, page: 3, total: 19 },
    tags: ['Халуун'],
  },
  {
    id: 'tsatsral',
    title: 'Цацрал',
    author: 'Д. Оюунцэцэг',
    artist: 'Б. Мөнхжаргал',
    genres: ['Нууцлаг', 'Шинжлэх ухаан', 'Тулаан'],
    status: 'Үргэлжилж буй',
    rating: 4.6,
    ratingCount: 9800,
    chapterCount: 41,
    synopsis: 'Цөмийн физикч Дулмаа нэг туршилтын явцад өөрийнхөө биед цацрагийн хүч шингэснийг мэдэнэ. Энэ хүч нь ашиг уу, аюул уу — тэр өөрөө шийдэх ёстой. Засгийн газар болон нууц байгууллагууд түүнийг хайж байна.',
    coverColor: '#050a1a',
    coverImage: 'https://images.unsplash.com/photo-1615038403612-c0db30ce8f91?w=400&h=600&fit=crop&auto=format',
    year: 2022,
    chapters: makeChapters(41, 7),
    tags: ['Шинэ'],
  },
  {
    id: 'gobi-haluun',
    title: 'Говийн Халуун',
    author: 'Н. Ариунаа',
    artist: 'Т. Энхжаргал',
    genres: ['Адал явдал', 'Амьдрал', 'Нууцлаг'],
    status: 'Дууссан',
    rating: 4.3,
    ratingCount: 3100,
    chapterCount: 22,
    synopsis: 'Говийн хайгуулч Хорлоо эртний хот олсноо мэдээлнэ. Гэвч тэр хот одоо ч хоосон биш — нуугдаж байгаа хэн нэгэн дотор байна. Мянган жилийн нууц задрахад бэлэн үү?',
    coverColor: '#1a0e00',
    coverImage: 'https://images.unsplash.com/photo-1563310978-dd47a28323ab?w=400&h=600&fit=crop&auto=format',
    year: 2020,
    chapters: makeChapters(22, 22),
    tags: ['Дууссан'],
  },
  {
    id: 'undes',
    title: 'Үндэс',
    author: 'Э. Гантулга',
    artist: 'О. Болормаа',
    genres: ['Тулаан', 'Фантази', 'Нууцлаг'],
    status: 'Үргэлжилж буй',
    rating: 4.9,
    ratingCount: 31200,
    chapterCount: 94,
    synopsis: 'Монголын нууц хамгаалалтын байгууллагын гишүүн Нарантуул ертөнцийн бусад хэмжээст нэвтрэх чадвартай болно. Хоёр ертөнцийн дайтаж буй талуудын аль нэгийг сонгох ёстой — гэвч үнэн нь аль нэг талд байхгүй. Үндэс нь хаана байдаг вэ?',
    coverColor: '#050010',
    coverImage: 'https://images.unsplash.com/photo-1769221909918-8d40bf8c2459?w=400&h=600&fit=crop&auto=format',
    year: 2020,
    chapters: makeChapters(94, 60),
    readProgress: { chapter: 60, page: 11, total: 21 },
    tags: ['№1 Эрэлттэй', 'Шилдэг'],
  },
]

export const GENRES = ['Адал явдал', 'Тулаан', 'Романтик', 'Фантази', 'Инээдэм', 'Нууцлаг', 'Амьдрал', 'Шинжлэх ухаан']

// Real manga panel images for the reader
export const READER_PAGES = [
  'https://images.unsplash.com/photo-1772537287525-5523925f7677?w=800&h=1200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1763732397784-c5ff2651d40c?w=800&h=1200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1768142206870-9a7fedcf646c?w=800&h=1200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1768142206948-fbbb321aac4d?w=800&h=1200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1763732397953-7866a2dd8289?w=800&h=1200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1763732397864-5b860bb298b0?w=800&h=1200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1763732397715-ed72258ccb49?w=800&h=1200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1768142206945-35402ab4dc6c?w=800&h=1200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1780871766050-d7db65bc618f?w=800&h=1200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1763315371250-4ecc8bcd0638?w=800&h=1200&fit=crop&auto=format',
]

export function getManga(id: string): Manga | undefined {
  return MANGA_LIST.find((m) => m.id === id)
}

export function getRelated(id: string): Manga[] {
  return getRelatedFrom(MANGA_LIST, id)
}

export function getRelatedFrom(list: Manga[], id: string): Manga[] {
  const manga = list.find((m) => m.id === id)
  if (!manga) return []
  return list.filter(
    (m) => m.id !== id && m.genres.some((g) => manga.genres.includes(g))
  ).slice(0, 5)
}

export function mangaFromRecord(id: string, data: Record<string, unknown>): Manga {
  const chapterCount = Math.max(1, Number(data.chapterCount) || 1)
  return {
    id,
    title: String(data.title || 'Гарчиггүй'),
    author: String(data.author || ''),
    artist: String(data.artist || data.author || ''),
    genres: Array.isArray(data.genres) ? data.genres.map(String) : [],
    status: data.status === 'Дууссан' ? 'Дууссан' : 'Үргэлжилж буй',
    rating: Number(data.rating) || 0,
    ratingCount: Number(data.ratingCount) || 0,
    chapterCount,
    synopsis: String(data.synopsis || ''),
    coverColor: String(data.coverColor || '#0d0a1e'),
    coverImage: String(data.coverImage || ''),
    year: Number(data.year) || new Date().getFullYear(),
    chapters: makeChapters(chapterCount),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
  }
}
