import { NextRequest, NextResponse } from "next/server";
import type { RoomScanResult, FurniturePiece, RoomScanParams } from "@/lib/types";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

function buildPrompt(params: RoomScanParams): string {
  const budgetMap = { low: "до 50 000 ₽", medium: "50 000–200 000 ₽", high: "от 200 000 ₽" };
  const roomMap: Record<string, string> = {
    living_room: "гостиная", bedroom: "спальня", kitchen: "кухня",
    bathroom: "ванная", office: "кабинет/офис", studio: "студия",
    balcony: "балкон/лоджия", dining_room: "столовая", hallway: "прихожая",
  };

  // Room-specific allowed furniture — strict enforcement
  const roomAllowedItems: Record<string, string> = {
    bedroom:     "Разрешено: кровать, прикроватные тумбы, комод, шкаф, пуф, торшер, ночник, зеркало, текстиль (шторы, постельное бельё, ковёр). ЗАПРЕЩЕНО: диван, обеденный стол, кухонные предметы.",
    living_room: "Разрешено: диван, кресла, журнальный столик, ТВ-тумба, стеллаж, торшер, ковёр, декор. ЗАПРЕЩЕНО: кровать, матрас, кухонные предметы.",
    kitchen:     "Разрешено: обеденный стол, стулья, барные стулья, кухонный остров, полки, светильники над столом. ЗАПРЕЩЕНО: диван, кровать, шкаф для одежды.",
    dining_room: "Разрешено: обеденный стол, стулья, сервант, буфет, люстра над столом, ковёр. ЗАПРЕЩЕНО: диван, кровать.",
    office:      "Разрешено: рабочий стол, офисное кресло, полки, стеллажи, настольная лампа, тумба. ЗАПРЕЩЕНО: диван, кровать, обеденный стол.",
    bathroom:    "Разрешено: тумба под раковину, зеркало, полки, крючки, коврик, аксессуары. ЗАПРЕЩЕНО: диван, кровать, стол.",
    hallway:     "Разрешено: вешалка, обувница, зеркало, пуф, полка. ЗАПРЕЩЕНО: диван, кровать, обеденный стол.",
    balcony:     "Разрешено: садовый стул, складной столик, кашпо, уличный коврик. ЗАПРЕЩЕНО: диван для гостиной, кровать.",
    studio:      "Разрешено: диван-кровать, стол, стул, полки, торшер, ковёр, разделители пространства.",
  };

  const roomRules = roomAllowedItems[params.roomType] || "Рекомендуй только подходящую для данного типа помещения мебель.";

  return `Ты — опытный интерьерный дизайнер с 15-летним стажем. Твоя задача — детально проанализировать фото комнаты и дать профессиональные рекомендации по мебели.

ПАРАМЕТРЫ КЛИЕНТА:
• Тип помещения: ${roomMap[params.roomType] || params.roomType}
• Бюджет: ${budgetMap[params.budget]}
${params.stylePreference ? `• Желаемый стиль: ${params.stylePreference}` : "• Стиль: определи сам на основе фото и дай лучший вариант"}
${params.roomSizeM2 ? `• Площадь: ~${params.roomSizeM2} м²` : "• Площадь: оцени визуально по фото"}
${params.notes ? `• Пожелания клиента: ${params.notes}` : ""}

КРИТИЧЕСКИ ВАЖНО — ПРАВИЛА ПО ТИПУ ПОМЕЩЕНИЯ:
${roomRules}
Если предмет не подходит для ${roomMap[params.roomType] || params.roomType} — НЕ рекомендуй его ни при каких условиях.

ЗАДАЧА:
1. Внимательно изучи фото: состояние стен, пол, освещение, пропорции, что уже есть
2. Определи стиль интерьера и доминирующие цвета
3. Подбери мебель и декор ТОЛЬКО для ${roomMap[params.roomType] || params.roomType}, вписывающиеся в бюджет
4. Для каждого предмета дай точный поисковый запрос для маркетплейсов

ПРАВИЛА ДЛЯ РЕКОМЕНДАЦИЙ:
- Не рекомендуй то, что уже есть на фото
- Цены должны СТРОГО соответствовать бюджету: ${budgetMap[params.budget]}
- Сначала — самое важное (essential), потом второстепенное
- Поисковые запросы должны быть конкретными: указывай материал, цвет, стиль, примерный размер
- Для searchQueryEn используй точные термины с английского Amazon/IKEA каталога

Верни ТОЛЬКО валидный JSON без markdown и без пояснений:
{
  "detectedStyle": "точное название стиля на русском",
  "detectedColors": ["основной цвет 1", "основной цвет 2", "акцентный цвет"],
  "detectedElements": ["предмет 1 что уже есть", "предмет 2", "особенность помещения"],
  "roomCondition": "needs_renovation или fresh_renovation или good_condition или excellent",
  "summary": "3 предложения: что хорошего в комнате, что нужно улучшить, главный совет",
  "furnitureList": [
    {
      "id": "f1",
      "category": "Название предмета (например: Угловой диван)",
      "reason": "Конкретная причина: почему именно это и почему сюда подходит",
      "searchQuery": "точный запрос на русском: материал + цвет + стиль + размер если важен",
      "searchQueryEn": "exact English query for IKEA/Amazon: material + color + style + size",
      "priceMin": число без пробелов,
      "priceMax": число без пробелов,
      "currency": "RUB",
      "style": "стиль предмета",
      "color": "конкретный цвет/оттенок",
      "material": "материал",
      "priority": "essential или recommended или optional"
    }
  ]
}

Дай ровно 6–8 позиций. Распредели: 2-3 essential, 2-3 recommended, 1-2 optional.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg", params } = body as {
      imageBase64: string;
      mimeType?: string;
      params: RoomScanParams;
    };

    if (!imageBase64 || !params) {
      return NextResponse.json({ error: "imageBase64 and params are required" }, { status: 400 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(getDemoResult(params));
    }

    const prompt = buildPrompt(params);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                  data: imageBase64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    const responseText = await anthropicRes.text();

    if (!anthropicRes.ok) {
      console.error("Anthropic error:", anthropicRes.status, responseText);

      if (anthropicRes.status === 429) {
        return NextResponse.json({ ...getDemoResult(params), _demo: true });
      }

      let friendlyError = "Ошибка Anthropic API";
      try {
        const errJson = JSON.parse(responseText);
        const msg = errJson?.error?.message || "";
        if (anthropicRes.status === 401) friendlyError = "Неверный API ключ. Проверь .env.local";
        else if (anthropicRes.status === 402 || msg.includes("credit")) {
          friendlyError = "Закончились кредиты Anthropic. Пополни на console.anthropic.com";
        } else if (msg) friendlyError = msg;
      } catch { /* ignore */ }

      return NextResponse.json({ error: friendlyError }, { status: 502 });
    }

    const anthropicData: { content?: { type: string; text: string }[] } = JSON.parse(responseText);
    const rawContent = anthropicData.content?.find((c) => c.type === "text")?.text || "";

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : rawContent;

    let parsed: Omit<RoomScanResult, "id" | "createdAt" | "params" | "imagePreview">;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "Не удалось разобрать ответ ИИ" }, { status: 502 });
    }

    const result: RoomScanResult = {
      id: `scan_${Date.now()}`,
      createdAt: new Date().toISOString(),
      params,
      detectedStyle: parsed.detectedStyle || "Современный",
      detectedColors: parsed.detectedColors || [],
      detectedElements: parsed.detectedElements || [],
      roomCondition: parsed.roomCondition || "good_condition",
      summary: parsed.summary || "",
      furnitureList: (parsed.furnitureList || []).map((f: FurniturePiece, i: number) => ({
        ...f,
        id: f.id || `f${i + 1}`,
        priceMin: Number(f.priceMin) || 0,
        priceMax: Number(f.priceMax) || 0,
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("analyze-room error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Внутренняя ошибка" },
      { status: 500 }
    );
  }
}

function getDemoResult(params: RoomScanParams): RoomScanResult {
  const furniture: FurniturePiece[] = [
    { id: "f1", category: "Модульный диван", reason: "Основа гостиной — создаёт зону отдыха и задаёт стиль всему пространству", searchQuery: "модульный диван серый велюр скандинавский 250см", searchQueryEn: "modular sofa grey velvet scandinavian 250cm", priceMin: 35000, priceMax: 90000, currency: "RUB", style: "scandinavian", color: "светло-серый", material: "велюр", priority: "essential" },
    { id: "f2", category: "Журнальный стол", reason: "Завершает зону дивана, нужен для функциональности и визуального баланса", searchQuery: "журнальный стол круглый дуб металлические ножки 80см", searchQueryEn: "round coffee table oak wood metal legs 80cm", priceMin: 8000, priceMax: 25000, currency: "RUB", style: "modern", color: "натуральный дуб", material: "массив дерева + металл", priority: "essential" },
    { id: "f3", category: "Открытый стеллаж", reason: "Добавляет хранение и декоративную зону, визуально структурирует пространство", searchQuery: "стеллаж открытый белый 5 полок 180x80", searchQueryEn: "open bookcase white 5 shelves 180x80cm", priceMin: 7000, priceMax: 22000, currency: "RUB", style: "minimal", color: "белый матовый", material: "МДФ/ЛДСП", priority: "essential" },
    { id: "f4", category: "Напольный торшер", reason: "Тёплое рассеянное освещение создаёт атмосферу вечером, нет резких теней", searchQuery: "торшер напольный дуга чёрный E27 лофт минимализм", searchQueryEn: "arc floor lamp black E27 minimalist", priceMin: 4000, priceMax: 14000, currency: "RUB", style: "loft", color: "матовый чёрный", material: "металл", priority: "recommended" },
    { id: "f5", category: "Ковёр с рисунком", reason: "Объединяет мебельную группу, защищает пол и добавляет уют", searchQuery: "ковёр шерстяной геометрический бежевый серый 160x230", searchQueryEn: "wool area rug geometric beige grey 160x230cm", priceMin: 6000, priceMax: 30000, currency: "RUB", style: "scandinavian", color: "бежево-серый", material: "шерсть/хлопок", priority: "recommended" },
    { id: "f6", category: "Декоративные подушки", reason: "Быстрый способ добавить цвет и текстуру, делают диван уютнее", searchQuery: "подушки декоративные набор 45x45 натуральные цвета лён", searchQueryEn: "decorative throw pillows set 45x45 natural linen", priceMin: 1500, priceMax: 6000, currency: "RUB", style: "boho", color: "терракот/охра/бежевый", material: "лён/хлопок", priority: "optional" },
    { id: "f7", category: "Настенное зеркало", reason: "Визуально увеличивает комнату и добавляет свет, особенно важно при невысоких потолках", searchQuery: "зеркало настенное круглое чёрная рама 80см", searchQueryEn: "round wall mirror black frame 80cm", priceMin: 3000, priceMax: 12000, currency: "RUB", style: "modern", color: "чёрная рама", material: "металл/стекло", priority: "optional" },
  ];

  return {
    id: `scan_demo_${Date.now()}`,
    createdAt: new Date().toISOString(),
    params,
    detectedStyle: "Скандинавский минимализм",
    detectedColors: ["Белый", "Светло-серый", "Натуральное дерево", "Чёрный акцент"],
    detectedElements: ["Светлые стены", "Деревянный пол", "Хорошее естественное освещение", "Пустые стены"],
    roomCondition: "good_condition",
    summary: "Комната имеет хорошую основу: светлые стены и естественный свет создают отличную базу для уютного интерьера. Сейчас не хватает мягкой мебельной группы и зонирования — пространство ощущается незавершённым. Начни с дивана и журнального стола — они сразу преобразят комнату.",
    furnitureList: furniture,
  };
}
