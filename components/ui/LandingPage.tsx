"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Camera, Sparkles, Heart, Clock, ChevronRight,
  Sofa, LayoutGrid, TrendingUp, Zap,
} from "lucide-react";
import { getHistory } from "@/lib/scanHistory";
import { useApp } from "@/app/context/AppContext";
import type { HistoryEntry } from "@/lib/scanHistory";
import { useLanguage } from "@/lib/i18n";

// ── Fade-in animation helper ──────────────────────────────────────────────────
const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const CONDITION_ICONS: Record<string, string> = {
  needs_renovation: "🔨",
  fresh_renovation: "✨",
  good_condition:   "👍",
  excellent:        "🏆",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const { favorites } = useApp();
  const { t, lang } = useLanguage();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const recentScans = history.slice(0, 3);
  const scanCount   = history.length;
  const favCount    = favorites.length;

  return (
    <div className="min-h-screen pb-8">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <FadeUp>
        <div className="px-4 pt-10 pb-2 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 rounded-lg bg-sky-600/20 border border-sky-600/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <span className="text-xs font-semibold text-sky-400 tracking-wide">RoomScan AI</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{t("home.greeting")}! 👋</h1>
            <p className="text-sm text-slate-400 mt-0.5">{t("home.tagline")}</p>
          </div>
        </div>
      </FadeUp>

      {/* ── Hero CTA ─────────────────────────────────────────────────────────── */}
      <FadeUp delay={0.05}>
        <div className="px-4 mt-4">
          <button
            onClick={() => router.push("/upload")}
            className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-5 text-left shadow-xl shadow-sky-900/40 hover:shadow-sky-900/60 hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            {/* Decorative glow */}
            <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-6 bottom-0 w-20 h-20 rounded-full bg-sky-300/20 blur-xl" />

            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <p className="text-lg font-bold text-white">{t("home.cta")}</p>
              <p className="text-sm text-sky-200 mt-0.5">{t("upload.subtitle")}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-white/80 font-medium">
                <span>{lang === "en" ? "Start" : "Начать"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>
      </FadeUp>

      {/* ── Stats row ────────────────────────────────────────────────────────── */}
      <FadeUp delay={0.1}>
        <div className="px-4 mt-4 grid grid-cols-3 gap-3">
          {[
            { value: scanCount, label: lang === "en" ? "Scans"   : "Сканов",    icon: Camera, color: "text-sky-400" },
            { value: favCount,  label: lang === "en" ? "Saved"   : "Избранных", icon: Heart,  color: "text-rose-400" },
            { value: "AI",      label: lang === "en" ? "Analysis": "Анализ",    icon: Zap,    color: "text-amber-400" },
          ].map((stat, i) => (
            <div key={i} className="card p-3 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </FadeUp>

      {/* ── Quick actions ────────────────────────────────────────────────────── */}
      <FadeUp delay={0.15}>
        <div className="px-4 mt-5">
          <p className="section-label mb-3">{lang === "en" ? "Quick actions" : "Быстрые действия"}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: LayoutGrid,
                title: lang === "en" ? "Browse Interiors" : "Свайп интерьеров",
                sub: lang === "en" ? "Find your style" : "Найди свой стиль",
                href: "/swipe",
                color: "bg-violet-600/15 border-violet-600/30 text-violet-400",
              },
              {
                icon: Heart,
                title: lang === "en" ? "Favorites" : "Избранное",
                sub: `${favCount} ${lang === "en" ? "saved" : "сохранено"}`,
                href: "/favorites",
                color: "bg-rose-500/15 border-rose-500/30 text-rose-400",
              },
              {
                icon: Clock,
                title: lang === "en" ? "Scan History" : "История сканов",
                sub: `${scanCount} ${lang === "en" ? "analyses" : "анализов"}`,
                href: "/history",
                color: "bg-amber-500/15 border-amber-500/30 text-amber-400",
              },
              {
                icon: TrendingUp,
                title: lang === "en" ? "Design Breakdown" : "Разборы дизайна",
                sub: lang === "en" ? "Furniture in the frame" : "Что за мебель в кадре",
                href: "/swipe",
                color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
              },
            ].map(item => (
              <button
                key={item.href + item.title}
                onClick={() => router.push(item.href)}
                className="card p-4 text-left hover:border-slate-600 active:scale-[0.97] transition-transform flex flex-col gap-2"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* ── Recent scans ─────────────────────────────────────────────────────── */}
      {recentScans.length > 0 && (
        <FadeUp delay={0.2}>
          <div className="px-4 mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="section-label">{lang === "en" ? "Recent scans" : "Последние сканы"}</p>
              <button
                onClick={() => router.push("/history")}
                className="text-xs text-sky-400 flex items-center gap-1"
              >
                {lang === "en" ? "All" : "Все"} <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {recentScans.map((entry, idx) => (
                <motion.button
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  onClick={() => router.push("/history")}
                  className="w-full card p-3 flex items-center gap-3 text-left hover:border-slate-600 active:scale-[0.98] transition-transform"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center">
                    {entry.imagePreview ? (
                      <img src={entry.imagePreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Sofa className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {entry.detectedStyle}
                      <span className="ml-1">{CONDITION_ICONS[entry.roomCondition] || ""}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{entry.furnitureCount} {lang === "en" ? "furniture items" : "позиций мебели"}</p>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">{entry.summary}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                </motion.button>
              ))}
            </div>
          </div>
        </FadeUp>
      )}

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <FadeUp delay={0.25}>
        <div className="px-4 mt-5">
          <p className="section-label mb-3">{lang === "en" ? "How it works" : "Как это работает"}</p>
          <div className="card p-4 space-y-4">
            {(lang === "en" ? [
              { step: "1", title: "Photograph your room",   sub: "Upload a photo or take one right from your phone",   icon: Camera   },
              { step: "2", title: "AI analyzes the space",  sub: "Claude AI detects style, colors, and what to buy",   icon: Sparkles },
              { step: "3", title: "Get a furniture list",   sub: "With real prices and links to marketplaces",         icon: Sofa     },
            ] : [
              { step: "1", title: "Сфотографируй комнату",       sub: "Загрузи фото или сними прямо с телефона",                 icon: Camera   },
              { step: "2", title: "ИИ анализирует пространство", sub: "Claude AI определяет стиль, цвета и что нужно купить",    icon: Sparkles },
              { step: "3", title: "Получи список мебели",        sub: "С реальными ценами и ссылками на маркетплейсы",           icon: Sofa     },
            ]).map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-600/15 border border-sky-600/30 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* ── Bottom spacer ────────────────────────────────────────────────────── */}
      <div className="h-4" />
    </div>
  );
}
