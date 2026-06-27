import type { SavedBrew, BrewType } from "@/lib/storage";
import type { Trait, TrackerConfig } from "@/lib/types";
import type { ResourceLanguage } from "@/lib/resource-types";
import { FORMAT as CANVAS_FORMAT } from "@/lib/canvas-session-transfer";
import { colossusToJSON, colossusFromJSON } from "@/lib/colossus";
import { normalizeBrewData, normalizeTrait } from "@/lib/brew-normalization";
import { createId } from "@/lib/id";

/**
 * Friendly import/export for Workshop resources.
 *
 * Per-object files use the app's OWN shapes so the hub round-trips with the
 * creator's download/import:
 *  - colossus  → external `*.colossus.json` (features, thresholdMinor/Major,
 *    experiences, segments with standardAttack) via {@link colossusToJSON}.
 *  - others    → a flat, type-specific shape without inapplicable arrays.
 * Canvases stay the self-contained `dagacorazon-lienzo` JSON; a full backup is
 * the hub-only `dagacorazon-backup` aggregate (keeps ids so restoring
 * overwrites by id).
 */

/** Legacy per-object wrapper from earlier builds — still accepted on import. */
export const BREW_FORMAT = "dagacorazon-brew";
export const BACKUP_FORMAT = "dagacorazon-backup";
export { CANVAS_FORMAT };
export const BREW_VERSION = 2;
const BACKUP_VERSION = 1;

export const BREW_TYPES: BrewType[] = [
  "adversary",
  "colossus",
  "environment",
  "equipment",
];

/** A brew without its local identity — ready to be saved as a new copy. */
export type BrewPayload = Omit<SavedBrew, "id" | "savedAt">;

const RESOURCE_LANGUAGES: ResourceLanguage[] = ["en", "es", "pt-br"];

const defaultTrackers = (type: BrewType): TrackerConfig => ({
  health: type === "adversary" || type === "colossus",
  countdown: false,
  token: false,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function coerceStringMap(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (v == null) continue;
    out[k] = typeof v === "string" ? v : String(v);
  }
  return out;
}

function coerceTrackers(value: unknown, type: BrewType): TrackerConfig {
  if (!isRecord(value)) return defaultTrackers(type);
  return {
    health: Boolean(value.health),
    countdown: Boolean(value.countdown),
    token: Boolean(value.token),
  };
}

function coerceTraits(value: unknown): Trait[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const trait: Trait = {
      name: String(raw.name ?? raw.title ?? ""),
      description: String(raw.description ?? ""),
      type: raw.type == null ? undefined : String(raw.type),
      libraryId:
        typeof raw.libraryId === "string" ? raw.libraryId : undefined,
    };
    return [normalizeTrait(trait)];
  });
}

function coerceLanguage(
  value: unknown,
  required: boolean,
): ResourceLanguage | undefined {
  if (
    typeof value === "string" &&
    RESOURCE_LANGUAGES.includes(value as ResourceLanguage)
  ) {
    return value as ResourceLanguage;
  }
  if (required) throw new Error("invalid-brew-language");
  return undefined;
}

/** Validate/normalize an internal-shape record into a brew payload. */
export function sanitizeBrewPayload(raw: unknown): BrewPayload {
  if (!isRecord(raw)) throw new Error("invalid-brew");
  const type = raw.type;
  if (typeof type !== "string" || !BREW_TYPES.includes(type as BrewType)) {
    throw new Error("invalid-brew-type");
  }
  const brewType = type as BrewType;
  return {
    type: brewType,
    data: normalizeBrewData(brewType, coerceStringMap(raw.data)),
    traits: coerceTraits(raw.traits),
    segments: Array.isArray(raw.segments)
      ? (raw.segments as BrewPayload["segments"])
      : [],
    trackers: coerceTrackers(raw.trackers, brewType),
    language: coerceLanguage(raw.language, false),
  };
}

/**
 * Like {@link sanitizeBrewPayload} but preserves the saved identity (`id`,
 * `savedAt`) so a full backup can be restored idempotently by id.
 */
export function sanitizeBrew(raw: unknown): SavedBrew {
  const payload = sanitizeBrewPayload(raw);
  const id =
    isRecord(raw) && typeof raw.id === "string" && raw.id ? raw.id : createId();
  const savedAt =
    isRecord(raw) && typeof raw.savedAt === "string"
      ? raw.savedAt
      : new Date().toISOString();
  return { ...payload, id, savedAt };
}

interface ResourceCodec {
  serialize(brew: BrewPayload): Record<string, unknown>;
  parse(raw: Record<string, unknown>, strict: boolean): BrewPayload;
}

function metadata(type: BrewType, language: ResourceLanguage) {
  return { format: BREW_FORMAT, version: BREW_VERSION, type, language };
}

