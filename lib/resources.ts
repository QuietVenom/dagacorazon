import type { BrewType, SavedSegment } from "@/lib/storage";
import type { Trait, TrackerConfig } from "@/lib/types";
import type { Resource, ResourceLanguage } from "@/lib/resource-types";
import {
  normalizeAdversaryAttackData,
  normalizeAttackRange,
  normalizeAttackType,
} from "@/lib/adversary-attack";
import { featureFromJSON, segmentFromJSON } from "@/lib/colossus";
import {
  normalizeAdversaryRole,
  normalizeBrewData,
} from "@/lib/brew-normalization";

import adversariesSrdEn from "@/resources/adversaries/adversaries-srd-en.json";
import adversariesSrdEs from "@/resources/adversaries/adversaries-srd-es.json";
import adversariesSrdPtBr from "@/resources/adversaries/adversaries-srd-pt-br.json";
import environmentsSrdEn from "@/resources/environment/environment-srd-en.json";
import environmentsSrdEs from "@/resources/environment/environment-srd-es.json";
import environmentsSrdPtBr from "@/resources/environment/environment-srd-pt-br.json";
import colossusCommunityEn from "@/resources/colossus/colossus-community-en.json";
import colossusCommunityEs from "@/resources/colossus/colossus-community-es.json";
import colossusCommunityPtBr from "@/resources/colossus/colossus-community-pt-br.json";
import equipmentSrdEnArmor from "@/resources/equipment/equipment-srd-en-armor.json";
import equipmentSrdEnConsumables from "@/resources/equipment/equipment-srd-en-consumables.json";
import equipmentSrdEnLoot from "@/resources/equipment/equipment-srd-en-loot.json";
import equipmentSrdEnMagicWeapons from "@/resources/equipment/equipment-srd-en-magic-weapons.json";
import equipmentSrdEnPhysicalWeapons from "@/resources/equipment/equipment-srd-en-physical-weapons.json";
import equipmentSrdEnSecondaryWeapons from "@/resources/equipment/equipment-srd-en-secondary-weapons.json";
import equipmentSrdEnWheelchairs from "@/resources/equipment/equipment-srd-en-wheelchairs.json";
import equipmentSrdEsArmor from "@/resources/equipment/equipment-srd-es-armor.json";
import equipmentSrdEsConsumables from "@/resources/equipment/equipment-srd-es-consumables.json";
import equipmentSrdEsLoot from "@/resources/equipment/equipment-srd-es-loot.json";
import equipmentSrdEsMagicWeapons from "@/resources/equipment/equipment-srd-es-magic-weapons.json";
import equipmentSrdEsPhysicalWeapons from "@/resources/equipment/equipment-srd-es-physical-weapons.json";
import equipmentSrdEsSecondaryWeapons from "@/resources/equipment/equipment-srd-es-secondary-weapons.json";
import equipmentSrdEsWheelchairs from "@/resources/equipment/equipment-srd-es-wheelchairs.json";
import equipmentSrdPtBrArmor from "@/resources/equipment/equipment-srd-pt-br-armor.json";
import equipmentSrdPtBrConsumables from "@/resources/equipment/equipment-srd-pt-br-consumables.json";
import equipmentSrdPtBrLoot from "@/resources/equipment/equipment-srd-pt-br-loot.json";
import equipmentSrdPtBrMagicWeapons from "@/resources/equipment/equipment-srd-pt-br-magic-weapons.json";
import equipmentSrdPtBrPhysicalWeapons from "@/resources/equipment/equipment-srd-pt-br-physical-weapons.json";
import equipmentSrdPtBrSecondaryWeapons from "@/resources/equipment/equipment-srd-pt-br-secondary-weapons.json";
import equipmentSrdPtBrWheelchairs from "@/resources/equipment/equipment-srd-pt-br-wheelchairs.json";

/**
 * Index of the `resources/` directory: existing game content offered by the
 * creators under "Start from".
 *
 * Source documents are kept verbatim (they are authoritative; see
 * resources/README.md for the record format) and adapted here at the
 * boundary. To add a new document: import it and add one entry to
 * `sources` below — nothing else.
 */

/** Raw record as it appears in a source document (SRD-style). */
type RawRecord = Record<string, unknown>;

