"use client";

import type { Design } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Scan, Sofa } from "lucide-react";

type Props = {
  design: Design;
  onNext: () => void;
  onPrev?: () => void;
};

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
  low: "text-emerald-400 bg-emerald-400/10 border-emerald-800",
  medium: "text-amber-400 bg-amber-400/10 border-amber-800",
  high: "text-violet-400 bg-violet-400/10 border-violet-800",
};
const BUDGET_LABELS: Record<string, string> = {
  low: "Бюджетно", medium: "Средний", high: "Премиум",
};

export default function DesignCard({ design, onNext, onPrev }: Props) {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* ── Image card ─────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800"
           style={{ aspectRatio: design.orientation === "vertical" ? "3/4" : "4/3", maxHeight: "70vh" }}>
        <Image
          src={design.src}
          alt={design.title}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className={design.orientation === "vertical" ? "object-contain" : "object-cover"}
          priority={false}
        />

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Tags overlay */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {design.style && (
            <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-white">
              {STYLE_LABELS[design.style] ?? design.style}
            </span>
          )}
          {design.room && (
            <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-slate-300">
              {ROOM_LABELS[design.room] ?? design.room}
            </span>
          )}
          {design.budget && (
            <span className={`px-2 py-0.5 rounded-full border text-xs backdrop-blur-sm ${BUDGET_COLORS[design.budget]}`}>
              {BUDGET_LABELS[design.budget]}
            </span>
          )}
        </div>

        {/* Navigation arrows on top */}
        <div className="absolute top-3 right-3 flex gap-2">
          {onPrev && (
            <button
              onClick={onPrev}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onNext}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Title & description ─────────────────────────────────────────────── */}
      <div className="px-1">
        <h2 className="font-semibold text-base text-white leading-snug">{design.title}</h2>
        {design.description && design.description !== design.title && (
          <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{design.description}</p>
        )}
      </div>

      {/* ── Разбор button-card ──────────────────────────────────────────────── */}
      <Link
        href={`/breakdown/${design.id}`}
        className="group flex items-center gap-3 px-4 py-3 bg-slate-900/80 border border-slate-700 hover:border-sky-600/60 hover:bg-slate-900 rounded-2xl transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-sky-600/15 border border-sky-600/30 flex items-center justify-center shrink-0 group-hover:bg-sky-600/25 transition-colors">
          <Sofa className="w-5 h-5 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">Разбор: что за мебель на фото</p>
          <p className="text-xs text-slate-400 mt-0.5">Какие предметы здесь, где купить</p>
        </div>
        <Scan className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors shrink-0" />
      </Link>

      {/* ── Next button ─────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onNext}
        className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
      >
        Следующий интерьер
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
