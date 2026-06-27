"use client";

import { t, useLanguage, type LocalizedText } from "@/lib/i18n";
import { attackRangeOptions, attackTypeOptions } from "@/lib/adversary-attack";
import {
  composeSegmentAttackParts,
  segmentCount,
  segmentInstanceNames,
} from "@/lib/colossus";
import { featureTypeOptions } from "@/lib/feature-types";
import type { SavedSegment } from "@/lib/types";
import { Pips } from "@/components/statblock";
import { DamageRollButton } from "@/components/damage-roll-button";

const texts = {
  adjacent: { es: "Segmentos adyacentes", pt: "Segmentos adjacentes" },
  difficulty: { es: "Dificultad", pt: "Dificuldade" },
  hp: { es: "PG", pt: "PV" },
  each: { es: "c/u", pt: "cada" },
  attack: { es: "Ataque estándar", pt: "Ataque padrão" },
} satisfies Record<string, LocalizedText>;

function optionLabel(
  options: { value: string; label: LocalizedText }[],
  value: string,
  language: "es" | "pt",
) {
  const option = options.find((o) => o.value === value);
  return option ? t(option.label, language) : value;
}

/**
 * One colossus segment, rendered as a parchment card. Static in the creator
 * preview; interactive on the table when `marked`/`onMark` are provided
 * (a clickable HP track per copy).
 */
export function SegmentCard({
  segment,
  segments,
  marked,
  onMark,
  rollableDamage,
}: {
  segment: SavedSegment;
  segments: SavedSegment[];
  marked?: number[];
  onMark?: (copyIndex: number, n: number) => void;
  /** On the table, render the attack damage as a dice-roll button. */
  rollableDamage?: boolean;
}) {
  const { language } = useLanguage();
  const count = segmentCount(segment);
  const heading = (count > 1 && segment.pluralName ? segment.pluralName : segment.name) || "—";

  const adjacentNames = (segment.adjacentSegments ?? [])
    .map((name) => {
      const target = segments.find((s) => s.name === name);
      return target && segmentCount(target) > 1 && target.pluralName
        ? target.pluralName
        : name;
    })
    .filter(Boolean);

  const attackParts = composeSegmentAttackParts(segment.attack, (key, value) =>
    key === "attackRange"
      ? optionLabel(attackRangeOptions, value, language)
      : optionLabel(attackTypeOptions, value, language),
  );

  const features = (segment.features ?? []).filter((f) => f.name || f.description);
  const hp = parseInt(segment.hp ?? "", 10);
  const instances = segmentInstanceNames(segment);
  // HP pips always show (one row per copy); clickable only when on the table.
  const interactive = onMark != null;

  return (
    <div className="w-72 shrink-0 overflow-hidden rounded-lg bg-parchment font-body text-iron shadow-xl shadow-black/40">
      <div className="p-4">
        <h3 className="font-display text-xl font-bold tracking-tight text-iron uppercase">
          {heading}
          {count > 1 && <span className="text-iron-soft"> ({count})</span>}
        </h3>

        {adjacentNames.length > 0 && (
          <p className="mt-0.5 text-[13px] text-iron">
            <strong>{t(texts.adjacent, language)}:</strong> {adjacentNames.join(", ")}
          </p>
        )}

        {(segment.difficulty || segment.hp || attackParts.length > 0) && (
          <div className="mt-2 border-y-2 border-iron/80 py-1.5 text-[15px] leading-snug">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {segment.difficulty && (
                <span>
                  <strong>{t(texts.difficulty, language)}:</strong> {segment.difficulty}
                </span>
              )}
              {segment.hp && (
                <span className="flex items-center gap-2">
                  {segment.difficulty && <span className="text-iron-soft/50">|</span>}
                  <span>
                    <strong>{t(texts.hp, language)}:</strong> {segment.hp}
                    {count > 1 && ` (${t(texts.each, language)})`}
                  </span>
                </span>
              )}
            </div>
            {attackParts.length > 0 && (
              <div className="mt-0.5">
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
              </div>
            )}
          </div>
        )}

        {features.length > 0 && (
          <div className="mt-2">
            {features.map((f, i) => (
              <p key={i} className="mb-1.5 text-[14px] leading-snug">
                {f.name && (
                  <strong className="font-bold italic">
                    {f.name}
                    {f.type && ` - ${optionLabel(featureTypeOptions, f.type, language)}`}
                  </strong>
                )}
                {f.name && f.description && <span> : </span>}
                <span>{f.description}</span>
              </p>
            ))}
          </div>
        )}

        {hp > 0 && (
          <div
            className={`mt-3 border-t border-iron/30 pt-2 ${interactive ? "" : "pointer-events-none"}`}
          >
            {instances.map((label, copyIndex) => (
              <div key={copyIndex} className="mb-1.5 flex items-center gap-2">
                {count > 1 && (
                  <span className="min-w-16 text-[12px] font-bold text-iron">{label}</span>
                )}
                <Pips
                  count={hp}
                  marked={marked?.[copyIndex] ?? 0}
                  color="var(--color-pip-hp)"
                  reverse={false}
                  onChange={(n) => onMark?.(copyIndex, n)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
