"use client";

import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useFilters } from "@/app/context/FilterContext";
import { useLanguage } from "@/lib/i18n";
import type {
  Style, Room, Palette, Budget, Lighting,
  Material, Orientation, Theme, FilterState,
} from "@/lib/types";

// ─── Labels (EN) ──────────────────────────────────────────────────────────────

const STYLE_LABELS_EN: Record<Style, string> = {
  minimal: "Minimalism", modern: "Modern", scandinavian: "Scandinavian",
  japandi: "Japandi", boho: "Boho", loft: "Loft",
  industrial: "Industrial", classic: "Classic", luxury: "Luxury",
};
const STYLE_LABELS_RU: Record<Style, string> = {
  minimal: "Минимализм", modern: "Модерн", scandinavian: "Скандинавский",
  japandi: "Japandi", boho: "Бохо", loft: "Лофт",
  industrial: "Индустриальный", classic: "Классика", luxury: "Люкс",
};

const ROOM_LABELS_EN: Record<Room, string> = {
  living_room: "Living Room", bedroom: "Bedroom", kitchen: "Kitchen",
  bathroom: "Bathroom", office: "Office", studio: "Studio",
  balcony: "Balcony", dining_room: "Dining Room", hallway: "Hallway",
};
const ROOM_LABELS_RU: Record<Room, string> = {
  living_room: "Гостиная", bedroom: "Спальня", kitchen: "Кухня",
  bathroom: "Ванная", office: "Кабинет", studio: "Студия",
  balcony: "Балкон", dining_room: "Столовая", hallway: "Прихожая",
};

const PALETTE_LABELS_EN: Record<Palette, string> = {
  warm: "🔶 Warm", cool: "🔷 Cool", neutral: "⬜ Neutral",
  bright: "✨ Bright", pastel: "🌸 Pastel",
};
const PALETTE_LABELS_RU: Record<Palette, string> = {
  warm: "🔶 Тёплая", cool: "🔷 Холодная", neutral: "⬜ Нейтральная",
  bright: "✨ Яркая", pastel: "🌸 Пастель",
};

const BUDGET_LABELS_EN: Record<Budget, string> = {
  low: "💚 Budget", medium: "💛 Mid-range", high: "💎 Premium",
};
const BUDGET_LABELS_RU: Record<Budget, string> = {
  low: "💚 Бюджетно", medium: "💛 Средний", high: "💎 Премиум",
};

const LIGHTING_LABELS_EN: Record<Lighting, string> = {
  soft: "🌤 Soft", daylight: "☀️ Daylight", ambient: "🕯 Ambient", dramatic: "🎭 Dramatic",
};
const LIGHTING_LABELS_RU: Record<Lighting, string> = {
  soft: "🌤 Мягкий", daylight: "☀️ Дневной", ambient: "🕯 Окружающий", dramatic: "🎭 Драматичный",
};

const MATERIAL_LABELS_EN: Record<Material, string> = {
  wood: "🪵 Wood", stone: "🪨 Stone", metal: "⚙️ Metal",
  textile: "🧶 Textile", mixed: "🎨 Mixed",
};
const MATERIAL_LABELS_RU: Record<Material, string> = {
  wood: "🪵 Дерево", stone: "🪨 Камень", metal: "⚙️ Металл",
  textile: "🧶 Текстиль", mixed: "🎨 Смешанный",
};

const ORIENTATION_LABELS_EN: Record<Orientation, string> = {
  horizontal: "↔️ Horizontal", vertical: "↕️ Vertical",
};
const ORIENTATION_LABELS_RU: Record<Orientation, string> = {
  horizontal: "↔️ Горизонт.", vertical: "↕️ Вертикаль",
};

const THEME_LABELS_EN: Record<Theme, string> = {
  cozy: "🏠 Cozy", elegant: "🌿 Elegant", rustic: "🌾 Rustic",
  artistic: "🎨 Artistic", industrial: "🏭 Industrial",
};
const THEME_LABELS_RU: Record<Theme, string> = {
  cozy: "🏠 Уютный", elegant: "🌿 Элегантный", rustic: "🌾 Рустик",
  artistic: "🎨 Артистичный", industrial: "🏭 Индустриальный",
};

// ─── Filter group types ───────────────────────────────────────────────────────

type GroupKey = keyof Pick<FilterState,
  "style" | "room" | "palette" | "budget" | "lighting" | "material" | "orientation" | "theme"
>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function FiltersBar() {
  const { filters, setFilter, resetFilters } = useFilters();
  const { lang } = useLanguage();
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null);

  // Language-dependent label maps
  const styleLabels      = lang === "en" ? STYLE_LABELS_EN      : STYLE_LABELS_RU;
  const roomLabels       = lang === "en" ? ROOM_LABELS_EN       : ROOM_LABELS_RU;
  const paletteLabels    = lang === "en" ? PALETTE_LABELS_EN    : PALETTE_LABELS_RU;
  const budgetLabels     = lang === "en" ? BUDGET_LABELS_EN     : BUDGET_LABELS_RU;
  const lightingLabels   = lang === "en" ? LIGHTING_LABELS_EN   : LIGHTING_LABELS_RU;
  const materialLabels   = lang === "en" ? MATERIAL_LABELS_EN   : MATERIAL_LABELS_RU;
  const orientLabels     = lang === "en" ? ORIENTATION_LABELS_EN: ORIENTATION_LABELS_RU;
  const themeLabels      = lang === "en" ? THEME_LABELS_EN      : THEME_LABELS_RU;

  type FilterGroup = {
    key: GroupKey;
    label: string;
    options: string[];
    labels: Record<string, string>;
  };

  const FILTER_GROUPS: FilterGroup[] = [
    { key: "style",       label: lang === "en" ? "Style"       : "Стиль",      options: Object.keys(styleLabels),    labels: styleLabels    },
    { key: "room",        label: lang === "en" ? "Room"        : "Комната",    options: Object.keys(roomLabels),     labels: roomLabels     },
    { key: "budget",      label: lang === "en" ? "Budget"      : "Бюджет",     options: Object.keys(budgetLabels),   labels: budgetLabels   },
    { key: "palette",     label: lang === "en" ? "Palette"     : "Палитра",    options: Object.keys(paletteLabels),  labels: paletteLabels  },
    { key: "lighting",    label: lang === "en" ? "Light"       : "Свет",       options: Object.keys(lightingLabels), labels: lightingLabels },
    { key: "material",    label: lang === "en" ? "Material"    : "Материал",   options: Object.keys(materialLabels), labels: materialLabels },
    { key: "theme",       label: lang === "en" ? "Mood"        : "Атмосфера",  options: Object.keys(themeLabels),    labels: themeLabels    },
    { key: "orientation", label: lang === "en" ? "Format"      : "Формат",     options: Object.keys(orientLabels),   labels: orientLabels   },
  ];

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
            <span>{lang === "en" ? "Filters" : "Фильтры"}</span>
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
