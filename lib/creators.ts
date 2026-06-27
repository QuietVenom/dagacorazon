import type { LocalizedText } from "@/lib/i18n";
import {
  attackRangeOptions,
  attackTypeOptions,
  ATTACK_FIELD_KEYS,
} from "@/lib/adversary-attack";
import type { BrewType } from "@/lib/storage";

/**
 * Declarative schemas for the Workshop creators.
 * Each creator (adversary, colossus, environment, equipment) is defined as
 * data: the BrewCreator component renders the form and the live preview
 * from the schema, so adding a new creator requires no new UI.
 */

export type FieldType = "text" | "textarea" | "select";

export interface CreatorField {
  key: string;
  type: FieldType;
  label: LocalizedText;
  placeholder?: LocalizedText;
  options?: { value: string; label: LocalizedText }[];
  /** "half" shares a row; "full" takes the whole width. */
  width: "half" | "full";
  /** Shown highlighted in the preview (banner under the name). */
  highlight?: boolean;
  /** Offered as a filter in the "Start from" resource picker. */
  filterable?: boolean;
  /** A dice-damage field: normalized on blur and validated (e.g. "1d8+3"). */
  damage?: boolean;
  /**
   * For grouped creators (see `CreatorSchema.groups`): restrict this field —
   * as a form input and as a filter — to these category values. A weapon trait,
   * for example, is only relevant to weapons. Omit to always show the field.
   */
  categories?: string[];
  /**
   * Where this field renders in the Daggerheart statblock card:
   * - "subtitle": the line under the name (e.g. "Tier 1 Solo")
   * - "flavor": italic/labelled lines in the header (description, motives)
   * - "stat": the inline stat box (difficulty, thresholds, hp, stress, attack)
   * - "note": a boxed line below the stats (experience)
   * Fields without a block don't appear in the statblock.
   */
  block?: "subtitle" | "flavor" | "stat" | "note";
}

/** A tab in a grouped creator: a named bundle of category values. */
export interface CreatorGroupTab {
  id: string;
  label: LocalizedText;
  values: string[];
}

export interface CreatorSchema {
  id: BrewType;
  /** URL segment under /taller — user-facing, stays in Spanish. */
  slug: string;
  icon: "sword" | "dragon" | "mountain" | "gem";
  title: LocalizedText;
  subtitle: LocalizedText;
  fields: CreatorField[];
  withTraits: boolean;
  withSegments: boolean;
  /**
   * Optional tab grouping over one field's values. When present the creator
   * shows a tab bar that segments the picker and the library (e.g. equipment by
   * Weapons / Armor / Loot), and category-scoped fields appear only on the
   * tabs they belong to.
   */
  groups?: {
    field: string;
    tabs: CreatorGroupTab[];
  };
}

const tier = (placeholder: string): CreatorField => ({
  key: "tier",
  type: "text",
  label: { es: "Nivel", pt: "Nível" },
  placeholder: { es: placeholder, pt: placeholder },
  width: "half",
  highlight: true,
  filterable: true,
  block: "subtitle",
});

const description = (es: string, pt: string): CreatorField => ({
  key: "description",
  type: "textarea",
  label: { es: "Descripción", pt: "Descrição" },
  placeholder: { es, pt },
  width: "full",
  block: "flavor",
});

const adversaryRoleOptions: NonNullable<CreatorField["options"]> = [
  { value: "Bruiser", label: { es: "Bruto", pt: "Bruto" } },
  { value: "Horde", label: { es: "Horda", pt: "Horda" } },
  { value: "Leader", label: { es: "Líder", pt: "Líder" } },
  { value: "Minion", label: { es: "Esbirro", pt: "Lacaio" } },
  { value: "Ranged", label: { es: "A distancia", pt: "À distância" } },
  { value: "Skulk", label: { es: "Acechador", pt: "Espreitador" } },
  { value: "Social", label: { es: "Social", pt: "Social" } },
  { value: "Solo", label: { es: "Solo", pt: "Solo" } },
  { value: "Standard", label: { es: "Estándar", pt: "Padrão" } },
  { value: "Support", label: { es: "Apoyo", pt: "Suporte" } },
];

export const adversaryAttackFieldKeys = new Set<string>(ATTACK_FIELD_KEYS);

// ── Equipment grouping ──
// The three weapon categories share a tab and the tier+trait filters.
const weaponCategories = ["Physical Weapon", "Magic Weapon", "Secondary Weapon"];

