# MANGA.MN — Mongolian Manga Reading Website

## Context
Build a full-featured manga reading website "MANGA.MN" for Mongolian readers. All UI text in Mongolian Cyrillic. Premium dark editorial aesthetic. This replaces the blank App.tsx with a multi-page React app.

## Aesthetic Stance
- **Dark editorial/archival** — MoMA meets manga magazine. Clean geometry, strong typographic hierarchy.
- **Fonts**: Inter (body/UI, Cyrillic support) + Noto Sans (fallback for Cyrillic glyphs) from Google Fonts.
- **Palette**: bg `#0B0D12`, card `#151923`, accent `#8B5CF6`, text `#F5F7FA`, muted `#9CA3AF`, border `rgba(255,255,255,0.08)`
- **Cover colors provide the vibrancy** — UI stays restrained.

## Architecture

### Routing (react-router-dom)
Install `react-router-dom`. Routes:
- `/` — Home ("Нүүр")
- `/manga` — Browse & Search ("Манга")
- `/manga/:id` — Manga Detail
- `/manga/:id/read/:chapter` — Reader
- `/library` — Personal Library ("Миний сан")

### File Structure
```
src/
  App.tsx              — router setup
  index.css            — Google Fonts @import, Tailwind, CSS variables
  data/
    manga.ts           — fictional manga data (titles, covers, chapters)
  components/
    Layout.tsx         — desktop header + mobile bottom nav shell
    MangaCard.tsx      — cover card (2:3 ratio, title, genre, chapter)
    GenreChip.tsx      — pill badge
    ChapterRow.tsx     — chapter list item (read/unread/current states)
    ProgressBar.tsx    — reading progress indicator
    Skeleton.tsx       — loading skeleton
    SearchBar.tsx      — search input with suggestions
    BottomSheet.tsx    — mobile filter drawer
  pages/
    HomePage.tsx
    BrowsePage.tsx
    DetailPage.tsx
    ReaderPage.tsx
    LibraryPage.tsx
```

## Data Layer (src/data/manga.ts)
10 fictional manga with:
- Mongolian titles (e.g., "Мөнгөн Сум", "Хар Нар", "Тэнгэрийн Хаан")
- Authors with Mongolian names
- Genres from the spec
- Chapter lists (15–80 chapters)
- Cover placeholder colors (vivid per-manga hues)
- Synopsis in Mongolian
- Rating, status, chapter count

Use Unsplash for cover images with manga/comic/illustration themes.

## Key Implementation Details

### src/index.css
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap');
@import 'tailwindcss';

@theme {
  --color-bg: #0B0D12;
  --color-card: #151923;
  --color-accent: #8B5CF6;
  --color-text: #F5F7FA;
  --color-muted: #9CA3AF;
  --color-border: rgba(255,255,255,0.08);
  --font-sans: 'Inter', 'Noto Sans', sans-serif;
  --radius: 12px;
}

body { background: #0B0D12; color: #F5F7FA; font-family: var(--font-sans); }
```

### Layout.tsx
- Desktop: fixed top header (logo, nav links, search icon, profile avatar)
- Mobile: bottom navigation bar (4 tabs: Нүүр, Хайх, Миний сан, Профайл)
- Reader page hides bottom nav
- Max content width 1280px, centered

### HomePage.tsx sections
1. **Featured hero** — large card with backdrop blur overlay, cover, title, synopsis, genre chips, "Уншиж эхлэх" + "Санд хадгалах" buttons
2. **Үргэлжлүүлэн унших** — horizontal scroll row, progress bars
3. **Эрэлттэй манга** — ranked grid with position numbers
4. **Шинээр нэмэгдсэн бүлгүүд** — list with chapter + time
5. **Танд санал болгох** — card grid

### BrowsePage.tsx
- Search bar with live suggestions
- Filter chips: genre (multi-select), status, sort
- Responsive grid: 4 cols desktop, 2 cols mobile
- Active filter pills with × dismiss
- Empty state illustration + "Шүүлтүүр цэвэрлэх" button
- Mobile: filter button opens BottomSheet

### DetailPage.tsx
- Blurred backdrop cover behind hero section
- Cover image (2:3), title, author, meta, rating stars, chapter count
- Expandable synopsis (clamp + "Дэлгэрэнгүй" toggle)
- CTA buttons: "Эхнээс нь унших", "Үргэлжлүүлэх", "Санд хадгалах" (toggle saved state)
- Chapter list with search + sort toggle, read/unread/current styling
- "Төстэй манга" grid
- "Сэтгэгдэл" section (3 sample comments)

### ReaderPage.tsx — most important
- **Immersive**: black background, no chrome by default
- Tap-to-toggle controls (header bar + bottom bar)
- **Header**: back arrow, manga title, chapter selector dropdown, settings gear
- **Modes**: vertical scroll (default) / paginated (left-right arrows)
- **Settings panel** (slide-in from right): reading mode toggle, image width slider, bg color (black/white/sepia), reading direction (RTL/LTR)
- **Images**: centered, max-w configurable, mobile fills viewport width
- **Bottom bar**: prev chapter, page X/Y, next chapter, fullscreen button
- **End of chapter card**: "Дараагийн бүлэг" prominent CTA
- **Image error state**: gray placeholder + "Дахин оролдох" retry button
- Sample pages: use Unsplash manga/comic-style illustrations

### LibraryPage.tsx
- Three tabs: "Уншиж байгаа", "Хадгалсан", "Дуусгасан"
- Each entry: cover, title, progress bar, "Үргэлжлүүлэх" button, context menu (remove, change status)
- Empty state per tab with "Манга үзэх" → navigate to /manga
- Sign-in prompt banner (guest mode) with explanation in Mongolian

## Prototype Flows (React state)
1. Home → click manga card → DetailPage → "Эхнээс нь унших" → ReaderPage → next chapter
2. Browse → filter by genre → click result → DetailPage
3. DetailPage → "Санд хадгалах" → toggle saved → Library shows it
4. Reader → settings gear → panel opens → toggle reading mode

## Responsive Breakpoints
- Mobile-first; `md:` prefix for ≥768px, `lg:` for ≥1024px
- Desktop nav: hidden on mobile; bottom nav: hidden on desktop and in reader
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- Touch targets: minimum 44×44px

## Verification
1. Navigate all 5 routes work
2. Reader tap-to-toggle works
3. Settings panel opens/closes
4. Save manga → appears in Library tab
5. Filter chips in Browse work
6. Mobile layout at 390px viewport