const templateTrait = (): Trait => ({
  name: "",
  description: "",
  type: "Passive",
});

const templateSegment = (): BrewPayload["segments"][number] => ({
  name: "",
  count: 1,
  pluralName: "",
  difficulty: "",
  hp: "",
  attack: {
    modifier: "",
    name: "",
    range: "Melee",
    damage: "",
    damageType: "Physical",
  },
  features: [templateTrait()],
  adjacentSegments: [],
});

function serializeFlat(
  brew: BrewPayload,
  traits: "always" | "when-present",
): Record<string, unknown> {
  const language = brew.language ?? "es";
  const normalizedTraits = brew.traits.map(normalizeTrait);
  return {
    ...metadata(brew.type, language),
    data: normalizeBrewData(brew.type, brew.data),
    ...(traits === "always" || normalizedTraits.length > 0
      ? { traits: normalizedTraits }
      : {}),
    trackers: brew.trackers,
  };
}

function parseFlat(
  type: BrewType,
  raw: Record<string, unknown>,
  strict: boolean,
): BrewPayload {
  return {
    type,
    data: normalizeBrewData(type, coerceStringMap(raw.data)),
    traits: coerceTraits(raw.traits),
    segments: [],
    trackers: coerceTrackers(raw.trackers, type),
    language: coerceLanguage(raw.language, strict),
  };
}

function parseColossus(
  raw: Record<string, unknown>,
  strict: boolean,
): BrewPayload {
  const form = colossusFromJSON(raw);
  return {
    type: "colossus",
    data: normalizeBrewData("colossus", coerceStringMap(form.data)),
    traits: form.traits.map(normalizeTrait),
    segments: form.segments,
    trackers: coerceTrackers(form.trackers, "colossus"),
    language: coerceLanguage(raw.language ?? form.language, strict),
  };
}

/** Single registry for every individual-resource file contract. */
export const resourceCodecs: Record<BrewType, ResourceCodec> = {
  adversary: {
    serialize: (brew) => serializeFlat(brew, "always"),
    parse: (raw, strict) => parseFlat("adversary", raw, strict),
  },
  environment: {
    serialize: (brew) => serializeFlat(brew, "always"),
    parse: (raw, strict) => parseFlat("environment", raw, strict),
  },
  equipment: {
    serialize: (brew) => serializeFlat(brew, "when-present"),
    parse: (raw, strict) => parseFlat("equipment", raw, strict),
  },
  colossus: {
    serialize: (brew) => ({
      format: BREW_FORMAT,
      version: BREW_VERSION,
      ...colossusToJSON({
        data: normalizeBrewData("colossus", brew.data),
        traits: brew.traits.map(normalizeTrait),
        segments: brew.segments,
        trackers: brew.trackers,
        language: brew.language ?? "es",
      }),
    }),
    parse: parseColossus,
  },
};

/** The display name of a brew (its form `name` field). */
export const brewName = (brew: { data: Record<string, string> }) =>
  brew.data?.name?.trim() ?? "";

/**
 * Serialize a brew to the app's own file shape. The single source of truth for
 * what an exported object looks like — used by both the hub and the creator.
 */
export function serializeBrew(brew: BrewPayload): string {
  return JSON.stringify(resourceCodecs[brew.type].serialize(brew), null, 2);
}

/**
 * An empty, fillable template in the app's own file shape. For grouped
 * creators (equipment) pass a `category` so the template only includes the
 * fields that apply and preselects the category.
 */
export function emptyBrewTemplate(
  type: BrewType,
  fields: { key: string; categories?: string[] }[],
  language: ResourceLanguage,
  category?: string,
): string {
  const applicable = fields.filter(
    (f) => !f.categories || (category != null && f.categories.includes(category)),
  );
  const data: Record<string, string> = {};
  for (const f of applicable) data[f.key] = "";
  if (category != null) data.category = category;
  // Mirror the creator: health tracker on only when the type has vitals.
  const hasVitals = applicable.some((f) => f.key === "hp" || f.key === "stress");
  const trackers: TrackerConfig = { health: hasVitals, countdown: false, token: false };
  const documentsTraits = type !== "equipment";
  return serializeBrew({
    type,
    language,
    data,
    traits: documentsTraits ? [templateTrait()] : [],
    segments: type === "colossus" ? [templateSegment()] : [],
    trackers,
  });
}

// ── Canvas helpers (reading the raw export without touching images) ──

const isValidImage = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("data:image/");

/**
 * Brews embedded in a canvas (its statblock cards), so the importer can add
 * the missing ones to the library.
 */
