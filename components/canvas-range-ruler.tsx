"use client";

import {
  GiBoltSpellCast,
  GiBroadDagger,
  GiEnergyArrow,
  GiPocketBow,
  GiSpears,
} from "react-icons/gi";
import {
  DAGGERHEART_RANGE_BANDS,
  canvasDistanceInSquares,
  daggerheartRangeForSquares,
  type CanvasRangeMeasurement,
} from "@/lib/canvas-range";
import { t, useLanguage } from "@/lib/i18n";

const texts = {
  title: { es: "Regla de alcance", pt: "Régua de alcance" },
  instruction: {
    es: "Arrastra sobre el lienzo para medir.",
    pt: "Arraste sobre a tela para medir.",
  },
  clear: { es: "Limpiar", pt: "Limpar" },
  close: { es: "Cerrar regla", pt: "Fechar régua" },
  squares: { es: "cuadros", pt: "quadrados" },
};

const rangeIcons = {
  melee: GiBroadDagger,
  "very-close": GiSpears,
  close: GiBoltSpellCast,
  far: GiPocketBow,
  "very-far": GiEnergyArrow,
} satisfies Record<
  (typeof DAGGERHEART_RANGE_BANDS)[number]["id"],
  typeof GiBroadDagger
>;

interface CanvasRangeRulerProps {
  measurement: CanvasRangeMeasurement | null;
  view: { x: number; y: number; scale: number };
  onClear: () => void;
  /** Deactivate the ruler entirely (close the legend). */
  onClose: () => void;
}

