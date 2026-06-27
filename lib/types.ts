import type { ObjectId } from "mongodb";
import type { Language } from "@/lib/i18n";
import type { ResourceLanguage } from "@/lib/resource-types";

/** The four kinds of homebrew the Workshop creates. */
export type BrewType = "adversary" | "colossus" | "environment" | "equipment";

/** Which trackers a statblock shows (chosen in the creator). */
export interface TrackerConfig {
  health: boolean;
  countdown: boolean;
  token: boolean;
}

/** Live, per-instance tracker values (marked pips, counters). */
export interface TrackerState {
  markedHp: number;
  markedStress: number;
  countdown: number;
  tokens: number;
  /** Reverse mode: pips fill from full toward empty (GM preference). */
  reverse: boolean;
  /**
   * Colossus only: marked HP per segment copy.
   * `segments[segmentIndex][copyIndex]` = marked HP for that instance
   * (e.g. each of the 4 legs tracks its own HP).
   */
  segments?: number[][];
}

export const emptyTrackerState = (): TrackerState => ({
  markedHp: 0,
  markedStress: 0,
  countdown: 0,
  tokens: 0,
  reverse: false,
});

/**
 * Homebrew content models ("brews") that will live in MongoDB.
 * Every brew shares a base: authorship, public visibility for the
 * community library, and content language.
 */

export interface BrewBase {
  _id?: ObjectId;
  authorId?: string;
  name: string;
  /** Visible in the community library. */
  isPublic: boolean;
  language: Language;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Trait {
  name: string;
  description: string;
  /** Canonical feature kind: Passive / Action / Reaction. */
  type?: string;
  /** Optional source recommendation from the adversary feature library. */
  libraryId?: string;
}

/** A segment's standard attack — independent fields, like an adversary's. */
export interface SegmentAttack {
  modifier: string;
  name: string;
  /** Canonical attack range (see lib/adversary-attack.ts). */
  range: string;
  damage: string;
  /** Canonical attack type (Physical / Magical / Physical & Magical). */
  damageType: string;
}

/**
 * A colossus segment definition. New fields are optional so older saved data
 * (`{ name, hp }`) and the non-colossus creators (empty `segments`) stay valid.
 */
export interface SavedSegment {
  name: string;
  hp: string;
  /** How many identical copies of this segment the colossus has. */
  count?: number;
  /** Display name when count > 1 (e.g. "Legs"). */
  pluralName?: string;
  difficulty?: string;
  attack?: SegmentAttack;
  features?: Trait[];
  /** Names of segments directly connected to this one. */
  adjacentSegments?: string[];
}

export interface Adversary extends BrewBase {
  type: "adversary";
  tier: string;
  role: string; // Minion, Standard, Solo, Leader, Horde…
  description: string;
  motives: string;
  difficulty: string;
  thresholds: string;
  hp: string;
  stress: string;
  attackModifier: string;
  attackName: string;
  attackRange: string;
  attackDamage: string;
  attackType: string;
  /** Legacy combined attack string kept only for backward-compatible reads. */
  attack?: string;
  experience: string;
  traits: Trait[];
}

export interface ColossusSegment {
  name: string;
  hp: string;
  traits: Trait[];
}

export interface Colossus extends BrewBase {
  type: "colossus";
  title: string;
  tier: string;
  stress: string;
  description: string;
  motives: string;
  size: string;
  thresholds: string;
  experience: string;
  traits: Trait[];
  segments: ColossusSegment[];
}

export interface Environment extends BrewBase {
  type: "environment";
  tier: string;
  category: string; // Traversal, Social, Combat, Exploration
  description: string;
  impulses: string;
  difficulty: string;
  potentialAdversaries: string;
  traits: Trait[];
}

export interface Equipment extends BrewBase {
  type: "equipment";
  category: string; // Physical Weapon, Magic Weapon, Secondary Weapon, Wheelchair, Armor, Loot, Consumable
  traits: Trait[];
}

export type Brew = Adversary | Colossus | Environment | Equipment;

/** Snapshot of a brew placed on the canvas (kept even if the source is deleted). */
export interface StatblockSnapshot {
  brewType: BrewType;
  data: Record<string, string>;
  traits: Trait[];
  segments: SavedSegment[];
  trackers: TrackerConfig;
  language?: ResourceLanguage;
}

/** A dated entry inside a canvas note. */
export interface NoteThread {
  id: string;
  text: string;
  /** ISO timestamp set from the user's browser when the thread is created. */
  createdAt: string;
}

/** An element on the game-table canvas: token, image, counter, note or statblock. */
export interface CanvasElement {
  id: string;
  kind:
    | "pc-token"
    | "adversary-token"
    | "image"
    | "counter"
    | "note"
    | "statblock";
  name: string;
  x: number;
  y: number;
  /** Legacy inline image. Kept temporarily so existing canvases can migrate. */
  image?: string;
  /** Key for the image Blob stored in IndexedDB. */
  imageId?: string;
  /** Display width for a free image placed on the canvas. */
  imageWidth?: number;
  color?: string;
  /** Reference to a Workshop brew, to bring planning down to the Table. */
  brewId?: string;
  /** For kind "counter": the current tally. */
  count?: number;
  /** For kind "note": dated entries the GM jots down during play. */
  threads?: NoteThread[];
  /** For kind "statblock": the rendered card and its live trackers. */
  statblock?: StatblockSnapshot;
  trackerState?: TrackerState;
  /** Colossus super-card: whether the segment strip is collapsed. */
  collapsed?: boolean;
}

export interface TableCanvas {
  _id?: ObjectId;
  authorId?: string;
  name: string;
  elements: CanvasElement[];
  createdAt: Date;
  updatedAt: Date;
}
