import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-4-5-20251001";

interface BreakdownRequest {
  designId: string;
  title: string;
  style: string;
  room: string;
  budget: string;
  palette?: string[];
  tags?: string[];
  region?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: BreakdownRequest = await req.json();
    const { title, style, room, budget, palette = [], tags = [], region = "CIS" } = body;

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(getFallbackBreakdown(body), { status: 200 });
    }

    const styleFull: Record<string, string> = {
      minimal: "Minimalism", modern: "Modern", scandinavian: "Scandinavian",
      japandi: "Japandi", boho: "Boho", loft: "Loft",
      industrial: "Industrial", classic: "Classic", luxury: "Luxury",
    };
    const roomFull: Record<string, string> = {
      living_room: "Living Room", bedroom: "Bedroom", kitchen: "Kitchen",
      bathroom: "Bathroom", office: "Home Office", studio: "Studio",
      balcony: "Balcony", dining_room: "Dining Room", hallway: "Hallway",
    };
    const budgetFull: Record<string, string> = {
      low: "budget (under $500)", medium: "mid-range ($500–2000)", high: "premium (over $2000)",
    };

    const marketLinks = region === "US"
      ? "Amazon.com and Wayfair.com"
      : "Wildberries.ru, Ozon.ru, and IKEA.ru";

    const prompt = `You are a professional interior designer. Analyze this ${styleFull[style] || style} style ${roomFull[room] || room} interior design.

Design: "${title}"
Style: ${styleFull[style] || style}
Room: ${roomFull[room] || room}
Budget: ${budgetFull[budget] || budget}
${palette.length ? `Color palette: ${palette.join(", ")}` : ""}
${tags.length ? `Keywords: ${tags.join(", ")}` : ""}

Create a detailed furniture breakdown in English. For each item, provide realistic search queries for ${marketLinks}.

Return ONLY valid JSON (no markdown):
{
  "mainStyle": "full style name",
  "difficulty": "easy|medium|hard",
  "summary": "2-3 sentences describing this design's character and what makes it special",
  "keyPoints": ["principle 1", "principle 2", "principle 3", "principle 4"],
  "items": [
    {
      "id": "item_1",
      "title": "Item name",
      "category": "sofa|armchair|coffee_table|tv_stand|bookshelf|floor_lamp|table_lamp|rug|curtains|bed|wardrobe|nightstand|desk|dining_table|chair|decoration|mirror|plant|shelf|other",
      "zone": "seating|textiles|lighting|storage|decor",
      "importance": 1,
      "description": "Why this specific item works for this style and room",
      "style": "${styleFull[style] || style}",
      "palette": "specific color/shade",
      "material": "material description",
      "notes": ["tip 1", "tip 2"],
      "products": [
        {
          "title": "Specific product search query",
          "shop": "store name",
          "url": "https://...",
          "similarity": 0.9,
          "note": "optional note"
        }
      ]
    }
  ]
}

Rules:
- importance: 1=key piece, 2=important, 3=accent
- Generate 6-8 items covering all zones
- Products: generate realistic ${region === "US" ? "Amazon/Wayfair" : "Wildberries/Ozon/IKEA"} search URLs
- For Amazon: https://www.amazon.com/s?k=YOUR+SEARCH+QUERY
- For Wildberries: https://www.wildberries.ru/catalog/0/search.aspx?search=YOUR+QUERY
- For Ozon: https://www.ozon.ru/search/?text=YOUR+QUERY
- For IKEA: https://www.ikea.com/ru/ru/search/?q=YOUR+QUERY
- Each item should have 1-2 product links
- All text must be in English`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic error:", res.status, errText);
      return NextResponse.json(getFallbackBreakdown(body), { status: 200 });
    }

    const data: { content?: { type: string; text: string }[] } = await res.json();
    const raw = data.content?.find(c => c.type === "text")?.text || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json(getFallbackBreakdown(body), { status: 200 });

    const parsed = JSON.parse(match[0]);
    return NextResponse.json({ ...parsed, _ai: true });
  } catch (err) {
    console.error("generate-breakdown error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function getFallbackBreakdown(body: BreakdownRequest) {
  const styleFull: Record<string, string> = {
    minimal: "Minimalism", modern: "Modern", scandinavian: "Scandinavian",
    japandi: "Japandi", boho: "Boho", loft: "Loft",
    industrial: "Industrial", classic: "Classic", luxury: "Luxury",
  };
  const s = styleFull[body.style] || body.style;

  return {
    _ai: false,
    mainStyle: s,
    difficulty: "medium" as const,
    summary: `A carefully curated ${s} design that balances form and function. Clean lines and thoughtful material choices define this interior. Each piece is selected to enhance the overall composition.`,
    keyPoints: [
      "Harmony of proportions and negative space",
      "Natural materials and textures",
      "Layered lighting for atmosphere",
      "Cohesive color palette throughout",
    ],
    items: [
      {
        id: "item_1",
        title: "Main Sofa",
        category: "sofa",
        zone: "seating",
        importance: 1,
        description: `The centerpiece of the space — anchors the seating area and sets the ${s} tone.`,
        style: s,
        palette: body.palette?.[0] || "neutral",
        material: "fabric",
        notes: ["Choose low profile for open feel", "Opt for removable covers for longevity"],
        products: [
          { title: `${s} sofa fabric`, shop: "IKEA", url: "https://www.ikea.com/ru/ru/search/?q=sofa+fabric", similarity: 0.85 },
        ],
      },
      {
        id: "item_2",
        title: "Coffee Table",
        category: "coffee_table",
        zone: "seating",
        importance: 2,
        description: "Functional centerpiece that ties the seating arrangement together.",
        style: s,
        palette: "natural wood",
        material: "wood / metal",
        notes: ["Round edges for flow", "Consider storage underneath"],
        products: [
          { title: `${s} coffee table round`, shop: "Ozon", url: "https://www.ozon.ru/search/?text=coffee+table+round+wood", similarity: 0.8 },
        ],
      },
      {
        id: "item_3",
        title: "Floor Lamp",
        category: "floor_lamp",
        zone: "lighting",
        importance: 2,
        description: "Warm ambient light to create atmosphere in the evening.",
        style: s,
        palette: "matte black / brass",
        material: "metal",
        notes: ["Warm white bulb (2700K)", "Arc style saves floor space"],
        products: [
          { title: `arc floor lamp ${s}`, shop: "Wildberries", url: "https://www.wildberries.ru/catalog/0/search.aspx?search=arc+floor+lamp", similarity: 0.82 },
        ],
      },
      {
        id: "item_4",
        title: "Area Rug",
        category: "rug",
        zone: "textiles",
        importance: 2,
        description: "Grounds the furniture grouping and adds warmth underfoot.",
        style: s,
        palette: body.palette?.[1] || "beige/grey",
        material: "wool / cotton",
        notes: ["Size up for visual spaciousness", "Low pile is easier to maintain"],
        products: [
          { title: `${s} area rug wool`, shop: "Ozon", url: "https://www.ozon.ru/search/?text=area+rug+wool", similarity: 0.78 },
        ],
      },
      {
        id: "item_5",
        title: "Open Shelving",
        category: "shelf",
        zone: "storage",
        importance: 3,
        description: "Display and storage that adds vertical interest.",
        style: s,
        palette: "white / wood",
        material: "MDF / solid wood",
        notes: ["Style with odd-number groupings", "Mix books, plants, and objects"],
        products: [
          { title: `wall shelf ${s} wood`, shop: "IKEA", url: "https://www.ikea.com/ru/ru/search/?q=wall+shelf", similarity: 0.88 },
        ],
      },
      {
        id: "item_6",
        title: "Decorative Pillows",
        category: "decoration",
        zone: "decor",
        importance: 3,
        description: "Quick way to add color, texture, and personality.",
        style: s,
        palette: "terracotta / sage",
        material: "linen / velvet",
        notes: ["Mix 2-3 textures", "Odd numbers look more natural"],
        products: [
          { title: `throw pillows linen set`, shop: "Wildberries", url: "https://www.wildberries.ru/catalog/0/search.aspx?search=throw+pillows+linen", similarity: 0.75 },
        ],
      },
    ],
  };
}
