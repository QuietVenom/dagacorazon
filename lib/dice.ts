/**
 * Damage expressions: normalization, validation, and rolling.
 *
 * Canonical format is dice notation `NdM`, `NdM+K` or `NdM-K`, where the count
 * `N` may be omitted (treated as 1): `1d8+3`, `1d6`, `d8`, `4d8+10`. Only the
 * standard polyhedral dice are accepted (so `1d15` is rejected).
 */

/** The dice the app supports, in size order (shared with the dice roller). */
export const DIE_SIDES = [4, 6, 8, 10, 12, 20] as const;
const ALLOWED_SIDES = new Set<number>(DIE_SIDES);

const DAMAGE_PATTERN = /^(\d*)d(\d+)([+-]\d+)?$/;

/** Join a loosely-typed expression: drop whitespace, lowercase the `d`. */
export function normalizeDamage(value: string): string {
  return value.replace(/\s+/g, "").replace(/D/g, "d");
}

export interface ParsedDamage {
  count: number;
  sides: number;
  modifier: number;
}

/** Parse a normalized expression, or null if it is not a supported format. */
function parseDamage(value: string): ParsedDamage | null {
  const match = DAMAGE_PATTERN.exec(normalizeDamage(value));
  if (!match) return null;
  const count = match[1] === "" ? 1 : parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;
  if (count < 1 || count > 100) return null;
  if (!ALLOWED_SIDES.has(sides)) return null;
  return { count, sides, modifier };
}

/** Empty is allowed (no damage); anything non-empty must be a supported roll. */
export function isValidDamage(value: string): boolean {
  return normalizeDamage(value) === "" || parseDamage(value) !== null;
}

/**
 * Parse a damage expression into its parts without rolling, so the physical
 * dice can decide the result. Returns null if it is not a supported format.
 */
export function parseDamageExpression(value: string): ParsedDamage | null {
  return parseDamage(value);
}

export interface DamageRoll {
  expr: string;
  rolls: number[];
  modifier: number;
  total: number;
}

/** Roll a damage expression, or null if it is not a supported format. */
export function rollDamage(value: string): DamageRoll | null {
  const parsed = parseDamage(value);
  if (!parsed) return null;
  const { count, sides, modifier } = parsed;
  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;
  return { expr: normalizeDamage(value), rolls, modifier, total };
}

/** Event used to ask the floating dice roller to roll a damage expression. */
export const DAMAGE_ROLL_EVENT = "dagacorazon:roll-damage";

/** Ask the dice roller to roll this damage expression. */
export function requestDamageRoll(expr: string): void {
  window.dispatchEvent(new CustomEvent(DAMAGE_ROLL_EVENT, { detail: normalizeDamage(expr) }));
}
