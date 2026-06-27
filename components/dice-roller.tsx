"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { t, ui, useLanguage, type LocalizedText } from "@/lib/i18n";
import {
  DAMAGE_ROLL_EVENT,
  DIE_SIDES,
  normalizeDamage,
  parseDamageExpression,
  rollDamage,
} from "@/lib/dice";
import { RULER_ACTIVE_EVENT } from "@/lib/canvas-range";
import { DiceIcon } from "@/components/icons";
import {
  DicePhysicsOverlay,
  type VisualDie,
  type VisualDieTone,
} from "@/components/dice-physics-overlay";

const texts = {
  damage: { es: "Daño", pt: "Dano" },
  roll: { es: "Tirar", pt: "Rolar" },
  clear: { es: "Limpiar", pt: "Limpar" },
  modifier: { es: "Mod", pt: "Mod" },
  emptyPool: {
    es: "Toca los dados para armar tu tirada",
    pt: "Toque os dados para montar sua rolagem",
  },
  removeOne: { es: "Quitar uno", pt: "Remover um" },
} satisfies Record<string, LocalizedText>;

type RollResult =
  | { kind: "pool"; expr: string; rolls: number[]; modifier: number; total: number }
  | { kind: "duality"; hope: number; fear: number }
  | { kind: "damage"; expr: string; rolls: number[]; modifier: number; total: number };

/**
 * Describes an in-flight throw so the settled physical values can be turned
 * into a result. `extras` holds RNG-rolled dice for counts above the visual
 * cap, which are summed in alongside the physical dice.
 */
type PendingRoll =
  | { kind: "pool"; expr: string; modifier: number; extras: number[] }
  | { kind: "duality" }
  | { kind: "damage"; expr: string; modifier: number; extras: number[] };

/** Map of die size → how many of that die are in the pool. */
type DicePool = Partial<Record<number, number>>;

const d = (sides: number) => Math.floor(Math.random() * sides) + 1;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const MAX_VISUAL_DICE = 12;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const activeSides = (pool: DicePool) => DIE_SIDES.filter((s) => (pool[s] ?? 0) > 0);
const poolTotalDice = (pool: DicePool) =>
  DIE_SIDES.reduce((n, s) => n + (pool[s] ?? 0), 0);

/** Flatten the pool into one entry per die, in size order. */
function poolToSides(pool: DicePool): number[] {
  const sidesList: number[] = [];
  for (const s of DIE_SIDES) {
    for (let i = 0; i < (pool[s] ?? 0); i += 1) sidesList.push(s);
  }
  return sidesList;
}

/** A readable expression such as "3d4 + 2d6 + 1d10 + 8". */
function poolExpression(pool: DicePool, modifier: number): string {
  let expr = activeSides(pool)
    .map((s) => `${pool[s]}d${s}`)
    .join(" + ");
  if (modifier > 0) expr += ` + ${modifier}`;
  else if (modifier < 0) expr += ` − ${Math.abs(modifier)}`;
  return expr;
}

/** Build the on-screen dice plus any RNG `extras` above the visual cap. */
function planThrow(
  sides: number,
  count: number,
  tone: VisualDieTone,
): { dice: Array<Omit<VisualDie, "id">>; extras: number[] } {
  const visualCount = Math.min(count, MAX_VISUAL_DICE);
  return {
    dice: Array.from({ length: visualCount }, () => ({ sides, tone })),
    extras: Array.from({ length: count - visualCount }, () => d(sides)),
  };
}

/** Same as `planThrow`, but for a mixed pool of dice thrown together. */
function planPoolThrow(
  pool: DicePool,
  tone: VisualDieTone,
): { dice: Array<Omit<VisualDie, "id">>; extras: number[] } {
  const sidesList = poolToSides(pool);
  return {
    dice: sidesList.slice(0, MAX_VISUAL_DICE).map((sides) => ({ sides, tone })),
    extras: sidesList.slice(MAX_VISUAL_DICE).map((sides) => d(sides)),
  };
}

/**
 * Floating dice roller: a build-your-own pool (mix any dice + a modifier, e.g.
 * 3d4 + 2d6 + 1d10 + 8) plus the Daggerheart Duality roll (2d12: Hope vs. Fear,
 * critical when equal).
 */
