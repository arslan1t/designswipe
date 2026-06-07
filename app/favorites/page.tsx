"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart, LayoutGrid, Trash2, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useApp } from "../context/AppContext";
import type { Design } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

const STYLE_LABELS: Record<string, string> = {
  minimal: "Минимализм", modern: "Модерн", scandinavian: "Скандинавский",
  japandi: "Japandi", boho: "Бохо", loft: "Лофт",
  industrial: "Индустриальный", classic: "Классика", luxury: "Люкс",
};

const ROOM_LABELS: Record<string, string> = {
  living_room: "Гостиная", bedroom: "Спальня", kitchen: "Кухня",
  bathroom: "Ванная", office: "Кабинет", studio: "Студия",
  balcony: "Балкон", dining_room: "Столовая", hallway: "Прихожая",
};

const BUDGET_COLORS: Record<string, string> = {
  low: "bg-emerald-500/20 text-emerald-400",
  medium: "bg-sky-500/20 text-sky-400",
  high: "bg-violet-500/20 text-violet-400",
};
const BUDGET_LABELS: Record<string, string> = {
  low: "Бюджетно", medium: "Средний", high: "Премиум",
};

// ── Design Card ───────────────────────────────────────────────────────────────

function FavCard({ design, onRemove, onOpen }: {
  design: Design;
  onRemove: () => void;
  onOpen: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group card overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div
        className="relative w-full overflow-hidden bg-slate-800 cursor-pointer"
        style={{ aspectRatio: "4/3" }}
        onClick={onOpen}
      >
        <Image
          src={design.src}
          alt={design.title}
          fill
          sizes="(max-width: 768px) 50vw, 300px"
          className="object-cover hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Remove button */}
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
        >
          <Trash2 className="w-3.5 h-3.5 text-white" />
        </button>

        {/* Budget badge */}
        {design.budget && (
          <span className={`absolute bottom-2 left-2 px-1.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${BUDGET_COLORS[design.budget]}`}>
            {BUDGET_LABELS[design.budget]}
          </span>
        )}
      </div>

      {/* Info */}
      <div
        className="p-3 flex items-start justify-between gap-2 cursor-pointer"
        onClick={onOpen}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {STYLE_LABELS[design.style] ?? design.style}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {ROOM_LABELS[design.room] ?? design.room}
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useApp();
  const { t, lang } = useLanguage();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      toggleFavorite(id);
      setRemovingId(null);
    }, 250);
  };

  const handleOpen = (design: Design) => {
    router.push(`/breakdown/${design.id}`);
  };

  return (
    <div className="min-h-screen pb-8">

      {/* ── Header ── */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {t("favorites.title")}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {favorites.length > 0
                ? `${favorites.length} ${lang === "en" ? "saved interiors" : "сохранённых интерьеров"}`
                : t("favorites.empty.sub")}
            </p>
          </div>
          {favorites.length > 0 && (
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-400 fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* ── Empty State ── */}
      {favorites.length === 0 && (
        <div className="px-4 flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Heart className="w-9 h-9 text-slate-700" />
          </div>
          <div>
            <p className="font-semibold text-slate-300">{t("favorites.empty")}</p>
            <p className="text-sm text-slate-500 mt-1">{t("favorites.empty.sub")}</p>
          </div>
          <button
            onClick={() => router.push("/swipe")}
            className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-2xl text-sm font-semibold transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            {t("favorites.go")}
          </button>
        </div>
      )}

      {/* ── Grid ── */}
      {favorites.length > 0 && (
        <div className="px-4">
          {/* Section label */}
          <p className="section-label mb-3">{t("favorites.title")}</p>

          <AnimatePresence>
            <div className="grid grid-cols-2 gap-3">
              {favorites
                .filter(f => f.id !== removingId)
                .map(design => (
                  <FavCard
                    key={design.id}
                    design={design}
                    onRemove={() => handleRemove(design.id)}
                    onOpen={() => handleOpen(design)}
                  />
                ))}
            </div>
          </AnimatePresence>

          {/* CTA to see more */}
          <div className="mt-4">
            <button
              onClick={() => router.push("/swipe")}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-800 rounded-2xl text-sm text-slate-500 hover:border-sky-600/40 hover:text-sky-400 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t("favorites.go")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
