"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Sofa, Lightbulb, BookOpen, ShoppingBag,
  Star, ExternalLink, Sparkles, Wand2, Loader2,
} from "lucide-react";
import { mockDesigns } from "@/lib/mockDesigns";
import type { BreakdownItem, DesignBreakdown } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

// ─── Zone meta (driven by t()) ────────────────────────────────────────────────

const zones = ["seating", "textiles", "lighting", "storage", "decor"] as const;
type Zone = (typeof zones)[number];

type ZoneMeta = { icon: React.ElementType; color: string };
const ZONE_META: Record<Zone, ZoneMeta> = {
  seating:  { icon: Sofa,      color: "text-sky-400 bg-sky-400/10 border-sky-800"           },
  textiles: { icon: Sparkles,  color: "text-violet-400 bg-violet-400/10 border-violet-800"  },
  lighting: { icon: Lightbulb, color: "text-amber-400 bg-amber-400/10 border-amber-800"     },
  storage:  { icon: BookOpen,  color: "text-emerald-400 bg-emerald-400/10 border-emerald-800" },
  decor:    { icon: Star,      color: "text-rose-400 bg-rose-400/10 border-rose-800"         },
};

// ─── Item card ────────────────────────────────────────────────────────────────

function ItemCard({ item }: { item: BreakdownItem }) {
  const { t } = useLanguage();

  const IMPORTANCE_LABELS: Record<1 | 2 | 3, { text: string; color: string }> = {
    1: { text: t("breakdown.key"),       color: "text-sky-400 bg-sky-400/10 border-sky-700"      },
    2: { text: t("breakdown.important"), color: "text-amber-400 bg-amber-400/10 border-amber-700" },
    3: { text: t("breakdown.accent"),    color: "text-slate-400 bg-slate-700/50 border-slate-600" },
  };

  const imp = IMPORTANCE_LABELS[item.importance];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white leading-snug">{item.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 capitalize">{item.category.replace(/_/g, " ")}</p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs border ${imp.color}`}>
          {imp.text}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-1.5">
        {[item.style, item.palette, item.material].filter(Boolean).map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-400">
            {tag}
          </span>
        ))}
      </div>

      {/* Notes */}
      {item.notes && item.notes.length > 0 && (
        <ul className="space-y-1">
          {item.notes.map((n, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
              {n}
            </li>
          ))}
        </ul>
      )}

      {/* Products */}
      {item.products.length > 0 && (
        <div className="pt-1 space-y-2">
          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" /> {t("breakdown.where")}
          </p>
          <div className="space-y-1.5">
            {item.products.map((p, pi) => (
              <a
                key={pi}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 bg-slate-800/60 border border-slate-700 hover:border-sky-600/50 rounded-xl transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500">{p.shop}</span>
                    {p.similarity && (
                      <span className="text-xs text-emerald-500">
                        {Math.round(p.similarity * 100)}% {t("common.match")}
                      </span>
                    )}
                    {p.note && <span className="text-xs text-slate-600">{p.note}</span>}
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BreakdownPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { id } = use(params);

  const rawId    = Array.isArray(id) ? id[0] : id;
  const designId = (rawId ?? "").trim();

  const design = useMemo(
    () => mockDesigns.find(d => String(d.id) === designId) ?? null,
    [designId]
  );

  const [breakdown, setBreakdown] = useState<DesignBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAi, setIsAi] = useState(false);

  // Fetch AI breakdown on mount
  useEffect(() => {
    if (!design) return;

    const region = typeof window !== "undefined"
      ? (localStorage.getItem("roomscan:region") || "CIS")
      : "CIS";

    fetch("/api/generate-breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        designId: design.id,
        title:    design.title,
        style:    design.style,
        room:     design.room,
        budget:   design.budget || "medium",
        palette:  [design.palette],
        region,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.items) {
          setBreakdown({
            designId:   String(design.id),
            mainStyle:  data.mainStyle || design.style,
            difficulty: data.difficulty || "medium",
            summary:    data.summary || "",
            keyPoints:  data.keyPoints || [],
            items:      data.items || [],
          });
          setIsAi(!!data._ai);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [design]);

  useEffect(() => {
    if (!design) {
      const t = setTimeout(() => router.push("/swipe"), 1500);
      return () => clearTimeout(t);
    }
  }, [design, router]);

  // ── Not found ──
  if (!design) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-2xl card flex items-center justify-center text-2xl">🔍</div>
        <p className="text-slate-300 font-medium">{t("common.error")}</p>
        <p className="text-xs text-slate-500">{t("common.loading")}</p>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-slate-400 text-sm">{lang === "en" ? "AI is analyzing this design…" : "ИИ анализирует дизайн…"}</p>
      </div>
    );
  }

  if (!breakdown) return null;

  const DIFFICULTY_META: Record<string, { label: string; color: string }> = {
    easy:   { label: t("breakdown.easy"),   color: "text-emerald-400 bg-emerald-400/10 border-emerald-700" },
    medium: { label: t("breakdown.medium"), color: "text-amber-400 bg-amber-400/10 border-amber-700"       },
    hard:   { label: t("breakdown.hard"),   color: "text-rose-400 bg-rose-400/10 border-rose-700"          },
  };

  const ZONE_LABELS: Record<Zone, string> = {
    seating:  t("breakdown.zone.seating"),
    textiles: t("breakdown.zone.textiles"),
    lighting: t("breakdown.zone.lighting"),
    storage:  t("breakdown.zone.storage"),
    decor:    t("breakdown.zone.decor"),
  };

  const diff          = DIFFICULTY_META[breakdown.difficulty];
  const totalItems    = breakdown.items.length;
  const totalProducts = breakdown.items.reduce((acc, item) => acc + item.products.length, 0);

  return (
    <div className="min-h-screen pb-28 max-w-lg mx-auto">

      {/* ── Header ── */}
      <div className="px-4 pt-8 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl card flex items-center justify-center text-slate-400 hover:border-slate-600 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{design.title}</h1>
          <p className="text-xs text-slate-500">{t("breakdown.title")}</p>
        </div>
        {isAi && (
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">

        {/* ── AI badge ── */}
        {isAi ? (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-xs text-violet-300 leading-relaxed">
              {lang === "en"
                ? "AI-generated breakdown — Claude analyzed this design and selected matching furniture."
                : "Разбор создан ИИ — Claude проанализировал этот дизайн и подобрал мебель."}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-slate-800/60 border border-slate-700">
            <Wand2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">{t("breakdown.auto")}</p>
          </div>
        )}

        {/* ── Summary card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 space-y-3"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-sky-300">{breakdown.mainStyle}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs border ${diff.color}`}>
              {diff.label}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{breakdown.summary}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 bg-slate-800/60 rounded-xl text-center">
              <p className="text-xl font-bold text-white">{totalItems}</p>
              <p className="text-xs text-slate-500">{t("breakdown.items")}</p>
            </div>
            <div className="p-2.5 bg-slate-800/60 rounded-xl text-center">
              <p className="text-xl font-bold text-sky-300">{totalProducts}</p>
              <p className="text-xs text-slate-500">{t("breakdown.links")}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Key points ── */}
        {breakdown.keyPoints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card p-4 space-y-2"
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {t("breakdown.principles")}
            </p>
            <ul className="space-y-2">
              {breakdown.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ── Zones ── */}
        {zones.map((zone, zoneIdx) => {
          const items = breakdown.items
            .filter(i => i.zone === zone)
            .sort((a, b) => a.importance - b.importance);
          if (!items.length) return null;

          const meta     = ZONE_META[zone];
          const ZoneIcon = meta.icon;

          return (
            <motion.section
              key={zone}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + zoneIdx * 0.05 }}
              className="space-y-2"
            >
              {/* Zone header */}
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${meta.color}`}>
                  <ZoneIcon className="w-3.5 h-3.5" />
                </div>
                <h2 className="font-semibold text-sm text-white">{ZONE_LABELS[zone]}</h2>
                <span className="text-xs text-slate-500 ml-auto">{items.length} {t("breakdown.pcs")}</span>
              </div>

              <div className="space-y-2">
                {items.map(item => <ItemCard key={item.id} item={item} />)}
              </div>
            </motion.section>
          );
        })}

        {/* ── Back ── */}
        <div className="pb-4 pt-2">
          <Link
            href="/swipe"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t("breakdown.back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
