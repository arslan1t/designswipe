"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  LogOut, Globe, Clock, ChevronRight,
  Check, Sparkles, ShoppingBag, User,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { getRegion, setRegion, REGION_CONFIGS, type Region } from "@/lib/region";
import { getHistory } from "@/lib/scanHistory";
import { useLanguage, type Lang } from "@/lib/i18n";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
  const [region, setRegionState] = useState<Region>("cis");
  const [scanCount, setScanCount] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setRegionState(getRegion());
    setScanCount(getHistory().length);
  }, []);

  const handleRegionChange = (r: Region) => { setRegion(r); setRegionState(r); };
  const handleSignOut = async () => { setSigningOut(true); await signOut(); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-sky-400 animate-pulse" />
      </div>
    );
  }

  const avatarUrl = user?.photoURL ?? undefined;
  const fullName  = user?.displayName ?? undefined;
  const email     = user?.email ?? undefined;
  const initials  = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      <div className="px-4 pt-8 pb-6">
        <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
      </div>
      <div className="px-4 space-y-4">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-sky-600 to-violet-600 flex items-center justify-center shrink-0">
            {avatarUrl
              ? <img src={avatarUrl} alt={fullName || "User"} className="w-full h-full object-cover" />
              : <span className="text-xl font-bold text-white">{user ? initials : "?"}</span>}
          </div>
          <div className="flex-1 min-w-0">
            {fullName && <p className="font-semibold text-base truncate">{fullName}</p>}
            <p className="text-sm text-slate-400 truncate">{email || t("profile.anon")}</p>
            {user && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full w-fit">
                <Sparkles className="w-3 h-3 text-sky-400" />{t("profile.google")}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center">
            <div className="text-2xl font-bold text-sky-300">{scanCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">{t("profile.scans")}</div>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center">
            <div className="text-2xl font-bold">{REGION_CONFIGS[region].flag}</div>
            <div className="text-xs text-slate-400 mt-0.5">{REGION_CONFIGS[region].label}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
            <Globe className="w-4 h-4 text-violet-400" />
            <span className="font-medium text-sm">Language / Язык</span>
          </div>
          {(["en", "ru"] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left border-b border-slate-800/50 last:border-0 ${lang === l ? "bg-violet-900/20" : "hover:bg-slate-800/40"}`}>
              <span className="text-2xl">{l === "en" ? "🇬🇧" : "🇷🇺"}</span>
              <div className="flex-1"><div className="font-medium text-sm">{l === "en" ? "English" : "Русский"}</div></div>
              {lang === l && <Check className="w-5 h-5 text-violet-400 shrink-0" />}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="font-medium text-sm">{t("profile.region")}</span>
          </div>
          {Object.values(REGION_CONFIGS).map((cfg) => (
            <button key={cfg.id} onClick={() => handleRegionChange(cfg.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left border-b border-slate-800/50 last:border-0 ${region === cfg.id ? "bg-sky-900/20" : "hover:bg-slate-800/40"}`}>
              <span className="text-2xl">{cfg.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{cfg.label}</div>
                <div className="text-xs text-slate-400 mt-0.5 truncate">{cfg.description}</div>
              </div>
              {region === cfg.id && <Check className="w-5 h-5 text-sky-400 shrink-0" />}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          {[
            { icon: Clock,       label: t("profile.history"), sub: `${scanCount} ${t("history.items")}`, href: "/history" },
            { icon: ShoppingBag, label: t("profile.newscan"), sub: t("upload.subtitle"),                 href: "/upload"  },
            { icon: User,        label: t("profile.swipe"),   sub: t("home.swipe"),                      href: "/swipe"   },
          ].map((item) => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/40 transition-colors border-b border-slate-800/50 last:border-0">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-slate-500 truncate">{item.sub}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          ))}
        </div>

        {user && (
          <button onClick={handleSignOut} disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900/60 border border-slate-800 hover:border-red-900/50 hover:bg-red-900/10 text-slate-300 hover:text-red-400 rounded-2xl font-medium text-sm transition-all disabled:opacity-50">
            <LogOut className="w-4 h-4" />
            {signingOut ? t("profile.signingout") : t("profile.signout")}
          </button>
        )}

        <p className="text-center text-xs text-slate-600 pb-4">{t("profile.footer")}</p>
      </div>
    </div>
  );
}
