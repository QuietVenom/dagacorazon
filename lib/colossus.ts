import type { ResourceLanguage } from "@/lib/resource-types";
import type {
  SavedSegment,
  SegmentAttack,
  Trait,
  TrackerConfig,
} from "@/lib/types";
import {
  composeAdversaryAttack,
  composeAttackParts,
  normalizeAttackRange,
  normalizeAttackType,
  type AttackPart,
} from "@/lib/adversary-attack";
import { normalizeTrait } from "@/lib/brew-normalization";

/**
 * Colossus helpers: segment construction, the standard-attack line, feature
 * types, and import/export between the app's internal shape and the external
 * `*.colossus.json` format.
 */

export const emptySegmentAttack = (): SegmentAttack => ({
  modifier: "",
  name: "",
  range: "",
  damage: "",
  damageType: "",
});

export const emptySegment = (): SavedSegment => ({
  name: "",
  hp: "",
  count: 1,
  pluralName: "",
  difficulty: "",
  attack: emptySegmentAttack(),
  features: [],
  adjacentSegments: [],
});

/** A segment always has at least one copy. */
export const segmentCount = (segment: SavedSegment): number =>
  Math.max(1, segment.count ?? 1);

/** Per-copy instance names: ["Leg #1", "Leg #2", …] or just [name]. */
export function segmentInstanceNames(segment: SavedSegment): string[] {
  const count = segmentCount(segment);
  const base = segment.name || "—";
  if (count <= 1) return [base];
  return Array.from({ length: count }, (_, i) => `${base} #${i + 1}`);
}

/**
 * Render a segment's standard attack as one line ("Stomp +2 · Very Close ·
 * 4d8 + 10 · Físico"), reusing the adversary attack composer.
 */
function segmentAttackData(attack: SegmentAttack): Record<string, string> {
  return {
    attackModifier: attack.modifier,
    attackName: attack.name,
    attackRange: attack.range,
    attackDamage: attack.damage,
    attackType: attack.damageType,
  };
}

export function composeSegmentAttack(
  attack: SegmentAttack | undefined,
  transform?: (key: "attackRange" | "attackType", value: string) => string,
): string {
  if (!attack) return "";
  return composeAdversaryAttack(segmentAttackData(attack), transform);
}

/** Structured parts of a segment's attack line, with the damage token marked. */
export function composeSegmentAttackParts(
  attack: SegmentAttack | undefined,
  transform?: (key: "attackRange" | "attackType", value: string) => string,
): AttackPart[] {
  if (!attack) return [];
  return composeAttackParts(segmentAttackData(attack), transform);
}

// ── Import / export ──

type RawJSON = Record<string, unknown>;
const str = (v: unknown) => (v == null ? "" : String(v));

/** Payload that loads straight into the creator form. */
export interface ColossusForm {
  data: Record<string, string>;
  traits: Trait[];
  segments: SavedSegment[];
  trackers: TrackerConfig;
  language?: ResourceLanguage;
}

export function featureFromJSON(raw: RawJSON): Trait {
  return normalizeTrait({
    name: str(raw.title ?? raw.name),
    description: str(raw.description),
    type: str(raw.type),
  });
}

function attackFromJSON(raw: unknown): SegmentAttack {
  const a = (raw ?? {}) as RawJSON;
  return {
    modifier: str(a.modifier),
    name: str(a.name),
    range: normalizeAttackRange(str(a.range)),
    damage: str(a.damage),
    damageType: normalizeAttackType(str(a.damageType)),
  };
}

/** Normalize a raw segment record (rich fields if present, defaults if not). */
export function segmentFromJSON(raw: RawJSON): SavedSegment {
  return {
    name: str(raw.name),
    hp: str(raw.hp),
    count: Number(raw.count) || 1,
    pluralName: str(raw.pluralName),
    difficulty: str(raw.difficulty),
    attack: attackFromJSON(raw.standardAttack ?? raw.attack),
    features: Array.isArray(raw.features)
      ? (raw.features as RawJSON[]).map(featureFromJSON)
      : [],
    adjacentSegments: Array.isArray(raw.adjacentSegments)
      ? (raw.adjacentSegments as unknown[]).map(str)
      : [],
  };
}

