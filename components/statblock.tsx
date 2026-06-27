"use client";

import { useState } from "react";
import { composeAttackParts } from "@/lib/adversary-attack";
import { DamageRollButton } from "@/components/damage-roll-button";
import { t, useLanguage, type LocalizedText } from "@/lib/i18n";
import { schemas } from "@/lib/creators";
import type { BrewType, SavedSegment, Trait, TrackerConfig, TrackerState } from "@/lib/types";
import { emptyTrackerState } from "@/lib/types";
import { featureTypeLabel, featureTypeOptions } from "@/lib/feature-types";
import type { ResourceLanguage } from "@/lib/resource-types";

const texts = {
  attack: { es: "Ataque estándar", pt: "Ataque padrão" },
  clear: { es: "Limpiar", pt: "Limpar" },
  reverse: { es: "Invertir", pt: "Reverter" },
  countdown: { es: "Cuenta atrás", pt: "Contagem" },
  tokens: { es: "Fichas", pt: "Fichas" },
} satisfies Record<string, LocalizedText>;

/** Renders **bold** markdown inline; leaves the rest as plain text. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

const MAX_PIPS = 30;

/** A clickable row of HP/Stress pips. Click a pip to fill up to it. */
export function Pips({
  count,
  marked,
  color,
  reverse,
  onChange,
}: {
  count: number;
  marked: number;
  color: string;
  reverse: boolean;
  onChange: (n: number) => void;
}) {
  const pips = Array.from({ length: Math.min(count, MAX_PIPS) });
  return (
    <div className="flex flex-wrap gap-1">
      {pips.map((_, i) => {
        // Normal: fill left→right. Reverse: fill right→left.
        const position = reverse ? count - i : i + 1;
        const filled = reverse ? position <= marked : i < marked;
        return (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}`}
            aria-pressed={filled}
            onClick={() => onChange(filled && (reverse ? position : i + 1) === marked ? marked - 1 : reverse ? position : i + 1)}
            className="h-4 w-4 rounded-full border-2 transition-colors"
            style={{
              borderColor: color,
              background: filled ? color : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-semibold text-iron">{label}:</span>
      <div className="flex items-center overflow-hidden rounded-md border border-iron-soft/40">
        <button
          type="button"
          aria-label="−"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="px-2 py-0.5 text-iron transition-colors hover:bg-iron/10"
        >
          −
        </button>
        <span className="min-w-6 px-1 text-center text-sm font-bold text-iron">{value}</span>
        <button
          type="button"
          aria-label="+"
          onClick={() => onChange(value + 1)}
          className="px-2 py-0.5 text-iron transition-colors hover:bg-iron/10"
        >
          +
        </button>
      </div>
    </div>
  );
}

export interface StatblockProps {
  brewType: BrewType;
  data: Record<string, string>;
  traits: Trait[];
  segments: SavedSegment[];
  trackers: TrackerConfig;
  /** Controlled tracker state; if omitted, the card manages its own. */
  state?: TrackerState;
  onStateChange?: (next: TrackerState) => void;
  /** Show the empty-state hint when nothing has been entered yet. */
  emptyHint?: string;
  /** Colossus: skip the inline segment list (rendered as SegmentCards elsewhere). */
  hideSegments?: boolean;
  /** On the table, render damage values as dice-roll buttons. */
  rollableDamage?: boolean;
  /** Language of authored content, independent from the UI language. */
  contentLanguage?: ResourceLanguage;
}

export function Statblock({
  brewType,
  data,
  traits,
  segments,
  trackers,
  state,
  onStateChange,
  emptyHint,
  hideSegments,
  rollableDamage,
  contentLanguage,
}: StatblockProps) {
  const { language } = useLanguage();
  const schema = schemas.find((s) => s.id === brewType);
  const [internal, setInternal] = useState<TrackerState>(emptyTrackerState);
  const tracker = state ?? internal;
  const setTracker = (next: TrackerState) =>
    onStateChange ? onStateChange(next) : setInternal(next);
  const patch = (p: Partial<TrackerState>) => setTracker({ ...tracker, ...p });

  if (!schema) return null;

  const field = (key: string) => schema.fields.find((f) => f.key === key);
  const fieldsWith = (block: string) =>
    schema.fields.filter((f) => f.block === block && data[f.key]);
  const displayValue = (key: string) => {
    const config = field(key);
    if (!config) return data[key] ?? "";
    const option = config.options?.find((item) => item.value === data[key]);
    return option ? t(option.label, language) : data[key];
  };
  const translateAttackValue = (key: "attackRange" | "attackType", value: string) => {
    const config = field(key);
    const option = config?.options?.find((item) => item.value === value);
    return option ? t(option.label, language) : value;
  };
  // Renders a stat value. A weapon's damage is shown as a rollable token
  // followed by its type (e.g. "1d8+2 Físico"); damageType has no block.
  const isEquipmentDamage = (key: string) => brewType === "equipment" && key === "damage";
  const statDisplay = (key: string) => {
    if (isEquipmentDamage(key)) {
      const type = displayValue("damageType");
      return (
        <>
          <DamageRollButton value={displayValue("damage")} rollable={rollableDamage} />
          {type && ` ${type}`}
        </>
      );
    }
    return displayValue(key);
  };

  const subtitle = fieldsWith("subtitle")
    .map((f) => (f.key === "tier" ? `${t(f.label, language)} ${data[f.key]}` : displayValue(f.key)))
    .join(" · ");
  const flavorFields = fieldsWith("flavor");
  const statFields = fieldsWith("stat");
  const attackParts =
    brewType === "adversary" ? composeAttackParts(data, translateAttackValue) : [];
  const noteFields = fieldsWith("note");
  const realTraits = traits.filter((tr) => tr.name || tr.description);
  const displayFeatureType = (type: string) => {
    if (contentLanguage) return featureTypeLabel(type, contentLanguage);
    const option = featureTypeOptions.find((item) => item.value === type);
    return option ? t(option.label, language) : type;
  };

  const isEmpty =
    !Object.values(data).some(Boolean) && realTraits.length === 0 && segments.length === 0;

  const hp = parseInt(data.hp ?? "", 10);
  const stress = parseInt(data.stress ?? "", 10);
  const showHp = trackers.health && hp > 0;
  const showStress = trackers.health && stress > 0;
  const anyTracker = showHp || showStress || trackers.countdown || trackers.token;

  if (isEmpty && emptyHint) {
    return (
      <div className="rounded-lg border border-iron-soft/30 bg-parchment p-6 text-center text-sm text-iron-soft italic">
        {emptyHint}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-parchment font-body text-iron shadow-xl shadow-black/40">
      <div className="p-4">
        {/* ── Header ── */}
        <h3 className="font-display text-2xl font-bold tracking-tight text-iron uppercase">
          {data.name || "…"}
        </h3>
        {subtitle && <p className="mt-0.5 text-sm font-bold text-iron">{subtitle}</p>}

        {flavorFields.map((f) =>
          f.key === "description" ? (
            <p key={f.key} className="mt-1.5 text-[15px] leading-snug text-iron italic">
              {data[f.key]}
            </p>
          ) : (
              <p key={f.key} className="mt-1 text-[15px] leading-snug text-iron">
              <strong>{t(f.label, language)}:</strong> {displayValue(f.key)}
              </p>
          ),
        )}

        {/* ── Stat box ── */}
        {(statFields.length > 0 || attackParts.length > 0) && (
          <div className="mt-3 border-y-2 border-iron/80 py-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[15px] leading-snug">
              {statFields.map((f, i) => (
                <span key={f.key} className="flex items-center gap-2">
                  {i > 0 && <span className="text-iron-soft/50">|</span>}
                  <span>
                    <strong>{t(f.label, language)}:</strong> {statDisplay(f.key)}
                  </span>
                </span>
              ))}
              {attackParts.length > 0 && (
                <span className="flex items-center gap-2">
                  {statFields.length > 0 && <span className="text-iron-soft/50">|</span>}
                  <span>
                    <strong>{t(texts.attack, language)}:</strong>{" "}
                    {attackParts.map((part, i) => (
                      <span key={i}>
                        {i > 0 && " · "}
                        {part.damage ? (
                          <DamageRollButton value={part.text} rollable={rollableDamage} />
                        ) : (
                          part.text
                        )}
                      </span>
                    ))}
                  </span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Note box (experience) ── */}
        {noteFields.length > 0 && (
          <div className="border-b-2 border-dashed border-iron/40 pb-1.5">
            {noteFields.map((f) => (
              <p key={f.key} className="py-1 text-[15px] leading-snug">
                <strong>{t(f.label, language)}:</strong> {displayValue(f.key)}
              </p>
            ))}
          </div>
        )}

        {/* ── Features ── */}
        {realTraits.length > 0 && (
          <div className="mt-3">
            <h4 className="mb-1 font-display text-xl font-bold text-iron">Features</h4>
            {realTraits.map((tr, i) => (
              <p key={i} className="mb-2 text-[15px] leading-snug">
                {tr.name && (
                  <em className="font-bold not-italic">
                    <span className="italic">
                      {tr.name}
                      {tr.type && ` - ${displayFeatureType(tr.type)}`}
                    </span>{" "}
                  </em>
                )}
                {tr.name && tr.description && <span>: </span>}
                <Inline text={tr.description} />
              </p>
            ))}
          </div>
        )}

        {/* ── Segments (colossus) — rich cards render via SegmentCard ── */}
        {!hideSegments && segments.length > 0 && (
          <div className="mt-2 border-t border-iron/30 pt-2">
            {segments.map((s, i) => (
              <p key={i} className="text-[15px]">
                <strong>{s.name || `Segment ${i + 1}`}</strong>
                {s.hp && ` · HP ${s.hp}`}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── Trackers ── */}
      {anyTracker && (
        <div className="border-t-2 border-iron/20 px-4 py-3">
          {trackers.health && (
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-sm font-bold text-iron">{data.name}</span>
              <label className="flex cursor-pointer items-center gap-1.5 text-[13px] text-iron">
                {t(texts.reverse, language)}
                <input
                  type="checkbox"
                  checked={tracker.reverse}
                  onChange={(e) => patch({ reverse: e.target.checked })}
                  className="h-3.5 w-3.5 accent-pip-stress"
                />
              </label>
            </div>
          )}
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {showHp && (
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[13px] font-bold text-iron">{t(field("hp")!.label, language)}</span>
                  <button
                    type="button"
                    onClick={() => patch({ markedHp: 0 })}
                    className="rounded bg-iron/10 px-1.5 text-[11px] text-iron transition-colors hover:bg-iron/20"
                  >
                    {t(texts.clear, language)}
                  </button>
                </div>
                <Pips
                  count={hp}
                  marked={tracker.markedHp}
                  color="var(--color-pip-hp)"
                  reverse={tracker.reverse}
                  onChange={(n) => patch({ markedHp: n })}
                />
              </div>
            )}
            {showStress && (
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[13px] font-bold text-iron">{t(field("stress")!.label, language)}</span>
                  <button
                    type="button"
                    onClick={() => patch({ markedStress: 0 })}
                    className="rounded bg-iron/10 px-1.5 text-[11px] text-iron transition-colors hover:bg-iron/20"
                  >
                    {t(texts.clear, language)}
                  </button>
                </div>
                <Pips
                  count={stress}
                  marked={tracker.markedStress}
                  color="var(--color-pip-stress)"
                  reverse={tracker.reverse}
                  onChange={(n) => patch({ markedStress: n })}
                />
              </div>
            )}
          </div>
          {(trackers.countdown || trackers.token) && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              {trackers.countdown && (
                <Counter
                  label={t(texts.countdown, language)}
                  value={tracker.countdown}
                  onChange={(n) => patch({ countdown: n })}
                />
              )}
              {trackers.token && (
                <Counter
                  label={t(texts.tokens, language)}
                  value={tracker.tokens}
                  onChange={(n) => patch({ tokens: n })}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
