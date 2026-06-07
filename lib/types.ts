export type Style =
  | "minimal"
  | "modern"
  | "scandinavian"
  | "japandi"
  | "boho"
  | "loft"
  | "industrial"
  | "classic"
  | "luxury";

export type Room =
  | "living_room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "office"
  | "studio"
  | "balcony"
  | "dining_room"
  | "hallway";

export type Palette = "warm" | "cool" | "neutral" | "bright" | "pastel";

export type Budget = "low" | "medium" | "high";

export type Lighting = "soft" | "daylight" | "ambient" | "dramatic";

export type Material = "wood" | "stone" | "metal" | "textile" | "mixed";

export type Orientation = "horizontal" | "vertical";

export type Theme = "cozy" | "elegant" | "rustic" | "artistic" | "industrial";

export type Design = {
  id: string;
  src: string;
  title: string;
  description: string;
  style: Style;
  room: Room;
  palette: Palette;
  budget: Budget;
  lighting: Lighting;
  material: Material;
  orientation: Orientation;
  dominantColor: string;
  hasWindow: boolean;
  hasPlants: boolean;
  floorType: "wood" | "tile" | "cement" | "rug";
  theme: Theme;
  qualityScore: number;
};

export type FilterState = {
  style?: Style;
  room?: Room;
  palette?: Palette;
  budget?: Budget;
  lighting?: Lighting;
  material?: Material;
  orientation?: Orientation;
  theme?: Theme;
  qualityMin?: number;
};

export type ProductLink = {
  shop: string;
  title: string;
  url: string;
  priceApprox?: number;
  currency?: string;
  similarity: number; // 0–1
  note?: string;
};

export type BreakdownItem = {
  id: string;
  category: string;
  role: "primary" | "secondary" | "accent";
  title: string;
  description: string;
  style: string;
  palette: string;
  material: string;
  importance: 1 | 2 | 3;
  zone: "seating" | "textiles" | "lighting" | "storage" | "decor";
  notes?: string[];
  products: ProductLink[];
};

export type DesignBreakdown = {
  designId: string;
  summary: string;
  difficulty: "easy" | "medium" | "hard";
  mainStyle: string;
  keyPoints: string[];
  items: BreakdownItem[];
};

// ─── Room Scan (новая функциональность) ────────────────────────────────────

export type RoomScanParams = {
  roomType: Room;
  budget: Budget;
  stylePreference?: Style;
  roomSizeM2?: number;
  notes?: string;
};

export type FurniturePiece = {
  id: string;
  category: string;           // "Диван", "Журнальный стол", "Торшер"
  reason: string;             // Почему рекомендуется
  searchQuery: string;        // Запрос для поиска на маркетплейсе
  searchQueryEn: string;      // English query for international shops
  priceMin: number;
  priceMax: number;
  currency: string;
  style: string;
  color?: string;
  material?: string;
  priority: "essential" | "recommended" | "optional";
};

export type RoomScanResult = {
  id: string;
  createdAt: string;
  imagePreview?: string;      // base64 preview (small)
  params: RoomScanParams;
  detectedStyle: string;
  detectedColors: string[];
  detectedElements: string[]; // что уже есть в комнате
  roomCondition: "needs_renovation" | "fresh_renovation" | "good_condition" | "excellent";
  summary: string;
  furnitureList: FurniturePiece[];
};

export type ShoppingProduct = {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  shop: string;
  rating?: number;
  reviews?: number;
};