export function DiceRoller() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);
  // The pool being assembled: how many of each die, plus a flat modifier.
  const [pool, setPool] = useState<DicePool>({});
  const [modifier, setModifier] = useState(0);
  // Lift above the Table's range-ruler legend when it is showing.
  const [rulerLifted, setRulerLifted] = useState(false);
  const [visualDice, setVisualDice] = useState<VisualDie[]>([]);
  const [visualRollKey, setVisualRollKey] = useState(0);
  const visualRollKeyRef = useRef(0);
  // How to read the dice once they land. Set when a throw starts, consumed once.
  const pendingRef = useRef<PendingRoll | null>(null);

  const showVisualDice = useCallback((dice: Array<Omit<VisualDie, "id">>) => {
    visualRollKeyRef.current += 1;
    const nextKey = visualRollKeyRef.current;
    setVisualDice(
      dice.slice(0, MAX_VISUAL_DICE).map((die, index) => ({
        ...die,
        id: `${nextKey}-${index}`,
      })),
    );
    setVisualRollKey(nextKey);
  }, []);

  // The dice have come to rest: the faces they landed on are the result.
  const handleResult = useCallback((values: number[]) => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;

    if (pending.kind === "duality") {
      const [hope = 1, fear = 1] = values;
      setResult({ kind: "duality", hope, fear });
      return;
    }

    const rolls = [...values, ...pending.extras];
    setResult({
      kind: pending.kind,
      expr: pending.expr,
      rolls,
      modifier: pending.modifier,
      total: sum(rolls) + pending.modifier,
    });
  }, []);

  const addDie = (sides: number) =>
    setPool((p) => ({ ...p, [sides]: Math.min(99, (p[sides] ?? 0) + 1) }));

  const removeDie = (sides: number) =>
    setPool((p) => {
      const next = { ...p };
      const value = (next[sides] ?? 0) - 1;
      if (value <= 0) delete next[sides];
      else next[sides] = value;
      return next;
    });

  const clearPool = () => {
    setPool({});
    setModifier(0);
  };

  const rollPool = () => {
    if (poolTotalDice(pool) === 0) return;
    const expr = poolExpression(pool, modifier);
    if (prefersReducedMotion()) {
      const rolls = poolToSides(pool).map((s) => d(s));
      setResult({ kind: "pool", expr, rolls, modifier, total: sum(rolls) + modifier });
      return;
    }
    const { dice, extras } = planPoolThrow(pool, "neutral");
    pendingRef.current = { kind: "pool", expr, modifier, extras };
    setResult(null);
    showVisualDice(dice);
  };

  const rollDuality = () => {
    if (prefersReducedMotion()) {
      setResult({ kind: "duality", hope: d(12), fear: d(12) });
      return;
    }
    pendingRef.current = { kind: "duality" };
    setResult(null);
    showVisualDice([
      { sides: 12, tone: "hope", label: t(ui.hope, language) },
      { sides: 12, tone: "fear", label: t(ui.fear, language) },
    ]);
  };

  // A damage value clicked on a table statblock asks us to roll it.
  useEffect(() => {
    const handler = (e: Event) => {
      const expr = (e as CustomEvent<string>).detail;
      const parsed = parseDamageExpression(expr);
      if (!parsed) return;
      setIsOpen(true);

      if (prefersReducedMotion()) {
        const roll = rollDamage(expr);
        if (roll) setResult({ kind: "damage", ...roll });
        return;
      }

      const { dice, extras } = planThrow(parsed.sides, parsed.count, "damage");
      pendingRef.current = {
        kind: "damage",
        expr: normalizeDamage(expr),
        modifier: parsed.modifier,
        extras,
      };
      setResult(null);
      showVisualDice(dice);
    };
    window.addEventListener(DAMAGE_ROLL_EVENT, handler);
    return () => window.removeEventListener(DAMAGE_ROLL_EVENT, handler);
  }, [showVisualDice]);

  useEffect(() => {
    const handler = (e: Event) =>
      setRulerLifted(Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener(RULER_ACTIVE_EVENT, handler);
    return () => window.removeEventListener(RULER_ACTIVE_EVENT, handler);
  }, []);

  const totalDice = poolTotalDice(pool);

  return (
    <>
      <DicePhysicsOverlay
        dice={visualDice}
        rollKey={visualRollKey}
        onResult={handleResult}
      />
      <div
        className={`fixed right-5 z-50 transition-all ${
          rulerLifted
            ? "bottom-[calc(7rem+env(safe-area-inset-bottom))]"
            : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))]"
        }`}
      >
      {isOpen && (
        <div className="absolute right-0 bottom-16 w-[min(17rem,calc(100vw-2.5rem))] rounded-card border border-edge bg-card p-4 shadow-2xl shadow-black/60">
          <h4 className="mb-3 text-center font-display text-xs font-semibold tracking-wider text-gold uppercase">
            {t(ui.rollDice, language)}
          </h4>
          <button
            onClick={rollDuality}
            className="w-full rounded-md border border-fear/40 bg-gradient-to-r from-gold/15 to-fear/20 px-3 py-2 font-display text-xs font-bold tracking-wider text-bone uppercase transition-transform hover:scale-[1.02]"
          >
            ✦ {t(ui.duality, language)} 2d12
          </button>

          <div className="my-3 border-t border-edge" />

          {/* Tap a die to add it to the pool; the badge shows how many. */}
          <div className="grid grid-cols-3 gap-1.5">
            {DIE_SIDES.map((sides) => {
              const n = pool[sides] ?? 0;
              return (
                <button
                  key={sides}
                  onClick={() => addDie(sides)}
                  className="relative rounded-md border border-edge bg-ink px-2 py-1.5 font-mono text-xs text-bone transition-colors hover:border-gold-dim hover:text-gold"
                >
                  d{sides}
                  {n > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold px-1 font-sans text-[10px] font-bold text-abyss">
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* The assembled tirada; tap a chip to remove one of that die. */}
          <div className="mt-2 flex min-h-[1.875rem] flex-wrap items-center justify-center gap-1 rounded-md border border-edge bg-ink/50 px-2 py-1.5 font-mono text-[11px] text-bone">
            {totalDice === 0 ? (
              <span className="text-center text-[10px] text-haze">
                {t(texts.emptyPool, language)}
              </span>
            ) : (
              <>
                {activeSides(pool).map((s, i) => (
                  <Fragment key={s}>
                    {i > 0 && <span className="text-haze">+</span>}
                    <button
                      onClick={() => removeDie(s)}
                      title={t(texts.removeOne, language)}
                      className="rounded border border-edge bg-ink px-1.5 py-0.5 transition-colors hover:border-fear/50 hover:text-fear"
                    >
                      {pool[s]}d{s}
                    </button>
                  </Fragment>
                ))}
                {modifier > 0 && (
                  <span className="text-haze">
                    + <span className="text-bone">{modifier}</span>
                  </span>
                )}
                {modifier < 0 && (
                  <span className="text-haze">
                    − <span className="text-bone">{Math.abs(modifier)}</span>
                  </span>
                )}
              </>
            )}
          </div>

          {/* Modifier stepper. */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <label
              htmlFor="dice-modifier"
              className="font-display text-[10px] font-semibold tracking-wider text-haze uppercase"
            >
              {t(texts.modifier, language)}
            </label>
            <div className="flex items-center overflow-hidden rounded-md border border-edge">
              <button
                type="button"
                aria-label="−"
                onClick={() => setModifier((m) => Math.max(-99, m - 1))}
                className="px-2 py-0.5 text-mist transition-colors hover:bg-white/5"
              >
                −
              </button>
              <input
                id="dice-modifier"
                type="number"
                min={-99}
                max={99}
                value={modifier}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setModifier(Number.isNaN(n) ? 0 : Math.min(99, Math.max(-99, n)));
                }}
                className="w-10 bg-transparent text-center font-mono text-sm font-bold text-bone outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label="+"
                onClick={() => setModifier((m) => Math.min(99, m + 1))}
                className="px-2 py-0.5 text-mist transition-colors hover:bg-white/5"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions. */}
          <div className="mt-3 flex gap-1.5">
            <button
              onClick={clearPool}
              disabled={totalDice === 0 && modifier === 0}
              className="flex-1 rounded-md border border-edge px-2 py-2 font-display text-[11px] font-semibold tracking-wider text-mist uppercase transition-colors hover:text-bone disabled:opacity-40"
            >
              {t(texts.clear, language)}
            </button>
            <button
              onClick={rollPool}
              disabled={totalDice === 0}
              className="flex-[2] rounded-md border border-gold/40 bg-gradient-to-r from-gold/20 to-gold-bright/25 px-2 py-2 font-display text-xs font-bold tracking-wider text-bone uppercase transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              {t(texts.roll, language)}
            </button>
          </div>

          {result && (
            <div
              className="mt-3 border-t border-edge pt-3 text-center"
              aria-live="polite"
            >
              {result.kind === "damage" ? (
                <>
                  <div className="font-display text-3xl font-bold text-gold-bright">
                    {result.total}
                  </div>
                  <div className="text-xs text-haze">
                    {t(texts.damage, language)} {result.expr} · [{result.rolls.join(", ")}]
                    {result.modifier > 0 && ` + ${result.modifier}`}
                    {result.modifier < 0 && ` − ${Math.abs(result.modifier)}`}
                  </div>
                </>
              ) : result.kind === "pool" ? (
                <>
                  <div className="font-display text-3xl font-bold text-gold-bright">
                    {result.total}
                  </div>
                  <div className="text-xs text-haze">
                    {result.expr}
                    {result.rolls.length > 1 && ` · [${result.rolls.join(", ")}]`}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-3">
                    <div>
                      <div className="font-display text-2xl font-bold text-hope">
                        {result.hope}
                      </div>
                      <div className="text-[10px] tracking-wide text-haze uppercase">
                        {t(ui.hope, language)}
                      </div>
                    </div>
                    <span className="text-haze">·</span>
                    <div>
                      <div className="font-display text-2xl font-bold text-fear">
                        {result.fear}
                      </div>
                      <div className="text-[10px] tracking-wide text-haze uppercase">
                        {t(ui.fear, language)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-mist">
                    {result.hope === result.fear
                      ? t(ui.critical, language)
                      : `${result.hope + result.fear} ${t(
                          result.hope > result.fear
                            ? ui.withHope
                            : ui.withFear,
                          language,
                        )}`}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={t(ui.rollDice, language)}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-bright text-abyss shadow-lg shadow-gold/25 transition-transform hover:scale-108"
      >
        <DiceIcon size={22} />
      </button>
      </div>
    </>
  );
}
