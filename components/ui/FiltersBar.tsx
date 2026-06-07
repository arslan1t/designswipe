"use client";

import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useFilters } from "@/app/context/FilterContext";
import type {
  Style, Room, Palette, Budget, Lighting,
  Material, Orientation, Theme, FilterState,
} from "@/lib/types";

// ─── Russian labels ────────────────────────────────────────────────────────────

const STYLE_LABELS: Record<Style, string> = {
  minimal: "Минимализм",
  modern: "Модерн",
  scandinavian: "Скандинавский",
  japandi: "Japandi",
  boho: "Бохо",
  loft: "Лофт",
  industrial: "Индустриальный",
  classic: "Классика",
  luxury: "Люкс",
};

const ROOM_LABELS: Record<Room, string> = {
  living_room: "Гостиная",
  bedroom: "Спальня",
  kitchen: "Кухня",
  bathroom: "Ванная",
  office: "Кабинет",
  studio: "Студия",
  balcony: "Балкон",
  dining_room: "Столовая",
  hallway: "Прихожая",
};

const PALETTE_LABELS: Record<Palette, string> = {
  warm: "🔶 Тёплая",
  cool: "🔷 Холодная",
  neutral: "⬜ Нейтральная",
  bright: "✨ Яркая",
  pastel: "🌸 Пастель",
};

const BUDGET_LABELS: Record<Budget, string> = {
  low: "💚 Бюджетно",
  medium: "💛 Средний",
  high: "💎 Премиум",
};

const LIGHTING_LABELS: Record<Lighting, string> = {
  soft: "🌤 Мягкий",
  daylight: "☀️ Дневной",
  ambient: "🕯 Окружающий",
  dramatic: "🎭 Драматичный",
};

const MATERIAL_LABELS: Record<Material, string> = {
  wood: "🪵 Дерево",
  stone: "🪨 Камень",
  metal: "⚙️ Металл",
  textile: "🧶 Текстиль",
  mixed: "🎨 Смешанный",
};

const ORIENTATION_LABELS: Record<Orientation, string> = {
  horizontal: "↔️ Горизонт.",
  vertical: "↕️ Вертикаль",
};

const THEME_LABELS: Record<Theme, string> = {
  cozy: "🏠 Уютный",
  elegant: "🌿 Элегантный",
  rustic: "🌾 Рустик",
  artistic: "🎨 Артистичный",
  industrial: "🏭 Индустриальный",
};

// ─── Filter group config ───────────────────────────────────────────────────────

type GroupKey = keyof Pick<FilterState,
  "style" | "room" | "palette" | "budget" | "lighting" | "material" | "orientation" | "theme"
>;

type FilterGroup = {
  key: GroupKey;
  label: string;
  options: string[];
  labels: Record<string, string>;
};

const FILTER_GROUPS: FilterGroup[] = [
  { key: "style",       label: "Стиль",      options: Object.keys(STYLE_LABELS),       labels: STYLE_LABELS       },
  { key: "room",        label: "Комната",    options: Object.keys(ROOM_LABELS),        labels: ROOM_LABELS        },
  { key: "budget",      label: "Бюджет",     options: Object.keys(BUDGET_LABELS),      labels: BUDGET_LABELS      },
  { key: "palette",     label: "Палитра",    options: Object.keys(PALETTE_LABELS),     labels: PALETTE_LABELS     },
  { key: "lighting",    label: "Свет",       options: Object.keys(LIGHTING_LABELS),    labels: LIGHTING_LABELS    },
  { key: "material",    label: "Материал",   options: Object.keys(MATERIAL_LABELS),    labels: MATERIAL_LABELS    },
  { key: "theme",       label: "Атмосфера",  options: Object.keys(THEME_LABELS),       labels: THEME_LABELS       },
  { key: "orientation", label: "Формат",     options: Object.keys(ORIENTATION_LABELS), labels: ORIENTATION_LABELS },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function FiltersBar() {
  const { filters, setFilter, resetFilters } = useFilters();
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null);

  const activeCount = FILTER_GROUPS.filter(g => filters[g.key] !== undefined).length;

  const toggleGroup = (key: GroupKey) =>
    setOpenGroup(prev => (prev === key ? null : key));

  const toggleValue = (key: GroupKey, value: string) => {
    if ((filters[key] as string | undefined) === value) {
      setFilter(key, undefined);
      setOpenGroup(null);
    } else {
      setFilter(key, value as FilterState[GroupKey]);
      setOpenGroup(null);
    }
  };

  const currentGroup = FILTER_GROUPS.find(g => g.key === openGroup) ?? null;

  return (
    <div className="space-y-2">
      {/* ── Category pills row ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {/* Filter icon + count */}
        <button
          onClick={activeCount > 0 ? resetFilters : undefined}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 border transition-colors
            ${activeCount > 0
              ? "bg-sky-600 border-sky-500 text-white"
              : "bg-slate-900 border-slate-700 text-slate-400"}`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {activeCount > 0 ? (
            <>
              <span>{activeCount}</span>
              <X className="w-3 h-3 ml-0.5" />
            </>
          ) : (
            <span>Фильтры</span>
          )}
        </button>

        {FILTER_GROUPS.map(group => {
          const active = filters[group.key] as string | undefined;
          const isOpen = openGroup === group.key;

          return (
            <button
              key={group.key}
              onClick={() => toggleGroup(group.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 border transition-colors
                ${active
                  ? "bg-sky-900/60 border-sky-600 text-sky-300"
                  : isOpen
                  ? "bg-slate-800 border-slate-600 text-white"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"}`}
            >
              {active ? group.labels[active] : group.label}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          );
        })}
      </div>

      {/* ── Options row (for open group) ── */}
      {currentGroup && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {currentGroup.options.map(opt => {
            const isSelected = (filters[currentGroup.key] as string | undefined) === opt;
            return (
              <button
                key={opt}
                onClick={() => toggleValue(currentGroup.key, opt)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                  ${isSelected
                    ? "bg-sky-600 border-sky-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-sky-600 hover:text-white"}`}
              >
                {currentGroup.labels[opt]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
