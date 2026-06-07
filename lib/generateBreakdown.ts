/**
 * Auto-generates a DesignBreakdown from a Design's metadata.
 * Used when no hand-crafted breakdown exists in designBreakdowns.ts
 */
import type { Design } from "./types";
import type { DesignBreakdown, BreakdownItem, ProductLink } from "./types";

// ─── Style descriptions ────────────────────────────────────────────────────────

const STYLE_SUMMARIES: Record<string, string> = {
  scandinavian: "Скандинавский интерьер с акцентом на светлое дерево, белые поверхности и мягкий текстиль. Минимализм без аскетизма — уютная атмосфера за счёт тёплых натуральных материалов.",
  minimal:      "Минималистичное пространство с чистыми линиями и отсутствием лишних деталей. Каждый предмет несёт функцию и визуальный смысл. Палитра нейтральная, материалы — качественные.",
  modern:       "Современный интерьер с акцентом на функциональность и эстетику. Сочетание металла, стекла и качественных тканей. Отделка лаконичная, акценты выверенные.",
  japandi:      "Japandi — сплав японской философии ваби-саби и скандинавского функционализма. Светлое дерево, натуральные фактуры, минимум цвета, много воздуха.",
  boho:         "Богемный интерьер с тёплыми оттенками, многослойным текстилем и органическими формами. Живые растения, ротанг, макраме создают естественную, живую атмосферу.",
  loft:         "Лофт-интерьер с открытым пространством, индустриальными элементами и необработанными поверхностями. Кирпич, металл и дерево — базовая триада материалов.",
  industrial:   "Индустриальный стиль с тёмными металлическими акцентами, приглушённой палитрой и грубыми текстурами. Функциональная мебель с характером.",
  classic:      "Классический интерьер с богатыми материалами, симметричными композициями и тщательно подобранным декором. Качество деталей — ключевое.",
  luxury:       "Люксовый интерьер с использованием мрамора, металлов и Premium-тканей. Изысканные пропорции, дорогие материалы, безупречная отделка.",
};

const STYLE_MAIN_LABELS: Record<string, string> = {
  scandinavian: "Скандинавский",
  minimal:      "Минимализм",
  modern:       "Современный",
  japandi:      "Japandi",
  boho:         "Бохо",
  loft:         "Лофт",
  industrial:   "Индустриальный",
  classic:      "Классика",
  luxury:       "Люкс",
};

const ROOM_LABELS: Record<string, string> = {
  living_room: "Гостиная",
  bedroom:     "Спальня",
  kitchen:     "Кухня",
  dining_room: "Столовая",
  office:      "Кабинет",
  bathroom:    "Ванная",
  hallway:     "Прихожая",
  balcony:     "Балкон",
  studio:      "Студия",
};

const DIFFICULTY: Record<string, "easy" | "medium" | "hard"> = {
  scandinavian: "easy",
  minimal:      "easy",
  modern:       "medium",
  japandi:      "medium",
  boho:         "easy",
  loft:         "medium",
  industrial:   "medium",
  classic:      "hard",
  luxury:       "hard",
};

// ─── Furniture templates per style × room ────────────────────────────────────

type FurnitureTemplate = {
  category: string;
  role: "primary" | "secondary" | "accent";
  title: string;
  description: string;
  importance: 1 | 2 | 3;
  zone: "seating" | "textiles" | "lighting" | "storage" | "decor";
  notes: string[];
  searchQuery: string;
  shopLinks: { shop: string; title: string; url: string; similarity: number }[];
};

