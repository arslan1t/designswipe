"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useFilters } from "../context/FilterContext";
import FiltersBar from "@/components/ui/FiltersBar";
import DesignCard from "@/components/ui/DesignCard";
import { mockDesigns } from "@/lib/mockDesigns";
import { applyFilters } from "@/lib/filterEngine";
import { useLanguage } from "@/lib/i18n";

export default function SwipePage() {
  const { favorites, toggleFavorite } = useApp();
  const { filters, resetFilters } = useFilters();
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  const swipePool = useMemo(
    () => applyFilters(mockDesigns, filters),
    [filters]
  );

  // Reset index when filters change
  useEffect(() => {
    setIndex(0);
  }, [filters]);

  const current = index < swipePool.length ? swipePool[index] : null;
  const isEnd = index >= swipePool.length && swipePool.length > 0;
  const isEmpty = swipePool.length === 0;

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="px-4 pt-8 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("nav.home")}</h1>
          {current && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {index + 1} / {swipePool.length}
              </span>
              <button
                onClick={() => toggleFavorite(current.id)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors
                  ${favorites.some(f => f.id === current.id)
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-rose-500/50 hover:text-rose-400"}`}
              >
                <Heart className={`w-4 h-4 ${favorites.some(f => f.id === current.id) ? "fill-current" : ""}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-3">
        <FiltersBar />
      </div>

      {/* Progress bar */}
      {swipePool.length > 0 && (
        <div className="px-4 mb-3">
          <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(((index) / swipePool.length) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* Empty — no matches */}
          {isEmpty && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <SlidersHorizontal className="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-300">{t("swipe.empty")}</p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:border-sky-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t("swipe.reset")}
                </button>
              )}
            </motion.div>
          )}

          {/* End of pool */}
          {isEnd && (
            <motion.div
              key="end"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl">
                🎉
              </div>
              <div>
                <p className="font-semibold text-slate-300">{t("swipe.done")}</p>
                <p className="text-sm text-slate-500 mt-1">{t("swipe.done.sub")}</p>
              </div>
              <button
                onClick={() => setIndex(0)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t("swipe.restart")}
              </button>
            </motion.div>
          )}

          {/* Current card */}
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DesignCard
                design={current}
                onNext={() => setIndex(prev => prev + 1)}
                onPrev={index > 0 ? () => setIndex(prev => Math.max(prev - 1, 0)) : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
