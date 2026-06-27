"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { t, useLanguage, type LocalizedText } from "@/lib/i18n";
import type { StatblockSnapshot, TrackerState } from "@/lib/types";
import { emptyTrackerState } from "@/lib/types";
import { Statblock } from "@/components/statblock";
import { SegmentCard } from "@/components/segment-card";
import { TrashIcon, ChevronIcon } from "@/components/icons";

const texts = {
  segments: { es: "segmentos", pt: "segmentos" },
} satisfies Record<string, LocalizedText>;

/**
 * A colossus on the table as one expandable object: the main statblock plus a
 * horizontal strip of segment cards, each with a per-copy HP track. Collapsing
 * hides the strip. The dark bar is the drag handle.
 */
export function ColossusSuperCard({
  snapshot,
  name,
  collapsed,
  state,
  onStateChange,
  onToggleCollapse,
  onRemove,
  onHeaderPointerDown,
}: {
  snapshot: StatblockSnapshot;
  name: string;
  collapsed: boolean;
  state: TrackerState;
  onStateChange: (next: TrackerState) => void;
  onToggleCollapse: () => void;
  onRemove: () => void;
  onHeaderPointerDown: (e: ReactPointerEvent) => void;
}) {
  const { language } = useLanguage();
  const segments = snapshot.segments ?? [];

  const setSegmentHp = (segIndex: number, copyIndex: number, value: number) => {
    const next = (state.segments ?? []).map((arr) => [...arr]);
    while (next.length <= segIndex) next.push([]);
    next[segIndex][copyIndex] = value;
    onStateChange({ ...state, segments: next });
  };

  const stop = (e: ReactPointerEvent) => e.stopPropagation();

  return (
    <div className="flex items-start gap-3 rounded-xl border-2 border-gold/45 bg-gold/[0.06] p-3 shadow-2xl shadow-black/40 backdrop-blur-sm">
      {/* Main column */}
      <div className="w-[340px] shrink-0 overflow-hidden rounded-lg shadow-2xl shadow-black/50">
        <div
          onPointerDown={onHeaderPointerDown}
          className="flex cursor-move items-center gap-2 bg-abyss/90 px-3 py-1.5"
        >
          <button
            type="button"
            onPointerDown={stop}
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={`${segments.length} ${t(texts.segments, language)}`}
            className="flex items-center gap-1 text-haze hover:text-gold"
          >
            <ChevronIcon open={!collapsed} size={14} />
            {segments.length > 0 && (
              <span className="font-mono text-[11px]">{segments.length}</span>
            )}
          </button>
          <span className="flex-1 truncate font-display text-xs font-semibold text-gold">
            {name}
          </span>
          <button
            type="button"
            aria-label="✕"
            onPointerDown={stop}
            onClick={onRemove}
            className="rounded p-0.5 text-haze hover:text-blood-bright"
          >
            <TrashIcon />
          </button>
        </div>
        <Statblock
          brewType={snapshot.brewType}
          data={snapshot.data}
          traits={snapshot.traits}
          segments={segments}
          trackers={snapshot.trackers}
          contentLanguage={snapshot.language}
          state={state ?? emptyTrackerState()}
          onStateChange={onStateChange}
          hideSegments
          rollableDamage
        />
      </div>

      {/* Segment strip */}
      {!collapsed &&
        segments.map((seg, i) => (
          <SegmentCard
            key={i}
            segment={seg}
            segments={segments}
            marked={state.segments?.[i] ?? []}
            onMark={(copyIndex, value) => setSegmentHp(i, copyIndex, value)}
            rollableDamage
          />
        ))}
    </div>
  );
}