function makeLivingRoom(style: string, budget: string): FurnitureTemplate[] {
  const budgetNote = budget === "high" ? " · Ориентир: люкс-сегмент" : budget === "low" ? " · Ориентир: доступный сегмент" : "";
  const isWarm = ["scandinavian","boho","japandi","classic"].includes(style);
  const sofaColor = isWarm ? "бежевый / кремовый" : "серый / антрацит";

  return [
    {
      category: "sofa",
      role: "primary",
      title: `Диван в стиле ${STYLE_MAIN_LABELS[style] || style}`,
      description: `Главный якорь гостиной. Задаёт тон всей композиции. Цвет — ${sofaColor}.${budgetNote}`,
      importance: 1,
      zone: "seating",
      notes: ["Высота сиденья 42–46 см", "Ножки — дерево или матовый металл"],
      searchQuery: `${style} style sofa ${sofaColor.split("/")[0]} living room`,
      shopLinks: [
        { shop: "IKEA",    title: `Диван ${STYLE_MAIN_LABELS[style]}`, url: "https://www.ikea.com/ru/ru/cat/divany-20649/",  similarity: 0.88 },
        { shop: "Ozon",    title: `Диван для гостиной`,                url: "https://www.ozon.ru/category/divany/",           similarity: 0.82 },
        { shop: "Wildberries", title: `Диван мягкий`,                  url: "https://www.wildberries.ru/catalog/0/search.aspx?search=диван", similarity: 0.78 },
      ],
    },
    {
      category: "coffee_table",
      role: "secondary",
      title: "Журнальный столик",
      description: "Центр посадочной зоны. Создаёт точку фокуса и рабочую поверхность.",
      importance: 2,
      zone: "seating",
      notes: ["Высота 40–50 см", "Форма — округлая или прямоугольная"],
      searchQuery: `${style} coffee table wood`,
      shopLinks: [
        { shop: "IKEA",    title: "Столик журнальный",  url: "https://www.ikea.com/ru/ru/cat/zhurnalnye-stoliki-10705/", similarity: 0.85 },
        { shop: "Ozon",    title: "Кофейный столик",    url: "https://www.ozon.ru/category/zhurnalnye-stoliki/",          similarity: 0.80 },
      ],
    },
    {
      category: "floor_lamp",
      role: "accent",
      title: "Торшер",
      description: "Создаёт тёплый фоновый свет и визуальную вертикаль в пространстве.",
      importance: 2,
      zone: "lighting",
      notes: ["Высота 150–180 см", "Регулируемый угол наклона — плюс"],
      searchQuery: `${style} floor lamp`,
      shopLinks: [
        { shop: "IKEA",    title: "Торшер",  url: "https://www.ikea.com/ru/ru/cat/torsher-21527/",      similarity: 0.86 },
        { shop: "Wildberries", title: "Торшер напольный", url: "https://www.wildberries.ru/catalog/0/search.aspx?search=торшер", similarity: 0.80 },
      ],
    },
    {
      category: "rug",
      role: "accent",
      title: "Ковёр",
      description: "Объединяет мебельную группу и добавляет текстуру в пространство.",
      importance: 3,
      zone: "textiles",
      notes: ["Размер 200×300 см под диван + стол", "Натуральные волокна предпочтительны"],
      searchQuery: `${style} area rug`,
      shopLinks: [
        { shop: "IKEA",    title: "Ковёр",      url: "https://www.ikea.com/ru/ru/cat/kovry-10654/",                 similarity: 0.84 },
        { shop: "Ozon",    title: "Ковёр паласный", url: "https://www.ozon.ru/category/kovry-10553001/",           similarity: 0.78 },
      ],
    },
    {
      category: "bookshelf",
      role: "secondary",
      title: "Стеллаж / полки",
      description: "Функциональное хранение и место для декора. Придаёт глубину стене.",
      importance: 3,
      zone: "storage",
      notes: ["Открытые полки + закрытые секции", "Высота до потолка визуально расширяет"],
      searchQuery: `${style} bookshelf shelving unit`,
      shopLinks: [
        { shop: "IKEA",    title: "Стеллаж KALLAX / BILLY", url: "https://www.ikea.com/ru/ru/cat/stellazhi-polki-49197/", similarity: 0.90 },
        { shop: "Wildberries", title: "Стеллаж для гостиной",  url: "https://www.wildberries.ru/catalog/0/search.aspx?search=стеллаж",  similarity: 0.75 },
      ],
    },
  ];
}