export function CanvasRangeRuler({
  measurement,
  view,
  onClear,
  onClose,
}: CanvasRangeRulerProps) {
  const { language } = useLanguage();
  const squares = measurement ? canvasDistanceInSquares(measurement) : 0;
  const currentRange = daggerheartRangeForSquares(squares);
  const formatter = new Intl.NumberFormat(
    language === "pt" ? "pt-BR" : "es-MX",
    { maximumFractionDigits: 1 },
  );

  const start = measurement
    ? {
        x: measurement.start.x * view.scale + view.x,
        y: measurement.start.y * view.scale + view.y,
      }
    : null;
  const end = measurement
    ? {
        x: measurement.end.x * view.scale + view.x,
        y: measurement.end.y * view.scale + view.y,
      }
    : null;

  const segments =
    measurement && start && end && squares > 0
      ? DAGGERHEART_RANGE_BANDS.flatMap((band) => {
          if (squares <= band.minSquares) return [];
          const fromRatio = band.minSquares / squares;
          const toRatio = Math.min(squares, band.maxSquares) / squares;
          return [
            {
              id: band.id,
              color: band.color,
              x1: start.x + (end.x - start.x) * fromRatio,
              y1: start.y + (end.y - start.y) * fromRatio,
              x2: start.x + (end.x - start.x) * toRatio,
              y2: start.y + (end.y - start.y) * toRatio,
            },
          ];
        })
      : [];

  const tickCount = Math.min(100, Math.floor(squares));
  const ticks =
    measurement && start && end && squares > 0
      ? Array.from({ length: tickCount }, (_, index) => {
          const ratio = (index + 1) / squares;
          const x = start.x + (end.x - start.x) * ratio;
          const y = start.y + (end.y - start.y) * ratio;
          const length = Math.hypot(end.x - start.x, end.y - start.y);
          const normalX = length > 0 ? -(end.y - start.y) / length : 0;
          const normalY = length > 0 ? (end.x - start.x) / length : 0;
          return {
            x1: x - normalX * 4,
            y1: y - normalY * 4,
            x2: x + normalX * 4,
            y2: y + normalY * 4,
          };
        })
      : [];

  return (
    <>
      {measurement && start && end && (
        <>
          <svg
            className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
            aria-hidden
          >
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="rgba(0, 0, 0, 0.8)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {segments.map((segment) => (
              <line
                key={segment.id}
                x1={segment.x1}
                y1={segment.y1}
                x2={segment.x2}
                y2={segment.y2}
                stroke={segment.color}
                strokeWidth="5"
                strokeLinecap="round"
              />
            ))}
            {ticks.map((tick, index) => (
              <line
                key={index}
                {...tick}
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="1.5"
              />
            ))}
            <circle
              cx={start.x}
              cy={start.y}
              r="6"
              fill="#111827"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle
              cx={end.x}
              cy={end.y}
              r="7"
              fill={currentRange.color}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </svg>
          <div
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-lg border bg-abyss/95 px-3 py-2 text-center shadow-xl shadow-black/50"
            style={{
              left: end.x,
              top: end.y,
              borderColor: currentRange.color,
            }}
          >
            <strong
              className="block font-display text-xs tracking-wide uppercase"
              style={{ color: currentRange.color }}
            >
              {t(currentRange.label, language)}
            </strong>
            <span className="text-xs text-bone">
              {formatter.format(squares)} {t(texts.squares, language)}
            </span>
          </div>
        </>
      )}

      <aside
        aria-label={t(texts.title, language)}
        className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-40 max-w-[calc(100%-1.5rem)] -translate-x-1/2 overflow-x-auto rounded-2xl shadow-2xl shadow-black/70"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="min-w-[600px] overflow-hidden rounded-2xl border-2 border-gold-dim/80 bg-[linear-gradient(180deg,rgba(38,24,69,0.98),rgba(12,10,24,0.98))] ring-1 ring-black/80 backdrop-blur sm:min-w-[880px]">
          <div className="flex items-center justify-between gap-4 border-b border-gold-dim/35 bg-black/25 px-4 py-1.5">
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-[11px] font-bold tracking-[0.16em] text-gold uppercase">
                {t(texts.title, language)}
              </h2>
              <p className="text-[10px] text-haze max-sm:hidden">
                {t(texts.instruction, language)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {measurement && (
                <button
                  type="button"
                  onClick={onClear}
                  className="rounded-md border border-edge bg-black/20 px-2.5 py-1 text-[10px] text-mist transition-colors hover:border-gold-dim hover:text-bone focus-visible:outline-2 focus-visible:outline-gold"
                >
                  {t(texts.clear, language)}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label={t(texts.close, language)}
                title={t(texts.close, language)}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-edge bg-black/20 text-sm leading-none text-mist transition-colors hover:border-blood-bright hover:text-blood-bright focus-visible:outline-2 focus-visible:outline-gold"
              >
                ✕
              </button>
            </div>
          </div>
          <ol className="flex divide-x divide-gold-dim/35">
            {DAGGERHEART_RANGE_BANDS.map((band, index) => {
              const Icon = rangeIcons[band.id];
              const isCurrent =
                measurement !== null && currentRange.id === band.id;

              return (
                <li
                  key={band.id}
                  className="relative flex min-w-0 items-center justify-center gap-2 px-2.5 py-2 transition-[background-color,box-shadow,transform] sm:gap-2.5 sm:px-3 sm:py-3"
                  style={{
                    color: band.color,
                    flexGrow: 1,
                    flexBasis: 0,
                    backgroundColor: isCurrent ? `${band.color}22` : undefined,
                    boxShadow: isCurrent
                      ? `inset 0 0 0 2px ${band.color}, inset 0 -18px 30px ${band.color}18`
                      : undefined,
                  }}
                >
                  <Icon
                    aria-hidden
                    className={`shrink-0 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${
                      isCurrent ? "scale-110" : ""
                    }`}
                    size={index >= 3 ? 28 : 25}
                  />
                  <span className="min-w-0">
                    <strong className="block whitespace-nowrap font-display text-[11px] font-bold tracking-wide uppercase">
                      {t(band.label, language)}
                    </strong>
                    <span className="mt-0.5 block text-[10px] font-semibold text-bone/85">
                      {t(band.distanceLabel, language)}
                    </span>
                  </span>
                  {isCurrent && (
                    <span
                      className="absolute right-2 bottom-1 left-2 h-0.5 rounded-full"
                      style={{ backgroundColor: band.color }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </aside>
    </>
  );
}
