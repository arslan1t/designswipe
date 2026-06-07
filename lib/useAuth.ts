"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AuthState = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: import("firebase/auth").User | null) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    window.location.href = "/login";
  };

  return { user, loading, signOut };
}