function makeBedroomItems(style: string, budget: string): FurnitureTemplate[] {
  const isWarm = ["scandinavian","boho","japandi","classic"].includes(style);
  const bedColor = isWarm ? "натуральное дерево / дуб" : "белый / серый / чёрный";
  return [
    {
      category: "bed",
      role: "primary",
      title: `Кровать в стиле ${STYLE_MAIN_LABELS[style] || style}`,
      description: `Главный элемент спальни. Задаёт масштаб и стиль. Цвет рамы — ${bedColor}.`,
      importance: 1,
      zone: "seating",
      notes: ["Размер 160×200 или 180×200 см", "Мягкое изголовье добавляет комфорт"],
      searchQuery: `${style} bed frame wooden bedroom`,
      shopLinks: [
        { shop: "IKEA",    title: "Кровать", url: "https://www.ikea.com/ru/ru/cat/krovati-bazy-20487/", similarity: 0.88 },
        { shop: "Ozon",    title: "Кровать деревянная", url: "https://www.ozon.ru/category/krovati/", similarity: 0.82 },
      ],
    },
    {
      category: "nightstand",
      role: "secondary",
      title: "Тумба прикроватная",
      description: "Функциональный элемент рядом с кроватью: место для лампы, книги, телефона.",
      importance: 2,
      zone: "storage",
      notes: ["Высота вровень с матрасом", "Ящик обязателен"],
      searchQuery: `${style} nightstand bedside table`,
      shopLinks: [
        { shop: "IKEA", title: "Тумба прикроватная", url: "https://www.ikea.com/ru/ru/cat/prikrovatnye-stoliki-19026/", similarity: 0.87 },
        { shop: "Wildberries", title: "Тумба для спальни", url: "https://www.wildberries.ru/catalog/0/search.aspx?search=прикроватная+тумба", similarity: 0.79 },
      ],
    },
    {
      category: "wardrobe",
      role: "secondary",
      title: "Шкаф-купе",
      description: "Хранение одежды. Встроенные модели экономят пространство.",
      importance: 1,
      zone: "storage",
      notes: ["Глубина 60 см стандарт", "Зеркальные двери — лайфхак для малых спален"],
      searchQuery: `${style} wardrobe closet bedroom`,
      shopLinks: [
        { shop: "IKEA", title: "Шкаф PAX", url: "https://www.ikea.com/ru/ru/cat/shkafy-kupy-s-razdvizhnymi-dver-10538/", similarity: 0.91 },
        { shop: "Hoff", title: "Шкаф-купе", url: "https://www.hoff.ru/catalog/shkafy_kupy/", similarity: 0.84 },
      ],
    },
    {
      category: "bedding",
      role: "accent",
      title: "Комплект постельного белья",
      description: "Задаёт тональность спальни. Натуральные материалы — хлопок, лён — предпочтительны.",
      importance: 2,
      zone: "textiles",
      notes: ["Евро-размер 200×200", "Тёплый/нейтральный тон под стиль"],
      searchQuery: `${style} bedding linen set`,
      shopLinks: [
        { shop: "IKEA", title: "Постельное бельё", url: "https://www.ikea.com/ru/ru/cat/postelnoe-bele-21841/", similarity: 0.85 },
        { shop: "Wildberries", title: "КПБ лён/хлопок", url: "https://www.wildberries.ru/catalog/dom-i-dacha/tekstil/postelnoe-bele/", similarity: 0.82 },
      ],
    },
  ];
}

