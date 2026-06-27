import type { LocalizedText } from "@/lib/i18n";

export const CANVAS_GRID_SIZE = 28;

/**
 * Broadcast when the range ruler is toggled, so floating controls living
 * outside the canvas tree (e.g. the global dice button) can lift clear of the
 * ruler legend. `detail` is the active flag.
 */
export const RULER_ACTIVE_EVENT = "dagacorazon:ruler-active";

export type CanvasPoint = { x: number; y: number };

export interface CanvasRangeMeasurement {
  start: CanvasPoint;
  end: CanvasPoint;
}

export interface DaggerheartRangeBand {
  id: "melee" | "very-close" | "close" | "far" | "very-far";
  label: LocalizedText;
  minSquares: number;
  maxSquares: number;
  color: string;
  distanceLabel: LocalizedText;
}

export const DAGGERHEART_RANGE_BANDS: DaggerheartRangeBand[] = [
  {
    id: "melee",
    label: { es: "Cuerpo a cuerpo", pt: "Corpo a corpo" },
    minSquares: 0,
    maxSquares: 1,
    color: "#ef4444",
    distanceLabel: { es: "1 cuadro", pt: "1 quadrado" },
  },
  {
    id: "very-close",
    label: { es: "Muy cerca", pt: "Muito perto" },
    minSquares: 1,
    maxSquares: 3,
    color: "#f97316",
    distanceLabel: { es: "3 cuadros", pt: "3 quadrados" },
  },
  {
    id: "close",
    label: { es: "Cerca", pt: "Perto" },
    minSquares: 3,
    maxSquares: 6,
    color: "#eab308",
    distanceLabel: { es: "6 cuadros", pt: "6 quadrados" },
  },
  {
    id: "far",
    label: { es: "Lejos", pt: "Longe" },
    minSquares: 6,
    maxSquares: 12,
    color: "#38bdf8",
    distanceLabel: { es: "12 cuadros", pt: "12 quadrados" },
  },
  {
    id: "very-far",
    label: { es: "Muy lejos", pt: "Muito longe" },
    minSquares: 12,
    maxSquares: Number.POSITIVE_INFINITY,
    color: "#a78bfa",
    distanceLabel: { es: "13+ cuadros", pt: "13+ quadrados" },
  },
];

export function canvasDistanceInSquares(
  measurement: CanvasRangeMeasurement,
): number {
  return (
    Math.hypot(
      measurement.end.x - measurement.start.x,
      measurement.end.y - measurement.start.y,
    ) / CANVAS_GRID_SIZE
  );
}

export function daggerheartRangeForSquares(
  squares: number,
): DaggerheartRangeBand {
  return (
    DAGGERHEART_RANGE_BANDS.find((band) => squares <= band.maxSquares) ??
    DAGGERHEART_RANGE_BANDS[DAGGERHEART_RANGE_BANDS.length - 1]
  );
}
