# PROJECT AUDIT — DesignSwipe / RoomScan AI
_Generated: 2026-06-07_

---

## 1. Existing Architecture

```
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase Auth · Claude Haiku API
```

**Pages (app/)**
| Route | Purpose | Status |
|---|---|---|
| `/` | Dashboard / Landing | ✅ Working |
| `/swipe` | Swipe-лента с фильтрами | ✅ Working |
| `/upload` | Загрузка фото комнаты | ✅ Working |
| `/results` | AI-результаты + мебель | ✅ Working |
| `/breakdown/[id]` | Разбор дизайна по предметам | ✅ Working |
| `/favorites` | Избранные дизайны | ✅ Working |
| `/history` | История сканов | ✅ Working |
| `/profile` | Профиль + регион + выход | ✅ Working |
| `/login` | Google OAuth | ✅ Working |
| `/auth/callback` | OAuth callback | ✅ Working |
| `/analysis` | Старый placeholder | ❌ DEAD — не используется |

**API Routes**
| Route | Purpose | Status |
|---|---|---|
| `/api/analyze-room` | Фото → Claude Haiku → JSON | ✅ Working |
| `/api/search-furniture` | Запрос → маркетплейсы | ✅ Working |
| `/api/designs` | Unsplash search | ❌ DEAD — ни одна страница не вызывает |

**Key Libraries**
| File | Used by | Status |
|---|---|---|
| `lib/mockDesigns.ts` | swipe/page.tsx | ✅ Active |
| `lib/filterEngine.ts` | swipe/page.tsx | ✅ Active |
| `lib/generateBreakdown.ts` | breakdown/[id]/page.tsx | ✅ Active |
| `lib/designBreakdowns.ts` | breakdown/[id]/page.tsx | ✅ Active |
| `lib/scanHistory.ts` | results, history, profile | ✅ Active |
| `lib/region.ts` | results, profile, search API | ✅ Active |
| `lib/supabaseClient.ts` | AuthGuard, login, callback, useAuth | ✅ Active |
| `lib/useAuth.ts` | profile/page.tsx | ✅ Active |
| `lib/types.ts` | upload, results, API routes | ✅ Active |
| `lib/supabase.ts` | nobody | ❌ DEAD |
| `lib/designLibrary.ts` | only api/designs (dead) | ❌ DEAD |
| `lib/imageLoader.ts` | nobody | ❌ DEAD |
| `lib/styleKeywords.ts` | nobody | ❌ DEAD |
| `lib/unsplash.ts` | only api/designs (dead) | ❌ DEAD |

**Components**
| File | Used by | Status |
|---|---|---|
| `FiltersBar.tsx` | swipe/page.tsx | ✅ Active |
| `DesignCard.tsx` | swipe/page.tsx | ✅ Active |
| `BottomNav.tsx` | layout.tsx | ✅ Active |
| `LandingPage.tsx` | app/page.tsx | ✅ Active |
| `AuthGuard.tsx` | layout.tsx | ✅ Active |
| `AuthButton.tsx` | nobody | ❌ DEAD |
| `ImageWithFallback.tsx` | nobody | ❌ DEAD |

---

## 2. Existing Features

- Swipe-лента с 89 фотографиями интерьеров (Unsplash CDN)
- 8-мерная фильтрация: стиль / комната / палитра / бюджет / освещение / материал / ориентация / тема
- Breakdown: разбор дизайна по предметам с ценами и ссылками
- Auto-generate breakdown для всех 89 дизайнов
- RoomScan AI: загрузка фото → Claude Haiku → список мебели
- Поиск по маркетплейсам (WB, Ozon, AliExpress, IKEA / Amazon, Wayfair)
- Регионы: СНГ / США
- Google OAuth через Supabase
- AuthGuard на всех маршрутах
- История сканов в localStorage
- Избранные дизайны в localStorage

---

## 3. Missing Features / Production Gaps

- ❌ `app/not-found.tsx` — нет 404 страницы
- ❌ `app/error.tsx` — нет error boundary (500)
- ❌ `public/robots.txt` — нет
- ❌ `public/sitemap.xml` — нет
- ❌ `.env.example` устарел — не содержит ANTHROPIC_API_KEY и SERPAPI_KEY
- ❌ Нет rate limiting на API routes (особенно /api/analyze-room — дорогой вызов Claude)
- ❌ Нет валидации тела запроса в /api/analyze-room
- ❌ viewport в metadata — Next.js 16 требует отдельный export

---

## 4. Technical Debt

- **Дублирование Supabase клиента**: `lib/supabase.ts` (unused) и `lib/supabaseClient.ts` (active) — два клиента, один мёртвый
- **Дублирование Design типа**: `lib/designLibrary.ts` определяет свой `Design`, `lib/types.ts` тоже. Оба существуют независимо
- **Dead API route** `/api/designs` использует старый `designLibrary` и `unsplash.ts` — vestigial от первой версии
- **`app/analysis/page.tsx`** — старый placeholder с текстом "Подключи свой бэкенд"
- **`lib/imageLoader.ts`** — полноценная реализация live Unsplash/Pexels загрузки, которая никогда не используется (заменена статическим mockDesigns)

---

## 5. Security Issues

| Issue | Severity | Notes |
|---|---|---|
| Нет rate limiting на `/api/analyze-room` | HIGH | Каждый вызов = платный запрос к Claude API |
| Нет валидации размера base64 в API (только bodySizeLimit) | MEDIUM | Можно передать невалидные данные |
| SERPAPI_KEY не в .env.example | LOW | Документация неполная |
| Нет input sanitization в search API | LOW | Query передаётся в fetch к внешним API |

---

## 6. Performance Issues

- `recharts` в зависимостях — нигде не используется (лишний бандл ~300kb)
- `logo.png` в public/ — 1MB, нет оптимизированной версии
- Нет `loading.tsx` для медленных страниц (upload, results)

---

## 7. Production Blockers (P0)

1. Нет 404 страницы → Next.js покажет дефолтную, некрасивую
2. Нет error.tsx → необработанные ошибки убивают весь UI
3. viewport в metadata устарел для Next.js 16 (console warning)
4. Мёртвый код засоряет bundle и вводит в заблуждение
5. .env.example неполный → новый разработчик не знает нужных переменных