function makeKitchenItems(style: string): FurnitureTemplate[] {
  return [
    {
      category: "kitchen_set",
      role: "primary",
      title: "Кухонный гарнитур",
      description: "Основа кухни. Задаёт стиль, цвет и функциональность всего пространства.",
      importance: 1,
      zone: "storage",
      notes: ["П-образная или L-образная — оптимальная эргономика", "Фасады без ручек — современный тренд"],
      searchQuery: `${style} kitchen cabinets set`,
      shopLinks: [
        { shop: "IKEA", title: "Кухня METOD", url: "https://www.ikea.com/ru/ru/cat/kuhonnye-garnitary-s-fasadami-s14001/", similarity: 0.90 },
        { shop: "Hoff", title: "Кухонный гарнитур", url: "https://www.hoff.ru/catalog/kukhni/", similarity: 0.82 },
      ],
    },
    {
      category: "bar_stool",
      role: "secondary",
      title: "Барные стулья",
      description: "Добавляют зону завтрака у острова или барной стойки.",
      importance: 3,
      zone: "seating",
      notes: ["Высота 65–75 см под барную стойку", "Минимум 2 штуки"],
      searchQuery: `${style} bar stool kitchen`,
      shopLinks: [
        { shop: "IKEA", title: "Барный стул", url: "https://www.ikea.com/ru/ru/cat/barnye-stulya-otdelnye-21520/", similarity: 0.86 },
        { shop: "Wildberries", title: "Барный стул", url: "https://www.wildberries.ru/catalog/0/search.aspx?search=барный+стул", similarity: 0.78 },
      ],
    },
    {
      category: "pendant_light",
      role: "accent",
      title: "Подвесные светильники над островом",
      description: "Функциональный и декоративный элемент. Обозначает зону острова/стойки.",
      importance: 2,
      zone: "lighting",
      notes: ["Высота 70–80 см над поверхностью", "Нечётное кол-во смотрится лучше"],
      searchQuery: `${style} pendant light kitchen island`,
      shopLinks: [
        { shop: "IKEA", title: "Подвесной светильник", url: "https://www.ikea.com/ru/ru/cat/podvesnye-svetilniki-10706/", similarity: 0.85 },
        { shop: "Ozon", title: "Люстра подвесная кухня", url: "https://www.ozon.ru/category/lyustry/", similarity: 0.78 },
      ],
    },
  ];
}

function makeGenericItems(style: string, room: string): FurnitureTemplate[] {
  return [
    {
      category: "main_furniture",
      role: "primary",
      title: `Основная мебель · ${ROOM_LABELS[room] || room}`,
      description: `Ключевой элемент пространства. Отражает стиль ${STYLE_MAIN_LABELS[style] || style}.`,
      importance: 1,
      zone: "seating",
      notes: ["Выбирай под масштаб комнаты", "Начни с одного якорного предмета"],
      searchQuery: `${style} ${room.replace("_"," ")} furniture`,
      shopLinks: [
        { shop: "IKEA", title: "Мебель для комнаты", url: "https://www.ikea.com/ru/ru/", similarity: 0.80 },
        { shop: "Hoff", title: "Мебель", url: "https://www.hoff.ru/catalog/", similarity: 0.75 },
      ],
    },
    {
      category: "lighting",
      role: "secondary",
      title: "Освещение",
      description: "Правильный свет меняет восприятие пространства. Многоуровневое освещение = комфорт.",
      importance: 2,
      zone: "lighting",
      notes: ["Основной + локальный + акцентный свет", "Тёплое белое (2700–3000K) для жилых зон"],
      searchQuery: `${style} lighting ceiling lamp`,
      shopLinks: [
        { shop: "IKEA", title: "Светильники", url: "https://www.ikea.com/ru/ru/cat/osveshchenie-10799/", similarity: 0.83 },
        { shop: "Wildberries", title: "Светильник потолочный", url: "https://www.wildberries.ru/catalog/0/search.aspx?search=светильник", similarity: 0.77 },
      ],
    },
    {
      category: "decor",
      role: "accent",
      title: "Декор и акценты",
      description: "Завершающие детали, которые отражают характер и персонализируют пространство.",
      importance: 3,
      zone: "decor",
      notes: ["Правило: нечётное количество объектов смотрится лучше", "Разные высоты создают динамику"],
      searchQuery: `${style} home decor accessories`,
      shopLinks: [
        { shop: "IKEA", title: "Декор для дома", url: "https://www.ikea.com/ru/ru/cat/dekor-01490/", similarity: 0.80 },
        { shop: "Ozon", title: "Декор интерьера", url: "https://www.ozon.ru/category/tovary-dlya-doma/", similarity: 0.75 },
      ],
    },
  ];
}

