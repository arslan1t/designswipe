import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-sky-600/10 flex items-center justify-center text-4xl">
        🛋️
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-bold text-sky-400">404</h1>
        <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Страница не найдена
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Этой комнаты не существует. Попробуй начать сначала.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 rounded-2xl bg-sky-600 text-white text-sm font-semibold"
      >
        На главную
      </Link>
    </div>
  );
}
