import type { LocalizedText } from "@/lib/i18n";

export type CanonicalAttackRange = "Melee" | "Very Close" | "Close" | "Far" | "Very Far";
export type CanonicalAttackType = "Physical" | "Magical" | "Physical & Magical";

export type AttackOption = { value: string; label: LocalizedText };

export const ATTACK_FIELD_KEYS = [
  "attackModifier",
  "attackName",
  "attackRange",
  "attackDamage",
  "attackType",
] as const;

export const attackRangeOptions: AttackOption[] = [
  { value: "Melee", label: { es: "Cuerpo a cuerpo", pt: "Corpo a corpo" } },
  { value: "Very Close", label: { es: "Muy cerca", pt: "Muito perto" } },
  { value: "Close", label: { es: "Cerca", pt: "Perto" } },
  { value: "Far", label: { es: "Lejos", pt: "Longe" } },
  { value: "Very Far", label: { es: "Muy lejos", pt: "Muito longe" } },
];

export const attackTypeOptions: AttackOption[] = [
  { value: "Physical", label: { es: "Físico", pt: "Físico" } },
  { value: "Magical", label: { es: "Mágico", pt: "Mágico" } },
  {
    value: "Physical & Magical",
    label: { es: "Físico y mágico", pt: "Físico e mágico" },
  },
];

const localizedAttackRanges: Record<CanonicalAttackRange, string[]> = {
  Melee: ["Cuerpo a cuerpo", "Corpo a corpo"],
  "Very Close": ["Muy cerca", "Muito perto"],
  Close: ["Cerca", "Perto"],
  Far: ["Lejos", "Longe"],
  "Very Far": ["Muy lejos", "Muito longe"],
};

const localizedAttackTypes: Record<CanonicalAttackType, string[]> = {
  Physical: ["Físico", "Fisico", "phy"],
  Magical: ["Mágico", "Magico", "mag"],
  "Physical & Magical": [
    "Físico y mágico",
    "Fisico y magico",
    "Físico e mágico",
    "Fisico e magico",
    "phy/mag",
    "mag/phy",
    "phy or mag",
    "mag or phy",
  ],
};

const DIACRITIC_REGEX = /\p{Diacritic}/gu;

export function normalizeGlossaryValue(
  value: string,
  localized: Record<string, string[]>,
): string {
  const clean = value.trim();
  if (!clean) return "";
  const normalized = clean.normalize("NFD").replace(DIACRITIC_REGEX, "").toLowerCase();
  for (const [english, variants] of Object.entries(localized)) {
    const candidates = [english, ...variants];
    if (
      candidates.some(
        (candidate) =>
          candidate.normalize("NFD").replace(DIACRITIC_REGEX, "").toLowerCase() === normalized,
      )
    ) {
      return english;
    }
  }
  return clean;
}

export function normalizeAttackRange(value: string): string {
  return normalizeGlossaryValue(value, localizedAttackRanges);
}

export function normalizeAttackType(value: string): string {
  return normalizeGlossaryValue(value, localizedAttackTypes);
}

function parseNameAndModifier(value: string): { attackName: string; attackModifier: string } {
  const clean = value.trim();
  const match = /^(.*?)(?:\s+([+-]\d[\d+-]*))?$/.exec(clean);
  if (!match) return { attackName: clean, attackModifier: "" };
  return {
    attackName: match[1]?.trim() ?? "",
    attackModifier: match[2]?.trim() ?? "",
  };
}

function parseDamageAndType(value: string): { attackDamage: string; attackType: string } {
  const clean = value.trim();
  if (!clean) return { attackDamage: "", attackType: "" };

  const pieces = clean.split(/\s+/);
  const lastPiece = pieces.at(-1) ?? "";
  const normalizedType = normalizeAttackType(lastPiece);
  if (normalizedType !== lastPiece || ["Physical", "Magical", "Physical & Magical"].includes(lastPiece)) {
    return {
      attackDamage: pieces.slice(0, -1).join(" ").trim(),
      attackType: normalizedType,
    };
  }

  return { attackDamage: clean, attackType: "" };
}

