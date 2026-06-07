import { Design, FilterState } from "@/lib/types";

export function applyFilters(
  designs: Design[],
  filters: FilterState
): Design[] {
  const {
    style,
    room,
    palette,
    budget,
    lighting,
    material,
    orientation,
    theme,
    qualityMin,
  } = filters;

  // Strict match — фильтры точные, без расширенного fallback
  const result = designs.filter((d) => {
    if (style       && d.style       !== style)       return false;
    if (room        && d.room        !== room)        return false;
    if (palette     && d.palette     !== palette)     return false;
    if (budget      && d.budget      !== budget)      return false;
    if (lighting    && d.lighting    !== lighting)    return false;
    if (material    && d.material    !== material)    return false;
    if (orientation && d.orientation !== orientation) return false;
    if (theme       && d.theme       !== theme)       return false;
    if (qualityMin  && d.qualityScore < qualityMin)   return false;
    return true;
  });

  // Sort by quality descending
  return result.sort((a, b) => b.qualityScore - a.qualityScore);
}