/** A source document: records keyed by name (or an array of records). */
type SourceDocument = Record<string, RawRecord> | RawRecord[];

interface Source {
  type: BrewType;
  language: ResourceLanguage;
  /** Shown next to the record name in the "Start from" selector. */
  label: string;
  document: SourceDocument;
}

const sources: Source[] = [
  {
    type: "adversary",
    language: "en",
    label: "Daggerheart SRD",
    document: adversariesSrdEn as SourceDocument,
  },
  {
    type: "adversary",
    language: "es",
    label: "Daggerheart SRD",
    document: adversariesSrdEs as SourceDocument,
  },
  {
    type: "adversary",
    language: "pt-br",
    label: "Daggerheart SRD",
    document: adversariesSrdPtBr as SourceDocument,
  },
  {
    type: "environment",
    language: "en",
    label: "Daggerheart SRD",
    document: environmentsSrdEn as SourceDocument,
  },
  {
    type: "environment",
    language: "es",
    label: "Daggerheart SRD",
    document: environmentsSrdEs as SourceDocument,
  },
  {
    type: "environment",
    language: "pt-br",
    label: "Daggerheart SRD",
    document: environmentsSrdPtBr as SourceDocument,
  },
  {
    type: "colossus",
    language: "en",
    label: "Dagacorazón Community",
    document: colossusCommunityEn as SourceDocument,
  },
  {
    type: "colossus",
    language: "es",
    label: "Comunidad Dagacorazón",
    document: colossusCommunityEs as SourceDocument,
  },
  {
    type: "colossus",
    language: "pt-br",
    label: "Comunidade Dagacorazón",
    document: colossusCommunityPtBr as SourceDocument,
  },
  {
    type: "equipment",
    language: "en",
    label: "Daggerheart SRD",
    document: equipmentSrdEnPhysicalWeapons as SourceDocument,
  },
  {
    type: "equipment",
    language: "en",
    label: "Daggerheart SRD",
    document: equipmentSrdEnMagicWeapons as SourceDocument,
  },
  {
    type: "equipment",
    language: "en",
    label: "Daggerheart SRD",
    document: equipmentSrdEnSecondaryWeapons as SourceDocument,
  },
  {
    type: "equipment",
    language: "en",
    label: "Daggerheart SRD",
    document: equipmentSrdEnWheelchairs as SourceDocument,
  },
  {
    type: "equipment",
    language: "en",
    label: "Daggerheart SRD",
    document: equipmentSrdEnArmor as SourceDocument,
  },
  {
    type: "equipment",
    language: "en",
    label: "Daggerheart SRD",
    document: equipmentSrdEnLoot as SourceDocument,
  },
  {
    type: "equipment",
    language: "en",
    label: "Daggerheart SRD",
    document: equipmentSrdEnConsumables as SourceDocument,
  },
  {
    type: "equipment",
    language: "es",
    label: "Daggerheart SRD",
    document: equipmentSrdEsPhysicalWeapons as SourceDocument,
  },
  {
    type: "equipment",
    language: "es",
    label: "Daggerheart SRD",
    document: equipmentSrdEsMagicWeapons as SourceDocument,
  },
  {
    type: "equipment",
    language: "es",
    label: "Daggerheart SRD",
    document: equipmentSrdEsSecondaryWeapons as SourceDocument,
  },
  {
    type: "equipment",
    language: "es",
    label: "Daggerheart SRD",
    document: equipmentSrdEsWheelchairs as SourceDocument,
  },
  {
    type: "equipment",
    language: "es",
    label: "Daggerheart SRD",
    document: equipmentSrdEsArmor as SourceDocument,
  },
  {
    type: "equipment",
    language: "es",
    label: "Daggerheart SRD",
    document: equipmentSrdEsLoot as SourceDocument,
  },
  {
    type: "equipment",
    language: "es",
    label: "Daggerheart SRD",
    document: equipmentSrdEsConsumables as SourceDocument,
  },
  {
    type: "equipment",
    language: "pt-br",
    label: "Daggerheart SRD",
    document: equipmentSrdPtBrPhysicalWeapons as SourceDocument,
  },
  {
    type: "equipment",
    language: "pt-br",
    label: "Daggerheart SRD",
    document: equipmentSrdPtBrMagicWeapons as SourceDocument,
  },
  {
    type: "equipment",
    language: "pt-br",
    label: "Daggerheart SRD",
    document: equipmentSrdPtBrSecondaryWeapons as SourceDocument,
  },
  {
    type: "equipment",
    language: "pt-br",
    label: "Daggerheart SRD",
    document: equipmentSrdPtBrWheelchairs as SourceDocument,
  },
  {
    type: "equipment",
    language: "pt-br",
    label: "Daggerheart SRD",
    document: equipmentSrdPtBrArmor as SourceDocument,
  },
  {
    type: "equipment",
    language: "pt-br",
    label: "Daggerheart SRD",
    document: equipmentSrdPtBrLoot as SourceDocument,
  },
  {
    type: "equipment",
    language: "pt-br",
    label: "Daggerheart SRD",
    document: equipmentSrdPtBrConsumables as SourceDocument,
  },
];

