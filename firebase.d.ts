// Temporary shim — remove after running: npm install firebase
// Firebase types are resolved correctly once fully installed
declare module "firebase/app" {
  export function initializeApp(config: Record<string, string>): unknown;
  export function getApps(): unknown[];
}
declare module "firebase/auth" {
  export type User = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
  export function getAuth(app?: unknown): unknown;
  export function GoogleAuthProvider(): void;
  export class GoogleAuthProvider {
    setCustomParameters(params: Record<string, string>): void;
  }
  export function signInWithPopup(auth: unknown, provider: unknown): Promise<{ user: User }>;
  export function signOut(auth: unknown): Promise<void>;
  export function onAuthStateChanged(auth: unknown, callback: (user: User | null) => void): () => void;
}