// ─── Key points per style ─────────────────────────────────────────────────────

const KEY_POINTS: Record<string, string[]> = {
  scandinavian: [
    "Светлое дерево + белые поверхности + тёплые текстиль = скандинавский уют",
    "Минимум декора, максимум воздуха в пространстве",
    "Натуральный свет — главный партнёр этого стиля",
  ],
  minimal: [
    "Каждый предмет — в пространстве, а не рядом с ним",
    "Цвет: нейтральные базы + один сдержанный акцент",
    "Качество материалов важнее количества вещей",
  ],
  modern: [
    "Функциональность прежде всего — форма следует за задачей",
    "Сочетание фактур: матовый металл + дерево + текстиль",
    "Освещение — ключевой дизайнерский инструмент",
  ],
  japandi: [
    "Ваби-саби: красота в несовершенстве натуральных материалов",
    "Дерево дуба или ясеня + льняной текстиль + растения",
    "Воздух и пустота — такие же элементы дизайна, как мебель",
  ],
  boho: [
    "Многослойность: несколько ковров, текстиль поверх текстиля",
    "Ротанг, макраме, сухоцветы — органика в деталях",
    "Тёплая насыщенная палитра с зелёными акцентами от растений",
  ],
  loft: [
    "Открытое пространство — главный герой лофта",
    "Сырость материалов: кирпич, бетон, металлические трубы",
    "Высокие потолки + большие окна усиливают эффект",
  ],
  industrial: [
    "Тёмные металлические акценты против тёплых деревянных поверхностей",
    "Открытые системы хранения — трубы, провода напоказ",
    "Строгость и функциональность = индустриальная эстетика",
  ],
  classic: [
    "Симметрия в расстановке мебели — основа классики",
    "Детали решают: ручки, молдинги, карнизы",
    "Натуральные материалы высшего качества — вложение на десятилетия",
  ],
  luxury: [
    "Мрамор, золото, бархат — люксовая триада материалов",
    "Масштаб мебели должен соответствовать масштабу пространства",
    "Один смелый арт-объект лучше десяти «богатых» безделушек",
  ],
};

// ─── Main generator function ──────────────────────────────────────────────────

export function generateBreakdown(design: Design): DesignBreakdown {
  const style = design.style ?? "modern";
  const room  = design.room  ?? "living_room";

  // Choose items based on room
  let templates: FurnitureTemplate[];
  if      (room === "living_room") templates = makeLivingRoom(style, design.budget);
  else if (room === "bedroom")     templates = makeBedroomItems(style, design.budget);
  else if (room === "kitchen")     templates = makeKitchenItems(style);
  else                             templates = makeGenericItems(style, room);

  // Convert to BreakdownItem
  const items: BreakdownItem[] = templates.map((t, i) => ({
    id:          `${design.id}-item-${i}`,
    category:    t.category,
    role:        t.role,
    title:       t.title,
    description: t.description,
    style:       STYLE_MAIN_LABELS[style] ?? style,
    palette:     design.palette ?? "neutral",
    material:    design.material ?? "mixed",
    importance:  t.importance,
    zone:        t.zone,
    notes:       t.notes,
    products:    t.shopLinks.map(l => ({
      shop:       l.shop,
      title:      l.title,
      url:        l.url,
      similarity: l.similarity,
    } satisfies ProductLink)),
  }));

  return {
    designId:  design.id,
    summary:   STYLE_SUMMARIES[style] ?? `Интерьер в стиле ${STYLE_MAIN_LABELS[style] ?? style}.`,
    difficulty: DIFFICULTY[style] ?? "medium",
    mainStyle:  STYLE_MAIN_LABELS[style] ?? style,
    keyPoints:  KEY_POINTS[style] ?? [],
    items,
  };
}
