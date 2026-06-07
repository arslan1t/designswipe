import { NextRequest, NextResponse } from "next/server";
import type { ShoppingProduct } from "@/lib/types";
import { MARKETPLACES, REGION_CONFIGS, type MarketplaceId, type Region } from "@/lib/region";

const SERPAPI_KEY = process.env.SERPAPI_KEY;

// ─── Wildberries public API ───────────────────────────────────────────────────

async function searchWildberries(query: string): Promise<ShoppingProduct[]> {
  try {
    const params = new URLSearchParams({
      query,
      resultset: "catalog",
      limit: "8",
      sort: "popular",
      lang: "ru",
      dest: "-1257786",
      regions: "80,38,83,4,64,33,68,70,30,40,86,75,69,1,31,66,110,48,22,71,114",
    });

    const res = await fetch(
      `https://search.wb.ru/exactmatch/ru/common/v4/search?${params}`,
      { headers: { "Accept": "application/json" }, next: { revalidate: 0 } }
    );

    if (!res.ok) return [];
    const data = await res.json();
    const products = data?.data?.products || [];

    return products.slice(0, 8).map((p: Record<string, unknown>, idx: number) => {
      const id = p.id as number;
      const vol = Math.floor(id / 100000);
      const part = Math.floor(id / 1000);
      // WB basket number logic
      let basket = "01";
      if (vol >= 0    && vol <= 143)  basket = "01";
      else if (vol <= 287)  basket = "02";
      else if (vol <= 431)  basket = "03";
      else if (vol <= 719)  basket = "04";
      else if (vol <= 1007) basket = "05";
      else if (vol <= 1061) basket = "06";
      else if (vol <= 1115) basket = "07";
      else if (vol <= 1169) basket = "08";
      else if (vol <= 1313) basket = "09";
      else if (vol <= 1601) basket = "10";
      else if (vol <= 1655) basket = "11";
      else if (vol <= 1919) basket = "12";
      else if (vol <= 2045) basket = "13";
      else basket = "14";

      const imageUrl = `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/${id}/images/c516x688/1.jpg`;

      const salePriceU = (p.salePriceU as number) || (p.priceU as number) || 0;
      const price = Math.round(salePriceU / 100);

      return {
        id: `wb_${id}_${idx}`,
        title: `${p.brand ? p.brand + " · " : ""}${p.name}`,
        price,
        currency: "RUB",
        imageUrl,
        productUrl: `https://www.wildberries.ru/catalog/${id}/detail.aspx`,
        shop: "Wildberries",
        rating: (p.reviewRating as number) || undefined,
        reviews: (p.feedbacks as number) || undefined,
      } satisfies ShoppingProduct;
    });
  } catch (err) {
    console.error("WB API error:", err);
    return [];
  }
}

// ─── SerpAPI (Google Shopping) ────────────────────────────────────────────────

async function searchSerpApi(
  query: string,
  region: Region,
  marketplaceId?: MarketplaceId
): Promise<ShoppingProduct[]> {
  if (!SERPAPI_KEY) return [];

  const regionConfig = REGION_CONFIGS[region];
  const mp = marketplaceId ? MARKETPLACES[marketplaceId] : null;

  // Добавляем site: фильтр если выбран конкретный магазин
  let searchQuery = query;
  if (mp && marketplaceId !== "wildberries") {
    const siteMap: Partial<Record<MarketplaceId, string>> = {
      ozon:     "site:ozon.ru",
      ikea_ru:  "site:ikea.com/ru",
      yandex:   "site:market.yandex.ru",
      amazon:   "site:amazon.com",
      wayfair:  "site:wayfair.com",
      ikea_us:  "site:ikea.com/us",
      target:   "site:target.com",
      ebay:     "site:ebay.com",
      alibaba:  "site:alibaba.com",
      aliexpress: "site:aliexpress.com",
    };
    const siteFilter = marketplaceId ? siteMap[marketplaceId] : undefined;
    if (siteFilter) searchQuery += ` ${siteFilter}`;
  }

  try {
    const params = new URLSearchParams({
      engine: "google_shopping",
      q: searchQuery,
      api_key: SERPAPI_KEY,
      hl: regionConfig.serpHl,
      gl: regionConfig.serpGl,
      num: "10",
    });

    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    const items: Record<string, unknown>[] = data.shopping_results || data.inline_shopping_results || [];

    return items.slice(0, 8).map((item, idx) => {
      const priceRaw = String(item.price || "0");
      const priceNum = parseFloat(priceRaw.replace(/[^\d.]/g, "")) || 0;
      const isRub = priceRaw.includes("₽") || priceRaw.includes("руб") || region === "cis";

      return {
        id: `serp_${idx}_${Date.now()}`,
        title: String(item.title || "Товар"),
        price: priceNum,
        currency: isRub ? "RUB" : "USD",
        imageUrl: String(item.thumbnail || ""),
        productUrl: String(item.link || item.product_link || "#"),
        shop: String(item.source || item.seller || mp?.name || "Магазин"),
        rating: typeof item.rating === "number" ? item.rating : undefined,
        reviews: typeof item.reviews === "number" ? item.reviews : undefined,
      } satisfies ShoppingProduct;
    });
  } catch (err) {
    console.error("SerpAPI error:", err);
    return [];
  }
}

// ─── Direct search links fallback ─────────────────────────────────────────────

function buildDirectLinks(query: string, region: Region, marketplaceId?: MarketplaceId): ShoppingProduct[] {
  const regionConfig = REGION_CONFIGS[region];
  const mpIds = marketplaceId ? [marketplaceId] : regionConfig.marketplaces.slice(0, 4);

  return mpIds.map((mpId) => {
    const mp = MARKETPLACES[mpId];
    return {
      id: `direct_${mpId}`,
      title: `Найти "${query}" на ${mp.name}`,
      price: 0,
      currency: regionConfig.currency,
      imageUrl: "",
      productUrl: mp.searchUrl(query),
      shop: mp.name,
    } satisfies ShoppingProduct;
  });
}

// ─── Main route handler ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { query, queryEn, marketplace, region = "cis" } = await req.json() as {
      query: string;
      queryEn?: string;
      marketplace?: MarketplaceId | "all";
      region?: Region;
    };

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const mpId = (marketplace && marketplace !== "all") ? marketplace as MarketplaceId : undefined;
    const searchQuery = region === "us" && queryEn ? queryEn : query;

    let products: ShoppingProduct[] = [];

    // 1. Wildberries — используем их собственный API (бесплатно, без ключей)
    if (!mpId || mpId === "wildberries") {
      if (region === "cis") {
        products = await searchWildberries(query);
      }
    }

    // 2. Если WB дал результаты и выбраны только WB — возвращаем
    if (products.length >= 4 && mpId === "wildberries") {
      return NextResponse.json({ products, source: "wildberries" });
    }

    // 3. SerpAPI для остальных магазинов
    if (SERPAPI_KEY && (!mpId || mpId !== "wildberries")) {
      const serpProducts = await searchSerpApi(searchQuery, region, mpId);
      products = [...products, ...serpProducts];
    }

    // 4. Если всё ещё нет результатов — возвращаем прямые ссылки на поиск
    if (products.length === 0) {
      products = buildDirectLinks(query, region, mpId);
    }

    // Убираем дубли по URL
    const seen = new Set<string>();
    const unique = products.filter(p => {
      if (seen.has(p.productUrl)) return false;
      seen.add(p.productUrl);
      return true;
    });

    return NextResponse.json({ products: unique.slice(0, 10), total: unique.length });
  } catch (error) {
    console.error("search-furniture error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