export function normalizeAdversaryAttackData(
  data: Record<string, string>,
): Record<string, string> {
  const next = { ...data };
  const finalize = () => {
    delete next.attack;
    delete next.range;
    return next;
  };

  if (next.attackRange) next.attackRange = normalizeAttackRange(next.attackRange);
  if (next.attackType) next.attackType = normalizeAttackType(next.attackType);

  if (
    next.attackModifier ||
    next.attackName ||
    next.attackDamage ||
    next.attackType
  ) {
    return finalize();
  }

  const fallbackRange = normalizeAttackRange(next.range ?? "");
  const attack = (next.attack ?? "").trim();
  if (!attack) {
    if (!next.attackRange && fallbackRange) next.attackRange = fallbackRange;
    return finalize();
  }

  const resourcePattern =
    /^(.*?):\s*([^|]+?)\s*\|\s*([^()]+?)(?:\s*\(([^)]+)\))?$/;
  const resourceMatch = resourcePattern.exec(attack);
  if (resourceMatch) {
    const { attackDamage, attackType } = parseDamageAndType(resourceMatch[3] ?? "");
    next.attackName = resourceMatch[1]?.trim() ?? "";
    next.attackRange =
      normalizeAttackRange(resourceMatch[2] ?? "") || next.attackRange || fallbackRange;
    next.attackDamage = attackDamage;
    next.attackType = attackType;
    next.attackModifier = resourceMatch[4]?.trim() ?? "";
    return finalize();
  }

  const dottedParts = attack.split("·").map((part) => part.trim()).filter(Boolean);
  if (dottedParts.length >= 4) {
    const { attackName, attackModifier } = parseNameAndModifier(dottedParts[0] ?? "");
    next.attackName = attackName;
    next.attackModifier = attackModifier;
    next.attackRange =
      normalizeAttackRange(dottedParts[1] ?? "") || next.attackRange || fallbackRange;
    next.attackDamage = dottedParts[2] ?? "";
    next.attackType = normalizeAttackType(dottedParts[3] ?? "");
    return finalize();
  }

  if (dottedParts.length >= 2) {
    const { attackName, attackModifier } = parseNameAndModifier(dottedParts[0] ?? "");
    const { attackDamage, attackType } = parseDamageAndType(dottedParts[1] ?? "");
    next.attackName = attackName;
    next.attackModifier = attackModifier;
    next.attackRange = next.attackRange || fallbackRange;
    next.attackDamage = attackDamage;
    next.attackType = attackType;
    return finalize();
  }

  next.attackName = attack;
  next.attackRange = next.attackRange || fallbackRange;
  return finalize();
}

/** A piece of a composed attack line; `damage` marks the rollable token. */
export type AttackPart = { text: string; damage?: boolean };

export function composeAttackParts(
  data: Record<string, string>,
  transform?: (key: "attackRange" | "attackType", value: string) => string,
): AttackPart[] {
  const normalized = normalizeAdversaryAttackData(data);
  const parts: AttackPart[] = [];
  const name = normalized.attackName?.trim() ?? "";
  const modifier = normalized.attackModifier?.trim() ?? "";
  const head = [name, modifier].filter(Boolean).join(" ").trim();
  const range = normalized.attackRange?.trim() ?? "";
  const damage = normalized.attackDamage?.trim() ?? "";
  const type = normalized.attackType?.trim() ?? "";

  if (head) parts.push({ text: head });
  if (range) parts.push({ text: transform ? transform("attackRange", range) : range });
  if (damage) parts.push({ text: damage, damage: true });
  if (type) parts.push({ text: transform ? transform("attackType", type) : type });
  return parts;
}

export function composeAdversaryAttack(
  data: Record<string, string>,
  transform?: (key: "attackRange" | "attackType", value: string) => string,
): string {
  return composeAttackParts(data, transform)
    .map((part) => part.text)
    .join(" · ");
}