// ── Adapters: raw SRD-style record → creator form shape ──

const str = (v: unknown) => (v == null ? "" : String(v));

/** "ACID BURROWER" → "Acid Burrower" (leaves mixed-case names untouched). */
function titleCase(name: string): string {
  if (name !== name.toUpperCase()) return name;
  return name
    .toLowerCase()
    .replace(/(^|[\s(-])\p{L}/gu, (c) => c.toUpperCase());
}

/**
 * Accepts both tier formats:
 * combined  `tier: "Tier 1 Solo"`                     → { tier: "1", role: "Solo" }
 * split     `tier: 1, type|role|category: "Solo"`     → { tier: "1", role: "Solo" }
 */
function parseTier(raw: RawRecord): { tier: string; role: string } {
  const explicitRole = normalizeAdversaryRole(
    str(raw.role ?? raw.type ?? raw.category),
  );
  const value = str(raw.tier);
  const match = /tier\s*(\d+)\s*(.*)/i.exec(value);
  if (match) {
    return {
      tier: match[1],
      role: normalizeAdversaryRole(match[2].trim()) || explicitRole,
    };
  }
  return { tier: value, role: explicitRole };
}

/**
 * Normalize one feature record. Adversaries, colossi and environments use the
 * structured `{ title, type, description }` form; equipment still uses the
 * legacy markdown string `"**Name:** description"`.
 */
function parseFeature(feature: unknown): Trait {
  if (feature && typeof feature === "object") {
    return featureFromJSON(feature as RawRecord);
  }
  const match = /^\*\*(.+?):?\*\*\s*([\s\S]*)$/.exec(str(feature).trim());
  if (!match) return { name: "", description: str(feature) };
  return { name: match[1].replace(/:$/, ""), description: match[2].trim() };
}

function parseTraits(raw: RawRecord): Trait[] {
  return Array.isArray(raw.features) ? raw.features.map(parseFeature) : [];
}

function parseSegments(raw: RawRecord): SavedSegment[] {
  if (!Array.isArray(raw.segments)) return [];
  // segmentFromJSON reads rich fields (count, attack, features, adjacency) when
  // present and falls back to defaults for simple `{ name, hp }` records.
  return raw.segments.map((s: RawRecord) => segmentFromJSON(s));
}

// A source description that leads with "Tier N · …" is a stat line, not prose:
// every stat it holds is now surfaced as its own field, so it is dropped.
// Genuine flavor text (loot, consumables, community items) is kept.
const STAT_LINE = /^(tier|nivel|nível)\s*\d+/i;

function equipmentDescription(raw: RawRecord): string {
  const description = str(raw.description).trim();
  return STAT_LINE.test(description) ? "" : description;
}

function parseAttackFields(raw: RawRecord): Record<string, string> {
  const explicitRange = normalizeAttackRange(str(raw.range));
  const weapons = str(raw.weapons);
  if (!weapons) {
    return normalizeAdversaryAttackData({
      attack: str(raw.attack),
      attackRange: explicitRange,
    });
  }

  const [namePart, detailsPart] = weapons.split(/:\s*/, 2);
  const details = detailsPart?.split("|").map((part) => part.trim()).filter(Boolean) ?? [];
  const damageAndType = details.slice(1).join(" | ");
  const attackType = normalizeAttackType(damageAndType.split(/\s+/).at(-1) ?? "");
  const attackDamage = attackType
    ? damageAndType.replace(/\s+\S+\s*$/, "").trim()
    : damageAndType;

  return normalizeAdversaryAttackData({
    attackModifier: str(raw.atk),
    attackName: namePart.trim(),
    attackRange: normalizeAttackRange(details[0] ?? explicitRange),
    attackDamage,
    attackType,
  });
}

/** Per-type mapping from raw record to creator form data. */
const adapters: Record<BrewType, (raw: RawRecord) => Record<string, string>> = {
  adversary: (raw) => {
    const { tier, role } = parseTier(raw);
    return {
      name: titleCase(str(raw.name)),
      tier,
      role,
      description: str(raw.description),
      motives: str(raw.motivestactics ?? raw.motives),
      difficulty: str(raw.difficulty),
      thresholds: str(raw.thresholds),
      hp: str(raw.hp),
      stress: str(raw.stress),
      ...parseAttackFields(raw),
      experience: str(raw.experience),
    };
  },
  environment: (raw) => {
    const { tier, role } = parseTier(raw);
    return {
      name: titleCase(str(raw.name)),
      tier,
      category: role,
      description: str(raw.description),
      impulses: str(raw.impulses),
      difficulty: str(raw.difficulty),
      potentialAdversaries: str(raw.potentialadversaries ?? raw.potentialAdversaries),
    };
  },
  colossus: (raw) => {
    const { tier } = parseTier(raw);
    return {
      name: titleCase(str(raw.name)),
      title: str(raw.title),
      tier,
      stress: str(raw.stress),
      description: str(raw.description),
      motives: str(raw.motivestactics ?? raw.motives),
      size: str(raw.size),
      thresholds: str(raw.thresholds),
      experience: str(raw.experience),
    };
  },
  equipment: (raw) => ({
    name: titleCase(str(raw.name)),
    category: str(raw.category),
    tier: str(raw.tier),
    trait: str(raw.trait),
    range: str(raw.range),
    damage: str(raw.damage),
    damageType: str(raw.damageType),
    burden: str(raw.burden),
    thresholds: str(raw.baseThresholds),
    score: str(raw.baseScore),
    description: equipmentDescription(raw),
  }),
};

// Adversaries and colossi have HP/Stress, so default their health trackers on.
const defaultTrackers = (type: BrewType): TrackerConfig => ({
  health: type === "adversary" || type === "colossus",
  countdown: false,
  token: false,
});

function adapt(source: Source, raw: RawRecord): Resource {
  return {
    type: source.type,
    language: source.language,
    source: source.label,
    data: normalizeBrewData(source.type, adapters[source.type](raw)),
    traits: parseTraits(raw),
    segments: parseSegments(raw),
    trackers: defaultTrackers(source.type),
  };
}

export const resources: Resource[] = sources.flatMap((source) => {
  const records = Array.isArray(source.document)
    ? source.document
    : Object.values(source.document);
  return records.map((raw) => adapt(source, raw));
});

export const resourcesByType = (type: BrewType) =>
  resources.filter((r) => r.type === type);

/** Content languages available for a type, in canonical order (en, es, pt-br). */
export const LANGUAGE_ORDER: ResourceLanguage[] = ["en", "es", "pt-br"];

export const resourceLanguagesByType = (type: BrewType): ResourceLanguage[] => {
  const present = new Set(
    resources.filter((r) => r.type === type).map((r) => r.language),
  );
  return LANGUAGE_ORDER.filter((l) => present.has(l));
};

export function selectResourceLanguage(
  availableLanguages: ResourceLanguage[],
  requestedLanguage: ResourceLanguage,
) {
  return availableLanguages.includes(requestedLanguage)
    ? requestedLanguage
    : (availableLanguages[0] ?? "en");
}

export function getResourcesResponse(
  type: BrewType,
  requestedLanguage: ResourceLanguage,
) {
  const availableLanguages = resourceLanguagesByType(type);
  const selectedLanguage = selectResourceLanguage(availableLanguages, requestedLanguage);

  return {
    type,
    requestedLanguage,
    selectedLanguage,
    availableLanguages,
    resources: resourcesByType(type).filter((r) => r.language === selectedLanguage),
  };
}
