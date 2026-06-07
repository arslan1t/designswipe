"use client";

import { createContext, useContext, useState, useEffect, type ReactNode, createElement } from "react";

// ─── Translation keys ────────────────────────────────────────────────────────

export const translations = {
  en: {
    // Nav
    "nav.home":      "Home",
    "nav.history":   "History",
    "nav.scan":      "Scan",
    "nav.favorites": "Favorites",
    "nav.profile":   "Profile",

    // Login
    "login.subtitle":    "Furniture picks from your room photo",
    "login.feat1":       "Scan room with photo",
    "login.feat2":       "AI analyzes interior",
    "login.feat3":       "Finds furniture with prices",
    "login.feat4":       "Saves project history",
    "login.cta":         "Sign in with Google",
    "login.redirecting": "Redirecting…",
    "login.terms":       "By signing in you agree to terms of use.\nData is stored locally.",
    "login.error":       "Sign in failed. Please try again.",

    // Home
    "home.greeting":     "Hello",
    "home.tagline":      "Your AI interior assistant",
    "home.cta":          "Scan a room",
    "home.swipe":        "Browse designs",
    "home.history":      "Scan history",
    "home.favorites":    "Saved",

    // Swipe
    "swipe.empty":       "No designs match your filters",
    "swipe.reset":       "Reset filters",
    "swipe.breakdown":   "Furniture breakdown",
    "swipe.breakdown.sub": "What's in this design and where to buy",
    "swipe.done":        "You've seen all designs!",
    "swipe.done.sub":    "Reset filters or restart",
    "swipe.restart":     "Start over",

    // Upload
    "upload.title":      "Scan Your Room",
    "upload.subtitle":   "Take or upload a photo — AI will suggest furniture",
    "upload.photo":      "Add photo",
    "upload.room":       "Room type",
    "upload.budget":     "Budget",
    "upload.style":      "Preferred style",
    "upload.style.any":  "Any (AI decides)",
    "upload.area":       "Area (m²)",
    "upload.notes":      "Notes",
    "upload.notes.ph":   "E.g. minimalism, no dark colors…",
    "upload.analyze":    "Analyze with AI",
    "upload.analyzing":  "Analyzing…",

    // Results
    "results.title":     "AI Furniture Picks",
    "results.style":     "Style",
    "results.condition": "Condition",
    "results.summary":   "Summary",
    "results.furniture": "Furniture",
    "results.buy":       "Buy",
    "results.search":    "Search",
    "results.all":       "All",
    "results.empty":     "No products found",
    "results.loading":   "Searching marketplaces…",

    // Breakdown
    "breakdown.title":   "Design Breakdown",
    "breakdown.items":   "items",
    "breakdown.links":   "product links",
    "breakdown.auto":    "Auto-generated breakdown based on style and room type. Links lead to matching furniture.",
    "breakdown.back":    "Back to designs",
    "breakdown.zone.seating":  "Seating",
    "breakdown.zone.textiles": "Textiles",
    "breakdown.zone.lighting": "Lighting",
    "breakdown.zone.storage":  "Storage",
    "breakdown.zone.decor":    "Accents & Decor",
    "breakdown.key":     "Key",
    "breakdown.important": "Important",
    "breakdown.accent":  "Accent",
    "breakdown.easy":    "Easy to recreate",
    "breakdown.medium":  "Medium complexity",
    "breakdown.hard":    "Complex project",
    "breakdown.principles": "Style principles",
    "breakdown.where":   "Where to buy",
    "breakdown.pcs":     "pcs",

    // Favorites
    "favorites.title":   "Saved Designs",
    "favorites.empty":   "No saved designs yet",
    "favorites.empty.sub": "Swipe through interiors and heart the ones you like",
    "favorites.go":      "Go to swipe",
    "favorites.remove":  "Remove",

    // History
    "history.title":     "Scan History",
    "history.empty":     "No scans yet",
    "history.empty.sub": "Upload a room photo to get AI furniture recommendations",
    "history.scan":      "Scan room",
    "history.items":     "items",
    "history.delete":    "Delete",

    // Profile
    "profile.title":     "Profile",
    "profile.scans":     "Room scans",
    "profile.region":    "Marketplace region",
    "profile.google":    "Google account",
    "profile.signout":   "Sign out",
    "profile.signingout": "Signing out…",
    "profile.anon":      "Not signed in",
    "profile.footer":    "RoomScan AI · Data stored locally",
    "profile.history":   "Scan history",
    "profile.newscan":   "New scan",
    "profile.swipe":     "Browse designs",

    // Common
    "common.loading":    "Loading…",
    "common.error":      "Something went wrong",
    "common.retry":      "Try again",
    "common.back":       "Back",
    "common.saved":      "Saved",
    "common.match":      "match",
  },
  ru: {
    // Nav
    "nav.home":      "Главная",
    "nav.history":   "История",
    "nav.scan":      "Скан",
    "nav.favorites": "Избранное",
    "nav.profile":   "Профиль",

    // Login
    "login.subtitle":    "Подбор мебели по фото комнаты",
    "login.feat1":       "Сканируй комнату фото",
    "login.feat2":       "ИИ анализирует интерьер",
    "login.feat3":       "Подбирает мебель с ценами",
    "login.feat4":       "Сохраняет историю проектов",
    "login.cta":         "Войти через Google",
    "login.redirecting": "Перенаправление…",
    "login.terms":       "Входя, ты соглашаешься с использованием сервиса.\nДанные хранятся только у тебя.",
    "login.error":       "Ошибка входа. Попробуй снова.",

    // Home
    "home.greeting":     "Привет",
    "home.tagline":      "Твой ИИ-помощник по интерьеру",
    "home.cta":          "Сфотографировать комнату",
    "home.swipe":        "Листать дизайны",
    "home.history":      "История сканов",
    "home.favorites":    "Сохранённые",

    // Swipe
    "swipe.empty":       "Нет дизайнов по фильтрам",
    "swipe.reset":       "Сбросить фильтры",
    "swipe.breakdown":   "Разбор мебели",
    "swipe.breakdown.sub": "Какие предметы здесь, где купить",
    "swipe.done":        "Ты посмотрел все дизайны!",
    "swipe.done.sub":    "Сбрось фильтры или начни заново",
    "swipe.restart":     "Начать заново",

    // Upload
    "upload.title":      "Скан комнаты",
    "upload.subtitle":   "Сфотографируй или загрузи фото — ИИ подберёт мебель",
    "upload.photo":      "Добавить фото",
    "upload.room":       "Тип комнаты",
    "upload.budget":     "Бюджет",
    "upload.style":      "Желаемый стиль",
    "upload.style.any":  "Любой (ИИ сам определит)",
    "upload.area":       "Площадь (м²)",
    "upload.notes":      "Пожелания",
    "upload.notes.ph":   "Например, минимализм, без тёмных цветов…",
    "upload.analyze":    "Анализировать с ИИ",
    "upload.analyzing":  "Анализируем…",

    // Results
    "results.title":     "ИИ-подбор мебели",
    "results.style":     "Стиль",
    "results.condition": "Состояние",
    "results.summary":   "Общий анализ",
    "results.furniture": "Мебель",
    "results.buy":       "Купить",
    "results.search":    "Поиск",
    "results.all":       "Все",
    "results.empty":     "Товары не найдены",
    "results.loading":   "Ищем в маркетплейсах…",

    // Breakdown
    "breakdown.title":   "Разбор интерьера",
    "breakdown.items":   "предметов",
    "breakdown.links":   "ссылок на товары",
    "breakdown.auto":    "Разбор сгенерирован автоматически на основе стиля и типа комнаты. Ссылки ведут на подходящую мебель.",
    "breakdown.back":    "Вернуться к интерьерам",
    "breakdown.zone.seating":  "Зона посадки",
    "breakdown.zone.textiles": "Текстиль и мягкость",
    "breakdown.zone.lighting": "Освещение",
    "breakdown.zone.storage":  "Хранение",
    "breakdown.zone.decor":    "Акценты и декор",
    "breakdown.key":     "Ключевой",
    "breakdown.important": "Важный",
    "breakdown.accent":  "Акцент",
    "breakdown.easy":    "Легко повторить",
    "breakdown.medium":  "Средняя сложность",
    "breakdown.hard":    "Сложный проект",
    "breakdown.principles": "Ключевые принципы стиля",
    "breakdown.where":   "Где купить",
    "breakdown.pcs":     "пред.",

    // Favorites
    "favorites.title":   "Избранные дизайны",
    "favorites.empty":   "Пока нет сохранённых дизайнов",
    "favorites.empty.sub": "Свайпай интерьеры и жми ❤️ на понравившихся",
    "favorites.go":      "Перейти к свайпу",
    "favorites.remove":  "Удалить",

    // History
    "history.title":     "История сканов",
    "history.empty":     "Сканов пока нет",
    "history.empty.sub": "Загрузи фото комнаты чтобы получить рекомендации",
    "history.scan":      "Сфотографировать",
    "history.items":     "предметов",
    "history.delete":    "Удалить",

    // Profile
    "profile.title":     "Профиль",
    "profile.scans":     "Сканов комнат",
    "profile.region":    "Регион маркетплейсов",
    "profile.google":    "Google аккаунт",
    "profile.signout":   "Выйти из аккаунта",
    "profile.signingout": "Выходим…",
    "profile.anon":      "Не авторизован",
    "profile.footer":    "RoomScan AI · Данные хранятся локально",
    "profile.history":   "История сканов",
    "profile.newscan":   "Новый анализ",
    "profile.swipe":     "Swipe интерьеры",

    // Common
    "common.loading":    "Загрузка…",
    "common.error":      "Что-то пошло не так",
    "common.retry":      "Попробовать снова",
    "common.back":       "Назад",
    "common.saved":      "Сохранено",
    "common.match":      "совп.",
  },
} as const;

export type Lang = keyof typeof translations;
export type TranslationKey = keyof typeof translations["en"];

// ─── Context ─────────────────────────────────────────────────────────────────

type LangContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
};

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

const STORAGE_KEY = "roomscan:lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === "en" || saved === "ru") setLangState(saved);
    else {
      // Default to English on first visit
      setLangState("en");
      localStorage.setItem(STORAGE_KEY, "en");
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: TranslationKey): string =>
    (translations[lang] as Record<string, string>)[key] ?? key;

  return createElement(LangContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useLanguage() {
  return useContext(LangContext);
}
