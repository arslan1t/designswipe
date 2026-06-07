# FINALIZATION PLAN — DesignSwipe
_Generated: 2026-06-07_

---

## P0 — Required before production (executing automatically)

| # | Task | Action |
|---|---|---|
| P0-1 | Delete dead files (7 files) | `rm` |
| P0-2 | Create `app/not-found.tsx` | New file |
| P0-3 | Create `app/error.tsx` | New file |
| P0-4 | Create `public/robots.txt` | New file |
| P0-5 | Fix viewport metadata in `app/layout.tsx` | Edit |
| P0-6 | Update `.env.example` with all keys | Edit |

---

## P1 — Important (manual / future sprint)

| # | Task | Notes |
|---|---|---|
| P1-1 | Rate limiting on `/api/analyze-room` | Use upstash/ratelimit or middleware counter |
| P1-2 | Input validation in `/api/analyze-room` | Validate base64, roomType enum, budget enum |
| P1-3 | Remove `recharts` from dependencies | Not used anywhere, saves ~300kb bundle |
| P1-4 | `public/sitemap.xml` | Static XML for 8 public routes |
| P1-5 | `app/loading.tsx` for /upload and /results | Skeleton states |
| P1-6 | Optimize `public/logo.png` (1MB → <100kb) | Use squoosh or similar |

---

## P2 — Nice to have

| # | Task | Notes |
|---|---|---|
| P2-1 | OG image / social share meta tags | For sharing results links |
| P2-2 | PWA manifest | installable app |
| P2-3 | Offline fallback | Service worker |
| P2-4 | Analytics | Plausible / Vercel Analytics |
| P2-5 | Supabase DB for favorites | Currently localStorage only |
