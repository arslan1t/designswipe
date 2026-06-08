"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ExternalLink, Star, Loader2, ShoppingBag,
  Sparkles, RefreshCw, AlertTriangle, ChevronRight,
  LayoutGrid, Wallet, Share2, Trash2, Copy, Check,
  TrendingUp, Palette, Sofa,
} from "lucide-react";
import type { RoomScanResult, FurniturePiece, ShoppingProduct } from "@/lib/types";
import { saveScanResult, ROOM_LABELS, formatDate } from "@/lib/scanHistory";
import { getRegion, getMarketplacesForRegion, REGION_CONFIGS, type MarketplaceId } from "@/lib/region";
import { useLanguage } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

type Marketplace = MarketplaceId | "all";

type ProductState = {
  loading: boolean;
  products: ShoppingProduct[];
  marketplace: Marketplace;
  error?: string;
};

type SelectedProduct = {
  pieceId: string;
  pieceName: string;
  product: ShoppingProduct;
};

type Tab = "furniture" | "budget" | "share";
type PriorityKey = "essential" | "recommended" | "optional";

// ─── Price formatter ──────────────────────────────────────────────────────────

function formatPrice(amount: number, currency: string): string {
  if (currency === "USD") return `$${amount.toLocaleString("en-US")}`;
  if (currency === "EUR") return `€${amount.toLocaleString("en-US")}`;
  return `${amount.toLocaleString("ru")} ₽`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const PRIORITY_CONFIG: Record<PriorityKey, { label: string; dot: string; text: string; border: string; bg: string }> = lang === "en" ? {
    essential:   { label: "Essential",    dot: "bg-rose-400",  text: "text-rose-400",  border: "border-rose-400/30",  bg: "bg-rose-400/10" },
    recommended: { label: "Recommended",  dot: "bg-sky-400",   text: "text-sky-400",   border: "border-sky-400/30",   bg: "bg-sky-400/10" },
    optional:    { label: "Optional",     dot: "bg-slate-400", text: "text-slate-400", border: "border-slate-600",    bg: "bg-slate-800/60" },
  } : {
    essential:   { label: "Обязательно",   dot: "bg-rose-400",  text: "text-rose-400",  border: "border-rose-400/30",  bg: "bg-rose-400/10" },
    recommended: { label: "Рекомендуется", dot: "bg-sky-400",   text: "text-sky-400",   border: "border-sky-400/30",   bg: "bg-sky-400/10" },
    optional:    { label: "Опционально",   dot: "bg-slate-400", text: "text-slate-400", border: "border-slate-600",    bg: "bg-slate-800/60" },
  };

  const CONDITION_CONFIG: Record<string, { label: string; color: string; icon: string }> = lang === "en" ? {
    needs_renovation: { label: "Needs renovation", color: "text-rose-400",    icon: "🔨" },
    fresh_renovation: { label: "Fresh renovation",  color: "text-emerald-400", icon: "✨" },
    good_condition:   { label: "Good condition",    color: "text-sky-400",     icon: "👍" },
    excellent:        { label: "Excellent",          color: "text-emerald-400", icon: "🏆" },
  } : {
    needs_renovation: { label: "Требует ремонта",    color: "text-rose-400",    icon: "🔨" },
    fresh_renovation: { label: "Свежий ремонт",      color: "text-emerald-400", icon: "✨" },
    good_condition:   { label: "Хорошее состояние",  color: "text-sky-400",     icon: "👍" },
    excellent:        { label: "Отличное",            color: "text-emerald-400", icon: "🏆" },
  };

  const [result, setResult] = useState<RoomScanResult | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [tab, setTab] = useState<Tab>("furniture");
  const [productStates, setProductStates] = useState<Record<string, ProductState>>({});
  const [selected, setSelected] = useState<SelectedProduct[]>([]);
  const [copied, setCopied] = useState(false);
  const [activePieceId, setActivePieceId] = useState<string | null>(null);
  const fetchedRef = useRef<Set<string>>(new Set());
  const [regionCurrency, setRegionCurrency] = useState<string>("USD");
  const [marketplaces, setMarketplaces] = useState<{ value: Marketplace; label: string }[]>([
    { value: "all", label: lang === "en" ? "All" : "Все" },
  ]);

  // ── Load result + region ───────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("roomScanResult");
      if (!raw) { router.replace("/upload"); return; }
      const parsed: RoomScanResult & { _demo?: boolean } = JSON.parse(raw);
      if (parsed._demo) setIsDemo(true);
      setResult(parsed);
      saveScanResult(parsed);
      if (parsed.furnitureList?.length) setActivePieceId(parsed.furnitureList[0].id);
    } catch { router.replace("/upload"); }

    const region = getRegion();
    const currency = REGION_CONFIGS[region]?.currency || "USD";
    setRegionCurrency(currency);
    const mps = getMarketplacesForRegion(region);
    setMarketplaces([
      { value: "all", label: lang === "en" ? "All" : "Все" },
      ...mps.map(mp => ({ value: mp.id as Marketplace, label: mp.name })),
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ── Auto-fetch products for all pieces ────────────────────────────────────
  const fetchProducts = useCallback(async (piece: FurniturePiece, marketplace: Marketplace = "all") => {
    const key = `${piece.id}_${marketplace}`;
    if (fetchedRef.current.has(key)) return;
    fetchedRef.current.add(key);

    setProductStates(prev => ({
      ...prev,
      [piece.id]: { loading: true, products: [], marketplace },
    }));

    try {
      const region = getRegion();
      const res = await fetch("/api/search-furniture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: piece.searchQuery,
          queryEn: piece.searchQueryEn,
          marketplace,
          region,
        }),
      });
      const data = await res.json();
      setProductStates(prev => ({
        ...prev,
        [piece.id]: { loading: false, products: data.products || [], marketplace },
      }));
    } catch {
      setProductStates(prev => ({
        ...prev,
        [piece.id]: {
          loading: false, products: [], marketplace,
          error: lang === "en" ? "Load error" : "Ошибка загрузки",
        },
      }));
    }
  }, [lang]);

  useEffect(() => {
    if (!result?.furnitureList) return;
    result.furnitureList.forEach((piece, idx) => {
      if (idx < 3) fetchProducts(piece);
    });
  }, [result, fetchProducts]);

  useEffect(() => {
    if (!activePieceId || !result?.furnitureList) return;
    const piece = result.furnitureList.find(p => p.id === activePieceId);
    if (piece) fetchProducts(piece);
  }, [activePieceId, result, fetchProducts]);

  // ── Select product ─────────────────────────────────────────────────────────
  const toggleSelect = (piece: FurniturePiece, product: ShoppingProduct) => {
    setSelected(prev => {
      const exists = prev.find(s => s.pieceId === piece.id && s.product.id === product.id);
      if (exists) return prev.filter(s => !(s.pieceId === piece.id && s.product.id === product.id));
      const withoutPiece = prev.filter(s => s.pieceId !== piece.id);
      return [...withoutPiece, { pieceId: piece.id, pieceName: piece.category, product }];
    });
  };

  const isProductSelected = (pieceId: string, productId: string) =>
    selected.some(s => s.pieceId === pieceId && s.product.id === productId);

  // ── Budget ─────────────────────────────────────────────────────────────────
  const totalBudget = selected.reduce((sum, s) => sum + (s.product.price || 0), 0);
  const estimatedMin = result?.furnitureList
    ?.filter(f => f.priority === "essential")
    .reduce((sum, f) => sum + f.priceMin, 0) || 0;
  const estimatedMax = result?.furnitureList
    ?.reduce((sum, f) => sum + f.priceMax, 0) || 0;

  // Currency to use for display (from AI result or region)
  const displayCurrency = result?.furnitureList?.[0]?.currency || regionCurrency;

  // ── Share ──────────────────────────────────────────────────────────────────
  const shareText = result ? (lang === "en" ? [
    `🏠 My room project — ${result.detectedStyle}`,
    `📋 ${ROOM_LABELS[result.params.roomType] || result.params.roomType}`,
    ``,
    `✅ Furniture items: ${result.furnitureList?.length || 0}`,
    selected.length > 0 ? `🛒 In cart: ${selected.length} items for ${formatPrice(totalBudget, displayCurrency)}` : "",
    ``,
    result.furnitureList?.slice(0, 3).map(f => `• ${f.category}: ${formatPrice(f.priceMin, f.currency || displayCurrency)}–${formatPrice(f.priceMax, f.currency || displayCurrency)}`).join("\n"),
    ``,
    `Created with RoomScan AI`,
  ] : [
    `🏠 Мой проект комнаты — ${result.detectedStyle}`,
    `📋 ${ROOM_LABELS[result.params.roomType] || result.params.roomType}`,
    ``,
    `✅ Подобрано мебели: ${result.furnitureList?.length || 0} позиций`,
    selected.length > 0 ? `🛒 В корзине: ${selected.length} товаров на ${formatPrice(totalBudget, displayCurrency)}` : "",
    ``,
    result.furnitureList?.slice(0, 3).map(f => `• ${f.category}: ${formatPrice(f.priceMin, f.currency || displayCurrency)}–${formatPrice(f.priceMax, f.currency || displayCurrency)}`).join("\n"),
    ``,
    `Создано с помощью RoomScan AI`,
  ]).filter(Boolean).join("\n") : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  const condition = CONDITION_CONFIG[result.roomCondition] || CONDITION_CONFIG.good_condition;

  return (
    <div className="min-h-screen pb-28">
      {/* ── Hero ── */}
      <div className="relative">
        {result.imagePreview ? (
          <img src={result.imagePreview} alt={lang === "en" ? "Room" : "Комната"} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <Sofa className="w-16 h-16 text-slate-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F2C] via-[#0A0F2C]/40 to-transparent" />

        <button
          onClick={() => router.push("/upload")}
          className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur rounded-xl border border-white/10 hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={() => router.push("/upload")}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-black/40 backdrop-blur rounded-xl border border-white/10 hover:bg-black/60 transition-colors text-xs text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {lang === "en" ? "New scan" : "Новый скан"}
        </button>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow">{result.detectedStyle}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">{condition.icon}</span>
                <span className={`text-sm font-medium ${condition.color}`}>{condition.label}</span>
                <span className="text-slate-400 text-sm">·</span>
                <span className="text-slate-300 text-sm">{ROOM_LABELS[result.params.roomType]}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">{formatDate(result.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Demo banner ── */}
      {isDemo && (
        <div className="mx-4 mt-4 flex items-start gap-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-3 text-sm text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{lang === "en" ? "Demo mode — add an API key for real AI analysis." : "Демо-режим — добавь API ключ для реального анализа."}</span>
        </div>
      )}

      {/* ── Summary ── */}
      <div className="mx-4 mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {result.detectedColors?.map(c => (
            <span key={c} className="px-2.5 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">
              <Palette className="w-3 h-3 inline mr-1 opacity-50" />{c}
            </span>
          ))}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="sticky top-0 z-20 bg-[#0A0F2C]/95 backdrop-blur px-4 pt-4 pb-0">
        <div className="flex gap-1 bg-slate-900/80 rounded-2xl p-1">
          {([
            { id: "furniture" as Tab, label: lang === "en" ? "Furniture" : "Мебель", icon: LayoutGrid, count: result.furnitureList?.length },
            { id: "budget" as Tab, label: lang === "en" ? "Budget" : "Бюджет", icon: Wallet, count: selected.length || null },
            { id: "share" as Tab, label: lang === "en" ? "Share" : "Поделиться", icon: Share2, count: null },
          ]).map(tb => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === tb.id ? "bg-sky-600 text-white shadow-lg shadow-sky-900/40" : "text-slate-400 hover:text-slate-200"}`}
            >
              <tb.icon className="w-4 h-4" />
              {tb.label}
              {tb.count != null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                  ${tab === tb.id ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"}`}>
                  {tb.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="px-4 mt-4"
        >
          {/* ──── FURNITURE TAB ──── */}
          {tab === "furniture" && (
            <div className="space-y-3">
              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {result.furnitureList?.map(piece => {
                  const cfg = PRIORITY_CONFIG[piece.priority];
                  const isActive = activePieceId === piece.id;
                  return (
                    <button
                      key={piece.id}
                      onClick={() => setActivePieceId(piece.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        ${isActive
                          ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {piece.category}
                    </button>
                  );
                })}
              </div>

              {/* Active piece detail */}
              {result.furnitureList?.map(piece => {
                if (piece.id !== activePieceId) return null;
                const cfg = PRIORITY_CONFIG[piece.priority];
                const state = productStates[piece.id];
                const priceCurrency = piece.currency || displayCurrency;

                return (
                  <motion.div
                    key={piece.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* Piece info card */}
                    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h2 className="font-semibold text-base">{piece.category}</h2>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed">{piece.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800">
                        <div className="text-sm">
                          <span className="text-slate-400">{lang === "en" ? "Price: " : "Цена: "}</span>
                          <span className="font-medium text-sky-300">
                            {formatPrice(piece.priceMin, priceCurrency)} – {formatPrice(piece.priceMax, priceCurrency)}
                          </span>
                        </div>
                        {piece.color && (
                          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">{piece.color}</span>
                        )}
                        {piece.material && (
                          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">{piece.material}</span>
                        )}
                      </div>
                    </div>

                    {/* Marketplace filter */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {marketplaces.map(mp => {
                        const isActiveFilter = state?.marketplace === mp.value;
                        return (
                          <button
                            key={mp.value}
                            onClick={() => {
                              const key = `${piece.id}_${mp.value}`;
                              fetchedRef.current.delete(key);
                              fetchProducts(piece, mp.value);
                            }}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                              ${isActiveFilter
                                ? "bg-sky-600 border-sky-500 text-white"
                                : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                              }`}
                          >
                            {mp.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Products */}
                    {state?.loading && (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => <ProductSkeleton key={i} />)}
                      </div>
                    )}

                    {!state?.loading && state?.products && (
                      <div className="space-y-2">
                        {state.products.length === 0 ? (
                          <div className="text-center py-8 text-slate-500 text-sm">
                            {lang === "en" ? "Nothing found. Try another marketplace." : "Ничего не найдено. Попробуй другой маркетплейс."}
                          </div>
                        ) : (
                          state.products.map(product => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              selected={isProductSelected(piece.id, product.id)}
                              onSelect={() => toggleSelect(piece, product)}
                              lang={lang}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Next piece navigation */}
              {result.furnitureList && activePieceId && (() => {
                const idx = result.furnitureList.findIndex(p => p.id === activePieceId);
                const next = result.furnitureList[idx + 1];
                if (!next) return null;
                return (
                  <button
                    onClick={() => setActivePieceId(next.id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-600 transition-colors text-sm"
                  >
                    <span className="text-slate-400">
                      {lang === "en" ? "Next: " : "Следующий: "}
                      <span className="text-slate-200 font-medium">{next.category}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })()}
            </div>
          )}

          {/* ──── BUDGET TAB ──── */}
          {tab === "budget" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-sky-900/40 to-slate-900/80 border border-sky-800/40 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <TrendingUp className="w-5 h-5" />
                  {lang === "en" ? "Project Summary" : "Итог проекта"}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 rounded-xl p-3">
                    <div className="text-xs text-slate-400 mb-1">{lang === "en" ? "Selected items" : "Выбрано товаров"}</div>
                    <div className="text-2xl font-bold text-white">
                      {totalBudget > 0 ? formatPrice(totalBudget, displayCurrency) : "—"}
                    </div>
                    <div className="text-xs text-slate-500">{selected.length} {lang === "en" ? "items" : "позиций"}</div>
                  </div>
                  <div className="bg-slate-900/60 rounded-xl p-3">
                    <div className="text-xs text-slate-400 mb-1">{lang === "en" ? "AI estimate" : "Оценка ИИ"}</div>
                    <div className="text-sm font-semibold text-slate-300">{formatPrice(estimatedMin, displayCurrency)}</div>
                    <div className="text-xs text-slate-500">{lang === "en" ? "minimum budget" : "минимальный бюджет"}</div>
                  </div>
                </div>
              </div>

              {/* Selected items */}
              {selected.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-slate-500 text-sm">
                    {lang === "en"
                      ? 'Tap a product card in the "Furniture" tab to add it to your cart'
                      : 'Нажми на карточку товара во вкладке "Мебель", чтобы добавить его в корзину'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-400">
                    {lang === "en" ? "Selected items" : "Выбранные товары"}
                  </h3>
                  {selected.map(s => (
                    <div key={`${s.pieceId}_${s.product.id}`} className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                      {s.product.imageUrl && (
                        <img src={s.product.imageUrl} alt={s.product.title} className="w-14 h-14 rounded-xl object-cover bg-slate-700 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-sky-400 font-medium mb-0.5">{s.pieceName}</div>
                        <div className="text-sm text-slate-200 line-clamp-1">{s.product.title}</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {s.product.price > 0
                            ? formatPrice(s.product.price, s.product.currency || displayCurrency)
                            : (lang === "en" ? "See price on site" : "Цена на сайте")}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <a href={s.product.productUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 bg-sky-600/20 rounded-lg hover:bg-sky-600/40 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                        </a>
                        <button onClick={() => setSelected(prev => prev.filter(x => !(x.pieceId === s.pieceId && x.product.id === s.product.id)))}
                          className="p-1.5 bg-slate-800 rounded-lg hover:bg-red-900/40 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* All furniture estimate */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-400">
                  {lang === "en" ? "All items estimate" : "Оценка всех позиций"}
                </h3>
                {result.furnitureList?.map(piece => {
                  const cfg = PRIORITY_CONFIG[piece.priority];
                  const priceCurrency = piece.currency || displayCurrency;
                  return (
                    <div key={piece.id} className="flex items-center gap-3 py-2 border-b border-slate-800/60">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                      <span className="flex-1 text-sm text-slate-300">{piece.category}</span>
                      <span className="text-sm text-slate-400 font-medium">
                        {formatPrice(piece.priceMin, priceCurrency)} – {formatPrice(piece.priceMax, priceCurrency)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 font-semibold">
                  <span className="text-slate-300">{lang === "en" ? "Total (max)" : "Итого (макс.)"}</span>
                  <span className="text-sky-300">{formatPrice(estimatedMax, displayCurrency)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ──── SHARE TAB ──── */}
          {tab === "share" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-sky-400" />
                  {lang === "en" ? "Share project" : "Поделиться проектом"}
                </h3>
                <div className="bg-slate-800/60 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-line font-mono leading-relaxed">
                  {shareText}
                </div>
                <button
                  onClick={handleCopy}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all
                    ${copied ? "bg-emerald-600 text-white" : "bg-sky-600 hover:bg-sky-500 text-white"}`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied
                    ? (lang === "en" ? "Copied!" : "Скопировано!")
                    : (lang === "en" ? "Copy text" : "Скопировать текст")}
                </button>
              </div>

              {/* Quick links */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-400">
                  {lang === "en" ? "Search by style" : "Быстрый поиск по стилю"}
                </h3>
                {[
                  {
                    label: "Pinterest — " + result.detectedStyle,
                    url: `https://pinterest.com/search/pins/?q=${encodeURIComponent(result.detectedStyle + " interior")}`,
                  },
                  {
                    label: "Houzz — " + (lang === "en" ? "similar interiors" : "похожие интерьеры"),
                    url: `https://www.houzz.com/photos/query/${encodeURIComponent(result.detectedStyle)}`,
                  },
                  {
                    label: lang === "en" ? "IKEA — style ideas" : "IKEA — подборка по стилю",
                    url: lang === "en"
                      ? `https://www.ikea.com/us/en/ideas/`
                      : `https://www.ikea.com/ru/ru/ideas/`,
                  },
                ].map(link => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors text-sm">
                    <span className="text-slate-300">{link.label}</span>
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Floating budget bar ── */}
      {selected.length > 0 && tab !== "budget" && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-4 right-4 z-30"
        >
          <button
            onClick={() => setTab("budget")}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-sky-600 hover:bg-sky-500 rounded-2xl shadow-xl shadow-sky-900/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">
                {selected.length} {lang === "en" ? "items selected" : "товаров выбрано"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{formatPrice(totalBudget, displayCurrency)}</span>
              <ChevronRight className="w-4 h-4 text-white/70" />
            </div>
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, selected, onSelect, lang }: {
  product: ShoppingProduct;
  selected: boolean;
  onSelect: () => void;
  lang: string;
}) {
  return (
    <motion.div
      layout
      className={`flex gap-3 p-3 rounded-2xl border transition-all cursor-pointer
        ${selected
          ? "bg-sky-900/30 border-sky-500/50"
          : "bg-slate-900/60 border-slate-800 hover:border-slate-600"
        }`}
      onClick={onSelect}
    >
      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-800">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-slate-600" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100 line-clamp-2 leading-tight mb-1">{product.title}</p>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{product.shop}</span>
          {product.rating && (
            <span className="flex items-center gap-0.5 text-xs text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />{product.rating}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-sky-300">
            {product.price > 0
              ? formatPrice(product.price, product.currency || "USD")
              : (lang === "en" ? "See price on site" : "Цена на сайте")}
          </span>
          <div className="flex items-center gap-1.5">
            {selected && <Check className="w-4 h-4 text-sky-400" />}
            <a
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse">
      <div className="w-20 h-20 rounded-xl bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
        <div className="h-4 bg-slate-800 rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}
