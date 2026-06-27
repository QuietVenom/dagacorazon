import {
  normalizeAdversaryAttackData,
  normalizeAttackRange,
  normalizeAttackType,
  normalizeGlossaryValue,
} from "@/lib/adversary-attack";
import { normalizeFeatureType } from "@/lib/feature-types";
import type { BrewType, Trait } from "@/lib/types";

const localizedAdversaryRoles: Record<string, string[]> = {
  Bruiser: ["Bruto"],
  Horde: ["Horda"],
  Leader: ["Líder", "Lider"],
  Minion: ["Esbirro", "Lacaio"],
  Ranged: ["A distancia", "A distância", "À distância"],
  Skulk: ["Acechador", "Espreitador"],
  Social: ["Social"],
  Solo: ["Solo"],
  Standard: ["Estándar", "Estandar", "Padrão", "Padrao"],
  Support: ["Apoyo", "Suporte"],
};

const localizedSceneTypes: Record<string, string[]> = {
  Exploration: ["Exploración", "Exploracao", "Exploração"],
  Social: ["Social"],
  Traversal: ["Travesía", "Travessia"],
  Event: ["Evento"],
};

const localizedEquipmentCategories: Record<string, string[]> = {
  "Physical Weapon": ["Arma física", "Arma fisica"],
  "Magic Weapon": ["Arma mágica", "Arma magica"],
  "Secondary Weapon": ["Arma secundaria", "Arma secundária"],
  Wheelchair: ["Silla de ruedas", "Cadeira de rodas"],
  Armor: ["Armadura"],
  Loot: ["Objeto", "Item", "Botín", "Botin", "Saque", "Espólio", "Espolio"],
  Consumable: ["Consumible", "Consumível", "Consumivel"],
};

const localizedEquipmentTraits: Record<string, string[]> = {
  Agility: ["Agilidad", "Agilidade"],
  Strength: ["Fuerza", "Força", "Forca"],
  Finesse: ["Fineza"],
  Instinct: ["Instinto"],
  Presence: ["Presencia", "Presença", "Presenca"],
  Knowledge: ["Conocimiento", "Conhecimento"],
  Spellcast: ["Conjuro", "Conjuração", "Conjuracao", "Lanzamiento"],
};

const localizedBurdens: Record<string, string[]> = {
  "One-Handed": ["Una mano", "Uma mão", "Uma mao", "A una mano"],
  "Two-Handed": ["Dos manos", "Duas mãos", "Duas maos", "A dos manos"],
};

export const normalizeAdversaryRole = (value: string) =>
  normalizeGlossaryValue(value, localizedAdversaryRoles);

export const normalizeSceneType = (value: string) =>
  normalizeGlossaryValue(value, localizedSceneTypes);

export const normalizeEquipmentCategory = (value: string) =>
  normalizeGlossaryValue(value, localizedEquipmentCategories);

export const normalizeEquipmentTrait = (value: string) =>
  normalizeGlossaryValue(value, localizedEquipmentTraits);

export const normalizeBurden = (value: string) =>
  normalizeGlossaryValue(value, localizedBurdens);

export function normalizeTrait(trait: Trait): Trait {
  return {
    ...trait,
    type: trait.type ? normalizeFeatureType(trait.type) : trait.type,
  };
}

/** Keep enum-backed form values canonical at every import/export boundary. */
export function normalizeBrewData(
  type: BrewType,
  data: Record<string, string>,
): Record<string, string> {
  const next = { ...data };

  if (type === "adversary") {
    if (next.role) next.role = normalizeAdversaryRole(next.role);
    return normalizeAdversaryAttackData(next);
  }

  if (type === "environment") {
    if (next.category) next.category = normalizeSceneType(next.category);
    return next;
  }

  if (type === "equipment") {
    if (next.category) next.category = normalizeEquipmentCategory(next.category);
    if (next.trait) next.trait = normalizeEquipmentTrait(next.trait);
    if (next.range) next.range = normalizeAttackRange(next.range);
    if (next.damageType) next.damageType = normalizeAttackType(next.damageType);
    if (next.burden) next.burden = normalizeBurden(next.burden);
  }

  return next;
}