/** Accepts both the external `*.colossus.json` and the app's own export shape. */
export function colossusFromJSON(json: RawJSON): ColossusForm {
  // The app's own export nests everything under `data`.
  if (json.data && typeof json.data === "object") {
    const data = json.data as Record<string, string>;
    return {
      data: { ...data },
      traits: Array.isArray(json.traits) ? (json.traits as Trait[]) : [],
      segments: Array.isArray(json.segments)
        ? (json.segments as RawJSON[]).map(segmentFromJSON)
        : [],
      trackers: (json.trackers as TrackerConfig) ?? {
        health: true,
        countdown: false,
        token: false,
      },
      language: json.language as ResourceLanguage | undefined,
    };
  }

  // External Colossus Creator shape.
  const minor = str(json.thresholdMinor);
  const major = str(json.thresholdMajor);
  const thresholds = str(json.thresholds) || [minor, major].filter(Boolean).join(" / ");
  return {
    data: {
      name: str(json.name),
      title: str(json.title),
      tier: str(json.tier),
      stress: str(json.stress),
      description: str(json.description),
      motives: str(json.motives ?? json.motivestactics),
      size: str(json.size),
      thresholds,
      experience: str(json.experience ?? json.experiences),
    },
    traits: Array.isArray(json.features)
      ? (json.features as RawJSON[]).map(featureFromJSON)
      : [],
    segments: Array.isArray(json.segments)
      ? (json.segments as RawJSON[]).map(segmentFromJSON)
      : [],
    trackers: {
      health: json.showStats !== false,
      countdown: json.countdownTracker === true,
      token: json.tokenTracker === true,
    },
    language: json.language as ResourceLanguage | undefined,
  };
}

function featureToJSON(trait: Trait) {
  const normalized = normalizeTrait(trait);
  return {
    title: normalized.name,
    type: normalized.type ?? "",
    description: normalized.description,
  };
}

// Export the abbreviations the external Colossus Creator uses for damage type.
const DAMAGE_TYPE_ABBREV: Record<string, string> = {
  Physical: "phy",
  Magical: "mag",
  "Physical & Magical": "phy or mag",
};

/** Text summary of a segment's neighbours, by plural/singular name. */
function adjacentText(names: string[], byName: Map<string, SavedSegment>): string {
  return names
    .map((name) => {
      const seg = byName.get(name);
      return seg && segmentCount(seg) > 1 && seg.pluralName ? seg.pluralName : name;
    })
    .join(", ");
}

function segmentToJSON(segment: SavedSegment, byName: Map<string, SavedSegment>) {
  const attack = segment.attack ?? emptySegmentAttack();
  const adjacent = segment.adjacentSegments ?? [];
  return {
    name: segment.name,
    count: segmentCount(segment),
    pluralName: segment.pluralName ?? "",
    difficulty: segment.difficulty ?? "",
    hp: segment.hp,
    standardAttack: {
      modifier: attack.modifier,
      name: attack.name,
      range: attack.range,
      damage: attack.damage,
      damageType: DAMAGE_TYPE_ABBREV[attack.damageType] ?? attack.damageType,
    },
    features: (segment.features ?? []).map(featureToJSON),
    adjacentSegments: adjacent,
    adjacentSegmentsText: adjacentText(adjacent, byName),
  };
}

/** Serialize a colossus to the external `*.colossus.json` shape. */
export function colossusToJSON(form: ColossusForm) {
  const { data, traits, segments, trackers, language = "es" } = form;
  const [minor, major] = (data.thresholds ?? "").split("/").map((p) => p.trim());
  const byName = new Map(segments.map((s) => [s.name, s]));
  return {
    type: "colossus" as const,
    language,
    name: data.name ?? "",
    title: data.title ?? "",
    tier: data.tier ?? "",
    description: data.description ?? "",
    motives: data.motives ?? "",
    size: data.size ?? "",
    thresholdMinor: minor ?? "",
    thresholdMajor: major ?? "",
    stress: data.stress ?? "",
    experiences: data.experience ?? "",
    features: traits.map(featureToJSON),
    segments: segments.map((s) => segmentToJSON(s, byName)),
    showStats: trackers.health,
    countdownTracker: trackers.countdown,
    tokenTracker: trackers.token,
  };
}
