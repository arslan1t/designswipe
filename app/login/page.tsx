"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ShoppingBag, Camera, TrendingUp } from "lucide-react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useLanguage } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: import("firebase/auth").User | null) => {
      if (user) router.replace("/");
      else setChecking(false);
    });
    return () => unsub();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("popup-closed-by-user") && !msg.includes("cancelled-popup-request")) {
        setError(t("login.error"));
      }
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  const FEATURES = [
    { icon: Camera,      text: t("login.feat1") },
    { icon: Sparkles,    text: t("login.feat2") },
    { icon: ShoppingBag, text: t("login.feat3") },
    { icon: TrendingUp,  text: t("login.feat4") },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-600 to-violet-600 flex items-center justify-center mx-auto shadow-2xl shadow-sky-900/40">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RoomScan AI</h1>
            <p className="text-slate-400 text-sm mt-1">{t("login.subtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="card flex flex-col items-center gap-2 p-3 text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-900/50 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-sky-400" />
              </div>
              <span className="text-xs text-slate-300 leading-tight">{f.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          {error && (
            <p className="text-center text-sm text-red-400 bg-red-900/20 border border-red-900/30 rounded-xl px-4 py-2">
              {error}
            </p>
          )}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-semibold text-base transition-all shadow-xl disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
            {loading ? t("login.redirecting") : t("login.cta")}
          </motion.button>
          <p className="text-center text-xs text-slate-500 leading-relaxed">{t("login.terms")}</p>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
