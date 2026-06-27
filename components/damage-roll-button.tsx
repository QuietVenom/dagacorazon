"use client";

import { isValidDamage, normalizeDamage, requestDamageRoll } from "@/lib/dice";

/**
 * A damage value. On the table (`rollable`), it's a button that rolls the
 * expression in the floating dice roller; elsewhere it's plain text.
 */
export function DamageRollButton({ value, rollable }: { value: string; rollable?: boolean }) {
  const normalized = normalizeDamage(value);
  if (!rollable || normalized === "" || !isValidDamage(normalized)) {
    return <>{value}</>;
  }
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        requestDamageRoll(normalized);
      }}
      title={normalized}
      className="rounded bg-iron/15 px-1 font-bold text-iron underline decoration-dotted underline-offset-2 transition-colors hover:bg-iron/25 hover:text-abyss"
    >
      {normalized}
    </button>
  );
}
