"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, Trash2, Sofa, ChevronRight, ScanLine, Sparkles } from "lucide-react";
import { getHistory, deleteFromHistory, getScanResult, formatDate, ROOM_LABELS } from "@/lib/scanHistory";
import type { HistoryEntry } from "@/lib/scanHistory";
import { useLanguage } from "@/lib/i18n";

const CONDITION_ICONS: Record<string, string> = {
  needs_renovation: "🔨",
  fresh_renovation: "✨",
  good_condition: "👍",
  excellent: "🏆",
};

export default function HistoryPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const handleOpen = (entry: HistoryEntry) => {
    const result = getScanResult(entry.id);
    if (!result) return;
    sessionStorage.setItem("roomScanResult", JSON.stringify(result));
    router.push("/results");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    setTimeout(() => {
      deleteFromHistory(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setDeletingId(null);
    }, 300);
  };

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-sky-400" />
              {t("history.title")}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {entries.length > 0
                ? `${entries.length} ${lang === "en" ? "saved analyses" : "сохранённых анализов"}`
                : t("history.empty.sub")}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <ScanLine className="w-9 h-9 text-slate-600" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-slate-300">{t("history.empty")}</p>
              <p className="text-sm text-slate-500">{t("history.empty.sub")}</p>
            </div>
            <button
              onClick={() => router.push("/upload")}
              className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-2xl font-semibold text-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t("history.scan")}
            </button>
          </div>
        ) : (
          <>
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: deletingId === entry.id ? 0 : 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                onClick={() => handleOpen(entry)}
                className="flex gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-600 transition-all group"
              >
                {/* Room preview */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center">
                  {entry.imagePreview ? (
                    <img src={entry.imagePreview} alt="Комната" className="w-full h-full object-cover" />
                  ) : (
                    <Sofa className="w-8 h-8 text-slate-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-base font-semibold text-white truncate">{entry.detectedStyle}</span>
                    <span>{CONDITION_ICONS[entry.roomCondition] || "🏠"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                    <span>{ROOM_LABELS[entry.params.roomType] || entry.params.roomType}</span>
                    <span>·</span>
                    <span>{entry.furnitureCount} {t("history.items")}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{entry.summary}</p>
                  <p className="text-xs text-slate-600 mt-1.5">{formatDate(entry.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center justify-between py-0.5 shrink-0">
                  <button
                    onClick={e => handleDelete(e, entry.id)}
                    className="p-1.5 rounded-lg hover:bg-red-900/40 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </motion.div>
            ))}

            {/* New scan CTA */}
            <button
              onClick={() => router.push("/upload")}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-700 rounded-2xl text-sm text-slate-400 hover:border-sky-600/50 hover:text-sky-400 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {t("history.scan")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
