"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev; swap for Sentry/LogRocket in prod
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-600/10 flex items-center justify-center text-4xl">
        ⚠️
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Что-то пошло не так
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {error.message || "Произошла непредвиденная ошибка. Попробуй ещё раз."}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-2xl bg-sky-600 text-white text-sm font-semibold"
        >
          Попробовать снова
        </button>
        <a
          href="/"
          className="px-6 py-3 rounded-2xl text-sm font-semibold"
          style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
        >
          На главную
        </a>
      </div>
    </div>
  );
}
