// ─── Region System ────────────────────────────────────────────────────────────

export type Region = "cis" | "us";

export type MarketplaceId =
  | "wildberries" | "ozon" | "aliexpress" | "ikea_ru" | "yandex"
  | "amazon" | "wayfair" | "ikea_us" | "target" | "ebay" | "alibaba";

export type Marketplace = {
  id: MarketplaceId;
  name: string;
  flag: string;
  color: string;
  searchUrl: (query: string) => string;
  region: Region;
};

// ─── Marketplace configs ──────────────────────────────────────────────────────

export const MARKETPLACES: Record<MarketplaceId, Marketplace> = {
  // ── CIS ──
  wildberries: {
    id: "wildberries",
    name: "Wildberries",
    flag: "🟣",
    color: "bg-purple-600",
    searchUrl: (q) => `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(q)}`,
    region: "cis",
  },
  ozon: {
    id: "ozon",
    name: "Ozon",
    flag: "🔵",
    color: "bg-blue-600",
    searchUrl: (q) => `https://www.ozon.ru/search/?text=${encodeURIComponent(q)}&from_global=true`,
    region: "cis",
  },
  aliexpress: {
    id: "aliexpress",
    name: "AliExpress",
    flag: "🔴",
    color: "bg-red-600",
    searchUrl: (q) => `https://aliexpress.ru/wholesale?SearchText=${encodeURIComponent(q)}`,
    region: "cis",
  },
  ikea_ru: {
    id: "ikea_ru",
    name: "IKEA",
    flag: "🟡",
    color: "bg-yellow-500",
    searchUrl: (q) => `https://www.ikea.com/ru/ru/search/?q=${encodeURIComponent(q)}`,
    region: "cis",
  },
  yandex: {
    id: "yandex",
    name: "Яндекс",
    flag: "🟠",
    color: "bg-orange-500",
    searchUrl: (q) => `https://market.yandex.ru/search?text=${encodeURIComponent(q)}`,
    region: "cis",
  },

  // ── US ──
  amazon: {
    id: "amazon",
    name: "Amazon",
    flag: "🟠",
    color: "bg-orange-500",
    searchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&i=garden`,
    region: "us",
  },
  wayfair: {
    id: "wayfair",
    name: "Wayfair",
    flag: "🟣",
    color: "bg-purple-600",
    searchUrl: (q) => `https://www.wayfair.com/keyword.php?keyword=${encodeURIComponent(q)}`,
    region: "us",
  },
  ikea_us: {
    id: "ikea_us",
    name: "IKEA",
    flag: "🟡",
    color: "bg-yellow-500",
    searchUrl: (q) => `https://www.ikea.com/us/en/search/?q=${encodeURIComponent(q)}`,
    region: "us",
  },
  target: {
    id: "target",
    name: "Target",
    flag: "🎯",
    color: "bg-red-600",
    searchUrl: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`,
    region: "us",
  },
  ebay: {
    id: "ebay",
    name: "eBay",
    flag: "🛒",
    color: "bg-blue-500",
    searchUrl: (q) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=11700`,
    region: "us",
  },
  alibaba: {
    id: "alibaba",
    name: "Alibaba",
    flag: "🇨🇳",
    color: "bg-orange-600",
    searchUrl: (q) => `https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&SearchText=${encodeURIComponent(q)}`,
    region: "us",
  },
};

// ─── Region configs ───────────────────────────────────────────────────────────

export type RegionConfig = {
  id: Region;
  label: string;
  flag: string;
  description: string;
  currency: string;
  serpGl: string;    // SerpAPI gl param
  serpHl: string;    // SerpAPI hl param
  marketplaces: MarketplaceId[];
  defaultMarketplace: MarketplaceId;
};

export const REGION_CONFIGS: Record<Region, RegionConfig> = {
  cis: {
    id: "cis",
    label: "СНГ / Россия",
    flag: "🇷🇺",
    description: "Wildberries, Ozon, AliExpress, IKEA, Яндекс",
    currency: "RUB",
    serpGl: "ru",
    serpHl: "ru",
    marketplaces: ["wildberries", "ozon", "aliexpress", "ikea_ru", "yandex"],
    defaultMarketplace: "wildberries",
  },
  us: {
    id: "us",
    label: "США / Международный",
    flag: "🇺🇸",
    description: "Amazon, Wayfair, IKEA, Target, eBay, Alibaba",
    currency: "USD",
    serpGl: "us",
    serpHl: "en",
    marketplaces: ["amazon", "wayfair", "ikea_us", "target", "ebay", "alibaba"],
    defaultMarketplace: "amazon",
  },
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

const REGION_KEY = "roomscan:region";

export function getRegion(): Region {
  if (typeof window === "undefined") return "cis";
  return (localStorage.getItem(REGION_KEY) as Region) || "cis";
}

export function setRegion(region: Region): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REGION_KEY, region);
}

export function getMarketplacesForRegion(region: Region): Marketplace[] {
  return REGION_CONFIGS[region].marketplaces.map((id) => MARKETPLACES[id]);
}