export function extractCanvasBrews(
  source: string,
): { name: string; payload: BrewPayload }[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return [];
  }
  if (
    !isRecord(parsed) ||
    !isRecord(parsed.session) ||
    !Array.isArray(parsed.session.elements)
  ) {
    return [];
  }
  const out: { name: string; payload: BrewPayload }[] = [];
  for (const el of parsed.session.elements as unknown[]) {
    if (!isRecord(el) || el.kind !== "statblock" || !isRecord(el.statblock)) {
      continue;
    }
    const snap = el.statblock;
    try {
      const payload = sanitizeBrewPayload({
        type: snap.brewType,
        data: snap.data,
        traits: snap.traits,
        segments: snap.segments,
        trackers: snap.trackers,
        language: snap.language,
      });
      const name =
        (typeof el.name === "string" && el.name.trim()) || brewName(payload) || "";
      out.push({ name, payload });
    } catch {
      // Skip elements whose snapshot isn't a valid brew.
    }
  }
  return out;
}

/** How many image-bearing canvas elements are missing their embedded image. */
export function countMissingCanvasImages(source: string): number {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return 0;
  }
  if (
    !isRecord(parsed) ||
    !isRecord(parsed.session) ||
    !Array.isArray(parsed.session.elements)
  ) {
    return 0;
  }
  let missing = 0;
  for (const el of parsed.session.elements as unknown[]) {
    if (!isRecord(el)) continue;
    const expectsImage = el.kind === "image" || Boolean(el.imageId);
    if (expectsImage && !isValidImage(el.image)) missing += 1;
  }
  return missing;
}

// ── Full backup (hub-only aggregate; keeps ids for overwrite-by-id) ──

export interface BackupExport {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  brews: SavedBrew[];
  /** Each entry is a canvas-session export (dagacorazon-lienzo). */
  sessions: unknown[];
}

export function buildBackup(brews: SavedBrew[], sessions: unknown[]): string {
  const payload: BackupExport = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    brews,
    sessions,
  };
  return JSON.stringify(payload, null, 2);
}

// ── Detection ──

export type DetectedResource =
  | { kind: "brew"; payload: BrewPayload; name: string }
  | { kind: "canvas"; source: string; name: string; missingImages: number }
  | { kind: "backup"; brews: SavedBrew[]; sessions: string[] };

/** Legacy external colossus files carried no `type`; recognize them structurally. */
function looksLikeColossus(json: Record<string, unknown>): boolean {
  return (
    typeof json.type !== "string" &&
    (Array.isArray(json.features) ||
      Array.isArray(json.segments) ||
      json.thresholdMinor != null ||
      json.thresholdMajor != null)
  );
}

/**
 * Inspect an uploaded file and classify it. Throws Error("unrecognized") for
 * anything that isn't a known resource (including stray images),
 * Error("invalid-json") when the file isn't JSON at all, and
 * Error("unsupported-version") for future per-object versions.
 */
export function detectResource(source: string): DetectedResource {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error("invalid-json");
  }
  if (!isRecord(parsed)) throw new Error("unrecognized");

  const format = parsed.format;

  if (format === CANVAS_FORMAT) {
    const session = isRecord(parsed.session) ? parsed.session : null;
    const name =
      session && typeof session.name === "string" ? session.name : "";
    return {
      kind: "canvas",
      source,
      name,
      missingImages: countMissingCanvasImages(source),
    };
  }

  if (format === BACKUP_FORMAT) {
    const brews = Array.isArray(parsed.brews)
      ? (parsed.brews as unknown[]).flatMap((b) => {
          try {
            return [sanitizeBrew(b)];
          } catch {
            return [];
          }
        })
      : [];
    const sessions = Array.isArray(parsed.sessions)
      ? (parsed.sessions as unknown[]).map((s) => JSON.stringify(s))
      : [];
    return { kind: "backup", brews, sessions };
  }

  if (
    format === BREW_FORMAT &&
    parsed.version != null &&
    parsed.version !== 1 &&
    parsed.version !== BREW_VERSION
  ) {
    throw new Error("unsupported-version");
  }

  // Per-object brew. Unwrap the legacy `{ format: "dagacorazon-brew", brew }`.
  const brewJson =
    format === BREW_FORMAT && isRecord(parsed.brew) ? parsed.brew : parsed;
  const strict = format === BREW_FORMAT && parsed.version === BREW_VERSION;

  if (
    strict &&
    (typeof brewJson.type !== "string" ||
      !BREW_TYPES.includes(brewJson.type as BrewType))
  ) {
    throw new Error("invalid-brew-type");
  }

  if (
    typeof brewJson.type === "string" &&
    BREW_TYPES.includes(brewJson.type as BrewType)
  ) {
    const type = brewJson.type as BrewType;
    const payload = resourceCodecs[type].parse(brewJson, strict);
    return { kind: "brew", payload, name: brewName(payload) };
  }

  if (looksLikeColossus(brewJson)) {
    const payload = resourceCodecs.colossus.parse(brewJson, false);
    return { kind: "brew", payload, name: brewName(payload) };
  }

  throw new Error("unrecognized");
}
