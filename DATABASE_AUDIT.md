# DATABASE AUDIT
_Generated: 2026-06-07_

---

## Current Implementation

Проект использует **Supabase** только для **аутентификации** (Google OAuth). База данных для пользовательских данных не используется.

### Что хранится где

| Данные | Хранилище | Примечания |
|---|---|---|
| Auth session / user | Supabase Auth | Google OAuth, PKCE flow |
| Избранные дизайны | `localStorage` | ключ задан в AppContext |
| История сканов | `localStorage` | `roomscan:history` |
| Регион пользователя | `localStorage` | `roomscan:region` |
| Дизайны (89 шт.) | Static TS file | `lib/mockDesigns.ts` |
| Breakdowns (12 шт.) | Static TS file | `lib/designBreakdowns.ts` |

### Supabase Tables

Проверка схемы невозможна без прямого доступа к проекту `dmbsfyuepjvosmjfodoc`. По коду используется **только Auth API** — таблицы не создавались.

---

## Риски текущей архитектуры

| Риск | Уровень | Описание |
|---|---|---|
| Потеря избранных при смене браузера | MEDIUM | localStorage не синхронизируется |
| Потеря истории сканов | MEDIUM | localStorage не синхронизируется |
| Нет бэкапа пользовательских данных | MEDIUM | Всё в localStorage |

---

## Рекомендации (P1, не блокируют продакшн)

Если нужна синхронизация данных между устройствами — создать две таблицы:

```sql
-- Избранные дизайны
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  design_id text not null,
  created_at timestamptz default now(),
  unique(user_id, design_id)
);
alter table favorites enable row level security;
create policy "users own favorites"
  on favorites for all using (auth.uid() = user_id);

-- История сканов
create table scan_history (
  id text primary key,
  user_id uuid references auth.users not null,
  data jsonb not null,
  created_at timestamptz default now()
);
alter table scan_history enable row level security;
create policy "users own history"
  on scan_history for all using (auth.uid() = user_id);
```

**Для текущего MVP — не требуется.** localStorage достаточен для одного устройства.