/** Governing trait of a weapon (kept canonical in English; labels localized). */
const equipmentTraitOptions: NonNullable<CreatorField["options"]> = [
  { value: "Agility", label: { es: "Agilidad", pt: "Agilidade" } },
  { value: "Strength", label: { es: "Fuerza", pt: "Força" } },
  { value: "Finesse", label: { es: "Fineza", pt: "Finesse" } },
  { value: "Instinct", label: { es: "Instinto", pt: "Instinto" } },
  { value: "Presence", label: { es: "Presencia", pt: "Presença" } },
  { value: "Knowledge", label: { es: "Conocimiento", pt: "Conhecimento" } },
  { value: "Spellcast", label: { es: "Conjuro", pt: "Conjuração" } },
];

/** How many hands a weapon takes (canonical English; labels localized). */
const burdenOptions: NonNullable<CreatorField["options"]> = [
  { value: "One-Handed", label: { es: "Una mano", pt: "Uma mão" } },
  { value: "Two-Handed", label: { es: "Dos manos", pt: "Duas mãos" } },
];

// Categories that carry weapon-style stats (range, damage, burden, trait).
const armedCategories = [...weaponCategories, "Wheelchair"];

/** Category tabs for the equipment creator (and the Table's equipment filter). */
export const equipmentCategoryGroups: CreatorGroupTab[] = [
  { id: "weapons", label: { es: "Armas", pt: "Armas" }, values: weaponCategories },
  { id: "armor", label: { es: "Armadura", pt: "Armadura" }, values: ["Armor"] },
  {
    id: "wheelchairs",
    label: { es: "Sillas de ruedas", pt: "Cadeiras de rodas" },
    values: ["Wheelchair"],
  },
  { id: "loot", label: { es: "Botín", pt: "Saque" }, values: ["Loot"] },
  { id: "consumables", label: { es: "Consumibles", pt: "Consumíveis" }, values: ["Consumable"] },
];

