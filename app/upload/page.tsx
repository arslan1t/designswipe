"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, X, ChevronRight, Loader2,
  Sparkles, Check, Home, DollarSign, Palette,
} from "lucide-react";
import type { RoomScanParams, Budget, Room, Style } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

// ─── Component ────────────────────────────────────────────────────────────────

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useLanguage();

  // ── Options (language-aware) ───────────────────────────────────────────────

  const ROOM_OPTIONS: { value: Room; label: string; emoji: string }[] = lang === "en" ? [
    { value: "living_room", label: "Living Room", emoji: "🛋️" },
    { value: "bedroom",     label: "Bedroom",     emoji: "🛏️" },
    { value: "kitchen",     label: "Kitchen",     emoji: "🍳" },
    { value: "office",      label: "Home Office", emoji: "💻" },
    { value: "dining_room", label: "Dining Room", emoji: "🍽️" },
    { value: "hallway",     label: "Hallway",     emoji: "🚪" },
    { value: "bathroom",    label: "Bathroom",    emoji: "🛁" },
    { value: "balcony",     label: "Balcony",     emoji: "🌿" },
  ] : [
    { value: "living_room", label: "Гостиная", emoji: "🛋️" },
    { value: "bedroom",     label: "Спальня",  emoji: "🛏️" },
    { value: "kitchen",     label: "Кухня",    emoji: "🍳" },
    { value: "office",      label: "Кабинет",  emoji: "💻" },
    { value: "dining_room", label: "Столовая", emoji: "🍽️" },
    { value: "hallway",     label: "Прихожая", emoji: "🚪" },
    { value: "bathroom",    label: "Ванная",   emoji: "🛁" },
    { value: "balcony",     label: "Балкон",   emoji: "🌿" },
  ];

  const BUDGET_OPTIONS: { value: Budget; label: string; sub: string; color: string }[] = lang === "en" ? [
    { value: "low",    label: "Budget",   sub: "Under $500",    color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" },
    { value: "medium", label: "Mid-range",sub: "$500–$2,000",   color: "border-sky-500/50 bg-sky-500/10 text-sky-300" },
    { value: "high",   label: "Premium",  sub: "Over $2,000",   color: "border-violet-500/50 bg-violet-500/10 text-violet-300" },
  ] : [
    { value: "low",    label: "Эконом",  sub: "до 50 000 ₽",  color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" },
    { value: "medium", label: "Средний", sub: "50–200 тыс ₽", color: "border-sky-500/50 bg-sky-500/10 text-sky-300" },
    { value: "high",   label: "Премиум", sub: "от 200 000 ₽", color: "border-violet-500/50 bg-violet-500/10 text-violet-300" },
  ];

  const STYLE_OPTIONS: { value: Style; label: string }[] = lang === "en" ? [
    { value: "minimal",      label: "Minimalism"  },
    { value: "scandinavian", label: "Scandinavian"},
    { value: "modern",       label: "Modern"      },
    { value: "loft",         label: "Loft"        },
    { value: "japandi",      label: "Japandi"     },
    { value: "boho",         label: "Boho"        },
    { value: "industrial",   label: "Industrial"  },
    { value: "classic",      label: "Classic"     },
  ] : [
    { value: "minimal",      label: "Минимализм"    },
    { value: "scandinavian", label: "Скандинавский" },
    { value: "modern",       label: "Современный"   },
    { value: "loft",         label: "Лофт"          },
    { value: "japandi",      label: "Japandi"       },
    { value: "boho",         label: "Бохо"          },
    { value: "industrial",   label: "Индустриальный"},
    { value: "classic",      label: "Классика"      },
  ];

  const STEPS = lang === "en" ? [
    { id: 1, label: "Photo",  icon: Camera     },
    { id: 2, label: "Room",   icon: Home       },
    { id: 3, label: "Budget", icon: DollarSign },
    { id: 4, label: "Style",  icon: Palette    },
  ] : [
    { id: 1, label: "Фото",    icon: Camera     },
    { id: 2, label: "Комната", icon: Home       },
    { id: 3, label: "Бюджет",  icon: DollarSign },
    { id: 4, label: "Стиль",   icon: Palette    },
  ];

  const loadingMessages = lang === "en" ? [
    "Analyzing space…",
    "Detecting style and colors…",
    "Selecting furniture…",
    "Building recommendations…",
  ] : [
    "Анализируем пространство…",
    "Определяем стиль и цвета…",
    "Подбираем мебель…",
    "Формируем рекомендации…",
  ];

  // ── State ──────────────────────────────────────────────────────────────────

  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState<RoomScanParams>({
    roomType: "living_room",
    budget: "medium",
    stylePreference: undefined,
    roomSizeM2: undefined,
    notes: "",
  });

  // ── Image handling ─────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    const errMsg = lang === "en" ? "Please upload an image (JPG, PNG, WEBP)" : "Загрузите изображение (JPG, PNG, WEBP)";
    const sizeMsg = lang === "en" ? "File too large. Max 20 MB" : "Файл слишком большой. Максимум 20 МБ";
    if (!file.type.startsWith("image/")) { setError(errMsg); return; }
    if (file.size > 20 * 1024 * 1024) { setError(sizeMsg); return; }
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep(2);
  }, [lang]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!imageFile) return;
    setIsLoading(true); setError(null);

    let msgIdx = 0;
    setLoadingText(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[msgIdx]);
    }, 3500);

    try {
      const base64 = await fileToBase64(imageFile);
      const res = await fetch("/api/analyze-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg", params }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t("common.error"));
      }

      const result = await res.json();
      result.imagePreview = imagePreview;
      sessionStorage.setItem("roomScanResult", JSON.stringify(result));
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
      setIsLoading(false);
    } finally {
      clearInterval(interval);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingScreen text={loadingText} imagePreview={imagePreview} lang={lang} />;

  const nextLabel = lang === "en" ? "Next" : "Далее";
  const backLabel = lang === "en" ? "Back" : "Назад";

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, idx) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0
                  ${done ? "bg-sky-500 text-white" : active ? "bg-sky-600 text-white ring-2 ring-sky-400/40" : "bg-slate-800 text-slate-500"}`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : s.id}
                </div>
                <span className={`text-xs hidden sm:block transition-colors ${active ? "text-slate-200" : "text-slate-500"}`}>{s.label}</span>
                {idx < STEPS.length - 1 && (
                  <div className={`h-px flex-1 transition-colors ${done ? "bg-sky-500" : "bg-slate-800"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 space-y-5">
        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Photo ─── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-sky-400" />
                    {t("upload.title")}
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">{t("upload.subtitle")}</p>
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-3xl border-2 border-dashed overflow-hidden cursor-pointer transition-all
                    ${isDragging ? "border-sky-400 bg-sky-400/10 scale-[1.01]" : "border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60"}`}
                  style={{ minHeight: 260 }}
                >
                  <div className="flex flex-col items-center justify-center gap-4 py-16 px-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-900/60 to-slate-800 flex items-center justify-center border border-sky-800/40">
                      <Camera className="w-9 h-9 text-sky-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-200 text-lg">
                        {lang === "en" ? "Upload a room photo" : "Загрузи фото комнаты"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        JPG, PNG, WEBP · {lang === "en" ? "up to 20 MB · or drag & drop" : "до 20 МБ · или перетащи сюда"}
                      </p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-2xl text-sm font-semibold transition-colors shadow-lg shadow-sky-900/30">
                      <Upload className="w-4 h-4" />
                      {t("upload.photo")}
                    </button>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            </motion.div>
          )}

          {/* ─── STEP 2: Room type ─── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {imagePreview && (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={imagePreview} alt="Room" className="w-full h-36 object-cover" />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); setStep(1); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-600/80 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F2C]/80 to-transparent flex items-end p-3">
                    <span className="text-sm font-medium">{imageFile?.name}</span>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold mb-1">{t("upload.room")}</h2>
                <p className="text-slate-400 text-sm">
                  {lang === "en" ? "Helps AI give accurate recommendations" : "Это поможет ИИ дать точные рекомендации"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ROOM_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setParams(p => ({ ...p, roomType: opt.value }))}
                    className={`flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all text-left
                      ${params.roomType === opt.value
                        ? "bg-sky-600/20 border-sky-500/60 text-white"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600"}`}>
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                    {params.roomType === opt.value && <Check className="w-4 h-4 text-sky-400 ml-auto" />}
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(3)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-sky-600 hover:bg-sky-500 rounded-2xl font-semibold transition-colors shadow-lg shadow-sky-900/20">
                {nextLabel} <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* ─── STEP 3: Budget ─── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-1">{t("upload.budget")}</h2>
                <p className="text-slate-400 text-sm">
                  {lang === "en" ? "AI will pick furniture strictly within this range" : "ИИ подберёт мебель строго в этом диапазоне"}
                </p>
              </div>

              <div className="space-y-2">
                {BUDGET_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setParams(p => ({ ...p, budget: opt.value }))}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all
                      ${params.budget === opt.value ? opt.color : "bg-slate-900/60 border-slate-800 hover:border-slate-600"}`}>
                    <div className="text-left">
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{opt.sub}</div>
                    </div>
                    {params.budget === opt.value && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>

              {/* Room size (optional) */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  {t("upload.area")} ({lang === "en" ? "optional" : "необязательно"})
                </label>
                <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3">
                  <input type="number" min={4} max={200}
                    placeholder={lang === "en" ? "e.g. 20" : "Например: 20"}
                    value={params.roomSizeM2 ?? ""}
                    onChange={e => setParams(p => ({ ...p, roomSizeM2: e.target.value ? Number(e.target.value) : undefined }))}
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-600" />
                  <span className="text-slate-500 text-sm">m²</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:border-slate-500 font-medium transition-colors">
                  {backLabel}
                </button>
                <button onClick={() => setStep(4)} className="flex-[2] flex items-center justify-center gap-2 py-4 bg-sky-600 hover:bg-sky-500 rounded-2xl font-semibold transition-colors">
                  {nextLabel} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 4: Style + Notes ─── */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  {lang === "en" ? "Style & Preferences" : "Стиль и пожелания"}
                </h2>
                <p className="text-slate-400 text-sm">
                  {lang === "en" ? "Both optional — AI will decide based on your photo" : "Оба поля необязательны — ИИ определит сам"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">{t("upload.style")}</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => setParams(p => ({ ...p, stylePreference: p.stylePreference === opt.value ? undefined : opt.value }))}
                      className={`px-3 py-2 rounded-xl text-sm border transition-all
                        ${params.stylePreference === opt.value
                          ? "bg-sky-600 border-sky-500 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">{t("upload.notes")}</label>
                <textarea rows={3}
                  placeholder={t("upload.notes.ph")}
                  value={params.notes ?? ""}
                  onChange={e => setParams(p => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-600 resize-none" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  <X className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:border-slate-500 font-medium transition-colors">
                  {backLabel}
                </button>
                <button onClick={handleSubmit} disabled={!imageFile}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-2xl font-semibold transition-all shadow-lg shadow-sky-900/20">
                  <Sparkles className="w-5 h-5" />
                  {t("upload.analyze")}
                </button>
              </div>
              <p className="text-center text-xs text-slate-600">
                {lang === "en" ? "Analysis takes 10–20 seconds" : "Анализ занимает 10–20 секунд"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({ text, imagePreview, lang }: { text: string; imagePreview: string | null; lang: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">
      {imagePreview && (
        <div className="relative w-64 h-48 rounded-3xl overflow-hidden border border-slate-700">
          <img src={imagePreview} alt="Room" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F2C] via-[#0A0F2C]/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-600/80 backdrop-blur flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-2 h-2 rounded-full bg-sky-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
        <motion.p key={text} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="text-slate-300 font-medium text-center">
          {text}
        </motion.p>
        <p className="text-xs text-slate-500">
          {lang === "en" ? "Claude is analyzing your interior and searching for furniture" : "Claude анализирует интерьер и ищет мебель"}
        </p>
      </div>
    </div>
  );
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 1024;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas error")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load error")); };
    img.src = objectUrl;
  });
}
