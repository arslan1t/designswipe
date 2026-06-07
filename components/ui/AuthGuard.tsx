"use client";

import type { ReactNode } from "react";

// AUTH TEMPORARILY DISABLED — раскомментируй оригинал когда настроишь Supabase
export default function AuthGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