export const schemas: CreatorSchema[] = [
  {
    id: "adversary",
    slug: "adversario",
    icon: "sword",
    title: { es: "Adversario", pt: "Adversário" },
    subtitle: {
      es: "Diseña enemigos a la medida de tus encuentros",
      pt: "Crie inimigos sob medida para seus encontros",
    },
    withTraits: true,
    withSegments: false,
    fields: [
      {
        key: "name",
        type: "text",
        label: { es: "Nombre", pt: "Nome" },
        placeholder: { es: "p. ej. Madre Estrigoloba", pt: "ex. Mãe Estrigoloba" },
        width: "full",
      },
      tier("p. ej. 1"),
      {
        key: "role",
        type: "select",
        label: { es: "Rol", pt: "Função" },
        width: "half",
        highlight: true,
        filterable: true,
        block: "subtitle",
        options: adversaryRoleOptions,
      },
      description(
        "p. ej. Una criatura enorme con cuerpo de loba, rostro de búho y grandes alas en el lomo",
        "ex. Uma criatura enorme com corpo de loba, rosto de coruja e grandes asas no dorso",
      ),
      {
        key: "motives",
        type: "text",
        label: { es: "Motivos y tácticas", pt: "Motivos e táticas" },
        placeholder: { es: "p. ej. Observar, carroñear, proteger", pt: "ex. Observar, saquear, proteger" },
        width: "full",
        block: "flavor",
      },
      {
        key: "difficulty",
        type: "text",
        label: { es: "Dificultad", pt: "Dificuldade" },
        placeholder: { es: "p. ej. 10", pt: "ex. 10" },
        width: "half",
        block: "stat",
      },
      {
        key: "thresholds",
        type: "text",
        label: { es: "Umbrales (Mayor / Severo)", pt: "Limiares (Maior / Severo)" },
        placeholder: { es: "p. ej. 4 / 8", pt: "ex. 4 / 8" },
        width: "half",
        block: "stat",
      },
      {
        key: "hp",
        type: "text",
        label: { es: "PG", pt: "PV" },
        placeholder: { es: "p. ej. 3", pt: "ex. 3" },
        width: "half",
        block: "stat",
      },
      {
        key: "stress",
        type: "text",
        label: { es: "Estrés", pt: "Estresse" },
        placeholder: { es: "p. ej. 3", pt: "ex. 3" },
        width: "half",
        block: "stat",
      },
      {
        key: "attackModifier",
        type: "text",
        label: { es: "Modificador de ataque", pt: "Modificador de ataque" },
        placeholder: { es: "p. ej. +3", pt: "ex. +3" },
        width: "half",
      },
      {
        key: "attackName",
        type: "text",
        label: { es: "Ataque estándar", pt: "Ataque padrão" },
        placeholder: {
          es: "p. ej. Espadón empoderado",
          pt: "ex. Espada longa potencializada",
        },
        width: "full",
      },
      {
        key: "attackRange",
        type: "select",
        label: { es: "Rango", pt: "Alcance" },
        width: "half",
        filterable: true,
        options: attackRangeOptions,
      },
      {
        key: "attackDamage",
        type: "text",
        label: { es: "Daño", pt: "Dano" },
        placeholder: {
          es: "p. ej. 1d8+4",
          pt: "ex. 1d8+4",
        },
        width: "half",
        damage: true,
      },
      {
        key: "attackType",
        type: "select",
        label: { es: "Tipo de ataque", pt: "Tipo de ataque" },
        width: "half",
        options: attackTypeOptions,
      },
      {
        key: "experience",
        type: "text",
        label: { es: "Experiencias", pt: "Experiências" },
        placeholder: { es: "p. ej. Instinto materno +2", pt: "ex. Instinto materno +2" },
        width: "full",
        block: "note",
      },
    ],
  },
  {
    id: "colossus",
    slug: "coloso",
    icon: "dragon",
    title: { es: "Coloso", pt: "Colosso" },
    subtitle: {
      es: "Forja titanes que transforman el campo de batalla",
      pt: "Forje titãs que transformam o campo de batalha",
    },
    withTraits: true,
    withSegments: true,
    fields: [
      {
        key: "name",
        type: "text",
        label: { es: "Nombre", pt: "Nome" },
        placeholder: { es: "p. ej. Nix", pt: "ex. Nix" },
        width: "half",
      },
      {
        key: "title",
        type: "text",
        label: { es: "Título", pt: "Título" },
        placeholder: {
          es: "p. ej. La Que Oscurece el Sol",
          pt: "ex. Aquela Que Escurece o Sol",
        },
        width: "half",
        highlight: true,
        block: "subtitle",
      },
      tier("p. ej. 4"),
      {
        key: "stress",
        type: "text",
        label: { es: "Estrés", pt: "Estresse" },
        placeholder: { es: "p. ej. 6", pt: "ex. 6" },
        width: "half",
        block: "stat",
      },
      description(
        "p. ej. Una figura esquelética inmensa e imposiblemente delgada que tapa el sol con su manto estrellado",
        "ex. Uma figura esquelética imensa e impossivelmente magra que cobre o sol com seu manto estrelado",
      ),
      {
        key: "motives",
        type: "text",
        label: { es: "Motivos y tácticas", pt: "Motivos e táticas" },
        placeholder: { es: "p. ej. Sofocar, oscurecer, desmoralizar", pt: "ex. Sufocar, escurecer, desmoralizar" },
        width: "full",
        block: "flavor",
      },
      {
        key: "size",
        type: "text",
        label: { es: "Tamaño", pt: "Tamanho" },
        placeholder: { es: "p. ej. 80 m de alto, 15 m de ancho", pt: "ex. 80 m de altura, 15 m de largura" },
        width: "half",
        block: "flavor",
      },
      {
        key: "thresholds",
        type: "text",
        label: { es: "Umbrales (Mayor / Severo)", pt: "Limiares (Maior / Severo)" },
        placeholder: { es: "p. ej. 30 / 65", pt: "ex. 30 / 65" },
        width: "half",
        block: "stat",
      },
      {
        key: "experience",
        type: "text",
        label: { es: "Experiencias", pt: "Experiências" },
        placeholder: { es: "p. ej. Manto de medianoche +3", pt: "ex. Manto da meia-noite +3" },
        width: "full",
        block: "note",
      },
    ],
  },
  {
    id: "environment",
    slug: "entorno",
    icon: "mountain",
    title: { es: "Entorno", pt: "Ambiente" },
    subtitle: {
      es: "Crea terrenos peligrosos y escenas con vida propia",
      pt: "Crie terrenos perigosos e cenas com vida própria",
    },
    withTraits: true,
    withSegments: false,
    fields: [
      {
        key: "name",
        type: "text",
        label: { es: "Nombre", pt: "Nome" },
        placeholder: { es: "p. ej. Río embravecido", pt: "ex. Rio bravio" },
        width: "full",
      },
      tier("p. ej. 1"),
      {
        key: "category",
        type: "select",
        label: { es: "Tipo", pt: "Tipo" },
        width: "half",
        highlight: true,
        filterable: true,
        block: "subtitle",
        options: [
          { value: "Traversal", label: { es: "Travesía", pt: "Travessia" } },
          { value: "Social", label: { es: "Social", pt: "Social" } },
          { value: "Exploration", label: { es: "Exploración", pt: "Exploração" } },
          { value: "Event", label: { es: "Evento", pt: "Evento" } },
        ],
      },
      description(
        "p. ej. Un río de corriente veloz sin puente, lo bastante profundo para arrastrar a casi cualquiera",
        "ex. Um rio de correnteza veloz sem ponte, fundo o bastante para arrastar quase qualquer um",
      ),
      {
        key: "impulses",
        type: "text",
        label: { es: "Impulsos", pt: "Impulsos" },
        placeholder: {
          es: "p. ej. Impedir el cruce, arrastrar a los desprevenidos, dividir la tierra",
          pt: "ex. Impedir a travessia, arrastar os desavisados, dividir a terra",
        },
        width: "full",
        block: "flavor",
      },
      {
        key: "difficulty",
        type: "text",
        label: { es: "Dificultad", pt: "Dificuldade" },
        placeholder: { es: "p. ej. 10", pt: "ex. 10" },
        width: "half",
        block: "stat",
      },
      {
        key: "potentialAdversaries",
        type: "text",
        label: { es: "Adversarios potenciales", pt: "Adversários potenciais" },
        placeholder: {
          es: "p. ej. Bestias (oso, serpiente de cristal), Bandidos de la Daga Mellada",
          pt: "ex. Feras (urso, serpente de vidro), Bandidos da Adaga Lascada",
        },
        width: "full",
        block: "note",
      },
    ],
  },
  {
    id: "equipment",
    slug: "equipo",
    icon: "gem",
    title: { es: "Equipo", pt: "Equipamento" },
    subtitle: {
      es: "Diseña armas, armaduras y objetos para tu mesa",
      pt: "Crie armas, armaduras e itens para sua mesa",
    },
    withTraits: true,
    withSegments: false,
    groups: { field: "category", tabs: equipmentCategoryGroups },
    fields: [
      {
        key: "name",
        type: "text",
        label: { es: "Nombre", pt: "Nome" },
        placeholder: { es: "p. ej. Jopesh", pt: "ex. Copêsh" },
        width: "half",
      },
      {
        key: "category",
        type: "select",
        label: { es: "Tipo", pt: "Tipo" },
        width: "half",
        highlight: true,
        filterable: true,
        block: "subtitle",
        options: [
          { value: "Physical Weapon", label: { es: "Arma física", pt: "Arma física" } },
          { value: "Magic Weapon", label: { es: "Arma mágica", pt: "Arma mágica" } },
          { value: "Secondary Weapon", label: { es: "Arma secundaria", pt: "Arma secundária" } },
          { value: "Wheelchair", label: { es: "Silla de ruedas", pt: "Cadeira de rodas" } },
          { value: "Armor", label: { es: "Armadura", pt: "Armadura" } },
          { value: "Loot", label: { es: "Botín", pt: "Saque" } },
          { value: "Consumable", label: { es: "Consumible", pt: "Consumível" } },
        ],
      },
      {
        key: "tier",
        type: "text",
        label: { es: "Nivel", pt: "Nível" },
        placeholder: { es: "p. ej. 1", pt: "ex. 1" },
        width: "half",
        filterable: true,
        block: "subtitle",
        categories: [...armedCategories, "Armor"],
      },
      {
        key: "trait",
        type: "select",
        label: { es: "Atributo", pt: "Atributo" },
        width: "half",
        filterable: true,
        block: "stat",
        options: equipmentTraitOptions,
        categories: armedCategories,
      },
      {
        key: "range",
        type: "select",
        label: { es: "Rango", pt: "Alcance" },
        width: "half",
        block: "stat",
        options: attackRangeOptions,
        categories: armedCategories,
      },
      {
        key: "damage",
        type: "text",
        label: { es: "Daño", pt: "Dano" },
        placeholder: { es: "p. ej. 1d8+2", pt: "ex. 1d8+2" },
        width: "half",
        block: "stat",
        categories: armedCategories,
        damage: true,
      },
      {
        key: "damageType",
        type: "select",
        label: { es: "Tipo de daño", pt: "Tipo de dano" },
        width: "half",
        options: attackTypeOptions,
        categories: armedCategories,
      },
      {
        key: "burden",
        type: "select",
        label: { es: "Carga", pt: "Carga" },
        width: "half",
        block: "stat",
        options: burdenOptions,
        categories: armedCategories,
      },
      {
        key: "thresholds",
        type: "text",
        label: { es: "Umbrales base", pt: "Limiares base" },
        placeholder: { es: "p. ej. 5 / 11", pt: "ex. 5 / 11" },
        width: "half",
        block: "stat",
        categories: ["Armor"],
      },
      {
        key: "score",
        type: "text",
        label: { es: "Puntuación base", pt: "Pontuação base" },
        placeholder: { es: "p. ej. 3", pt: "ex. 3" },
        width: "half",
        block: "stat",
        categories: ["Armor"],
      },
      description(
        "p. ej. Una hoja curva forjada en bronce estelar, fría al tacto incluso bajo el sol",
        "ex. Uma lâmina curva forjada em bronze estelar, fria ao toque mesmo sob o sol",
      ),
    ],
  },
];

export const schemaBySlug = (slug: string) => schemas.find((s) => s.slug === slug);
