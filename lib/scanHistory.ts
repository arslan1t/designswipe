import type { RoomScanResult } from "@/lib/types";

const HISTORY_KEY = "roomscan:history";
const MAX_HISTORY = 10;

export type HistoryEntry = {
  id: string;
  createdAt: string;
  imagePreview?: string;
  detectedStyle: string;
  roomCondition: string;
  summary: string;
  params: RoomScanResult["params"];
  furnitureCount: number;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveToHistory(result: RoomScanResult): void {
  if (!isBrowser()) return;
  try {
    const entry: HistoryEntry = {
      id: result.id,
      createdAt: result.createdAt,
      imagePreview: result.imagePreview,
      detectedStyle: result.detectedStyle,
      roomCondition: result.roomCondition,
      summary: result.summary,
      params: result.params,
      furnitureCount: result.furnitureList?.length || 0,
    };

    const existing = getHistory();
    const updated = [entry, ...existing.filter((e) => e.id !== entry.id)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable
  }
}

export function getHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteFromHistory(id: string): void {
  if (!isBrowser()) return;
  try {
    const updated = getHistory().filter((e) => e.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch { /* ignore */ }
}

// Сохраняет полный результат скана для просмотра
export function saveScanResult(result: RoomScanResult): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(`roomscan:result:${result.id}`, JSON.stringify(result));
    saveToHistory(result);
  } catch { /* ignore */ }
}

export function getScanResult(id: string): RoomScanResult | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(`roomscan:result:${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// English labels — used as fallback keys; pages use useLanguage() for display
export const ROOM_LABELS: Record<string, string> = {
  living_room: "Living Room",
  bedroom: "Bedroom",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  office: "Office",
  studio: "Studio",
  balcony: "Balcony",
  dining_room: "Dining Room",
  hallway: "Hallway",
};
